import { pets, carregarPets, carregarPetCompleto, salvarPet, excluirPetApi, tutores, especies, racas, sexos } from '../services/api.js';
import { abrirModal, fecharModal } from '../components/modal.js';
import { nomeTutor, formatarData } from '../utils/helpers.js';

export async function render() {
    const lista = await carregarPets();
    window.petsCache = lista;
    const tutoresLista = await import('../services/api.js').then(m => m.carregarTutores());
    window.tutoresCache = tutoresLista;

    let html = `
        <div class="card">
            <div class="card-header">
                <h3>🐶 Pets</h3>
                <button class="btn btn-primary" onclick="window.formPet()">+ Adicionar Pet</button>
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
                                <button class="btn btn-info btn-sm" onclick="window.visualizarPet(${p.id})">Visualizar</button>
                                <button class="btn btn-danger btn-sm" onclick="window.excluirPet(${p.id})">Excluir</button>
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

export async function visualizarPet(id) {
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

export function formPet() {
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
            <button type="button" class="btn" onclick="window.fecharModal()">Cancelar</button>
        </form>
    `;
    abrirModal('Novo Pet', html);

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
            render();
        } catch (e) {
            alert('Erro: ' + e.message);
        }
    });
}

export async function excluirPet(id) {
    if (!confirm('Deseja excluir este pet?')) return;
    try {
        await excluirPetApi(id);
        alert('Pet excluído.');
        render();
    } catch (e) {
        alert('Erro: ' + e.message);
    }
}

window.visualizarPet = visualizarPet;
window.excluirPet = excluirPet;
window.formPet = formPet;