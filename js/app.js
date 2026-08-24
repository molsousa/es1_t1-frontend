import { carregarDadosIniciais } from './services/api.js';
import { renderizarPagina, registrarTodasPaginas } from './pages/index.js';

// Registrar todas as páginas
registrarTodasPaginas();

// Navegação
document.querySelectorAll('.menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.dataset.page;
        if (pageId) mostrarPagina(pageId);
    });
});

function mostrarPagina(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pageEl = document.getElementById('page-' + id);
    if (pageEl) pageEl.classList.add('active');
    document.querySelectorAll('.menu a').forEach(link => {
        link.classList.toggle('active', link.dataset.page === id);
    });
    renderizarPagina(id);
}

// Inicialização
(async function init() {
    await carregarDadosIniciais();
    mostrarPagina('dashboard');
})();