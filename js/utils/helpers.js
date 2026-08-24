import { tutores, pets, especies, racas, sexos, veterinariosList } from '../services/api.js';

export function proximoId(colecao) {
    if (colecao.length === 0) return 1;
    return Math.max(...colecao.map(i => i.id)) + 1;
}

export function nomeTutor(id) {
    const t = tutores.find(t => t.id === id);
    return t ? t.nome : 'Desconhecido';
}

export function nomePet(id) {
    const p = pets.find(p => p.id === id);
    return p ? p.nome : 'Desconhecido';
}

export function getPet(id) {
    return pets.find(p => p.id === id);
}

export function formatarDataHora(data, hora) {
    if (!data) return 'Data inválida';
    const d = new Date(data + 'T' + (hora || '00:00:00'));
    return d.toLocaleString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});
}

export function formatarData(dt) {
    if (!dt) return '';
    const d = new Date(dt);
    return d.toLocaleDateString('pt-BR');
}

export function calcularProximaData(dataAplicacao, meses) {
    const d = new Date(dataAplicacao);
    d.setMonth(d.getMonth() + meses);
    return d.toISOString().split('T')[0];
}

export function statusBadge(status) {
    const map = {
        'agendada': '<span class="badge badge-warning">Agendada</span>',
        'realizada': '<span class="badge badge-success">Realizada</span>',
        'cancelada': '<span class="badge badge-danger">Cancelada</span>'
    };
    return map[status] || status;
}

export function vacinaProxima(vacina) {
    const hoje = new Date();
    const prox = new Date(vacina.dataProxima);
    const diff = (prox - hoje) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 30;
}