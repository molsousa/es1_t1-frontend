import { atendimentos } from '../services/api.js';
import { abrirModal, fecharModal } from '../components/modal.js';
import { nomePet, formatarData, getPet } from '../utils/helpers.js';

export function render() {
    const petOptions = (window.petsCache || []).map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
    const consultaOptions = (window.consultasCache || []).filter(c => c.status === 'realizada').map(c =>
        `<option value="${c.id}">${nomePet(c.petId)} - ${formatarData(c.dataConsulta)}</option>`
    ).join('');

    let html = `
        <div class="card">
            <div class="card-header">
                <h3>🩺 Atendimentos</h3>
                <button class="btn btn-primary" onclick="window.formAtendimento()">+ Registrar Atendimento</button>
            </div>
            ${atendimentos.length === 0 ? '<p>Nenhum atendimento registrado.</p>' : `
            <table>
                <thead><tr><th>Data</th><th>Pet</th><th>Observações</th><th>Exames</th><th>Remédios</th><th>Ações</th></tr></thead>
                <tbody>
                    ${atendimentos.map(a => `
                        <tr>
                            <td>${formatarData(a.data)}</td>
                            <td>${nomePet(a.petId)}</td>
                            <td>${a.observacoes || '-'}</td>
                            <td>${a.exames ? a.exames.join(', ') : '-'}</td>
                            <td>${a.remedios ? a.remedios.join(', ') : '-'}</td>
                            <td>
                                <button class="btn btn-primary btn-sm" onclick="window.formAtendimento(${a.id})">Editar</button>
                                <button class="btn btn-danger btn-sm" onclick="window.excluirAtendimento(${a.id})">Excluir</button>
                                <button class="btn btn-warning btn-sm" onclick="window.emitirPrescricao(${a.id})">Prescrição</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            `}
        </div>
    `;
    document.getElementById('page-atendimentos').innerHTML = html;
}

export function formAtendimento(id = null) {
    const atend = id ? atendimentos.find(a => a.id === id) : null;
    const titulo = atend ? 'Editar Atendimento' : 'Novo Atendimento';
    const petOptions = (window.petsCache || []).map(p => `
        <option value="${p.id}" ${atend && atend.petId === p.id ? 'selected' : ''}>${p.nome}</option>
    `).join('');
    const consultaOptions = (window.consultasCache || []).filter(c => c.status === 'realizada').map(c =>
        `<option value="${c.id}" ${atend && atend.consultaId === c.id ? 'selected' : ''}>${nomePet(c.petId)} - ${formatarData(c.dataConsulta)}</option>`
    ).join('');

    const html = `
        <form id="form-atendimento">
            <input type="hidden" id="atend-id" value="${atend ? atend.id : ''}">
            <div class="form-group">
                <label>Pet *</label>
                <select id="atend-pet" required>
                    <option value="">Selecione</option>
                    ${petOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Data *</label>
                <input type="date" id="atend-data" value="${atend ? atend.data : new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="form-group">
                <label>Consulta associada (opcional)</label>
                <select id="atend-consulta">
                    <option value="">Nenhuma</option>
                    ${consultaOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Observações</label>
                <textarea id="atend-obs">${atend ? atend.observacoes : ''}</textarea>
            </div>
            <div class="form-group">
                <label>Exames (separados por vírgula)</label>
                <input type="text" id="atend-exames" value="${atend && atend.exames ? atend.exames.join(', ') : ''}">
            </div>
            <div class="form-group">
                <label>Remédios (separados por vírgula)</label>
                <input type="text" id="atend-remedios" value="${atend && atend.remedios ? atend.remedios.join(', ') : ''}">
            </div>
            <button type="submit" class="btn btn-success">Salvar</button>
            <button type="button" class="btn" onclick="window.fecharModal()">Cancelar</button>
        </form>
    `;
    abrirModal(titulo, html);

    document.getElementById('form-atendimento').addEventListener('submit', function (e) {
        e.preventDefault();
        const id = document.getElementById('atend-id').value;
        const dados = {
            petId: parseInt(document.getElementById('atend-pet').value),
            data: document.getElementById('atend-data').value,
            consultaId: document.getElementById('atend-consulta').value ? parseInt(document.getElementById('atend-consulta').value) : null,
            observacoes: document.getElementById('atend-obs').value.trim(),
            exames: document.getElementById('atend-exames').value.split(',').map(s => s.trim()).filter(s => s),
            remedios: document.getElementById('atend-remedios').value.split(',').map(s => s.trim()).filter(s => s)
        };
        try {
            if (id) {
                alert('Edição ainda não implementada.');
            } else {
                alert('Funcionalidade de salvar atendimento será implementada em breve.');
            }
            fecharModal();
            render();
        } catch (e) {
            alert('Erro: ' + e.message);
        }
    });
}

export function excluirAtendimento(id) {
    if (!confirm('Excluir atendimento?')) return;
    atendimentos = atendimentos.filter(a => a.id !== id);
    render();
}

export function emitirPrescricao(id) {
    const atend = atendimentos.find(a => a.id === id);
    if (!atend) return;
    const pet = getPet(atend.petId);
    const html = `
        <div style="font-family: monospace;">
            <h4>Prescrição Médica</h4>
            <p><strong>Pet:</strong> ${pet ? pet.nome : 'Desconhecido'}</p>
            <p><strong>Data:</strong> ${formatarData(atend.data)}</p>
            <p><strong>Observações:</strong> ${atend.observacoes || '-'}</p>
            <p><strong>Exames solicitados:</strong> ${atend.exames && atend.exames.length ? atend.exames.join(', ') : 'Nenhum'}</p>
            <p><strong>Remédios prescritos:</strong> ${atend.remedios && atend.remedios.length ? atend.remedios.join(', ') : 'Nenhum'}</p>
            <hr>
            <button class="btn btn-primary" onclick="alert('Prescrição emitida (simulação).')">Imprimir / Enviar</button>
            <button class="btn" onclick="window.fecharModal()">Fechar</button>
        </div>
    `;
    abrirModal('📄 Emitir Prescrição', html);
}

window.formAtendimento = formAtendimento;
window.excluirAtendimento = excluirAtendimento;
window.emitirPrescricao = emitirPrescricao;