import { tutores, pets, consultas, atendimentos, vacinas } from '../services/api.js';
import { carregarVacinasPendentes } from '../services/api.js';
import { formatarData, nomePet } from '../utils/helpers.js';

export async function render() {
    const tutoresData = await import('../services/api.js').then(m => m.carregarTutores());
    const petsData = await import('../services/api.js').then(m => m.carregarPets());
    const consultasData = await import('../services/api.js').then(m => m.carregarConsultas());
    const vacinasPendentes = await carregarVacinasPendentes();

    const hoje = new Date().toISOString().split('T')[0];
    const consultasHoje = consultasData.filter(c => c.dataConsulta === hoje).length;

    let notificacoes = '';
    if (vacinasPendentes.length > 0) {
        notificacoes = '<ul class="alert-list">';
        vacinasPendentes.forEach(v => {
            const pet = petsData.find(p => p.id === v.petId);
            notificacoes += `<li>🔔 Vacina <strong>${v.nomeVacina}</strong> para <strong>${pet ? pet.nome : 'pet'}</strong> ${v.status === 'agendada' ? 'agendada para' : 'vence em'} ${formatarData(v.dataProxima)}.</li>`;
        });
        notificacoes += '</ul>';
    } else {
        notificacoes = '<p style="color:#6c7a8a;">Nenhuma vacina pendente.</p>';
    }

    const html = `
        <h2>📊 Dashboard</h2>
        <div class="stats">
            <div class="stat-item"><div class="number">${petsData.length}</div><div class="label">Pets cadastrados</div></div>
            <div class="stat-item"><div class="number">${tutoresData.length}</div><div class="label">Tutores</div></div>
            <div class="stat-item"><div class="number">${consultasHoje}</div><div class="label">Consultas hoje</div></div>
            <div class="stat-item"><div class="number">${vacinasPendentes.length}</div><div class="label">Vacinas pendentes</div></div>
        </div>
        <div class="card">
            <div class="card-header"><h3>📬 Notificações de Vacinas</h3></div>
            ${notificacoes}
        </div>
        <div class="card">
            <div class="card-header"><h3>📋 Últimos atendimentos</h3></div>
            ${atendimentos.length === 0 ? '<p>Nenhum atendimento registrado.</p>' : `
            <table>
                <thead><tr><th>Data</th><th>Pet</th><th>Observações</th></tr></thead>
                <tbody>
                    ${atendimentos.slice(-3).reverse().map(a => `
                        <tr>
                            <td>${formatarData(a.data)}</td>
                            <td>${nomePet(a.petId)}</td>
                            <td>${a.observacoes.substring(0, 40)}${a.observacoes.length > 40 ? '...' : ''}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            `}
        </div>
    `;
    document.getElementById('page-dashboard').innerHTML = html;
}