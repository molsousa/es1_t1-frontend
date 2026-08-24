export function abrirModal(titulo, html) {
    document.getElementById('modalBootstrapTitle').textContent = titulo;
    document.getElementById('modalBootstrapBody').innerHTML = html;
    const modal = new bootstrap.Modal(document.getElementById('modalBootstrap'));
    modal.show();
}

export function fecharModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalBootstrap'));
    if (modal) modal.hide();
}