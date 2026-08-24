import { interpretarMensagem } from '../chatbot/interpreter.js';
import { executarIntencao } from '../chatbot/actions.js';

export function render() {
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
        if (e.key === 'Enter') enviarMensagem();
    });
}

async function enviarMensagem() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;

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