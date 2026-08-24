import { pets, consultas, atendimentos, vacinas, especies, racas, tutores } from '../services/api.js';
import { nomeTutor, formatarData, formatarDataHora } from '../utils/helpers.js';
import { veterinariosList } from '../services/api.js';

export function render() {
    const petOptions = (window.petsCache || []).map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
    const html = `
        <div class="card">
            <div class="card-header"><h3>📋 Prontuário do PET</h3></div>
            <div class="form-group" style="max-width:300px;">
                <label>Selecione o PET</label>
                <select id="prontuario-pet" onchange="window.carregarProntuario()">
                    <option value="">-- Escolha --</option>
                    ${petOptions}
                </select>
            </div>
            <div id="prontuario-conteudo">
                <p style="color:#6c7a8a;">Selecione um pet para visualizar o prontuário.</p>
            </div>
        </div>
    `;
    document.getElementById('page-prontuario').innerHTML = html;
}

window.carregarProntuario = function() {
    const petId = parseInt(document.getElementById('prontuario-pet').value);
    const container = document.getElementById('prontuario-conteudo');
    if (!petId) {
        container.innerHTML = '<p style="color:#6c7a8a;">Selecione um pet para visualizar o prontuário.</p>';
        return;
    }
    const pet = (window.petsCache || []).find(p => p.id === petId);
    if (!pet) {
        container.innerHTML = '<p>Pet não encontrado.</p>';
        return;
    }

    const especieObj = especies.find(e => e.id === pet.idEspecie);
    const racaObj = racas.find(r => r.id === pet.idRaca);
    const nomeEspecie = especieObj ? especieObj.descricao : 'Não encontrada';
    const nomeRaca = racaObj ? racaObj.descricao : 'SRD';

    const consultasPet = (window.consultasCache || []).filter(c => c.petId === petId && c.status === 'realizada');
    const atendimentosPet = atendimentos.filter(a => a.petId === petId);
    const vacinasPet = vacinas.filter(v => v.petId === petId);

    let html = `
        <h4>${pet.nome} (${nomeEspecie} - ${nomeRaca})</h4>
        <p><strong>Tutor:</strong> ${nomeTutor(pet.tutorId)}</p>
        <hr>
        <h5>🩺 Consultas realizadas</h5>
        ${consultasPet.length === 0 ? '<p>Nenhuma consulta registrada.</p>' : `
        <ul>
            ${consultasPet.map(c => {
                let nomeVet = 'Dr. Padrão';
                if (c.idVeterinario) {
                    const vet = veterinariosList.find(v => v.id === c.idVeterinario);
                    if (vet) nomeVet = vet.nome;
                } else if (c.veterinario) {
                    nomeVet = c.veterinario;
                }
                return `<li><strong>${formatarDataHora(c.dataConsulta, c.horaConsulta)}</strong> - ${c.motivo || 'Sem motivo'} (Vet: ${nomeVet})</li>`;
            }).join('')}
        </ul>
        `}
        <h5>📝 Atendimentos</h5>
        ${atendimentosPet.length === 0 ? '<p>Nenhum atendimento registrado.</p>' : `
        <ul>
            ${atendimentosPet.map(a => `
                <li><strong>${formatarData(a.data)}</strong> - ${a.observacoes || 'Sem observações'}
                    ${a.exames && a.exames.length ? `<br>🧪 Exames: ${a.exames.join(', ')}` : ''}
                    ${a.remedios && a.remedios.length ? `<br>💊 Remédios: ${a.remedios.join(', ')}` : ''}
                </li>
            `).join('')}
        </ul>
        `}
        <h5>💉 Vacinas</h5>
        ${vacinasPet.length === 0 ? '<p>Nenhuma vacina registrada.</p>' : `
        <ul>
            ${vacinasPet.map(v => `
                <li><strong>${v.nomeVacina}</strong> - ${new Date(v.dataAplicacao) > new Date() ? 'Agendada para' : 'Aplicada em'} ${formatarData(v.dataAplicacao)} ${v.dose ? `(Dose: ${v.dose})` : ''} ${v.observacao ? `- ${v.observacao}` : ''}</li>
            `).join('')}
        </ul>
        `}
    `;
    container.innerHTML = html;
};