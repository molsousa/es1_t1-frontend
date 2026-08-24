import { 
    tutores, carregarTutores, carregarTutorCompleto, salvarTutorCompleto, excluirTutorApi,
    tiposLogradouro, ufs, ddds
} from '../services/api.js';
import { abrirModal, fecharModal } from '../components/modal.js';
import { adicionarTelefone } from '../components/telefones.js';
import { formatarData } from '../utils/helpers.js';

export async function render() {
    const lista = await carregarTutores();
    window.tutoresCache = lista;
    let html = `
        <div class="card">
            <div class="card-header">
                <h3>👤 Tutores</h3>
                <button class="btn btn-primary" onclick="window.formTutor()">+ Adicionar Tutor</button>
            </div>
            ${lista.length === 0 ? '<p>Nenhum tutor cadastrado.</p>' : `
            <table>
                <thead><tr><th>Nome</th><th>CPF</th><th>Ações</th></tr></thead>
                <tbody>
                    ${lista.map(t => `
                        <tr>
                            <td>${t.nome}</td>
                            <td>${t.cpf}</td>
                            <td>
                                <button class="btn btn-info btn-sm" onclick="window.visualizarTutor(${t.id})">Visualizar</button>
                                <button class="btn btn-danger btn-sm" onclick="window.excluirTutor(${t.id})">Excluir</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            `}
        </div>
    `;
    document.getElementById('page-tutores').innerHTML = html;
}

// --- Visualizar Tutor ---
export async function visualizarTutor(id) {
    try {
        const data = await carregarTutorCompleto(id);
        const tutor = data.tutor;
        const endereco = data.endereco || {};
        const telefones = data.telefones || [];
        const emails = data.emails || [];
        exibirTutorModal(tutor, endereco, telefones, emails);
    } catch (e) {
        const tutor = tutores.find(t => t.id === id);
        if (!tutor) {
            alert('Tutor não encontrado.');
            return;
        }
        exibirTutorModal(tutor, {}, [], []);
    }
}

function exibirTutorModal(tutor, endereco, telefones, emails) {
    const html = `
        <div style="font-family: monospace;">
            <h4>Dados do Tutor</h4>
            <p><strong>ID:</strong> ${tutor.id}</p>
            <p><strong>Nome:</strong> ${tutor.nome}</p>
            <p><strong>CPF:</strong> ${tutor.cpf}</p>
            <p><strong>Senha:</strong> ${tutor.senha || '-'}</p>
            <hr>
            <h5>Endereço</h5>
            <p><strong>CEP:</strong> ${endereco.cep || '-'}</p>
            <p><strong>Tipo Logradouro:</strong> ${endereco.siglaTipoLogradouro || '-'}</p>
            <p><strong>Logradouro:</strong> ${endereco.logradouro || '-'}</p>
            <p><strong>Número:</strong> ${tutor.nroEndereco || '-'}</p>
            <p><strong>Complemento:</strong> ${tutor.complemento || '-'}</p>
            <p><strong>Bairro:</strong> ${endereco.bairro || '-'}</p>
            <p><strong>Cidade:</strong> ${endereco.cidade || '-'}</p>
            <p><strong>UF:</strong> ${endereco.uf || '-'}</p>
            <hr>
            <h5>Telefones</h5>
            ${telefones.length ? telefones.map(t => `<p>(${t.ddi}) ${t.ddd} ${t.numero}</p>`).join('') : '<p>-</p>'}
            <hr>
            <h5>Emails</h5>
            ${emails.length ? emails.map(e => `<p>${e}</p>`).join('') : '<p>-</p>'}
        </div>
    `;
    abrirModal('Visualizar Tutor', html);
}

export function formTutor() {
    const tipoOptions = tiposLogradouro.map(t =>
        `<option value="${t.sigla}">${t.nome}</option>`
    ).join('');
    const ufOptions = ufs.map(u =>
        `<option value="${u.sigla}">${u.nome}</option>`
    ).join('');

    const html = `
        <form id="form-tutor">
            <div class="form-group"><label>Nome *</label><input type="text" id="tutor-nome" required></div>
            <div class="form-group"><label>CPF *</label><input type="text" id="tutor-cpf" required></div>
            <div class="form-group"><label>Senha</label><input type="text" id="tutor-senha" value="123456"></div>
            <h4>Endereço</h4>
            <div class="form-group"><label>CEP</label><input type="text" id="endereco-cep"></div>
            <div class="form-group">
                <label>Tipo de Logradouro</label>
                <select id="endereco-tipo"><option value="">Selecione</option>${tipoOptions}</select>
            </div>
            <div class="form-group"><label>Logradouro</label><input type="text" id="endereco-logradouro"></div>
            <div class="form-group"><label>Número</label><input type="text" id="endereco-numero"></div>
            <div class="form-group"><label>Complemento</label><input type="text" id="endereco-complemento"></div>
            <div class="form-group"><label>Bairro</label><input type="text" id="endereco-bairro"></div>
            <div class="form-group"><label>Cidade</label><input type="text" id="endereco-cidade"></div>
            <div class="form-group">
                <label>UF</label>
                <select id="endereco-uf"><option value="">Selecione</option>${ufOptions}</select>
            </div>
            <h4>Telefones</h4>
            <div id="telefones-container"></div>
            <button type="button" class="btn btn-primary btn-sm" onclick="window.adicionarTelefone('telefones-container')">+ Adicionar Telefone</button>
            <div class="form-group"><label>Emails (separados por vírgula)</label><input type="text" id="tutor-emails"></div>
            <button type="submit" class="btn btn-success">Salvar</button>
            <button type="button" class="btn" onclick="window.fecharModal()">Cancelar</button>
        </form>
    `;
    abrirModal('Novo Tutor', html);
    adicionarTelefone('telefones-container');

    document.getElementById('form-tutor').addEventListener('submit', async function (e) {
        e.preventDefault();
        const cpfLimpo = document.getElementById('tutor-cpf').value.replace(/[^0-9]/g, '');
        const telefones = [];
        document.querySelectorAll('#telefones-container .telefone-item').forEach(item => {
            const ddi = parseInt(item.querySelector('.telefone-ddi').value) || 55;
            const ddd = parseInt(item.querySelector('.telefone-ddd').value) || 0;
            const numero = item.querySelector('.telefone-numero').value.trim();
            if (ddd > 0 && numero)
                telefones.push({ddi, ddd, numero});
        });
        const dados = {
            tutor: {
                nome: document.getElementById('tutor-nome').value.trim(),
                cpf: cpfLimpo,
                senha: document.getElementById('tutor-senha').value.trim() || '123456'
            },
            endereco: {
                cep: document.getElementById('endereco-cep').value,
                siglaTipoLogradouro: document.getElementById('endereco-tipo').value,
                logradouro: document.getElementById('endereco-logradouro').value,
                bairro: document.getElementById('endereco-bairro').value,
                cidade: document.getElementById('endereco-cidade').value,
                uf: document.getElementById('endereco-uf').value
            },
            numero: document.getElementById('endereco-numero').value,
            complemento: document.getElementById('endereco-complemento').value,
            telefones: telefones,
            emails: document.getElementById('tutor-emails').value.split(',').map(s => s.trim()).filter(s => s)
        };
        try {
            const result = await salvarTutorCompleto(dados);
            alert('✅ Tutor cadastrado com ID: ' + result.id);
            fecharModal();
            render();
        } catch (e) {
            alert('❌ Erro: ' + e.message);
        }
    });
}

export async function excluirTutor(id) {
    if (!confirm('Deseja excluir este tutor?')) return;
    try {
        await excluirTutorApi(id);
        alert('Tutor excluído.');
        render();
    } catch (e) {
        alert('Erro: ' + e.message);
    }
}

// Expor funções para uso em onclick
window.visualizarTutor = visualizarTutor;
window.excluirTutor = excluirTutor;
window.formTutor = formTutor;
window.fecharModal = fecharModal;