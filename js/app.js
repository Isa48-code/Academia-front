// js/app.js - VERSÃO COMPLETA E FUNCIONAL
console.log('🚀 Academia App com Login carregado!');

class AcademiaApp {
    constructor() {
        this.usuarioLogado = null;
        this.init();
    }

    init() {
        this.verificarAutenticacao();
    }

    verificarAutenticacao() {
        // Verifica se há usuário logado no localStorage
        const usuarioSalvo = localStorage.getItem('academiaUsuario');
        
        if (usuarioSalvo) {
            this.usuarioLogado = JSON.parse(usuarioSalvo);
            this.carregarDashboard();
        } else {
            this.carregarLogin();
        }
    }

    carregarLogin() {
        document.getElementById('app').innerHTML = `
            <div class="login-container">
                <div class="login-box">
                    <div class="login-header">
                        <h1>🏋️ Academia Fit</h1>
                        <p>Faça login para acessar o sistema</p>
                    </div>

                    <form id="loginForm" class="login-form">
                        <div class="form-group">
                            <label>E-mail</label>
                            <input type="email" id="email" placeholder="seu@email.com" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Senha</label>
                            <input type="password" id="senha" placeholder="Sua senha" required>
                        </div>

                        <button type="submit" class="btn btn-large btn-primary" style="width: 100%;">
                            🔐 Entrar
                        </button>
                    </form>

                    <div class="login-footer">
                        <p>Não tem conta? <a href="#" onclick="academiaApp.carregarCadastro()">Cadastre-se aqui</a></p>
                        <div class="demo-accounts">
                            <p><strong>Contas para teste:</strong></p>
                            <p>👨‍💼 Admin: admin@academia.com / senha123</p>
                            <p>👥 Instrutor: instructor@academia.com / senha123</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.fazerLogin();
        });
    }

    carregarCadastro() {
        document.getElementById('app').innerHTML = `
            <div class="login-container">
                <div class="login-box">
                    <div class="login-header">
                        <h1>📝 Criar Conta</h1>
                        <p>Cadastre-se no sistema</p>
                    </div>

                    <form id="cadastroForm" class="login-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Nome completo</label>
                                <input type="text" id="nome" placeholder="Seu nome completo" required>
                            </div>
                            <div class="form-group">
                                <label>Telefone</label>
                                <input type="tel" id="telefone" placeholder="(11) 99999-9999">
                            </div>
                        </div>

                        <div class="form-group">
                            <label>E-mail</label>
                            <input type="email" id="emailCadastro" placeholder="seu@email.com" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Senha</label>
                                <input type="password" id="senhaCadastro" placeholder="Mínimo 6 caracteres" required minlength="6">
                            </div>
                            <div class="form-group">
                                <label>Confirmar Senha</label>
                                <input type="password" id="confirmarSenha" placeholder="Digite novamente" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Tipo de Usuário</label>
                            <select id="tipoUsuario" required>
                                <option value="">Selecione...</option>
                                <option value="admin">Administrador</option>
                                <option value="instrutor">Instrutor</option>
                            </select>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn btn-large btn-success" style="width: 100%;">
                                📝 Criar Conta
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="academiaApp.carregarLogin()" style="width: 100%; margin-top: 10px;">
                                ← Voltar ao Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('cadastroForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.fazerCadastro();
        });
    }

    fazerLogin() {
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        // Busca usuário nos dados mockados
        const usuario = this.buscarUsuario(email, senha);

        if (usuario) {
            this.usuarioLogado = usuario;
            localStorage.setItem('academiaUsuario', JSON.stringify(usuario));
            this.carregarDashboard();
            this.mostrarMensagem(`Bem-vindo, ${usuario.nome}!`, 'success');
        } else {
            this.mostrarMensagem('E-mail ou senha incorretos!', 'error');
        }
    }

    fazerCadastro() {
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('emailCadastro').value;
        const telefone = document.getElementById('telefone').value;
        const senha = document.getElementById('senhaCadastro').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;
        const tipoUsuario = document.getElementById('tipoUsuario').value;

        // Validações
        if (senha !== confirmarSenha) {
            this.mostrarMensagem('As senhas não coincidem!', 'error');
            return;
        }

        if (senha.length < 6) {
            this.mostrarMensagem('A senha deve ter pelo menos 6 caracteres!', 'error');
            return;
        }

        // Verifica se email já existe
        if (this.buscarUsuarioPorEmail(email)) {
            this.mostrarMensagem('Este e-mail já está cadastrado!', 'error');
            return;
        }

        // Cria novo usuário
        const novoUsuario = {
            id: 'user_' + Date.now(),
            nome: nome,
            email: email,
            telefone: telefone,
            senha: senha, // Em app real, isso seria hash
            tipo: tipoUsuario,
            dataCadastro: new Date().toISOString()
        };

        // Salva no "banco" local
        this.salvarUsuario(novoUsuario);
        
        this.mostrarMensagem('Conta criada com sucesso! Faça login para continuar.', 'success');
        this.carregarLogin();
    }

    buscarUsuario(email, senha) {
        const usuarios = this.getUsuarios();
        return usuarios.find(user => user.email === email && user.senha === senha);
    }

    buscarUsuarioPorEmail(email) {
        const usuarios = this.getUsuarios();
        return usuarios.find(user => user.email === email);
    }

    getUsuarios() {
        // Usuários padrão + usuários cadastrados
        const usuariosPadrao = [
            {
                id: 'admin_1',
                nome: 'Administrador',
                email: 'admin@academia.com',
                senha: 'senha123',
                tipo: 'admin',
                telefone: '(11) 9999-9999'
            },
            {
                id: 'instrutor_1',
                nome: 'Carlos Souza',
                email: 'instrutor@academia.com', 
                senha: 'senha123',
                tipo: 'instrutor',
                telefone: '(11) 98888-8888'
            }
        ];

        const usuariosSalvos = JSON.parse(localStorage.getItem('academiaUsuarios') || '[]');
        return [...usuariosPadrao, ...usuariosSalvos];
    }

    salvarUsuario(usuario) {
        const usuarios = this.getUsuarios().filter(u => !u.id.startsWith('user_'));
        usuarios.push(usuario);
        localStorage.setItem('academiaUsuarios', JSON.stringify(usuarios));
    }

    carregarDashboard() {
        if (!this.usuarioLogado) {
            this.carregarLogin();
            return;
        }

        const alunos = window.mockData?.alunos || [];
        const treinos = window.mockData?.treinos || [];
        const instrutores = window.mockData?.instrutores || [];

        document.getElementById('app').innerHTML = `
            <div class="dashboard-container">
                <!-- Header com usuário -->
                <header class="main-header">
                    <div class="header-content">
                        <h1>🏋️ Academia Fit</h1>
                        <div class="user-info">
                            <span>Olá, <strong>${this.usuarioLogado.nome}</strong></span>
                            <span class="user-badge ${this.usuarioLogado.tipo}">${this.usuarioLogado.tipo}</span>
                            <button class="btn btn-sm btn-outline" onclick="academiaApp.sair()">
                                🚪 Sair
                            </button>
                        </div>
                    </div>
                </header>

                <!-- Conteúdo principal -->
                <main class="main-content">
                    <div class="welcome-section">
                        <h2>Bem-vindo ao Sistema de Gestão</h2>
                        <p>Gerencie alunos, treinos e instrutores em um só lugar</p>
                    </div>

                    <div class="quick-stats">
                        <div class="stat-card">
                            <div class="stat-icon">👥</div>
                            <div class="stat-info">
                                <h3>${alunos.length}</h3>
                                <p>Alunos Cadastrados</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">💪</div>
                            <div class="stat-info">
                                <h3>${treinos.length}</h3>
                                <p>Planos de Treino</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">🏃</div>
                            <div class="stat-info">
                                <h3>${instrutores.length}</h3>
                                <p>Instrutores</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">📊</div>
                            <div class="stat-info">
                                <h3>${alunos.filter(a => a.status === 'ativo').length}</h3>
                                <p>Alunos Ativos</p>
                            </div>
                        </div>
                    </div>

                    <div class="action-grid">
                        <div class="action-card" onclick="academiaApp.carregarAlunos()">
                            <div class="action-icon">👥</div>
                            <h3>Gestão de Alunos</h3>
                            <p>Cadastre e gerencie alunos</p>
                        </div>
                        
                        <div class="action-card" onclick="academiaApp.carregarTreinos()">
                            <div class="action-icon">💪</div>
                            <h3>Planos de Treino</h3>
                            <p>Crie e edite treinos</p>
                        </div>
                        
                        <div class="action-card" onclick="academiaApp.carregarInstrutores()">
                            <div class="action-icon">🏃</div>
                            <h3>Instrutores</h3>
                            <p>Gerencie a equipe</p>
                        </div>

                        ${this.usuarioLogado.tipo === 'admin' ? `
                            <div class="action-card" onclick="academiaApp.carregarUsuarios()">
                                <div class="action-icon">👨‍💼</div>
                                <h3>Usuários</h3>
                                <p>Gerencie acessos</p>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Atividade Recente -->
                    <div class="recent-activity">
                        <h3>📋 Atividade Recente</h3>
                        <div class="activity-list">
                            <div class="activity-item">
                                <span class="activity-icon">➕</span>
                                <span>Novo aluno cadastrado</span>
                                <span class="activity-time">Há 2 horas</span>
                            </div>
                            <div class="activity-item">
                                <span class="activity-icon">💪</span>
                                <span>Plano de treino atualizado</span>
                                <span class="activity-time">Há 1 dia</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

    // 👥 PÁGINA DE ALUNOS
    carregarAlunos() {
        const alunos = window.mockData?.alunos || [];
        const ativos = alunos.filter(a => a.status === 'ativo').length;

        document.getElementById('app').innerHTML = `
            <div class="page-header">
                <h1>👥 Gestão de Alunos</h1>
                <button class="btn" onclick="academiaApp.carregarDashboard()">
                    ← Voltar ao Dashboard
                </button>
                <button class="btn btn-success" onclick="academiaApp.criarAluno()">
                    ＋ Novo Aluno
                </button>
            </div>

            <div class="stats-bar">
                <div class="stat">
                    <strong>${alunos.length}</strong>
                    <span>Total de Alunos</span>
                </div>
                <div class="stat">
                    <strong>${ativos}</strong>
                    <span>Alunos Ativos</span>
                </div>
                <div class="stat">
                    <strong>${alunos.length - ativos}</strong>
                    <span>Alunos Inativos</span>
                </div>
            </div>

            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>E-mail</th>
                            <th>Telefone</th>
                            <th>Plano</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${alunos.map(aluno => `
                            <tr>
                                <td><strong>${aluno.nome}</strong></td>
                                <td>${aluno.email}</td>
                                <td>${aluno.telefone}</td>
                                <td>${aluno.plano || 'Não definido'}</td>
                                <td>
                                    <span class="status-badge ${aluno.status}">
                                        ${aluno.status}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm" onclick="academiaApp.editarAluno('${aluno.id}')">
                                        ✏️ Editar
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="academiaApp.excluirAluno('${aluno.id}')">
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

    // 💪 PÁGINA DE TREINOS
    carregarTreinos() {
        const treinos = window.mockData?.treinos || [];
        const ativos = treinos.filter(t => t.status === 'ativo').length;

        document.getElementById('app').innerHTML = `
            <div class="page-header">
                <h1>💪 Planos de Treino</h1>
                <button class="btn" onclick="academiaApp.carregarDashboard()">
                    ← Voltar ao Dashboard
                </button>
                <button class="btn btn-success" onclick="academiaApp.criarTreino()">
                    🏋️ Criar Treino
                </button>
            </div>

            <div class="stats-bar">
                <div class="stat">
                    <strong>${treinos.length}</strong>
                    <span>Total de Planos</span>
                </div>
                <div class="stat">
                    <strong>${ativos}</strong>
                    <span>Planos Ativos</span>
                </div>
                <div class="stat">
                    <strong>${treinos.reduce((total, t) => total + (t.alunos?.length || 0), 0)}</strong>
                    <span>Alunos com Treino</span>
                </div>
            </div>

            <div class="treinos-grid">
                ${treinos.map(treino => `
                    <div class="treino-card">
                        <div class="treino-header">
                            <h3>${treino.nome}</h3>
                            <span class="badge ${treino.dificuldade}">${treino.dificuldade}</span>
                        </div>
                        <div class="treino-info">
                            <p><strong>Tipo:</strong> ${treino.tipo}</p>
                            <p><strong>Duração:</strong> ${treino.duracao} semanas</p>
                            <p><strong>Alunos:</strong> ${treino.alunos?.length || 0}</p>
                        </div>
                        <div class="treino-exercicios">
                            <strong>Exercícios:</strong>
                            ${treino.exercicios?.slice(0, 3).map(ex => 
                                `<span class="exercise-tag">${typeof ex === 'object' ? ex.nome : ex}</span>`
                            ).join('') || '<span class="exercise-tag">Nenhum exercício</span>'}
                        </div>
                        <div class="treino-actions">
                            <button class="btn btn-sm" onclick="academiaApp.editarTreino('${treino.id}')">
                                ✏️ Editar
                            </button>
                            <button class="btn btn-sm btn-primary" onclick="academiaApp.visualizarTreino('${treino.id}')">
                                👁️ Visualizar
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // 🏃 PÁGINA DE INSTRUTORES
    carregarInstrutores() {
        const instrutores = window.mockData?.instrutores || [];

        document.getElementById('app').innerHTML = `
            <div class="page-header">
                <h1>🏃 Gestão de Instrutores</h1>
                <button class="btn" onclick="academiaApp.carregarDashboard()">
                    ← Voltar ao Dashboard
                </button>
                <button class="btn btn-success" onclick="academiaApp.criarInstrutor()">
                    👨‍💼 Novo Instrutor
                </button>
            </div>

            <div class="stats-bar">
                <div class="stat">
                    <strong>${instrutores.length}</strong>
                    <span>Total de Instrutores</span>
                </div>
                <div class="stat">
                    <strong>${instrutores.filter(i => i.turno === 'manhã').length}</strong>
                    <span>Turno Manhã</span>
                </div>
                <div class="stat">
                    <strong>${instrutores.filter(i => i.turno === 'tarde').length}</strong>
                    <span>Turno Tarde</span>
                </div>
            </div>

            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Especialidade</th>
                            <th>Turno</th>
                            <th>Telefone</th>
                            <th>E-mail</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${instrutores.map(instrutor => `
                            <tr>
                                <td><strong>${instrutor.nome}</strong></td>
                                <td>${instrutor.especialidade}</td>
                                <td>${instrutor.turno}</td>
                                <td>${instrutor.telefone}</td>
                                <td>${instrutor.email}</td>
                                <td>
                                    <button class="btn btn-sm" onclick="academiaApp.editarInstrutor('${instrutor.id}')">
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

    // 👨‍💼 PÁGINA DE USUÁRIOS
    carregarUsuarios() {
        const usuarios = this.getUsuarios();
        
        document.getElementById('app').innerHTML = `
            <div class="page-header">
                <h1>👨‍💼 Gestão de Usuários</h1>
                <button class="btn" onclick="academiaApp.carregarDashboard()">
                    ← Voltar
                </button>
                <button class="btn btn-success" onclick="academiaApp.criarUsuario()">
                    👤 Novo Usuário
                </button>
            </div>

            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>E-mail</th>
                            <th>Tipo</th>
                            <th>Data Cadastro</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${usuarios.map(usuario => `
                            <tr>
                                <td>${usuario.nome}</td>
                                <td>${usuario.email}</td>
                                <td><span class="user-badge ${usuario.tipo}">${usuario.tipo}</span></td>
                                <td>${new Date(usuario.dataCadastro).toLocaleDateString()}</td>
                                <td>
                                    <button class="btn btn-sm" onclick="academiaApp.editarUsuario('${usuario.id}')">
                                        ✏️ Editar
                                    </button>
                                    ${usuario.id !== this.usuarioLogado.id ? 
                                        `<button class="btn btn-sm btn-danger" onclick="academiaApp.excluirUsuario('${usuario.id}')">
                                            🗑️ Excluir
                                        </button>` : 
                                        '<span class="text-muted">Usuário atual</span>'
                                    }
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // 🎯 MÉTODOS DE AÇÃO (para implementar depois)
    criarAluno() {
        alert('🎯 Funcionalidade: Criar Novo Aluno');
    }

    editarAluno(id) {
        alert(`🎯 Funcionalidade: Editar Aluno ${id}`);
    }

    excluirAluno(id) {
        if (confirm('Tem certeza que deseja excluir este aluno?')) {
            alert(`🎯 Funcionalidade: Excluir Aluno ${id}`);
        }
    }

    criarTreino() {
        if (window.workoutBuilder) {
            window.workoutBuilder.abrir();
        } else {
            alert('🎯 Funcionalidade: Criar Novo Treino (Construtor não carregado)');
        }
    }

    editarTreino(id) {
        const treino = window.mockData.treinos.find(t => t.id === id);
        if (treino && window.workoutBuilder) {
            window.workoutBuilder.abrir(treino);
        } else {
            alert(`🎯 Funcionalidade: Editar Treino ${id}`);
        }
    }

    visualizarTreino(id) {
        alert(`🎯 Funcionalidade: Visualizar Treino ${id}`);
    }

    criarInstrutor() {
        alert('🎯 Funcionalidade: Criar Novo Instrutor');
    }

    editarInstrutor(id) {
        alert(`🎯 Funcionalidade: Editar Instrutor ${id}`);
    }

    criarUsuario() {
        alert('🎯 Funcionalidade: Criar Novo Usuário');
    }

    editarUsuario(id) {
        alert(`🎯 Funcionalidade: Editar Usuário ${id}`);
    }

    excluirUsuario(id) {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            alert(`🎯 Funcionalidade: Excluir Usuário ${id}`);
        }
    }

    sair() {
        localStorage.removeItem('academiaUsuario');
        this.usuarioLogado = null;
        this.carregarLogin();
        this.mostrarMensagem('Logout realizado com sucesso!', 'success');
    }

    mostrarMensagem(mensagem, tipo) {
        // Remove mensagem anterior se existir
        const mensagemAnterior = document.querySelector('.mensagem-flutuante');
        if (mensagemAnterior) {
            mensagemAnterior.remove();
        }

        const divMensagem = document.createElement('div');
        divMensagem.className = `mensagem-flutuante ${tipo}`;
        divMensagem.textContent = mensagem;
        divMensagem.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        if (tipo === 'success') {
            divMensagem.style.background = '#28a745';
        } else if (tipo === 'error') {
            divMensagem.style.background = '#dc3545';
        } else {
            divMensagem.style.background = '#007bff';
        }

        document.body.appendChild(divMensagem);

        // Remove após 3 segundos
        setTimeout(() => {
            if (divMensagem.parentNode) {
                divMensagem.remove();
            }
        }, 3000);
    }
}

// Inicia a aplicação
document.addEventListener('DOMContentLoaded', function() {
    window.academiaApp = new AcademiaApp();
});

// Adicione este CSS no estilo para as animações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);