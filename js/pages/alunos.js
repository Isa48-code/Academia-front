// js/pages/alunos.js
export class AlunosPage {
    async render() {
        const alunos = window.mockData.alunos;
        
        return `
            <div class="page-header">
                <h1>👥 Gestão de Alunos</h1>
                <button class="btn btn-primary" onclick="academiaApp.carregarDashboard()">
                    ← Voltar
                </button>
                <button class="btn btn-success" onclick="alunosPage.criarAluno()">
                    ＋ Novo Aluno
                </button>
            </div>

            <div class="stats-bar">
                <div class="stat">
                    <strong>${alunos.length}</strong>
                    <span>Total de Alunos</span>
                </div>
                <div class="stat">
                    <strong>${alunos.filter(a => a.status === 'ativo').length}</strong>
                    <span>Alunos Ativos</span>
                </div>
            </div>

            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>E-mail</th>
                            <th>Telefone</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${alunos.map(aluno => `
                            <tr>
                                <td>${aluno.nome}</td>
                                <td>${aluno.email}</td>
                                <td>${aluno.telefone}</td>
                                <td>
                                    <span class="status-badge ${aluno.status}">
                                        ${aluno.status}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm" onclick="alunosPage.editarAluno('${aluno.id}')">
                                        ✏️ Editar
                                    </button>
                                    <button class="btn btn-sm btn-danger" 
                                            onclick="alunosPage.excluirAluno('${aluno.id}')">
                                        🗑️ Excluir
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    criarAluno() {
        alert('Funcionalidade: Criar Novo Aluno');
        // Aqui você implementará o modal de criação
    }

    editarAluno(alunoId) {
        alert(`Funcionalidade: Editar Aluno ${alunoId}`);
    }

    excluirAluno(alunoId) {
        if (confirm('Tem certeza que deseja excluir este aluno?')) {
            alert(`Funcionalidade: Excluir Aluno ${alunoId}`);
        }
    }
}

// Torna global para acesso via HTML
window.alunosPage = new AlunosPage();