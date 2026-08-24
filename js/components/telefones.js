import { ddds } from '../services/api.js';

export function adicionarTelefone(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
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

export function removerTelefone(btn) {
    const item = btn.closest('.telefone-item');
    if (item) item.remove();
}

// Expor para uso em onclick
window.adicionarTelefone = adicionarTelefone;
window.removerTelefone = removerTelefone;