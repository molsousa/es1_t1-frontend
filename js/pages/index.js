// Registro central de páginas

const paginaMap = {};

export function registrarPagina(id, renderFn) {
    paginaMap[id] = renderFn;
}

export function renderizarPagina(id) {
    const renderFn = paginaMap[id];
    if (renderFn) renderFn();
}

// Importa e registra todas as páginas
import { render as dashboard } from './dashboard.js';
import { render as tutores } from './tutores.js';
import { render as veterinarios } from './veterinarios.js';
import { render as pets } from './pets.js';
import { render as consultas } from './consultas.js';
import { render as prontuario } from './prontuario.js';
import { render as atendimentos } from './atendimentos.js';
import { render as vacinas } from './vacinas.js';
import { render as relatorios } from './relatorios.js';
import { render as chatbot } from './chatbot.js';

export function registrarTodasPaginas() {
    registrarPagina('dashboard', dashboard);
    registrarPagina('tutores', tutores);
    registrarPagina('veterinarios', veterinarios);
    registrarPagina('pets', pets);
    registrarPagina('consultas', consultas);
    registrarPagina('prontuario', prontuario);
    registrarPagina('atendimentos', atendimentos);
    registrarPagina('vacinas', vacinas);
    registrarPagina('relatorios', relatorios);
    registrarPagina('chatbot', chatbot);
}