import { 
    veterinariosList, carregarVeterinarios, carregarVeterinarioCompleto, salvarVeterinarioCompleto, excluirVeterinarioApi,
    tiposLogradouro, ufs
} from '../services/api.js';
import { abrirModal, fecharModal } from '../components/modal.js';
import { adicionarTelefone } from '../components/telefones.js';

export async function render() {
    const lista = await carregarVeterinarios();
    window.veterinariosCache = lista;
    let html = `
        <div class="card">
            <div class="card-header">
                <h3>🩺 Veterinários</h3>
                <button class="btn btn-primary" onclick="window.formVeterinario()">+ Adicionar Veterinário</button>
            </div>
            ${lista.length === 0 ? '<p>Nenhum veterinário cadastrado.</p>' : `
            <table>
                <thead><tr><th>Nome</th><th>CPF</th><th>CRMV</th><th>Ações</th></tr></thead>
                <tbody>
                    ${lista.map(v => `
                        <tr>
                            <td>${v.nome}</td>
                            <td>${v.cpf}</td>
                            <td>${v.crmv}</td>
                            <td>
                                <button class="btn btn-info btn-sm" onclick="window.visualizarVeterinario(${v.id})">Visualizar</button>
                                <button class="btn btn-danger btn-sm" onclick="window.excluirVeterinario(${v.id})">Excluir</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            `}
        </div>
    `;
    document.getElementById('page-veterinarios').innerHTML = html;
}

export async function visualizarVeterinario(id) {
    try {
        const data = await carregarVeterinarioCompleto(id);
        const vet = data.veterinario;
        const endereco = data.endereco || {};
        const telefones = data.telefones || [];
        const emails = data.emails || [];
        exibirVeterinarioModal(vet, endereco, telefones, emails);
    } catch (e) {
        const vet = veterinariosList.find(v => v.id === id);
        if (!vet) {
            alert('Veterinário não encontrado.');
            return;
        }
        exibirVeterinarioModal(vet, {}, [], []);
    }
}

function exibirVeterinarioModal(vet, endereco, telefones, emails) {
    const html = `
        <div style="font-family: monospace;">
            <h4>Dados do Veterinário</h4>
            <p><strong>ID:</strong> ${vet.id}</p>
            <p><strong>Nome:</strong> ${vet.nome}</p>
            <p><strong>CPF:</strong> ${vet.cpf}</p>
            <p><strong>CRMV:</strong> ${vet.crmv || '-'}</p>
            <p><strong>Senha:</strong> ${vet.senha || '-'}</p>
            <hr>
            <h5>Endereço</h5>
            <p><strong>CEP:</strong> ${endereco.cep || '-'}</p>
            <p><strong>Tipo Logradouro:</strong> ${endereco.siglaTipoLogradouro || '-'}</p>
            <p><strong>Logradouro:</strong> ${endereco.logradouro || '-'}</p>
            <p><strong>Número:</strong> ${vet.nroEndereco || '-'}</p>
            <p><strong>Complemento:</strong> ${vet.complemento || '-'}</p>
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
    abrirModal('Visualizar Veterinário', html);
}

export function formVeterinario() {
    const tipoOptions = tiposLogradouro.map(t => `<option value="${t.sigla}">${t.nome}</option>`).join('');
    const ufOptions = ufs.map(u => `<option value="${u.sigla}">${u.nome}</option>`).join('');

    const html = `
        <form id="form-veterinario">
            <div class="form-group"><label>Nome *</label><input type="text" id="vet-nome" required></div>
            <div class="form-group"><label>CPF *</label><input type="text" id="vet-cpf" required></div>
            <div class="form-group"><label>CRMV *</label><input type="text" id="vet-crmv" required></div>
            <div class="form-group"><label>Senha</label><input type="text" id="vet-senha" value="123456"></div>
            <h4>Endereço</h4>
            <div class="form-group"><label>CEP</label><input type="text" id="vet-cep"></div>
            <div class="form-group">
                <label>Tipo de Logradouro</label>
                <select id="vet-tipo"><option value="">Selecione</option>${tipoOptions}</select>
            </div>
            <div class="form-group"><label>Logradouro</label><input type="text" id="vet-logradouro"></div>
            <div class="form-group"><label>Número</label><input type="text" id="vet-numero"></div>
            <div class="form-group"><label>Complemento</label><input type="text" id="vet-complemento"></div>
            <div class="form-group"><label>Bairro</label><input type="text" id="vet-bairro"></div>
            <div class="form-group"><label>Cidade</label><input type="text" id="vet-cidade"></div>
            <div class="form-group">
                <label>UF</label>
                <select id="vet-uf"><option value="">Selecione</option>${ufOptions}</select>
            </div>
            <h4>Telefones</h4>
            <div id="telefones-container-vet"></div>
            <button type="button" class="btn btn-primary btn-sm" onclick="window.adicionarTelefone('telefones-container-vet')">+ Adicionar Telefone</button>
            <div class="form-group"><label>Emails (separados por vírgula)</label><input type="text" id="vet-emails"></div>
            <button type="submit" class="btn btn-success">Salvar</button>
            <button type="button" class="btn" onclick="window.fecharModal()">Cancelar</button>
        </form>
    `;
    abrirModal('Novo Veterinário', html);
    adicionarTelefone('telefones-container-vet');

    document.getElementById('form-veterinario').addEventListener('submit', async function (e) {
        e.preventDefault();
        const cpfLimpo = document.getElementById('vet-cpf').value.replace(/[^0-9]/g, '');
        const telefones = [];
        document.querySelectorAll('#telefones-container-vet .telefone-item').forEach(item => {
            const ddi = parseInt(item.querySelector('.telefone-ddi').value) || 55;
            const ddd = parseInt(item.querySelector('.telefone-ddd').value) || 0;
            const numero = item.querySelector('.telefone-numero').value.trim();
            if (ddd > 0 && numero)
                telefones.push({ddi, ddd, numero});
        });
        const dados = {
            veterinario: {
                nome: document.getElementById('vet-nome').value.trim(),
                cpf: cpfLimpo,
                crmv: document.getElementById('vet-crmv').value.trim(),
                senha: document.getElementById('vet-senha').value.trim() || '123456'
            },
            endereco: {
                cep: document.getElementById('vet-cep').value,
                siglaTipoLogradouro: document.getElementById('vet-tipo').value,
                logradouro: document.getElementById('vet-logradouro').value,
                bairro: document.getElementById('vet-bairro').value,
                cidade: document.getElementById('vet-cidade').value,
                uf: document.getElementById('vet-uf').value
            },
            numero: document.getElementById('vet-numero').value,
            complemento: document.getElementById('vet-complemento').value,
            telefones: telefones,
            emails: document.getElementById('vet-emails').value.split(',').map(s => s.trim()).filter(s => s)
        };
        try {
            const result = await salvarVeterinarioCompleto(dados);
            alert('✅ Veterinário cadastrado com ID: ' + result.id);
            fecharModal();
            render();
        } catch (e) {
            alert('❌ Erro: ' + e.message);
        }
    });
}

export async function excluirVeterinario(id) {
    if (!confirm('Deseja excluir este veterinário?')) return;
    try {
        await excluirVeterinarioApi(id);
        alert('Veterinário excluído.');
        render();
    } catch (e) {
        alert('Erro: ' + e.message);
    }
}

window.visualizarVeterinario = visualizarVeterinario;
window.excluirVeterinario = excluirVeterinario;
window.formVeterinario = formVeterinario;