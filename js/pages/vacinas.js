import { vacinas, carregarTodasVacinasAplicadas, carregarVacinasPendentes, salvarVacina, excluirVacinaApi, listaVacinas, veterinariosList } from '../services/api.js';
import { abrirModal, fecharModal } from '../components/modal.js';
import { nomePet, formatarData } from '../utils/helpers.js';

export async function render() {
    await carregarTodasVacinasAplicadas();
    const listaPendentes = await carregarVacinasPendentes();

    const petOptions = (window.petsCache || []).map(p => `<option value="${p.id}">${p.nome}</option>`).join('');

    let html = `
        <div class="card">
            <div class="card-header">
                <h3>💉 Controle de Vacinas</h3>
                <button class="btn btn-primary" onclick="window.formVacina()">+ Registrar Vacina</button>
            </div>
            <div style="margin-bottom: 20px;">
                <h4>Vacinas Pendentes (próximas 30 dias ou agendadas)</h4>
                ${listaPendentes.length === 0 ? '<p>Nenhuma vacina pendente.</p>' : `
                <table>
                    <thead><tr><th>Pet</th><th>Vacina</th><th>Data</th><th>Status</th></tr></thead>
                    <tbody>
                        ${listaPendentes.map(v => `
                            <tr>
                                <td>${nomePet(v.petId)}</td>
                                <td>${v.nomeVacina}</td>
                                <td>${formatarData(v.dataProxima)}</td>
                                <td><span class="badge badge-warning">${v.status === 'agendada' ? 'Agendada' : 'Pendente'}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                `}
            </div>
            <div>
                <h4>Histórico de Vacinas</h4>
                ${vacinas.length === 0 ? '<p>Nenhuma vacina registrada.</p>' : `
                <table>
                    <thead><tr><th>Pet</th><th>Vacina</th><th>Data</th><th>Dose</th><th>Veterinário</th><th>Ações</th></tr></thead>
                    <tbody>
                        ${vacinas.map(v => {
                            const vet = veterinariosList.find(vet => vet.id === v.idVeterinario);
                            const isFutura = new Date(v.dataAplicacao) > new Date();
                            return `
                                <tr>
                                    <td>${nomePet(v.petId)}</td>
                                    <td>${v.nomeVacina}</td>
                                    <td>${formatarData(v.dataAplicacao)} ${isFutura ? '(Agendada)' : ''}</td>
                                    <td>${v.dose || '-'}</td>
                                    <td>${vet ? vet.nome : 'Desconhecido'}</td>
                                    <td>
                                        <button class="btn btn-danger btn-sm" onclick="window.excluirVacina(${v.id})">Excluir</button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
                `}
            </div>
        </div>
    `;
    document.getElementById('page-vacinas').innerHTML = html;
}

export function formVacina(id = null) {
    const vac = id ? vacinas.find(v => v.id === id) : null;
    const titulo = vac ? 'Editar Vacina' : 'Registrar Vacina';

    const petOptions = (window.petsCache || []).map(p => `
        <option value="${p.id}" ${vac && vac.petId === p.id ? 'selected' : ''}>${p.nome}</option>
    `).join('');

    const vacinaOptions = listaVacinas.map(v =>
        `<option value="${v.id}" ${vac && vac.idVacina === v.id ? 'selected' : ''}>${v.nomeVacina}</option>`
    ).join('');

    const vetOptions = veterinariosList.map(v =>
        `<option value="${v.id}" ${vac && vac.idVeterinario === v.id ? 'selected' : ''}>${v.nome}</option>`
    ).join('');

    const html = `
        <form id="form-vacina">
            <input type="hidden" id="vacina-id" value="${vac ? vac.id : ''}">
            <div class="form-group">
                <label>Pet *</label>
                <select id="vacina-pet" required>
                    <option value="">Selecione</option>
                    ${petOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Nome da Vacina *</label>
                <select id="vacina-nome" required>
                    <option value="">Selecione</option>
                    ${vacinaOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Veterinário *</label>
                <select id="vacina-veterinario" required>
                    <option value="">Selecione</option>
                    ${vetOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Data de Aplicação *</label>
                <input type="date" id="vacina-data" value="${vac ? vac.dataAplicacao : ''}" required>
            </div>
            <div class="form-group">
                <label>Periodicidade (em meses) *</label>
                <input type="number" id="vacina-periodicidade" value="${vac ? vac.periodicidadeMeses : 12}" min="1" required>
            </div>
            <div class="form-group">
                <label>Dose</label>
                <input type="text" id="vacina-dose" value="${vac ? vac.dose : '1'}">
            </div>
            <div class="form-group">
                <label>Observação</label>
                <textarea id="vacina-observacao">${vac ? vac.observacao : ''}</textarea>
            </div>
            <button type="submit" class="btn btn-success">Salvar</button>
            <button type="button" class="btn" onclick="window.fecharModal()">Cancelar</button>
        </form>
    `;
    abrirModal(titulo, html);

    document.getElementById('form-vacina').addEventListener('submit', async function (e) {
        e.preventDefault();
        const petId = parseInt(document.getElementById('vacina-pet').value);
        const idVacina = parseInt(document.getElementById('vacina-nome').value);
        const idVeterinario = parseInt(document.getElementById('vacina-veterinario').value);
        const dataAplicacao = document.getElementById('vacina-data').value;
        const periodicidadeMeses = parseInt(document.getElementById('vacina-periodicidade').value);
        const dose = document.getElementById('vacina-dose').value.trim() || '1';
        const observacao = document.getElementById('vacina-observacao').value.trim();

        const vacinaSelecionada = listaVacinas.find(v => v.id === idVacina);
        const nomeVacina = vacinaSelecionada ? vacinaSelecionada.nomeVacina : '';

        const dados = {
            petId: petId,
            nomeVacina: nomeVacina,
            idVeterinario: idVeterinario,
            dataAplicacao: dataAplicacao,
            periodicidadeMeses: periodicidadeMeses,
            dose: dose,
            observacao: observacao
        };

        try {
            const result = await salvarVacina(dados);
            alert('✅ Vacina registrada com ID: ' + result.id);
            await carregarTodasVacinasAplicadas();
            fecharModal();
            render();
        } catch (e) {
            alert('❌ Erro ao registrar vacina: ' + e.message);
        }
    });
}

export async function excluirVacina(id) {
    if (!confirm('Excluir registro de vacina?')) return;
    try {
        await excluirVacinaApi(id);
        alert('✅ Vacina excluída.');
        await carregarTodasVacinasAplicadas();
        render();
    } catch (e) {
        alert('❌ Erro ao excluir vacina: ' + e.message);
    }
}

window.formVacina = formVacina;
window.excluirVacina = excluirVacina;