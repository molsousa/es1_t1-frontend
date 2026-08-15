// ================================================================
// 1. CONFIGURAÇÕES GERAIS
// ================================================================

console.log('🚀 main.js carregado');
const API_BASE = 'http://localhost:8080/Clinica/api';

// Caches para inicializar sessões (preenchidos via API)
let tutores = [];
let pets = [];
let consultas = [];
let atendimentos = [];
let vacinas = []; // histórico de vacinas aplicadas + agendadas

// Caches para combos
let tiposLogradouro = [];
let veterinariosList = [];
let ufs = [];
let especies = [];
let racas = [];
let sexos = [];
let ddds = [];
let listaVacinas = []; // catálogo de vacinas (id, nome)

// ================================================================
// 2. FUNÇÕES AUXILIARES
// ================================================================

function proximoId(colecao) {
    if (colecao.length === 0)
        return 1;
    return Math.max(...colecao.map(i => i.id)) + 1;
}

function nomeTutor(id) {
    const t = tutores.find(t => t.id === id);
    return t ? t.nome : 'Desconhecido';
}

function nomePet(id) {
    const p = pets.find(p => p.id === id);
    return p ? p.nome : 'Desconhecido';
}

function getPet(id) {
    return pets.find(p => p.id === id);
}

function formatarDataHora(data, hora) {
    if (!data)
        return 'Data inválida';
    const d = new Date(data + 'T' + (hora || '00:00:00'));
    return d.toLocaleString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});
}

function formatarData(dt) {
    if (!dt)
        return '';
    const d = new Date(dt);
    return d.toLocaleDateString('pt-BR');
}

function calcularProximaData(dataAplicacao, meses) {
    const d = new Date(dataAplicacao);
    d.setMonth(d.getMonth() + meses);
    return d.toISOString().split('T')[0];
}

function statusBadge(status) {
    const map = {
        'agendada': '<span class="badge badge-warning">Agendada</span>',
        'realizada': '<span class="badge badge-success">Realizada</span>',
        'cancelada': '<span class="badge badge-danger">Cancelada</span>'
    };
    return map[status] || status;
}

function vacinaProxima(vacina) {
    const hoje = new Date();
    const prox = new Date(vacina.dataProxima);
    const diff = (prox - hoje) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 30;
}

// ================================================================
// TELEFONES DINÂMICOS
// ================================================================

function adicionarTelefone(containerId) {
    const container = document.getElementById(containerId);
    if (!container)
        return;
    const div = document.createElement('div');
    div.className = 'telefone-item';
    const dddOptions = ddds.length
            ? ddds.map(d => `<option value="${d}">${d}</option>`).join('')
            : '<option value="">---</option>';
    div.innerHTML = `
        <div class="form-group" style="display:flex; gap:10px; align-items:center;">
            <div style="flex:1;">
                <label>DDI</label>
                <input type="number" class="telefone-ddi" value="55" style="width:70px;">
            </div>
            <div style="flex:1;">
                <label>DDD</label>
                <select class="telefone-ddd" style="width:80px;">
                    <option value="">---</option>
                    ${dddOptions}
                </select>
            </div>
            <div style="flex:2;">
                <label>Número</label>
                <input type="text" class="telefone-numero" placeholder="9 9999-9999" style="width:150px;">
            </div>
            <button type="button" onclick="removerTelefone(this)" style="margin-top:18px;">✕</button>
        </div>
    `;
    container.appendChild(div);
}

function removerTelefone(btn) {
    const item = btn.closest('.telefone-item');
    if (item)
        item.remove();
}

// ================================================================
// CARREGAR DADOS (combos e listas)
// ================================================================

async function carregarTiposLogradouro() {
    try {
        const resp = await fetch(`${API_BASE}/tipos-logradouro`);
        if (resp.ok)
            tiposLogradouro = await resp.json();
        else
            console.warn('Erro ao carregar tipos de logradouro');
    } catch (e) {
        tiposLogradouro = [];
    }
}

async function carregarUFs() {
    try {
        const resp = await fetch(`${API_BASE}/uf`);
        if (resp.ok)
            ufs = await resp.json();
        else
            console.warn('Erro ao carregar UFs');
    } catch (e) {
        ufs = [];
    }
}

async function carregarEspecies() {
    try {
        const resp = await fetch(`${API_BASE}/especies`);
        if (resp.ok)
            especies = await resp.json();
        else
            console.warn('Erro ao carregar espécies');
    } catch (e) {
        especies = [];
    }
}

async function carregarRacas() {
    try {
        const resp = await fetch(`${API_BASE}/racas`);
        if (resp.ok)
            racas = await resp.json();
        else
            console.warn('Erro ao carregar raças');
    } catch (e) {
        racas = [];
    }
}

async function carregarSexos() {
    try {
        const resp = await fetch(`${API_BASE}/sexos`);
        if (resp.ok)
            sexos = await resp.json();
        else
            console.warn('Erro ao carregar sexos');
    } catch (e) {
        sexos = [];
    }
}

async function carregarDDDs() {
    try {
        const resp = await fetch(`${API_BASE}/ddd`);
        if (resp.ok)
            ddds = await resp.json();
        else
            ddds = [11, 21, 31, 41, 51, 61, 71, 81, 91];
    } catch (e) {
        ddds = [11, 21, 31, 41, 51, 61, 71, 81, 91];
    }
}

// --- Vacinas (catálogo) ---
async function carregarVacinas() {
    try {
        const resp = await fetch(`${API_BASE}/vacinas`);
        if (resp.ok) {
            listaVacinas = await resp.json();
        } else {
            console.warn('Erro ao carregar vacinas');
        }
    } catch (e) {
        console.warn('Falha ao carregar vacinas', e);
        listaVacinas = [];
    }
}

// --- Vacinas (aplicadas + agendadas) ---
async function carregarTodasVacinasAplicadas() {
    try {
        const resp = await fetch(`${API_BASE}/vacinas/aplicadas`);
        if (!resp.ok)
            throw new Error('Erro ao carregar histórico');
        const data = await resp.json();
        vacinas = data;
        return data;
    } catch (e) {
        console.warn('Erro ao carregar vacinas aplicadas', e);
        vacinas = [];
        return [];
    }
}

// --- Tutores ---
async function carregarTutores() {
    try {
        const resp = await fetch(`${API_BASE}/tutor`);
        if (!resp.ok)
            throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        if (data.length > 0)
            tutores = data;
        return data;
    } catch (e) {
        return tutores;
    }
}

async function carregarTutorCompleto(id) {
    const resp = await fetch(`${API_BASE}/tutor/${id}/completo`);
    if (!resp.ok)
        throw new Error('Erro ao carregar tutor completo');
    return await resp.json();
}

async function salvarTutorCompleto(dados) {
    const resp = await fetch(`${API_BASE}/tutor/completo`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(dados)
    });
    if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`Erro ${resp.status}: ${errorText}`);
    }
    return await resp.json();
}

async function excluirTutorApi(id) {
    try {
        const resp = await fetch(`${API_BASE}/tutor/${id}`, {method: 'DELETE'});
        if (!resp.ok)
            throw new Error('Erro');
        tutores = tutores.filter(t => t.id !== id);
        return true;
    } catch (e) {
        tutores = tutores.filter(t => t.id !== id);
        return true;
    }
}

// --- Pets ---
async function carregarPets() {
    try {
        const resp = await fetch(`${API_BASE}/pet/all`);
        if (!resp.ok)
            throw new Error('Erro');
        const data = await resp.json();
        if (data.length > 0)
            pets = data;
        window.petsCache = pets;
        return data;
    } catch (e) {
        return pets;
    }
}

async function carregarPetCompleto(id) {
    const resp = await fetch(`${API_BASE}/pet/${id}/completo`);
    if (!resp.ok)
        throw new Error('Erro ao carregar pet completo');
    return await resp.json();
}

async function salvarPet(pet) {
    try {
        const resp = await fetch(`${API_BASE}/pet`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(pet)
        });
        if (!resp.ok)
            throw new Error('Erro');
        const result = await resp.json();
        pet.id = result.id;
        pets.push(pet);
        window.petsCache = pets;
        return result;
    } catch (e) {
        pet.id = proximoId(pets);
        pets.push(pet);
        window.petsCache = pets;
        return {id: pet.id};
    }
}

async function excluirPetApi(id) {
    try {
        const resp = await fetch(`${API_BASE}/pet/${id}`, {method: 'DELETE'});
        if (!resp.ok)
            throw new Error('Erro');
        pets = pets.filter(p => p.id !== id);
        window.petsCache = pets;
        return true;
    } catch (e) {
        pets = pets.filter(p => p.id !== id);
        window.petsCache = pets;
        return true;
    }
}

// --- Consultas ---
async function carregarConsultas() {
    try {
        const resp = await fetch(`${API_BASE}/consulta/all`);
        if (!resp.ok)
            throw new Error('Erro');
        const data = await resp.json();
        if (data.length > 0)
            consultas = data;
        return data;
    } catch (e) {
        return consultas;
    }
}

async function salvarConsulta(consulta) {
    const dataHora = consulta.dataHora.split('T');
    const dataConsulta = dataHora[0];
    const horaConsulta = dataHora[1] ? dataHora[1] + ':00' : '00:00:00';
    const consultaParaEnviar = {
        dataConsulta: dataConsulta,
        horaConsulta: horaConsulta,
        motivo: consulta.motivo,
        idPet: consulta.petId,
        idVeterinario: consulta.idVeterinario || 1,
        idAtendente: 1
    };
    try {
        const resp = await fetch(`${API_BASE}/consulta`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(consultaParaEnviar)
        });
        if (!resp.ok)
            throw new Error('Erro');
        const result = await resp.json();
        consulta.id = result.id;
        consultas.push(consulta);
        return result;
    } catch (e) {
        consulta.id = proximoId(consultas);
        consultas.push(consulta);
        return {id: consulta.id};
    }
}

// --- Vacinas pendentes (inclui futuras e próximas) ---
async function carregarVacinasPendentes() {
    // Busca todas as vacinas do cache (aplicadas + agendadas)
    // Se a data de aplicação for futura, consideramos pendente (agendada).
    // Se já passou, calculamos a próxima data com base na periodicidade.
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const pendentes = [];

    for (const v of vacinas) {
        const dataAplic = new Date(v.dataAplicacao);
        dataAplic.setHours(0, 0, 0, 0);
        if (dataAplic > hoje) {
            // Ainda não aplicada -> pendente
            pendentes.push({
                ...v,
                dataProxima: v.dataAplicacao,
                status: 'agendada'
            });
        } else {
            // Já aplicada, verifica próxima dose se tiver periodicidade
            if (v.periodicidadeMeses) {
                const proxima = calcularProximaData(v.dataAplicacao, v.periodicidadeMeses);
                const dataProx = new Date(proxima);
                dataProx.setHours(0, 0, 0, 0);
                const diff = (dataProx - hoje) / (1000 * 60 * 60 * 24);
                if (diff >= 0 && diff <= 30) {
                    pendentes.push({
                        ...v,
                        dataProxima: proxima,
                        status: 'pendente'
                    });
                }
            }
        }
    }
    return pendentes;
}

// --- Veterinários ---
async function carregarVeterinarios() {
    try {
        const resp = await fetch(`${API_BASE}/veterinario`);
        if (!resp.ok)
            throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        veterinariosList = data;
        return data;
    } catch (e) {
        veterinariosList = [];
        return [];
    }
}

async function carregarVeterinarioCompleto(id) {
    const resp = await fetch(`${API_BASE}/veterinario/${id}/completo`);
    if (!resp.ok)
        throw new Error('Erro ao carregar veterinário completo');
    return await resp.json();
}

async function salvarVeterinarioCompleto(dados) {
    const resp = await fetch(`${API_BASE}/veterinario/completo`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(dados)
    });
    if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`Erro ${resp.status}: ${errorText}`);
    }
    return await resp.json();
}

async function excluirVeterinarioApi(id) {
    const resp = await fetch(`${API_BASE}/veterinario/${id}`, {method: 'DELETE'});
    if (!resp.ok)
        throw new Error('Erro ao excluir');
    return true;
}

// --- Relatórios ---
async function carregarDadosRelatorios(inicio, fim) {
    const resp = await fetch(`${API_BASE}/relatorios?inicio=${inicio}&fim=${fim}`);
    if (!resp.ok)
        throw new Error('Erro ao carregar dados dos relatórios');
    return await resp.json();
}

// --- Vacinas aplicadas - salvar ---
async function salvarVacina(dados) {
    const resp = await fetch(`${API_BASE}/vacinas`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(dados)
    });
    if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`Erro ${resp.status}: ${errorText}`);
    }
    return await resp.json();
}

// ================================================================
// GERENCIAMENTO DE PÁGINAS
// ================================================================

let paginaAtual = 'dashboard';

// Mapeamento de funções de renderização
const renderFns = {
    'dashboard': renderDashboard,
    'tutores': renderTutores,
    'pets': renderPets,
    'consultas': renderConsultas,
    'prontuario': renderProntuario,
    'atendimentos': renderAtendimentos,
    'vacinas': renderVacinas,
    'relatorios': renderRelatorios,
    'veterinarios': renderVeterinarios,
    'chatbot': renderChatbot
};

function mostrarPagina(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById('page-' + id);
    if (page)
        page.classList.add('active');
    document.querySelectorAll('.menu a').forEach(link => {
        link.classList.toggle('active', link.dataset.page === id);
    });
    paginaAtual = id;

    const renderFn = renderFns[id];
    if (renderFn)
        renderFn();
}

document.querySelectorAll('.menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        if (page)
            mostrarPagina(page);
    });
});

// Inicialização
(async function init() {
    await Promise.all([
        carregarTiposLogradouro(),
        carregarUFs(),
        carregarEspecies(),
        carregarRacas(),
        carregarSexos(),
        carregarDDDs(),
        carregarVeterinarios(),
        carregarVacinas(),
        carregarPets(),
        carregarTodasVacinasAplicadas()
    ]);
    mostrarPagina('dashboard');
})();

// ================================================================
// MODAL
// ================================================================

function abrirModal(titulo, html) {
    document.getElementById('modalBootstrapTitle').textContent = titulo;
    document.getElementById('modalBootstrapBody').innerHTML = html;
    const modal = new bootstrap.Modal(document.getElementById('modalBootstrap'));
    modal.show();
}

function fecharModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalBootstrap'));
    if (modal)
        modal.hide();
}

// ================================================================
// RENDERIZAÇÃO DAS PÁGINAS
// ================================================================

// ----- 6.1 DASHBOARD -----
async function renderDashboard() {
    const tutoresData = await carregarTutores();
    const petsData = await carregarPets();
    const consultasData = await carregarConsultas();
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

// ----- 6.2 TUTORES -----
async function renderTutores() {
    const lista = await carregarTutores();
    window.tutoresCache = lista;
    let html = `
        <div class="card">
            <div class="card-header">
                <h3>👤 Tutores</h3>
                <button class="btn btn-primary" onclick="formTutor()">+ Adicionar Tutor</button>
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
                                <button class="btn btn-info btn-sm" onclick="visualizarTutor(${t.id})">Visualizar</button>
                                <button class="btn btn-danger btn-sm" onclick="excluirTutor(${t.id})">Excluir</button>
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
async function visualizarTutor(id) {
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

function formTutor() {
    const titulo = 'Novo Tutor';
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
            <button type="button" class="btn btn-primary btn-sm" onclick="adicionarTelefone('telefones-container')">+ Adicionar Telefone</button>
            <div class="form-group"><label>Emails (separados por vírgula)</label><input type="text" id="tutor-emails"></div>
            <button type="submit" class="btn btn-success">Salvar</button>
            <button type="button" class="btn" onclick="fecharModal()">Cancelar</button>
        </form>
    `;
    abrirModal(titulo, html);
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
            renderTutores();
        } catch (e) {
            alert('❌ Erro: ' + e.message);
        }
    });
}

async function excluirTutor(id) {
    if (!confirm('Deseja excluir este tutor?'))
        return;
    try {
        await excluirTutorApi(id);
        alert('Tutor excluído.');
        renderTutores();
    } catch (e) {
        alert('Erro: ' + e.message);
    }
}

// ----- 6.3 PETS -----
async function renderPets() {
    const lista = await carregarPets();
    window.petsCache = lista;
    const tutoresLista = await carregarTutores();
    window.tutoresCache = tutoresLista;

    let html = `
        <div class="card">
            <div class="card-header">
                <h3>🐶 Pets</h3>
                <button class="btn btn-primary" onclick="formPet()">+ Adicionar Pet</button>
            </div>
            ${lista.length === 0 ? '<p>Nenhum pet cadastrado.</p>' : `
            <table>
                <thead><tr><th>Nome</th><th>Tutor</th><th>Ações</th></tr></thead>
                <tbody>
                    ${lista.map(p => `
                        <tr>
                            <td>${p.nome}</td>
                            <td>${nomeTutor(p.tutorId)}</td>
                            <td>
                                <button class="btn btn-info btn-sm" onclick="visualizarPet(${p.id})">Visualizar</button>
                                <button class="btn btn-danger btn-sm" onclick="excluirPet(${p.id})">Excluir</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            `}
        </div>
    `;
    document.getElementById('page-pets').innerHTML = html;
}

// --- Visualizar Pet ---
async function visualizarPet(id) {
    try {
        const data = await carregarPetCompleto(id);
        const pet = data.pet;
        const tutor = data.tutor;
        const especie = especies.find(e => e.id === pet.idEspecie);
        const raca = racas.find(r => r.id === pet.idRaca);
        const sexo = sexos.find(s => s.id === pet.idSexo);
        exibirPetModal(pet, tutor, especie, raca, sexo);
    } catch (e) {
        const pet = pets.find(p => p.id === id);
        if (!pet) {
            alert('Pet não encontrado.');
            return;
        }
        const tutor = tutores.find(t => t.id === pet.tutorId);
        const especie = especies.find(e => e.id === pet.idEspecie);
        const raca = racas.find(r => r.id === pet.idRaca);
        const sexo = sexos.find(s => s.id === pet.idSexo);
        exibirPetModal(pet, tutor, especie, raca, sexo);
    }
}

function exibirPetModal(pet, tutor, especie, raca, sexo) {
    const html = `
        <div style="font-family: monospace;">
            <h4>Dados do Pet</h4>
            <p><strong>ID:</strong> ${pet.id}</p>
            <p><strong>Nome:</strong> ${pet.nome}</p>
            <p><strong>Espécie:</strong> ${especie ? especie.descricao : '-'}</p>
            <p><strong>Raça:</strong> ${raca ? raca.descricao : '-'}</p>
            <p><strong>Sexo:</strong> ${sexo ? sexo.descricao : '-'}</p>
            <p><strong>Data Nascimento:</strong> ${pet.dataNascimento ? formatarData(pet.dataNascimento) : '-'}</p>
            <p><strong>Tutor:</strong> ${tutor ? tutor.nome : 'Desconhecido'}</p>
        </div>
    `;
    abrirModal('Visualizar Pet', html);
}

function formPet() {
    const titulo = 'Novo Pet';
    const tutorOptions = (window.tutoresCache || []).map(t =>
            `<option value="${t.id}">${t.nome}</option>`
    ).join('');
    const especieOptions = especies.map(e =>
            `<option value="${e.id}">${e.descricao}</option>`
    ).join('');
    const racaOptions = racas.map(r =>
            `<option value="${r.id}">${r.descricao}</option>`
    ).join('');
    const sexoOptions = sexos.map(s =>
            `<option value="${s.id}">${s.descricao}</option>`
    ).join('');

    const html = `
        <form id="form-pet">
            <div class="form-group"><label>Nome *</label><input type="text" id="pet-nome" required></div>
            <div class="form-group"><label>Data de Nascimento</label><input type="date" id="pet-data"></div>
            <div class="form-group"><label>Espécie *</label><select id="pet-especie" required><option value="">Selecione</option>${especieOptions}</select></div>
            <div class="form-group"><label>Raça *</label><select id="pet-raca" required><option value="">Selecione</option>${racaOptions}</select></div>
            <div class="form-group"><label>Sexo *</label><select id="pet-sexo" required><option value="">Selecione</option>${sexoOptions}</select></div>
            <div class="form-group"><label>Tutor *</label><select id="pet-tutor" required><option value="">Selecione</option>${tutorOptions}</select></div>
            <button type="submit" class="btn btn-success">Salvar</button>
            <button type="button" class="btn" onclick="fecharModal()">Cancelar</button>
        </form>
    `;
    abrirModal(titulo, html);

    document.getElementById('form-pet').addEventListener('submit', async function (e) {
        e.preventDefault();
        const dados = {
            nome: document.getElementById('pet-nome').value.trim(),
            dataNascimento: document.getElementById('pet-data').value,
            idEspecie: parseInt(document.getElementById('pet-especie').value),
            idRaca: parseInt(document.getElementById('pet-raca').value),
            idSexo: parseInt(document.getElementById('pet-sexo').value),
            tutorId: parseInt(document.getElementById('pet-tutor').value)
        };
        try {
            const result = await salvarPet(dados);
            alert('Pet cadastrado com ID: ' + result.id);
            fecharModal();
            renderPets();
        } catch (e) {
            alert('Erro: ' + e.message);
        }
    });
}

async function excluirPet(id) {
    if (!confirm('Deseja excluir este pet?'))
        return;
    try {
        await excluirPetApi(id);
        alert('Pet excluído.');
        renderPets();
    } catch (e) {
        alert('Erro: ' + e.message);
    }
}

// ----- 6.4 CONSULTAS -----
async function renderConsultas() {
    const lista = await carregarConsultas();
    window.consultasCache = lista;
    let html = `
        <div class="card">
            <div class="card-header">
                <h3>📅 Consultas</h3>
                <button class="btn btn-primary" onclick="formConsulta()">+ Agendar Consulta</button>
            </div>
            ${lista.length === 0 ? '<p>Nenhuma consulta agendada.</p>' : `
            <table>
                <thead><tr><th>Pet</th><th>Veterinário</th><th>Data/Hora</th><th>Motivo</th><th>Status</th><th>Ações</th></tr></thead>
                <tbody>
                    ${lista.map(c => {
        let nomeVet = 'Desconhecido';
        if (c.idVeterinario) {
            const vet = veterinariosList.find(v => v.id === c.idVeterinario);
            if (vet)
                nomeVet = vet.nome;
        } else if (c.veterinario) {
            nomeVet = c.veterinario;
        }
        const dataHora = c.dataHora || formatarDataHora(c.dataConsulta, c.horaConsulta);
        return `
                        <tr>
                            <td>${nomePet(c.petId)}</td>
                            <td>${nomeVet}</td>
                            <td>${c.dataHora || formatarDataHora(c.dataConsulta, c.horaConsulta)}</td>
                            <td>${c.motivo}</td>
                            <td>${statusBadge(c.status || 'agendada')}</td>
                            <td>
                                ${(c.status === 'agendada' || !c.status) ? `<button class="btn btn-success btn-sm" onclick="realizarConsulta(${c.id})">Realizar</button>` : ''}
                                <button class="btn btn-danger btn-sm" onclick="cancelarConsulta(${c.id})">Cancelar</button>
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

async function formConsulta() {
    if (veterinariosList.length === 0) {
        await carregarVeterinarios();
    }

    const titulo = 'Nova Consulta';
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
            <button type="button" class="btn" onclick="fecharModal()">Cancelar</button>
        </form>
    `;
    abrirModal(titulo, html);

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
            renderConsultas();
        } catch (e) {
            alert('Erro: ' + e.message);
        }
    });
}

async function realizarConsulta(id) {
    const c = window.consultasCache.find(c => c.id === id);
    if (!c)
        return;
    if (c.status === 'realizada')
        return;
    c.status = 'realizada';
    renderConsultas();
    mostrarPagina('atendimentos');
}

async function cancelarConsulta(id) {
    if (!confirm('Cancelar esta consulta?'))
        return;
    const c = window.consultasCache.find(c => c.id === id);
    if (c)
        c.status = 'cancelada';
    renderConsultas();
}

// ----- 6.5 PRONTUÁRIO -----
function renderProntuario() {
    const petOptions = (window.petsCache || []).map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
    const html = `
        <div class="card">
            <div class="card-header"><h3>📋 Prontuário do PET</h3></div>
            <div class="form-group" style="max-width:300px;">
                <label>Selecione o PET</label>
                <select id="prontuario-pet" onchange="carregarProntuario()">
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

function carregarProntuario() {
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

    // Buscar espécie e raça pelos arrays carregados
    const especieObj = especies.find(e => e.id === pet.idEspecie);
    const racaObj = racas.find(r => r.id === pet.idRaca);
    const nomeEspecie = especieObj ? especieObj.descricao : 'Não encontrada';
    const nomeRaca = racaObj ? racaObj.descricao : 'SRD';

    const consultasPet = (window.consultasCache || []).filter(c => c.petId === petId && c.status === 'realizada');
    const atendimentosPet = atendimentos.filter(a => a.petId === petId);
    // Filtra vacinas do pet a partir do cache global 'vacinas'
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
            if (vet)
                nomeVet = vet.nome;
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
}

// ----- 6.6 ATENDIMENTOS -----
function renderAtendimentos() {
    const petOptions = (window.petsCache || []).map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
    const consultaOptions = (window.consultasCache || []).filter(c => c.status === 'realizada').map(c =>
            `<option value="${c.id}">${nomePet(c.petId)} - ${formatarDataHora(c.dataConsulta, c.horaConsulta)}</option>`
    ).join('');

    let html = `
        <div class="card">
            <div class="card-header">
                <h3>🩺 Atendimentos</h3>
                <button class="btn btn-primary" onclick="formAtendimento()">+ Registrar Atendimento</button>
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
                                <button class="btn btn-primary btn-sm" onclick="formAtendimento(${a.id})">Editar</button>
                                <button class="btn btn-danger btn-sm" onclick="excluirAtendimento(${a.id})">Excluir</button>
                                <button class="btn btn-warning btn-sm" onclick="emitirPrescricao(${a.id})">Prescrição</button>
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

function formAtendimento(id = null) {
    const atend = id ? atendimentos.find(a => a.id === id) : null;
    const titulo = atend ? 'Editar Atendimento' : 'Novo Atendimento';
    const petOptions = (window.petsCache || []).map(p => `
        <option value="${p.id}" ${atend && atend.petId === p.id ? 'selected' : ''}>${p.nome}</option>
    `).join('');
    const consultaOptions = (window.consultasCache || []).filter(c => c.status === 'realizada').map(c =>
            `<option value="${c.id}" ${atend && atend.consultaId === c.id ? 'selected' : ''}>${nomePet(c.petId)} - ${formatarDataHora(c.dataConsulta, c.horaConsulta)}</option>`
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
            <button type="button" class="btn" onclick="fecharModal()">Cancelar</button>
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
            renderAtendimentos();
        } catch (e) {
            alert('Erro: ' + e.message);
        }
    });
}

function excluirAtendimento(id) {
    if (!confirm('Excluir atendimento?'))
        return;
    atendimentos = atendimentos.filter(a => a.id !== id);
    renderAtendimentos();
}

function emitirPrescricao(id) {
    const atend = atendimentos.find(a => a.id === id);
    if (!atend)
        return;
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
            <button class="btn" onclick="fecharModal()">Fechar</button>
        </div>
    `;
    abrirModal('📄 Emitir Prescrição', html);
}

// ----- 6.7 VACINAS -----
async function renderVacinas() {
    // Carrega histórico completo (já deve ter sido carregado na inicialização, mas recarregamos para garantir)
    await carregarTodasVacinasAplicadas();
    const listaPendentes = await carregarVacinasPendentes();

    const petOptions = (window.petsCache || []).map(p => `<option value="${p.id}">${p.nome}</option>`).join('');

    let html = `
        <div class="card">
            <div class="card-header">
                <h3>💉 Controle de Vacinas</h3>
                <button class="btn btn-primary" onclick="formVacina()">+ Registrar Vacina</button>
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
                                    <button class="btn btn-danger btn-sm" onclick="excluirVacina(${v.id})">Excluir</button>
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

function formVacina(id = null) {
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
            <button type="button" class="btn" onclick="fecharModal()">Cancelar</button>
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
            // Recarrega o histórico após salvar
            await carregarTodasVacinasAplicadas();
            fecharModal();
            renderVacinas();
        } catch (e) {
            alert('❌ Erro ao registrar vacina: ' + e.message);
        }
    });
}

async function excluirVacina(id) {
    if (!confirm('Excluir registro de vacina?'))
        return;
    try {
        const resp = await fetch(`${API_BASE}/vacinas/${id}`, {method: 'DELETE'});
        if (!resp.ok) {
            const errorText = await resp.text();
            throw new Error(`Erro ${resp.status}: ${errorText}`);
        }
        alert('✅ Vacina excluída.');
        // Recarrega o histórico após excluir
        await carregarTodasVacinasAplicadas();
        renderVacinas();
    } catch (e) {
        alert('❌ Erro ao excluir vacina: ' + e.message);
    }
}

// ----- 6.8 RELATÓRIOS -----
let chartInstance = null;

function renderRelatorios() {
    const html = `
        <div class="card">
            <div class="card-header"><h3>📈 Relatórios Gerenciais</h3></div>
            <div class="row">
                <div class="col">
                    <div class="form-group">
                        <label>Data Inicial</label>
                        <input type="date" id="rel-inicio" value="${new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]}">
                    </div>
                </div>
                <div class="col">
                    <div class="form-group">
                        <label>Data Final</label>
                        <input type="date" id="rel-fim" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                </div>
                <div class="col">
                    <button class="btn btn-primary" onclick="gerarRelatorios()" style="margin-top:22px;">Filtrar</button>
                </div>
            </div>
            <div id="relatorios-container">
                <div class="row">
                    <div class="col"><canvas id="chart-tipos"></canvas></div>
                    <div class="col"><canvas id="chart-motivos"></canvas></div>
                </div>
                <div class="row">
                    <div class="col"><canvas id="chart-vacinas"></canvas></div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('page-relatorios').innerHTML = html;
    setTimeout(() => gerarRelatorios(), 100);
}

async function gerarRelatorios() {
    const inicio = document.getElementById('rel-inicio').value;
    const fim = document.getElementById('rel-fim').value;
    if (!inicio || !fim) {
        alert('Selecione um período.');
        return;
    }

    try {
        const dados = await carregarDadosRelatorios(inicio, fim);
        const labelsTipos = Object.keys(dados.tipos);
        const dataTipos = Object.values(dados.tipos);
        const labelsMotivos = Object.keys(dados.motivos);
        const dataMotivos = Object.values(dados.motivos);
        const labelsVacinas = Object.keys(dados.vacinas);
        const dataVacinas = Object.values(dados.vacinas);

        if (chartInstance) {
            if (Array.isArray(chartInstance)) {
                chartInstance.forEach(ch => ch.destroy());
            } else {
                chartInstance.destroy();
            }
        }
        chartInstance = [];

        const ctx1 = document.getElementById('chart-tipos').getContext('2d');
        const chart1 = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: labelsTipos.length ? labelsTipos : ['Nenhum dado'],
                datasets: [{
                        label: 'Atendimentos por tipo',
                        data: labelsTipos.length ? dataTipos : [0],
                        backgroundColor: ['#4a9eff', '#ff6b6b', '#ffd93d', '#6bcb77', '#a29bfe']
                    }]
            },
            options: {responsive: true, plugins: {title: {display: true, text: 'Tipos de PET mais atendidos'}}}
        });
        chartInstance.push(chart1);

        const ctx2 = document.getElementById('chart-motivos').getContext('2d');
        const chart2 = new Chart(ctx2, {
            type: 'pie',
            data: {
                labels: labelsMotivos.length ? labelsMotivos : ['Nenhum dado'],
                datasets: [{
                        label: 'Motivos recorrentes',
                        data: labelsMotivos.length ? dataMotivos : [0],
                        backgroundColor: ['#4a9eff', '#ff6b6b', '#ffd93d', '#6bcb77', '#a29bfe']
                    }]
            },
            options: {responsive: true, plugins: {title: {display: true, text: 'Principais motivos de consulta'}}}
        });
        chartInstance.push(chart2);

        const ctx3 = document.getElementById('chart-vacinas').getContext('2d');
        const chart3 = new Chart(ctx3, {
            type: 'bar',
            data: {
                labels: labelsVacinas.length ? labelsVacinas : ['Nenhum dado'],
                datasets: [{
                        label: 'Vacinas aplicadas no período',
                        data: labelsVacinas.length ? dataVacinas : [0],
                        backgroundColor: '#4a9eff'
                    }]
            },
            options: {responsive: true, plugins: {title: {display: true, text: 'Vacinas mais aplicadas'}}}
        });
        chartInstance.push(chart3);
    } catch (e) {
        alert('Erro ao carregar dados dos relatórios: ' + e.message);
    }
}

// ----- 6.9 VETERINÁRIOS -----
async function renderVeterinarios() {
    const lista = await carregarVeterinarios();
    window.veterinariosCache = lista;
    let html = `
        <div class="card">
            <div class="card-header">
                <h3>🩺 Veterinários</h3>
                <button class="btn btn-primary" onclick="formVeterinario()">+ Adicionar Veterinário</button>
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
                                <button class="btn btn-info btn-sm" onclick="visualizarVeterinario(${v.id})">Visualizar</button>
                                <button class="btn btn-danger btn-sm" onclick="excluirVeterinario(${v.id})">Excluir</button>
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

// --- Visualizar Veterinário ---
async function visualizarVeterinario(id) {
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

function formVeterinario() {
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
            <button type="button" class="btn btn-primary btn-sm" onclick="adicionarTelefone('telefones-container-vet')">+ Adicionar Telefone</button>
            <div class="form-group"><label>Emails (separados por vírgula)</label><input type="text" id="vet-emails"></div>
            <button type="submit" class="btn btn-success">Salvar</button>
            <button type="button" class="btn" onclick="fecharModal()">Cancelar</button>
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
            renderVeterinarios();
        } catch (e) {
            alert('❌ Erro: ' + e.message);
        }
    });
}

async function excluirVeterinario(id) {
    if (!confirm('Deseja excluir este veterinário?'))
        return;
    try {
        await excluirVeterinarioApi(id);
        alert('Veterinário excluído.');
        renderVeterinarios();
    } catch (e) {
        alert('Erro: ' + e.message);
    }
}

// ================================================================
// CHATBOT - IA Conversacional
// ================================================================

// Mapeamento de intenções para funções assíncronas
const intencoes = {
    'pets_por_tutor': async (params) => {
        const nomeTutor = params.nomeTutor;
        if (!nomeTutor)
            return 'Por favor, informe o nome do tutor.';
        const tutor = tutores.find(t => t.nome.toLowerCase().includes(nomeTutor.toLowerCase()));
        if (!tutor)
            return `Tutor "${nomeTutor}" não encontrado.`;
        const petsDoTutor = pets.filter(p => p.tutorId === tutor.id);
        if (petsDoTutor.length === 0)
            return `O tutor ${tutor.nome} não possui pets cadastrados.`;
        return `🐶 Pets de ${tutor.nome}:\n${petsDoTutor.map(p => `- ${p.nome} (${p.especie || 'Espécie não definida'})`).join('\n')}`;
    },

    'dados_pet': async (params) => {
        const nomePet = params.nomePet;
        if (!nomePet)
            return 'Qual o nome do pet?';
        const pet = pets.find(p => p.nome.toLowerCase().includes(nomePet.toLowerCase()));
        if (!pet)
            return `Pet "${nomePet}" não encontrado.`;
        const tutor = tutores.find(t => t.id === pet.tutorId);
        const especie = especies.find(e => e.id === pet.idEspecie);
        const raca = racas.find(r => r.id === pet.idRaca);
        const sexo = sexos.find(s => s.id === pet.idSexo);
        return `📋 Dados do pet ${pet.nome}:\n- Espécie: ${especie ? especie.descricao : '-'}\n- Raça: ${raca ? raca.descricao : '-'}\n- Sexo: ${sexo ? sexo.descricao : '-'}\n- Data Nasc.: ${pet.dataNascimento ? formatarData(pet.dataNascimento) : '-'}\n- Tutor: ${tutor ? tutor.nome : 'Desconhecido'}`;
    },

    'vacinas_pendentes': async () => {
        const pendentes = await carregarVacinasPendentes();
        if (pendentes.length === 0)
            return 'Nenhuma vacina pendente.';
        return `💉 Vacinas pendentes:\n${pendentes.map(v => `- ${v.nomeVacina} para ${nomePet(v.petId)} (${v.status === 'agendada' ? 'Agendada para' : 'Próxima em'} ${formatarData(v.dataProxima)})`).join('\n')}`;
    },

    'vacinas_pet': async (params) => {
        const nomePet = params.nomePet;
        if (!nomePet)
            return 'Informe o nome do pet.';
        const pet = pets.find(p => p.nome.toLowerCase().includes(nomePet.toLowerCase()));
        if (!pet)
            return `Pet "${nomePet}" não encontrado.`;
        const vacinasPet = vacinas.filter(v => v.petId === pet.id);
        if (vacinasPet.length === 0)
            return `O pet ${pet.nome} não possui vacinas registradas.`;
        return `💉 Histórico de vacinas de ${pet.nome}:\n${vacinasPet.map(v => `- ${v.nomeVacina} em ${formatarData(v.dataAplicacao)} (${new Date(v.dataAplicacao) > new Date() ? 'Agendada' : 'Aplicada'})`).join('\n')}`;
    },

    'consultas_hoje': async () => {
        const hoje = new Date().toISOString().split('T')[0];
        const consultasHoje = consultas.filter(c => c.dataConsulta === hoje);
        if (consultasHoje.length === 0)
            return 'Nenhuma consulta agendada para hoje.';
        return `📅 Consultas de hoje:\n${consultasHoje.map(c => `- ${nomePet(c.petId)} com ${veterinariosList.find(v => v.id === c.idVeterinario)?.nome || 'Veterinário'} às ${c.horaConsulta || '--:--'}`).join('\n')}`;
    },

    'dados_tutor': async (params) => {
        const nomeTutor = params.nomeTutor;
        if (!nomeTutor)
            return 'Qual o nome do tutor?';
        const tutor = tutores.find(t => t.nome.toLowerCase().includes(nomeTutor.toLowerCase()));
        if (!tutor)
            return `Tutor "${nomeTutor}" não encontrado.`;
        try {
            const dto = await carregarTutorCompleto(tutor.id);
            const end = dto.endereco || {};
            const tels = dto.telefones || [];
            const emails = dto.emails || [];
            return `👤 Dados do tutor ${tutor.nome}:\n- CPF: ${tutor.cpf}\n- Endereço: ${end.logradouro || ''}, ${tutor.nroEndereco || ''} ${end.bairro || ''} - ${end.cidade || ''}/${end.uf || ''}\n- Telefones: ${tels.map(t => `(${t.ddi}) ${t.ddd} ${t.numero}`).join(', ') || '-'}\n- Emails: ${emails.join(', ') || '-'}`;
        } catch (e) {
            return `Erro ao buscar dados do tutor: ${e.message}`;
        }
    },

    'agendar_consulta': async () => {
        formConsulta();
        return '📅 Abrindo formulário para agendar consulta...';
    },

    'cadastrar_pet': async () => {
        formPet();
        return '🐶 Abrindo formulário para cadastrar novo pet...';
    },

    'ajuda': async () => {
        return `🤖 Comandos disponíveis:\n- "Quais pets o tutor [nome] tem?"\n- "Dados do pet [nome]"\n- "Vacinas pendentes"\n- "Vacinas do pet [nome]"\n- "Consultas de hoje"\n- "Dados do tutor [nome]"\n- "Agendar consulta"\n- "Cadastrar pet"`;
    }
};

// Função principal do interpretador
function interpretarMensagem(texto) {
    const lower = texto.toLowerCase().trim();

    // Ajuda
    if (/(?:o que|como|ajuda|comandos|pode fazer)/i.test(lower)) {
        return {intencao: 'ajuda', params: {}};
    }

    // Agendar consulta
    if (/(?:agendar|marcar)\s+consulta/i.test(lower)) {
        return {intencao: 'agendar_consulta', params: {}};
    }

    // Cadastrar pet
    if (/(?:cadastrar|novo)\s+pet/i.test(lower)) {
        return {intencao: 'cadastrar_pet', params: {}};
    }

    // Vacinas pendentes
    if (/(?:vacinas pendentes|pendentes|vencimento|próximas vacinas)/i.test(lower)) {
        return {intencao: 'vacinas_pendentes', params: {}};
    }

    // Consultas de hoje
    if (/(?:consultas de hoje|consultas hoje|hoje|agenda de hoje)/i.test(lower)) {
        return {intencao: 'consultas_hoje', params: {}};
    }

    // Pets por tutor
    let match = lower.match(/(?:pets do|pets de|tutor)\s+([a-zA-ZÀ-ÿ\s]+)(?: tem|\?)?/i);
    if (match) {
        return {intencao: 'pets_por_tutor', params: {nomeTutor: match[1].trim()}};
    }

    // Dados do tutor (extrai nome após "tutor" ou "dados do tutor")
    match = lower.match(/(?:dados do|informações do|mostre dados do)\s+tutor\s+([a-zA-ZÀ-ÿ\s]+)/i);
    if (match) {
        return {intencao: 'dados_tutor', params: {nomeTutor: match[1].trim()}};
    }
    // Fallback: se a frase contém "tutor" e um nome, captura
    match = lower.match(/tutor\s+([a-zA-ZÀ-ÿ\s]+)/i);
    if (match && !/(?:pets|vacinas|consultas)/i.test(lower)) {
        return {intencao: 'dados_tutor', params: {nomeTutor: match[1].trim()}};
    }

    // Vacinas de um pet
    match = lower.match(/(?:vacinas do|vacinas de|histórico de vacinas do)\s+([a-zA-ZÀ-ÿ\s]+)/i);
    if (match) {
        return {intencao: 'vacinas_pet', params: {nomePet: match[1].trim()}};
    }

    // Dados do pet (extrai nome após "pet" ou "dados do pet")
    match = lower.match(/(?:dados do|informações do|mostre dados do)\s+pet\s+([a-zA-ZÀ-ÿ\s]+)/i);
    if (match) {
        return {intencao: 'dados_pet', params: {nomePet: match[1].trim()}};
    }
    // Fallback: se a frase contém "pet" e um nome
    match = lower.match(/pet\s+([a-zA-ZÀ-ÿ\s]+)/i);
    if (match && !/(?:vacinas|consultas)/i.test(lower)) {
        return {intencao: 'dados_pet', params: {nomePet: match[1].trim()}};
    }

    // Se nada foi identificado
    return {intencao: null, params: {}};
}

// Executa a ação identificada e retorna a resposta em texto
async function executarIntencao(intencao, params) {
    if (!intencao || !intencoes[intencao]) {
        return 'Desculpe, não entendi o que você quer. Digite "ajuda" para ver os comandos disponíveis.';
    }
    try {
        return await intencoes[intencao](params);
    } catch (e) {
        return `❌ Erro ao executar: ${e.message}`;
    }
}

// Renderização da página do Chatbot
function renderChatbot() {
    const html = `
        <div class="card">
            <div class="card-header">
                <h3>🤖 Assistente Virtual - IA</h3>
                <span class="badge badge-info">Treinada para interpretar comandos em linguagem natural</span>
            </div>
            <div id="chat-container" style="display:flex; flex-direction:column; height:500px;">
                <div id="chat-messages" style="flex:1; overflow-y:auto; padding:10px; background:#f8fafc; border-radius:8px; margin-bottom:10px;">
                    <div class="chat-message bot">
                        Olá! Sou o assistente da Clínica Veterinária. Posso ajudar com:<br>
                        - Listar pets de um tutor<br>
                        - Consultar dados de um pet<br>
                        - Vacinas pendentes ou de um pet<br>
                        - Consultas de hoje<br>
                        - Dados de um tutor<br>
                        - Agendar consulta<br>
                        - Cadastrar pet<br><br>
                        <strong>Exemplo:</strong> "Quais pets o tutor João tem?"
                    </div>
                </div>
                <div style="display:flex; gap:10px;">
                    <input type="text" id="chat-input" class="form-control" placeholder="Digite sua mensagem..." style="flex:1;">
                    <button id="chat-send" class="btn btn-primary">Enviar</button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('page-chatbot').innerHTML = html;

    document.getElementById('chat-send').addEventListener('click', enviarMensagem);
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter')
            enviarMensagem();
    });
}

async function enviarMensagem() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg)
        return;

    addMensagem('user', msg);
    input.value = '';

    const interpretacao = interpretarMensagem(msg);
    const resposta = await executarIntencao(interpretacao.intencao, interpretacao.params);
    addMensagem('bot', resposta);
}

function addMensagem(tipo, texto) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `chat-message ${tipo}`;
    div.innerHTML = texto.replace(/\n/g, '<br>');
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}