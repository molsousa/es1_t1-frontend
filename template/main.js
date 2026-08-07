// ================================================================
    // 1. DADOS MOCKADOS (em memória – futuramente via API)
    // ================================================================

    // Geradores de ID sequencial
    let nextId = {
        tutor: 4,
        pet: 5,
        consulta: 4,
        atendimento: 3,
        vacina: 4
    };

    // Tutores
    let tutores = [
        { id: 1, nome: 'João Silva', cpf: '123.456.789-00', endereco: 'Rua das Flores, 123', email: 'joao@email.com', telefone: '(11) 99999-1111' },
        { id: 2, nome: 'Maria Santos', cpf: '987.654.321-00', endereco: 'Av. Principal, 456', email: 'maria@email.com', telefone: '(11) 98888-2222' },
        { id: 3, nome: 'Carlos Pereira', cpf: '456.789.123-00', endereco: 'Rua do Sol, 789', email: 'carlos@email.com', telefone: '(11) 97777-3333' }
    ];

    // Pets
    let pets = [
        { id: 1, nome: 'Rex', tipo: 'cão', raca: 'Labrador', tutorId: 1 },
        { id: 2, nome: 'Mimi', tipo: 'gato', raca: 'Siamês', tutorId: 2 },
        { id: 3, nome: 'Bobby', tipo: 'cão', raca: 'Poodle', tutorId: 1 },
        { id: 4, nome: 'Luna', tipo: 'gato', raca: 'Persa', tutorId: 3 }
    ];

    // Consultas
    let consultas = [
        { id: 1, petId: 1, veterinario: 'Dra. Ana', dataHora: '2026-08-10T09:00', motivo: 'Check-up anual', status: 'realizada' },
        { id: 2, petId: 2, veterinario: 'Dr. Carlos', dataHora: '2026-08-12T14:30', motivo: 'Vacinação', status: 'agendada' },
        { id: 3, petId: 3, veterinario: 'Dra. Ana', dataHora: '2026-08-15T11:00', motivo: 'Coceira na pele', status: 'agendada' }
    ];

    // Atendimentos (consultas realizadas com detalhes)
    let atendimentos = [
        { id: 1, consultaId: 1, petId: 1, data: '2026-08-10', observacoes: 'Peso ideal, sem alterações.', exames: ['Sangue'], remedios: ['Suplemento vitamínico'] }
    ];

    // Vacinas
    let vacinas = [
        { id: 1, petId: 1, nomeVacina: 'V8', dataAplicacao: '2026-01-15', periodicidadeMeses: 12, dataProxima: '2027-01-15' },
        { id: 2, petId: 2, nomeVacina: 'Raiva', dataAplicacao: '2026-03-10', periodicidadeMeses: 12, dataProxima: '2027-03-10' },
        { id: 3, petId: 3, nomeVacina: 'V10', dataAplicacao: '2026-05-20', periodicidadeMeses: 12, dataProxima: '2027-05-20' }
    ];

    // ================================================================
    // 2. FUNÇÕES AUXILIARES
    // ================================================================

    /** Gera um novo ID para uma coleção */
    function proximoId(colecao) {
        if (colecao.length === 0) return 1;
        return Math.max(...colecao.map(i => i.id)) + 1;
    }

    /** Retorna o nome do tutor pelo ID */
    function nomeTutor(id) {
        const t = tutores.find(t => t.id === id);
        return t ? t.nome : 'Desconhecido';
    }

    /** Retorna o nome do pet pelo ID */
    function nomePet(id) {
        const p = pets.find(p => p.id === id);
        return p ? p.nome : 'Desconhecido';
    }

    /** Retorna objeto pet pelo ID */
    function getPet(id) {
        return pets.find(p => p.id === id);
    }

    /** Formata data/hora para exibição */
    function formatarDataHora(dt) {
        const d = new Date(dt);
        return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    /** Formata data para exibição */
    function formatarData(dt) {
        const d = new Date(dt);
        return d.toLocaleDateString('pt-BR');
    }

    /** Calcula a próxima data com base na periodicidade em meses */
    function calcularProximaData(dataAplicacao, meses) {
        const d = new Date(dataAplicacao);
        d.setMonth(d.getMonth() + meses);
        return d.toISOString().split('T')[0];
    }

    /** Retorna status do agendamento em badge */
    function statusBadge(status) {
        const map = {
            'agendada': '<span class="badge badge-warning">Agendada</span>',
            'realizada': '<span class="badge badge-success">Realizada</span>',
            'cancelada': '<span class="badge badge-danger">Cancelada</span>'
        };
        return map[status] || status;
    }

    /** Verifica se uma vacina está próxima (dentro de 30 dias) */
    function vacinaProxima(vacina) {
        const hoje = new Date();
        const prox = new Date(vacina.dataProxima);
        const diff = (prox - hoje) / (1000 * 60 * 60 * 24);
        return diff > 0 && diff <= 30;
    }

    // ================================================================
    // 3. GERENCIAMENTO DE PÁGINAS E NAVEGAÇÃO
    // ================================================================

    let paginaAtual = 'dashboard';

    function mostrarPagina(id) {
        // Esconde todas
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        // Mostra a escolhida
        const page = document.getElementById('page-' + id);
        if (page) page.classList.add('active');
        // Atualiza menu
        document.querySelectorAll('.menu a').forEach(link => {
            link.classList.toggle('active', link.dataset.page === id);
        });
        paginaAtual = id;
        // Renderiza o conteúdo da página
        const renderFn = {
            'dashboard': renderDashboard,
            'tutores': renderTutores,
            'pets': renderPets,
            'consultas': renderConsultas,
            'prontuario': renderProntuario,
            'atendimentos': renderAtendimentos,
            'vacinas': renderVacinas,
            'relatorios': renderRelatorios
        }[id];
        if (renderFn) renderFn();
    }

    // Eventos de clique no menu
    document.querySelectorAll('.menu a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            if (page) mostrarPagina(page);
        });
    });

    // ================================================================
    // 4. MODAL GENÉRICO
    // ================================================================

    function abrirModal(titulo, html) {
        document.getElementById('modal-title').textContent = titulo;
        document.getElementById('modal-body').innerHTML = html;
        document.getElementById('modal').classList.add('active');
    }

    function fecharModal() {
        document.getElementById('modal').classList.remove('active');
    }

    // Fechar modal ao clicar no overlay
    document.getElementById('modal').addEventListener('click', function(e) {
        if (e.target === this) fecharModal();
    });

    // ================================================================
    // 5. RENDERIZAÇÃO DAS PÁGINAS
    // ================================================================

    // ----- 5.1 DASHBOARD -----
    function renderDashboard() {
        const totalPets = pets.length;
        const totalTutores = tutores.length;
        const consultasHoje = consultas.filter(c => {
            const hoje = new Date().toISOString().split('T')[0];
            return c.dataHora.startsWith(hoje);
        }).length;
        const vacinasPendentes = vacinas.filter(v => vacinaProxima(v)).length;

        let notificacoes = '';
        const proxVacinas = vacinas.filter(v => vacinaProxima(v));
        if (proxVacinas.length > 0) {
            notificacoes = '<ul class="alert-list">';
            proxVacinas.forEach(v => {
                const pet = getPet(v.petId);
                notificacoes += `<li>🔔 Vacina <strong>${v.nomeVacina}</strong> para <strong>${pet ? pet.nome : 'pet'}</strong> vence em ${formatarData(v.dataProxima)}.</li>`;
            });
            notificacoes += '</ul>';
        } else {
            notificacoes = '<p style="color:#6c7a8a;">Nenhuma vacina próxima do vencimento.</p>';
        }

        const html = `
            <h2>📊 Dashboard</h2>
            <div class="stats">
                <div class="stat-item"><div class="number">${totalPets}</div><div class="label">Pets cadastrados</div></div>
                <div class="stat-item"><div class="number">${totalTutores}</div><div class="label">Tutores</div></div>
                <div class="stat-item"><div class="number">${consultasHoje}</div><div class="label">Consultas hoje</div></div>
                <div class="stat-item"><div class="number">${vacinasPendentes}</div><div class="label">Vacinas pendentes</div></div>
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

    // ----- 5.2 TUTORES -----
    function renderTutores() {
        let html = `
            <div class="card">
                <div class="card-header">
                    <h3>👤 Tutores</h3>
                    <button class="btn btn-primary" onclick="formTutor()">+ Adicionar Tutor</button>
                </div>
                ${tutores.length === 0 ? '<p>Nenhum tutor cadastrado.</p>' : `
                <table>
                    <thead><tr><th>Nome</th><th>CPF</th><th>Telefone</th><th>Email</th><th>Ações</th></tr></thead>
                    <tbody>
                        ${tutores.map(t => `
                            <tr>
                                <td>${t.nome}</td>
                                <td>${t.cpf}</td>
                                <td>${t.telefone}</td>
                                <td>${t.email}</td>
                                <td>
                                    <button class="btn btn-primary btn-sm" onclick="formTutor(${t.id})">Editar</button>
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

    // Formulário para Tutor (criação/edição)
    function formTutor(id = null) {
        const tutor = id ? tutores.find(t => t.id === id) : null;
        const titulo = tutor ? 'Editar Tutor' : 'Novo Tutor';
        const html = `
            <form id="form-tutor">
                <input type="hidden" id="tutor-id" value="${tutor ? tutor.id : ''}">
                <div class="form-group">
                    <label>Nome *</label>
                    <input type="text" id="tutor-nome" value="${tutor ? tutor.nome : ''}" required>
                </div>
                <div class="form-group">
                    <label>CPF</label>
                    <input type="text" id="tutor-cpf" value="${tutor ? tutor.cpf : ''}">
                </div>
                <div class="form-group">
                    <label>Endereço</label>
                    <input type="text" id="tutor-endereco" value="${tutor ? tutor.endereco : ''}">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="tutor-email" value="${tutor ? tutor.email : ''}">
                </div>
                <div class="form-group">
                    <label>Telefone</label>
                    <input type="text" id="tutor-telefone" value="${tutor ? tutor.telefone : ''}">
                </div>
                <button type="submit" class="btn btn-success">Salvar</button>
                <button type="button" class="btn" onclick="fecharModal()">Cancelar</button>
            </form>
        `;
        abrirModal(titulo, html);

        document.getElementById('form-tutor').addEventListener('submit', function(e) {
            e.preventDefault();
            const id = document.getElementById('tutor-id').value;
            const dados = {
                nome: document.getElementById('tutor-nome').value.trim(),
                cpf: document.getElementById('tutor-cpf').value.trim(),
                endereco: document.getElementById('tutor-endereco').value.trim(),
                email: document.getElementById('tutor-email').value.trim(),
                telefone: document.getElementById('tutor-telefone').value.trim()
            };
            if (id) {
                // Editar
                const idx = tutores.findIndex(t => t.id === parseInt(id));
                if (idx !== -1) tutores[idx] = { ...tutores[idx], ...dados };
            } else {
                // Novo
                dados.id = proximoId(tutores);
                tutores.push(dados);
            }
            fecharModal();
            renderTutores();
        });
    }

    function excluirTutor(id) {
        if (!confirm('Deseja realmente excluir este tutor?')) return;
        tutores = tutores.filter(t => t.id !== id);
        // Remove pets associados? Para simplificar, apenas removemos tutor.
        renderTutores();
    }

    // ----- 5.3 PETS -----
    function renderPets() {
        let html = `
            <div class="card">
                <div class="card-header">
                    <h3>🐶 Pets</h3>
                    <button class="btn btn-primary" onclick="formPet()">+ Adicionar Pet</button>
                </div>
                ${pets.length === 0 ? '<p>Nenhum pet cadastrado.</p>' : `
                <table>
                    <thead><tr><th>Nome</th><th>Tipo</th><th>Raça</th><th>Tutor</th><th>Ações</th></tr></thead>
                    <tbody>
                        ${pets.map(p => `
                            <tr>
                                <td>${p.nome}</td>
                                <td>${p.tipo}</td>
                                <td>${p.raca}</td>
                                <td>${nomeTutor(p.tutorId)}</td>
                                <td>
                                    <button class="btn btn-primary btn-sm" onclick="formPet(${p.id})">Editar</button>
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

    function formPet(id = null) {
        const pet = id ? pets.find(p => p.id === id) : null;
        const titulo = pet ? 'Editar Pet' : 'Novo Pet';
        const tutorOptions = tutores.map(t => `
            <option value="${t.id}" ${pet && pet.tutorId === t.id ? 'selected' : ''}>${t.nome}</option>
        `).join('');

        const html = `
            <form id="form-pet">
                <input type="hidden" id="pet-id" value="${pet ? pet.id : ''}">
                <div class="form-group">
                    <label>Nome *</label>
                    <input type="text" id="pet-nome" value="${pet ? pet.nome : ''}" required>
                </div>
                <div class="form-group">
                    <label>Tipo *</label>
                    <select id="pet-tipo">
                        <option value="cão" ${pet && pet.tipo === 'cão' ? 'selected' : ''}>Cão</option>
                        <option value="gato" ${pet && pet.tipo === 'gato' ? 'selected' : ''}>Gato</option>
                        <option value="ave" ${pet && pet.tipo === 'ave' ? 'selected' : ''}>Ave</option>
                        <option value="roedor" ${pet && pet.tipo === 'roedor' ? 'selected' : ''}>Roedor</option>
                        <option value="outro" ${pet && pet.tipo === 'outro' ? 'selected' : ''}>Outro</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Raça</label>
                    <input type="text" id="pet-raca" value="${pet ? pet.raca : ''}">
                </div>
                <div class="form-group">
                    <label>Tutor *</label>
                    <select id="pet-tutor" required>
                        <option value="">Selecione</option>
                        ${tutorOptions}
                    </select>
                </div>
                <button type="submit" class="btn btn-success">Salvar</button>
                <button type="button" class="btn" onclick="fecharModal()">Cancelar</button>
            </form>
        `;
        abrirModal(titulo, html);

        document.getElementById('form-pet').addEventListener('submit', function(e) {
            e.preventDefault();
            const id = document.getElementById('pet-id').value;
            const dados = {
                nome: document.getElementById('pet-nome').value.trim(),
                tipo: document.getElementById('pet-tipo').value,
                raca: document.getElementById('pet-raca').value.trim(),
                tutorId: parseInt(document.getElementById('pet-tutor').value)
            };
            if (id) {
                const idx = pets.findIndex(p => p.id === parseInt(id));
                if (idx !== -1) pets[idx] = { ...pets[idx], ...dados };
            } else {
                dados.id = proximoId(pets);
                pets.push(dados);
            }
            fecharModal();
            renderPets();
        });
    }

    function excluirPet(id) {
        if (!confirm('Deseja excluir este pet?')) return;
        pets = pets.filter(p => p.id !== id);
        renderPets();
    }

    // ----- 5.4 CONSULTAS -----
    function renderConsultas() {
        let html = `
            <div class="card">
                <div class="card-header">
                    <h3>📅 Consultas</h3>
                    <button class="btn btn-primary" onclick="formConsulta()">+ Agendar Consulta</button>
                </div>
                ${consultas.length === 0 ? '<p>Nenhuma consulta agendada.</p>' : `
                <table>
                    <thead><tr><th>Pet</th><th>Veterinário</th><th>Data/Hora</th><th>Motivo</th><th>Status</th><th>Ações</th></tr></thead>
                    <tbody>
                        ${consultas.map(c => `
                            <tr>
                                <td>${nomePet(c.petId)}</td>
                                <td>${c.veterinario}</td>
                                <td>${formatarDataHora(c.dataHora)}</td>
                                <td>${c.motivo}</td>
                                <td>${statusBadge(c.status)}</td>
                                <td>
                                    ${c.status === 'agendada' ? `<button class="btn btn-success btn-sm" onclick="realizarConsulta(${c.id})">Realizar</button>` : ''}
                                    <button class="btn btn-danger btn-sm" onclick="cancelarConsulta(${c.id})">Cancelar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                `}
            </div>
        `;
        document.getElementById('page-consultas').innerHTML = html;
    }

    function formConsulta(id = null) {
        const consulta = id ? consultas.find(c => c.id === id) : null;
        const titulo = consulta ? 'Editar Consulta' : 'Nova Consulta';
        const petOptions = pets.map(p => `
            <option value="${p.id}" ${consulta && consulta.petId === p.id ? 'selected' : ''}>${p.nome}</option>
        `).join('');

        const dataHora = consulta ? consulta.dataHora : '';

        const html = `
            <form id="form-consulta">
                <input type="hidden" id="consulta-id" value="${consulta ? consulta.id : ''}">
                <div class="form-group">
                    <label>Pet *</label>
                    <select id="consulta-pet" required>
                        <option value="">Selecione</option>
                        ${petOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Veterinário *</label>
                    <input type="text" id="consulta-vet" value="${consulta ? consulta.veterinario : ''}" required>
                </div>
                <div class="form-group">
                    <label>Data e Hora *</label>
                    <input type="datetime-local" id="consulta-dt" value="${dataHora}" required>
                </div>
                <div class="form-group">
                    <label>Motivo</label>
                    <input type="text" id="consulta-motivo" value="${consulta ? consulta.motivo : ''}">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="consulta-status">
                        <option value="agendada" ${consulta && consulta.status === 'agendada' ? 'selected' : ''}>Agendada</option>
                        <option value="realizada" ${consulta && consulta.status === 'realizada' ? 'selected' : ''}>Realizada</option>
                        <option value="cancelada" ${consulta && consulta.status === 'cancelada' ? 'selected' : ''}>Cancelada</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-success">Salvar</button>
                <button type="button" class="btn" onclick="fecharModal()">Cancelar</button>
            </form>
        `;
        abrirModal(titulo, html);

        document.getElementById('form-consulta').addEventListener('submit', function(e) {
            e.preventDefault();
            const id = document.getElementById('consulta-id').value;
            const dados = {
                petId: parseInt(document.getElementById('consulta-pet').value),
                veterinario: document.getElementById('consulta-vet').value.trim(),
                dataHora: document.getElementById('consulta-dt').value,
                motivo: document.getElementById('consulta-motivo').value.trim(),
                status: document.getElementById('consulta-status').value
            };
            if (id) {
                const idx = consultas.findIndex(c => c.id === parseInt(id));
                if (idx !== -1) consultas[idx] = { ...consultas[idx], ...dados };
            } else {
                dados.id = proximoId(consultas);
                consultas.push(dados);
            }
            fecharModal();
            renderConsultas();
        });
    }

    function realizarConsulta(id) {
        const c = consultas.find(c => c.id === id);
        if (!c) return;
        if (c.status === 'realizada') return;
        // Abre o formulário de atendimento para essa consulta
        c.status = 'realizada';
        // Redireciona para página de atendimentos com a consulta selecionada
        mostrarPagina('atendimentos');
        // Podemos pré-preencher o formulário de atendimento com os dados da consulta
        // Para simplificar, apenas atualizamos a lista e mostramos.
        renderConsultas();
        // Também atualizar atendimentos se necessário
        renderAtendimentos();
    }

    function cancelarConsulta(id) {
        if (!confirm('Cancelar esta consulta?')) return;
        const c = consultas.find(c => c.id === id);
        if (c) c.status = 'cancelada';
        renderConsultas();
    }

    // ----- 5.5 PRONTUÁRIO -----
    function renderProntuario() {
        // Selecionar pet via dropdown
        const petOptions = pets.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
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
        const pet = getPet(petId);
        if (!pet) {
            container.innerHTML = '<p>Pet não encontrado.</p>';
            return;
        }

        // Consultas realizadas para este pet
        const consultasPet = consultas.filter(c => c.petId === petId && c.status === 'realizada');
        const atendimentosPet = atendimentos.filter(a => a.petId === petId);
        const vacinasPet = vacinas.filter(v => v.petId === petId);

        let html = `
            <h4>${pet.nome} (${pet.tipo} - ${pet.raca})</h4>
            <p><strong>Tutor:</strong> ${nomeTutor(pet.tutorId)}</p>
            <hr>
            <h5>🩺 Consultas realizadas</h5>
            ${consultasPet.length === 0 ? '<p>Nenhuma consulta registrada.</p>' : `
            <ul>
                ${consultasPet.map(c => `
                    <li><strong>${formatarDataHora(c.dataHora)}</strong> - ${c.motivo || 'Sem motivo'} (Vet: ${c.veterinario})</li>
                `).join('')}
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
                    <li><strong>${v.nomeVacina}</strong> - Aplicada em ${formatarData(v.dataAplicacao)}, próxima: ${formatarData(v.dataProxima)}</li>
                `).join('')}
            </ul>
            `}
        `;
        container.innerHTML = html;
    }

    // ----- 5.6 ATENDIMENTOS -----
    function renderAtendimentos() {
        const petOptions = pets.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
        const consultaOptions = consultas.filter(c => c.status === 'realizada').map(c =>
            `<option value="${c.id}">${nomePet(c.petId)} - ${formatarDataHora(c.dataHora)}</option>`
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
        const petOptions = pets.map(p => `
            <option value="${p.id}" ${atend && atend.petId === p.id ? 'selected' : ''}>${p.nome}</option>
        `).join('');

        // Lista de consultas realizadas para associar
        const consultaOptions = consultas.filter(c => c.status === 'realizada').map(c => `
            <option value="${c.id}" ${atend && atend.consultaId === c.id ? 'selected' : ''}>${nomePet(c.petId)} - ${formatarDataHora(c.dataHora)}</option>
        `).join('');

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

        document.getElementById('form-atendimento').addEventListener('submit', function(e) {
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
            if (id) {
                const idx = atendimentos.findIndex(a => a.id === parseInt(id));
                if (idx !== -1) atendimentos[idx] = { ...atendimentos[idx], ...dados };
            } else {
                dados.id = proximoId(atendimentos);
                atendimentos.push(dados);
            }
            fecharModal();
            renderAtendimentos();
        });
    }

    function excluirAtendimento(id) {
        if (!confirm('Excluir atendimento?')) return;
        atendimentos = atendimentos.filter(a => a.id !== id);
        renderAtendimentos();
    }

    function emitirPrescricao(id) {
        const atend = atendimentos.find(a => a.id === id);
        if (!atend) return;
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

    // ----- 5.7 VACINAS -----
    function renderVacinas() {
        const petOptions = pets.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
        let html = `
            <div class="card">
                <div class="card-header">
                    <h3>💉 Controle de Vacinas</h3>
                    <button class="btn btn-primary" onclick="formVacina()">+ Registrar Vacina</button>
                </div>
                <div style="margin-bottom: 20px;">
                    <h4>Vacinas Pendentes (próximas 30 dias)</h4>
                    ${vacinas.filter(v => vacinaProxima(v)).length === 0 ? '<p>Nenhuma vacina pendente.</p>' : `
                    <table>
                        <thead><tr><th>Pet</th><th>Vacina</th><th>Próxima aplicação</th></tr></thead>
                        <tbody>
                            ${vacinas.filter(v => vacinaProxima(v)).map(v => `
                                <tr>
                                    <td>${nomePet(v.petId)}</td>
                                    <td>${v.nomeVacina}</td>
                                    <td>${formatarData(v.dataProxima)}</td>
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
                        <thead><tr><th>Pet</th><th>Vacina</th><th>Aplicação</th><th>Próxima</th><th>Ações</th></tr></thead>
                        <tbody>
                            ${vacinas.map(v => `
                                <tr>
                                    <td>${nomePet(v.petId)}</td>
                                    <td>${v.nomeVacina}</td>
                                    <td>${formatarData(v.dataAplicacao)}</td>
                                    <td>${formatarData(v.dataProxima)}</td>
                                    <td>
                                        <button class="btn btn-danger btn-sm" onclick="excluirVacina(${v.id})">Excluir</button>
                                    </td>
                                </tr>
                            `).join('')}
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
        const petOptions = pets.map(p => `
            <option value="${p.id}" ${vac && vac.petId === p.id ? 'selected' : ''}>${p.nome}</option>
        `).join('');

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
                    <input type="text" id="vacina-nome" value="${vac ? vac.nomeVacina : ''}" required>
                </div>
                <div class="form-group">
                    <label>Data de Aplicação *</label>
                    <input type="date" id="vacina-data" value="${vac ? vac.dataAplicacao : ''}" required>
                </div>
                <div class="form-group">
                    <label>Periodicidade (em meses) *</label>
                    <input type="number" id="vacina-periodicidade" value="${vac ? vac.periodicidadeMeses : 12}" min="1" required>
                </div>
                <button type="submit" class="btn btn-success">Salvar</button>
                <button type="button" class="btn" onclick="fecharModal()">Cancelar</button>
            </form>
        `;
        abrirModal(titulo, html);

        document.getElementById('form-vacina').addEventListener('submit', function(e) {
            e.preventDefault();
            const id = document.getElementById('vacina-id').value;
            const petId = parseInt(document.getElementById('vacina-pet').value);
            const nomeVacina = document.getElementById('vacina-nome').value.trim();
            const dataAplicacao = document.getElementById('vacina-data').value;
            const periodicidadeMeses = parseInt(document.getElementById('vacina-periodicidade').value);
            const dataProxima = calcularProximaData(dataAplicacao, periodicidadeMeses);

            const dados = { petId, nomeVacina, dataAplicacao, periodicidadeMeses, dataProxima };
            if (id) {
                const idx = vacinas.findIndex(v => v.id === parseInt(id));
                if (idx !== -1) vacinas[idx] = { ...vacinas[idx], ...dados };
            } else {
                dados.id = proximoId(vacinas);
                vacinas.push(dados);
            }
            fecharModal();
            renderVacinas();
        });
    }

    function excluirVacina(id) {
        if (!confirm('Excluir registro de vacina?')) return;
        vacinas = vacinas.filter(v => v.id !== id);
        renderVacinas();
    }

    // ----- 5.8 RELATÓRIOS -----
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
        // Carregar gráficos com dados padrão (últimos 30 dias)
        setTimeout(() => gerarRelatorios(), 100);
    }

    function gerarRelatorios() {
        const inicio = document.getElementById('rel-inicio').value;
        const fim = document.getElementById('rel-fim').value;
        if (!inicio || !fim) {
            alert('Selecione um período.');
            return;
        }

        // Filtrar consultas realizadas no período
        const consultasFiltradas = consultas.filter(c => {
            if (c.status !== 'realizada') return false;
            const data = c.dataHora.split('T')[0];
            return data >= inicio && data <= fim;
        });

        // ----- Gráfico 1: Tipos de PET mais atendidos -----
        const tipos = {};
        consultasFiltradas.forEach(c => {
            const pet = getPet(c.petId);
            if (pet) {
                const tipo = pet.tipo || 'outro';
                tipos[tipo] = (tipos[tipo] || 0) + 1;
            }
        });
        const labelsTipos = Object.keys(tipos);
        const dataTipos = Object.values(tipos);

        // ----- Gráfico 2: Motivos de consulta mais recorrentes -----
        const motivos = {};
        consultasFiltradas.forEach(c => {
            const motivo = c.motivo || 'Sem motivo';
            motivos[motivo] = (motivos[motivo] || 0) + 1;
        });
        // Ordenar por frequência e pegar top 5
        const sortedMotivos = Object.entries(motivos).sort((a, b) => b[1] - a[1]);
        const labelsMotivos = sortedMotivos.slice(0, 5).map(item => item[0]);
        const dataMotivos = sortedMotivos.slice(0, 5).map(item => item[1]);

        // ----- Gráfico 3: Vacinas mais aplicadas -----
        // Considerar vacinas aplicadas no período (dataAplicacao)
        const vacinasFiltradas = vacinas.filter(v => v.dataAplicacao >= inicio && v.dataAplicacao <= fim);
        const vacinasCount = {};
        vacinasFiltradas.forEach(v => {
            vacinasCount[v.nomeVacina] = (vacinasCount[v.nomeVacina] || 0) + 1;
        });
        const labelsVacinas = Object.keys(vacinasCount);
        const dataVacinas = Object.values(vacinasCount);

        // Destruir gráficos anteriores se existirem
        if (chartInstance) {
            if (Array.isArray(chartInstance)) {
                chartInstance.forEach(ch => ch.destroy());
            } else {
                chartInstance.destroy();
            }
        }
        chartInstance = [];

        // Criar gráficos
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
            options: { responsive: true, plugins: { title: { display: true, text: 'Tipos de PET mais atendidos' } } }
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
            options: { responsive: true, plugins: { title: { display: true, text: 'Principais motivos de consulta' } } }
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
            options: { responsive: true, plugins: { title: { display: true, text: 'Vacinas mais aplicadas' } } }
        });
        chartInstance.push(chart3);
    }

    // ================================================================
    // 6. INICIALIZAÇÃO
    // ================================================================

    // Carrega a página inicial (Dashboard)
    mostrarPagina('dashboard');