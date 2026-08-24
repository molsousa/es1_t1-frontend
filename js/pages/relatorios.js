import { carregarDadosRelatorios } from '../services/api.js';

let chartInstance = null;

export function render() {
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
                    <button class="btn btn-primary" onclick="window.gerarRelatorios()" style="margin-top:22px;">Filtrar</button>
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
    setTimeout(() => gerarRelatorios(), 100);
}

window.gerarRelatorios = async function() {
    const inicio = document.getElementById('rel-inicio').value;
    const fim = document.getElementById('rel-fim').value;
    if (!inicio || !fim) {
        alert('Selecione um período.');
        return;
    }

    try {
        const dados = await carregarDadosRelatorios(inicio, fim);
        const labelsTipos = Object.keys(dados.tipos);
        const dataTipos = Object.values(dados.tipos);
        const labelsMotivos = Object.keys(dados.motivos);
        const dataMotivos = Object.values(dados.motivos);
        const labelsVacinas = Object.keys(dados.vacinas);
        const dataVacinas = Object.values(dados.vacinas);

        if (chartInstance) {
            if (Array.isArray(chartInstance)) {
                chartInstance.forEach(ch => ch.destroy());
            } else {
                chartInstance.destroy();
            }
        }
        chartInstance = [];

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
            options: {responsive: true, plugins: {title: {display: true, text: 'Tipos de PET mais atendidos'}}}
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
            options: {responsive: true, plugins: {title: {display: true, text: 'Principais motivos de consulta'}}}
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
            options: {responsive: true, plugins: {title: {display: true, text: 'Vacinas mais aplicadas'}}}
        });
        chartInstance.push(chart3);
    } catch (e) {
        alert('Erro ao carregar dados dos relatórios: ' + e.message);
    }
};