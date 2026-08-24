import { 
    tutores, pets, consultas, vacinas, veterinariosList, 
    carregarVacinasPendentes, carregarTutorCompleto,
    especies, racas, sexos
} from '../services/api.js';
import { formatarData, nomePet } from '../utils/helpers.js';

const intencoes = {
    'pets_por_tutor': async (params) => {
        const nomeTutor = params.nomeTutor;
        if (!nomeTutor) return 'Por favor, informe o nome do tutor.';
        const tutor = tutores.find(t => t.nome.toLowerCase().includes(nomeTutor.toLowerCase()));
        if (!tutor) return `Tutor "${nomeTutor}" não encontrado.`;
        const petsDoTutor = pets.filter(p => p.tutorId === tutor.id);
        if (petsDoTutor.length === 0) return `O tutor ${tutor.nome} não possui pets cadastrados.`;
        return `🐶 Pets de ${tutor.nome}:\n${petsDoTutor.map(p => `- ${p.nome} (${p.especie || 'Espécie não definida'})`).join('\n')}`;
    },

    'dados_pet': async (params) => {
        const nomePet = params.nomePet;
        if (!nomePet) return 'Qual o nome do pet?';
        const pet = pets.find(p => p.nome.toLowerCase().includes(nomePet.toLowerCase()));
        if (!pet) return `Pet "${nomePet}" não encontrado.`;
        const tutor = tutores.find(t => t.id === pet.tutorId);
        const especie = especies.find(e => e.id === pet.idEspecie);
        const raca = racas.find(r => r.id === pet.idRaca);
        const sexo = sexos.find(s => s.id === pet.idSexo);
        return `📋 Dados do pet ${pet.nome}:\n- Espécie: ${especie ? especie.descricao : '-'}\n- Raça: ${raca ? raca.descricao : '-'}\n- Sexo: ${sexo ? sexo.descricao : '-'}\n- Data Nasc.: ${pet.dataNascimento ? formatarData(pet.dataNascimento) : '-'}\n- Tutor: ${tutor ? tutor.nome : 'Desconhecido'}`;
    },

    'vacinas_pendentes': async () => {
        const pendentes = await carregarVacinasPendentes();
        if (pendentes.length === 0) return 'Nenhuma vacina pendente.';
        return `💉 Vacinas pendentes:\n${pendentes.map(v => `- ${v.nomeVacina} para ${nomePet(v.petId)} (${v.status === 'agendada' ? 'Agendada para' : 'Próxima em'} ${formatarData(v.dataProxima)})`).join('\n')}`;
    },

    'vacinas_pet': async (params) => {
        const nomePet = params.nomePet;
        if (!nomePet) return 'Informe o nome do pet.';
        const pet = pets.find(p => p.nome.toLowerCase().includes(nomePet.toLowerCase()));
        if (!pet) return `Pet "${nomePet}" não encontrado.`;
        const vacinasPet = vacinas.filter(v => v.petId === pet.id);
        if (vacinasPet.length === 0) return `O pet ${pet.nome} não possui vacinas registradas.`;
        return `💉 Histórico de vacinas de ${pet.nome}:\n${vacinasPet.map(v => `- ${v.nomeVacina} em ${formatarData(v.dataAplicacao)} (${new Date(v.dataAplicacao) > new Date() ? 'Agendada' : 'Aplicada'})`).join('\n')}`;
    },

    'consultas_hoje': async () => {
        const hoje = new Date().toISOString().split('T')[0];
        const consultasHoje = consultas.filter(c => c.dataConsulta === hoje);
        if (consultasHoje.length === 0) return 'Nenhuma consulta agendada para hoje.';
        return `📅 Consultas de hoje:\n${consultasHoje.map(c => `- ${nomePet(c.petId)} com ${veterinariosList.find(v => v.id === c.idVeterinario)?.nome || 'Veterinário'} às ${c.horaConsulta || '--:--'}`).join('\n')}`;
    },

    'dados_tutor': async (params) => {
        const nomeTutor = params.nomeTutor;
        if (!nomeTutor) return 'Qual o nome do tutor?';
        const tutor = tutores.find(t => t.nome.toLowerCase().includes(nomeTutor.toLowerCase()));
        if (!tutor) return `Tutor "${nomeTutor}" não encontrado.`;
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
        // Abre o formulário de consulta via navegação
        document.querySelector('[data-page="consultas"]')?.click();
        // Aciona o botão de nova consulta após a página carregar
        setTimeout(() => {
            const btn = document.querySelector('#page-consultas .btn-primary');
            if (btn) btn.click();
        }, 300);
        return '📅 Abrindo formulário para agendar consulta...';
    },

    'cadastrar_pet': async () => {
        document.querySelector('[data-page="pets"]')?.click();
        setTimeout(() => {
            const btn = document.querySelector('#page-pets .btn-primary');
            if (btn) btn.click();
        }, 300);
        return '🐶 Abrindo formulário para cadastrar novo pet...';
    },

    'ajuda': async () => {
        return `🤖 Comandos disponíveis:\n- "Quais pets o tutor [nome] tem?"\n- "Dados do pet [nome]"\n- "Vacinas pendentes"\n- "Vacinas do pet [nome]"\n- "Consultas de hoje"\n- "Dados do tutor [nome]"\n- "Agendar consulta"\n- "Cadastrar pet"`;
    }
};

export async function executarIntencao(intencao, params) {
    if (!intencao || !intencoes[intencao]) {
        return 'Desculpe, não entendi o que você quer. Digite "ajuda" para ver os comandos disponíveis.';
    }
    try {
        return await intencoes[intencao](params);
    } catch (e) {
        return `❌ Erro ao executar: ${e.message}`;
    }
}