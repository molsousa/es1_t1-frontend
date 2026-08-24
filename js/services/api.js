// ============================================================
// SERVIÇOS DE API E CACHE GLOBAL
// ============================================================

const API_BASE = 'http://localhost:8080/Clinica/api';

// Caches exportados
export let tutores = [];
export let pets = [];
export let consultas = [];
export let atendimentos = [];
export let vacinas = [];
export let veterinariosList = [];
export let tiposLogradouro = [];
export let ufs = [];
export let especies = [];
export let racas = [];
export let sexos = [];
export let ddds = [];
export let listaVacinas = [];

// --- Funções de carregamento ---

export async function carregarTiposLogradouro() {
    try {
        const resp = await fetch(`${API_BASE}/tipos-logradouro`);
        if (resp.ok) tiposLogradouro = await resp.json();
        else console.warn('Erro ao carregar tipos de logradouro');
    } catch (e) { tiposLogradouro = []; }
}

export async function carregarUFs() {
    try {
        const resp = await fetch(`${API_BASE}/uf`);
        if (resp.ok) ufs = await resp.json();
        else console.warn('Erro ao carregar UFs');
    } catch (e) { ufs = []; }
}

export async function carregarEspecies() {
    try {
        const resp = await fetch(`${API_BASE}/especies`);
        if (resp.ok) especies = await resp.json();
        else console.warn('Erro ao carregar espécies');
    } catch (e) { especies = []; }
}

export async function carregarRacas() {
    try {
        const resp = await fetch(`${API_BASE}/racas`);
        if (resp.ok) racas = await resp.json();
        else console.warn('Erro ao carregar raças');
    } catch (e) { racas = []; }
}

export async function carregarSexos() {
    try {
        const resp = await fetch(`${API_BASE}/sexos`);
        if (resp.ok) sexos = await resp.json();
        else console.warn('Erro ao carregar sexos');
    } catch (e) { sexos = []; }
}

export async function carregarDDDs() {
    try {
        const resp = await fetch(`${API_BASE}/ddd`);
        if (resp.ok) ddds = await resp.json();
        else ddds = [11, 21, 31, 41, 51, 61, 71, 81, 91];
    } catch (e) { ddds = [11, 21, 31, 41, 51, 61, 71, 81, 91]; }
}

export async function carregarVacinas() {
    try {
        const resp = await fetch(`${API_BASE}/vacinas`);
        if (resp.ok) listaVacinas = await resp.json();
        else console.warn('Erro ao carregar vacinas');
    } catch (e) { listaVacinas = []; }
}

export async function carregarTodasVacinasAplicadas() {
    try {
        const resp = await fetch(`${API_BASE}/vacinas/aplicadas`);
        if (!resp.ok) throw new Error('Erro ao carregar histórico');
        const data = await resp.json();
        vacinas = data;
        return data;
    } catch (e) {
        console.warn('Erro ao carregar vacinas aplicadas', e);
        vacinas = [];
        return [];
    }
}

export async function carregarTutores() {
    try {
        const resp = await fetch(`${API_BASE}/tutor`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        if (data.length > 0) tutores = data;
        return data;
    } catch (e) { return tutores; }
}

export async function carregarTutorCompleto(id) {
    const resp = await fetch(`${API_BASE}/tutor/${id}/completo`);
    if (!resp.ok) throw new Error('Erro ao carregar tutor completo');
    return await resp.json();
}

export async function salvarTutorCompleto(dados) {
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

export async function excluirTutorApi(id) {
    try {
        const resp = await fetch(`${API_BASE}/tutor/${id}`, {method: 'DELETE'});
        if (!resp.ok) throw new Error('Erro');
        tutores = tutores.filter(t => t.id !== id);
        return true;
    } catch (e) {
        tutores = tutores.filter(t => t.id !== id);
        return true;
    }
}

export async function carregarPets() {
    try {
        const resp = await fetch(`${API_BASE}/pet/all`);
        if (!resp.ok) throw new Error('Erro');
        const data = await resp.json();
        if (data.length > 0) pets = data;
        window.petsCache = pets;
        return data;
    } catch (e) { return pets; }
}

export async function carregarPetCompleto(id) {
    const resp = await fetch(`${API_BASE}/pet/${id}/completo`);
    if (!resp.ok) throw new Error('Erro ao carregar pet completo');
    return await resp.json();
}

export async function salvarPet(pet) {
    try {
        const resp = await fetch(`${API_BASE}/pet`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(pet)
        });
        if (!resp.ok) throw new Error('Erro');
        const result = await resp.json();
        pet.id = result.id;
        pets.push(pet);
        window.petsCache = pets;
        return result;
    } catch (e) {
        pet.id = (pets.length ? Math.max(...pets.map(p => p.id)) + 1 : 1);
        pets.push(pet);
        window.petsCache = pets;
        return {id: pet.id};
    }
}

export async function excluirPetApi(id) {
    try {
        const resp = await fetch(`${API_BASE}/pet/${id}`, {method: 'DELETE'});
        if (!resp.ok) throw new Error('Erro');
        pets = pets.filter(p => p.id !== id);
        window.petsCache = pets;
        return true;
    } catch (e) {
        pets = pets.filter(p => p.id !== id);
        window.petsCache = pets;
        return true;
    }
}

export async function carregarConsultas() {
    try {
        const resp = await fetch(`${API_BASE}/consulta/all`);
        if (!resp.ok) throw new Error('Erro');
        const data = await resp.json();
        if (data.length > 0) consultas = data;
        return data;
    } catch (e) { return consultas; }
}

export async function salvarConsulta(consulta) {
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
        if (!resp.ok) throw new Error('Erro');
        const result = await resp.json();
        consulta.id = result.id;
        consultas.push(consulta);
        return result;
    } catch (e) {
        consulta.id = (consultas.length ? Math.max(...consultas.map(c => c.id)) + 1 : 1);
        consultas.push(consulta);
        return {id: consulta.id};
    }
}

export async function carregarVacinasPendentes() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const pendentes = [];

    for (const v of vacinas) {
        const dataAplic = new Date(v.dataAplicacao);
        dataAplic.setHours(0, 0, 0, 0);
        if (dataAplic > hoje) {
            pendentes.push({
                ...v,
                dataProxima: v.dataAplicacao,
                status: 'agendada'
            });
        } else {
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

export async function carregarVeterinarios() {
    try {
        const resp = await fetch(`${API_BASE}/veterinario`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        veterinariosList = data;
        return data;
    } catch (e) {
        veterinariosList = [];
        return [];
    }
}

export async function carregarVeterinarioCompleto(id) {
    const resp = await fetch(`${API_BASE}/veterinario/${id}/completo`);
    if (!resp.ok) throw new Error('Erro ao carregar veterinário completo');
    return await resp.json();
}

export async function salvarVeterinarioCompleto(dados) {
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

export async function excluirVeterinarioApi(id) {
    const resp = await fetch(`${API_BASE}/veterinario/${id}`, {method: 'DELETE'});
    if (!resp.ok) throw new Error('Erro ao excluir');
    return true;
}

export async function carregarDadosRelatorios(inicio, fim) {
    const resp = await fetch(`${API_BASE}/relatorios?inicio=${inicio}&fim=${fim}`);
    if (!resp.ok) throw new Error('Erro ao carregar dados dos relatórios');
    return await resp.json();
}

export async function salvarVacina(dados) {
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

export async function excluirVacinaApi(id) {
    const resp = await fetch(`${API_BASE}/vacinas/${id}`, {method: 'DELETE'});
    if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`Erro ${resp.status}: ${errorText}`);
    }
    return true;
}

// Função auxiliar para calcular próxima data
function calcularProximaData(dataAplicacao, meses) {
    const d = new Date(dataAplicacao);
    d.setMonth(d.getMonth() + meses);
    return d.toISOString().split('T')[0];
}

// Função para carregar todos os dados iniciais
export async function carregarDadosIniciais() {
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
}