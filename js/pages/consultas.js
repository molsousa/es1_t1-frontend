import { consultas, carregarConsultas, salvarConsulta, veterinariosList, carregarVeterinarios } from '../services/api.js';
import { abrirModal, fecharModal } from '../components/modal.js';
import { nomePet, statusBadge, formatarDataHora } from '../utils/helpers.js';

export async function render() {
    const lista = await carregarConsultas();
    window.consultasCache = lista;
    let html = `
        <div class="card">
            <div class="card-header">
                <h3>📅 Consultas</h3>
                <button class="btn btn-primary" onclick="window.formConsulta()">+ Agendar Consulta</button>
            </div>
            ${lista.length === 0 ? '<p>Nenhuma consulta agendada.</p>' : `
            <table>
                <thead><tr><th>Pet</th><th>Veterinário</th><th>Data/Hora</th><th>Motivo</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>
                    ${lista.map(c => {
                        let nomeVet = 'Desconhecido';
                        if (c.idVeterinario) {
                            const vet = veterinariosList.find(v => v.id === c.idVeterinario);
                            if (vet) nomeVet = vet.nome;
                        } else if (c.veterinario) {
                            nomeVet = c.veterinario;
                        }
                        const dataHora = c.dataHora || formatarDataHora(c.dataConsulta, c.horaConsulta);
                        return `
                            <tr>
                                <td>${nomePet(c.petId)}</td>
                                <td>${nomeVet}</td>
                                <td>${dataHora}</td>
                                <td>${c.motivo}</td>
                                <td>${statusBadge(c.status || 'agendada')}</td>
                                <td>
                                    ${(c.status === 'agendada' || !c.status) ? `<button class="btn btn-success btn-sm" onclick="window.realizarConsulta(${c.id})">Realizar</button>` : ''}
                                    <button class="btn btn-danger btn-sm" onclick="window.cancelarConsulta(${c.id})">Cancelar</button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            `}
        </div>
    `;
    document.getElementById('page-consultas').innerHTML = html;
}

export async function formConsulta() {
    if (veterinariosList.length === 0) {
        await carregarVeterinarios();
    }

    const petOptions = (window.petsCache || []).map(p =>
        `<option value="${p.id}">${p.nome}</option>`
    ).join('');
    const vetOptions = veterinariosList.map(v =>
        `<option value="${v.id}">${v.nome}</option>`
    ).join('');

    const html = `
        <form id="form-consulta">
            <div class="form-group"><label>Pet *</label><select id="consulta-pet" required><option value="">Selecione</option>${petOptions}</select></div>
            <div class="form-group"><label>Veterinário *</label><select id="consulta-vet" required><option value="">Selecione</option>${vetOptions}</select></div>
            <div class="form-group"><label>Data e Hora *</label><input type="datetime-local" id="consulta-dt" required></div>
            <div class="form-group"><label>Motivo</label><input type="text" id="consulta-motivo"></div>
            <div class="form-group"><label>Status</label><select id="consulta-status"><option value="agendada">Agendada</option><option value="realizada">Realizada</option><option value="cancelada">Cancelada</option></select></div>
            <button type="submit" class="btn btn-success">Salvar</button>
            <button type="button" class="btn" onclick="window.fecharModal()">Cancelar</button>
        </form>
    `;
    abrirModal('Nova Consulta', html);

    document.getElementById('form-consulta').addEventListener('submit', async function (e) {
        e.preventDefault();
        const dados = {
            petId: parseInt(document.getElementById('consulta-pet').value),
            idVeterinario: parseInt(document.getElementById('consulta-vet').value),
            dataHora: document.getElementById('consulta-dt').value,
            motivo: document.getElementById('consulta-motivo').value.trim(),
            status: document.getElementById('consulta-status').value
        };
        try {
            const result = await salvarConsulta(dados);
            alert('Consulta agendada com ID: ' + result.id);
            fecharModal();
            render();
        } catch (e) {
            alert('Erro: ' + e.message);
        }
    });
}

export function realizarConsulta(id) {
    const c = window.consultasCache.find(c => c.id === id);
    if (!c) return;
    if (c.status === 'realizada') return;
    c.status = 'realizada';
    render();
    // Navega para atendimentos (opcional)
    document.querySelector('[data-page="atendimentos"]')?.click();
}

export function cancelarConsulta(id) {
    if (!confirm('Cancelar esta consulta?')) return;
    const c = window.consultasCache.find(c => c.id === id);
    if (c) c.status = 'cancelada';
    render();
}

window.formConsulta = formConsulta;
window.realizarConsulta = realizarConsulta;
window.cancelarConsulta = cancelarConsulta;