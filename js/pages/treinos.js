// js/pages/treinos.js
export class TreinosPage {
    async render() {
        const treinos = window.mockData.treinos;
        
        return `
            <div class="page-header">
                <h1>💪 Planos de Treino</h1>
                <button class="btn" onclick="academiaApp.carregarDashboard()">
                    ← Voltar
                </button>
                <button class="btn btn-success">
                    🏋️ Criar Treino
                </button>
            </div>

            <div class="stats-bar">
                <div class="stat">
                    <strong>${treinos.length}</strong>
                    <span>Total de Planos</span>
                </div>
                <div class="stat">
                    <strong>${treinos.filter(t => t.status === 'ativo').length}</strong>
                    <span>Planos Ativos</span>
                </div>
            </div>

            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nome do Treino</th>
                            <th>Tipo</th>
                            <th>Dificuldade</th>
                            <th>Duração</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${treinos.map(treino => `
                            <tr>
                                <td><strong>${treino.nome}</strong></td>
                                <td>${treino.tipo}</td>
                                <td>
                                    <span class="badge ${treino.dificuldade}">
                                        ${treino.dificuldade}
                                    </span>
                                </td>
                                <td>${treino.duracao} semanas</td>
                                <td>
                                    <span class="status-badge ${treino.status}">
                                        ${treino.status}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm">
                                        👁️ Visualizar
                                    </button>
                                    <button class="btn btn-sm">
                                        ✏️ Editar
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}

window.treinosPage = new TreinosPage();