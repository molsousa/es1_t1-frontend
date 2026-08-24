export function interpretarMensagem(texto) {
    const lower = texto.toLowerCase().trim();

    // Ajuda
    if (/(?:o que|como|ajuda|comandos|pode fazer)/i.test(lower)) {
        return {intencao: 'ajuda', params: {}};
    }

    // Agendar consulta
    if (/(?:agendar|marcar)\s+consulta/i.test(lower)) {
        return {intencao: 'agendar_consulta', params: {}};
    }

    // Cadastrar pet
    if (/(?:cadastrar|novo)\s+pet/i.test(lower)) {
        return {intencao: 'cadastrar_pet', params: {}};
    }

    // Vacinas pendentes
    if (/(?:vacinas pendentes|pendentes|vencimento|próximas vacinas)/i.test(lower)) {
        return {intencao: 'vacinas_pendentes', params: {}};
    }

    // Consultas de hoje
    if (/(?:consultas de hoje|consultas hoje|hoje|agenda de hoje)/i.test(lower)) {
        return {intencao: 'consultas_hoje', params: {}};
    }

    // Pets por tutor
    let match = lower.match(/(?:pets do|pets de|tutor)\s+([a-zA-ZÀ-ÿ\s]+)(?: tem|\?)?/i);
    if (match) {
        return {intencao: 'pets_por_tutor', params: {nomeTutor: match[1].trim()}};
    }

    // Dados do tutor
    match = lower.match(/(?:dados do|informações do|mostre dados do)\s+tutor\s+([a-zA-ZÀ-ÿ\s]+)/i);
    if (match) {
        return {intencao: 'dados_tutor', params: {nomeTutor: match[1].trim()}};
    }
    match = lower.match(/tutor\s+([a-zA-ZÀ-ÿ\s]+)/i);
    if (match && !/(?:pets|vacinas|consultas)/i.test(lower)) {
        return {intencao: 'dados_tutor', params: {nomeTutor: match[1].trim()}};
    }

    // Vacinas de um pet
    match = lower.match(/(?:vacinas do|vacinas de|histórico de vacinas do)\s+([a-zA-ZÀ-ÿ\s]+)/i);
    if (match) {
        return {intencao: 'vacinas_pet', params: {nomePet: match[1].trim()}};
    }

    // Dados do pet
    match = lower.match(/(?:dados do|informações do|mostre dados do)\s+pet\s+([a-zA-ZÀ-ÿ\s]+)/i);
    if (match) {
        return {intencao: 'dados_pet', params: {nomePet: match[1].trim()}};
    }
    match = lower.match(/pet\s+([a-zA-ZÀ-ÿ\s]+)/i);
    if (match && !/(?:vacinas|consultas)/i.test(lower)) {
        return {intencao: 'dados_pet', params: {nomePet: match[1].trim()}};
    }

    return {intencao: null, params: {}};
}