// js/app.js - SISTEMA COMPLETO ACADEMIA FIT
console.log('🚀 Academia Fit - Sistema de Gerenciamento carregado!');

class AcademiaApp {
    constructor() {
        this.usuarioLogado = null;
        this.apiService = window.apiService;
        this.init();
    }

    init() {
        this.verificarAutenticacao();
        this.inicializarServiceWorker();
    }

    // 🔐 SISTEMA DE AUTENTICAÇÃO
    verificarAutenticacao() {
        const usuarioSalvo = localStorage.getItem(CONFIG.STORAGE.USER_KEY);
        
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
                        <h1>🏋️ ${CONFIG.APP.NAME}</h1>
                        <p>Sistema de Gestão</p>
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

                        <button type="submit" class="btn btn-large btn-primary">
                            🔐 Entrar no Sistema
                        </button>
                    </form>

                    <div class="login-footer">
                        <!-- LINK DE CADASTRO ADICIONADO AQUI -->
                        <div class="cadastro-link">
                            <p>Não tem conta? 
                                <a href="#" onclick="academiaApp.carregarCadastro()">
                                    <strong>Cadastre-se aqui</strong>
                                </a>
                            </p>
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

    // 📝 PÁGINA DE CADASTRO
    carregarCadastro() {
        document.getElementById('app').innerHTML = `
            <div class="login-container">
                <div class="login-box">
                    <div class="login-header">
                        <h1>📝 Criar Conta</h1>
                        <p>Cadastre-se no sistema</p>
                    </div>

                    <form id="cadastroForm" class="login-form">
                        <div class="form-group">
                            <label>Nome completo *</label>
                            <input type="text" id="nome" placeholder="Seu nome completo" required>
                        </div>

                        <div class="form-group">
                            <label>E-mail *</label>
                            <input type="email" id="emailCadastro" placeholder="seu@email.com" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Senha *</label>
                                <input type="password" id="senhaCadastro" placeholder="Mínimo 6 caracteres" required minlength="6">
                            </div>
                            <div class="form-group">
                                <label>Confirmar Senha *</label>
                                <input type="password" id="confirmarSenha" placeholder="Digite novamente" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Tipo de Usuário *</label>
                            <select id="tipoUsuario" required>
                                <option value="">Selecione...</option>
                                <option value="ADMIN">Administrador</option>
                                <option value="INSTRUTOR">Instrutor</option>
                                <option value="ALUNO">Aluno</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Telefone</label>
                            <input type="tel" id="telefone" placeholder="(11) 99999-9999">
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn btn-large btn-success">
                                📝 Criar Minha Conta
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="academiaApp.carregarLogin()">
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

    // 💾 CADASTRAR USUÁRIO
    async fazerCadastro() {
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('emailCadastro').value;
        const senha = document.getElementById('senhaCadastro').value;
        const confirmarSenha = document.getElementById('confirmarSenha').value;
        const tipoUsuario = document.getElementById('tipoUsuario').value;
        const telefone = document.getElementById('telefone').value;

        // Validações
        if (senha !== confirmarSenha) {
            this.mostrarMensagem('As senhas não coincidem!', 'error');
            return;
        }

        if (senha.length < 6) {
            this.mostrarMensagem('A senha deve ter pelo menos 6 caracteres!', 'error');
            return;
        }

        if (!tipoUsuario) {
            this.mostrarMensagem('Selecione o tipo de usuário!', 'error');
            return;
        }

        try {
            // Por enquanto, salva localmente (será substituído pela API)
            const novoUsuario = new DataModels.Usuario({
                nome,
                email,
                senha,
                telefone,
                tipo: tipoUsuario
            });

            // Salva no localStorage (provisório)
            const usuarios = JSON.parse(localStorage.getItem('academia_usuarios') || '[]');
            
            // Verifica se email já existe
            if (usuarios.find(u => u.email === email)) {
                this.mostrarMensagem('Este e-mail já está cadastrado!', 'error');
                return;
            }

            usuarios.push(novoUsuario);
            localStorage.setItem('academia_usuarios', JSON.stringify(usuarios));

            this.mostrarMensagem('Conta criada com sucesso! Faça login para continuar.', 'success');
            this.carregarLogin();

        } catch (error) {
            this.mostrarMensagem('Erro ao criar conta: ' + error.message, 'error');
        }
    }

    async fazerLogin() {
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        try {
            this.mostrarLoading('Autenticando...');
            
            const resultado = await this.apiService.login(email, senha);
            
            if (resultado.success) {
                this.usuarioLogado = resultado.user;
                localStorage.setItem(CONFIG.STORAGE.USER_KEY, JSON.stringify(resultado.user));
                this.mostrarMensagem(`Bem-vindo, ${resultado.user.nome}!`, 'success');
                this.carregarDashboard();
            }
        } catch (error) {
            this.mostrarMensagem(error.message || 'Erro ao fazer login', 'error');
        } finally {
            this.esconderLoading();
        }
    }
    

    // 🏠 DASHBOARD PRINCIPAL
    async carregarDashboard() {
        if (!this.usuarioLogado) {
            this.carregarLogin();
            return;
        }

        try {
            // Carrega dados em paralelo
            const [alunos, instrutores, treinos, avaliacoes] = await Promise.all([
                this.apiService.getAlunos(),
                this.apiService.getInstrutores(),
                this.apiService.getTreinos(),
                this.apiService.getAvaliacoes()
            ]);

            this.renderizarDashboard(alunos, instrutores, treinos, avaliacoes);
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
            this.mostrarMensagem('Erro ao carregar dados', 'error');
        }
    }

    renderizarDashboard(alunos, instrutores, treinos, avaliacoes) {
        const alunosAtivos = alunos.filter(a => a.status === 'ATIVO').length;
        const treinosAtivos = treinos.filter(t => t.status === 'ATIVO').length;
        const avaliacoes30Dias = avaliacoes.filter(a => 
            new Date(a.dataAvaliacao) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length;

        document.getElementById('app').innerHTML = `
            <div class="dashboard-container">
                <header class="main-header">
                    <div class="header-content">
                        <h1>🏋️ ${CONFIG.APP.NAME}</h1>
                        <div class="user-info">
                            <span>Olá, <strong>${this.usuarioLogado.nome}</strong></span>
                            <span class="user-badge ${this.usuarioLogado.tipo.toLowerCase()}">
                                ${this.usuarioLogado.tipo}
                            </span>
                            <button class="btn btn-sm btn-outline" onclick="academiaApp.sair()">
                                🚪 Sair
                            </button>
                        </div>
                    </div>
                </header>

                <main class="main-content">
                    <div class="welcome-section">
                        <h2>Painel de Controle</h2>
                        <p>Gerencie sua academia de forma profissional</p>
                    </div>

                    <!-- Estatísticas -->
                    <div class="quick-stats">
                        <div class="stat-card">
                            <div class="stat-icon">👥</div>
                            <div class="stat-info">
                                <h3>${alunos.length}</h3>
                                <p>Total de Alunos</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">💪</div>
                            <div class="stat-info">
                                <h3>${treinosAtivos}</h3>
                                <p>Planos Ativos</p>
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
                                <h3>${avaliacoes30Dias}</h3>
                                <p>Avaliações (30 dias)</p>
                            </div>
                        </div>
                    </div>

                    <!-- Menu de Ações -->
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

                        <div class="action-card" onclick="academiaApp.carregarAvaliacoes()">
                            <div class="action-icon">📊</div>
                            <h3>Avaliações Físicas</h3>
                            <p>Avaliações completas</p>
                        </div>

                        ${this.usuarioLogado.tipo === 'ADMIN' ? `
                            <div class="action-card" onclick="academiaApp.carregarUsuarios()">
                                <div class="action-icon">👨‍💼</div>
                                <h3>Usuários</h3>
                                <p>Gerencie acessos</p>
                            </div>
                            <div class="action-card" onclick="academiaApp.carregarRelatorios()">
                                <div class="action-icon">📈</div>
                                <h3>Relatórios</h3>
                                <p>Relatórios e analytics</p>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Atividade Recente -->
                    <div class="recent-activity">
                        <h3>📋 Atividade Recente</h3>
                        <div class="activity-list">
                            ${avaliacoes.length > 0 ? `
                                <div class="activity-item">
                                    <span class="activity-icon">📊</span>
                                    <span>${avaliacoes.length} avaliações realizadas</span>
                                    <span class="activity-time">
                                        Última: ${new Date(avaliacoes[avaliacoes.length - 1].dataAvaliacao).toLocaleDateString()}
                                    </span>
                                </div>
                            ` : ''}
                            <div class="activity-item">
                                <span class="activity-icon">👥</span>
                                <span>${alunosAtivos} alunos ativos no sistema</span>
                                <span class="activity-time">Atualizado agora</span>
                            </div>
                            <div class="activity-item">
                                <span class="activity-icon">💪</span>
                                <span>${treinosAtivos} planos de treino ativos</span>
                                <span class="activity-time">Atualizado agora</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

    // 👥 GESTÃO DE ALUNOS
    async carregarAlunos() {
        try {
            const alunos = await this.apiService.getAlunos();
            const ativos = alunos.filter(a => a.status === 'ATIVO').length;

            document.getElementById('app').innerHTML = `
                <div class="page-header">
                    <h1>👥 Gestão de Alunos</h1>
                    <div>
                        <button class="btn" onclick="academiaApp.carregarDashboard()">
                            ← Voltar
                        </button>
                        <button class="btn btn-success" onclick="academiaApp.criarAluno()">
                            ＋ Novo Aluno
                        </button>
                    </div>
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
                                    <td>
                                        <div class="user-avatar">
                                            <strong>${aluno.nome}</strong>
                                        </div>
                                    </td>
                                    <td>${aluno.email}</td>
                                    <td>${aluno.telefone}</td>
                                    <td>
                                        <span class="plan-badge ${aluno.plano.toLowerCase()}">
                                            ${aluno.plano}
                                        </span>
                                    </td>
                                    <td>
                                        <span class="status-badge ${aluno.status.toLowerCase()}">
                                            ${aluno.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="action-buttons">
                                            <button class="btn btn-sm" onclick="academiaApp.editarAluno('${aluno.id}')">
                                                ✏️ Editar
                                            </button>
                                            <button class="btn btn-sm btn-outline" onclick="academiaApp.verAluno('${aluno.id}')">
                                                👁️ Ver
                                            </button>
                                            ${this.usuarioLogado.tipo === 'ADMIN' ? `
                                                <button class="btn btn-sm btn-danger" onclick="academiaApp.excluirAluno('${aluno.id}')">
                                                    🗑️ Excluir
                                                </button>
                                            ` : ''}
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (error) {
            this.mostrarMensagem('Erro ao carregar alunos', 'error');
        }
    }

    // 💪 PLANOS DE TREINO
    async carregarTreinos() {
        try {
            const treinos = await this.apiService.getTreinos();
            const ativos = treinos.filter(t => t.status === 'ATIVO').length;

            document.getElementById('app').innerHTML = `
                <div class="page-header">
                    <h1>💪 Planos de Treino</h1>
                    <div>
                        <button class="btn" onclick="academiaApp.carregarDashboard()">
                            ← Voltar
                        </button>
                        <button class="btn btn-success" onclick="academiaApp.criarTreino()">
                            🏋️ Criar Treino
                        </button>
                    </div>
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
                                <span class="badge ${treino.dificuldade.toLowerCase()}">
                                    ${treino.dificuldade}
                                </span>
                            </div>
                            <div class="treino-info">
                                <p><strong>Tipo:</strong> ${treino.tipo}</p>
                                <p><strong>Duração:</strong> ${treino.duracao} semanas</p>
                                <p><strong>Alunos:</strong> ${treino.alunos?.length || 0}</p>
                            </div>
                            <div class="treino-exercicios">
                                <strong>Exercícios:</strong>
                                <div class="exercises-list">
                                    ${treino.exercicios.slice(0, 3).map(ex => 
                                        `<span class="exercise-tag">${ex.nome}</span>`
                                    ).join('')}
                                    ${treino.exercicios.length > 3 ? 
                                        `<span class="exercise-tag">+${treino.exercicios.length - 3} mais</span>` : ''
                                    }
                                </div>
                            </div>
                            <div class="treino-actions">
                                <button class="btn btn-sm" onclick="academiaApp.editarTreino('${treino.id}')">
                                    ✏️ Editar
                                </button>
                                <button class="btn btn-sm btn-primary" onclick="academiaApp.visualizarTreino('${treino.id}')">
                                    👁️ Visualizar
                                </button>
                                <button class="btn btn-sm btn-outline" onclick="academiaApp.atribuirTreino('${treino.id}')">
                                    ➕ Atribuir
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (error) {
            this.mostrarMensagem('Erro ao carregar treinos', 'error');
        }
    }

    // 🏃 GESTÃO DE INSTRUTORES
    async carregarInstrutores() {
        try {
            const instrutores = await this.apiService.getInstrutores();

            document.getElementById('app').innerHTML = `
                <div class="page-header">
                    <h1>🏃 Gestão de Instrutores</h1>
                    <div>
                        <button class="btn" onclick="academiaApp.carregarDashboard()">
                            ← Voltar
                        </button>
                        ${this.usuarioLogado.tipo === 'ADMIN' ? `
                            <button class="btn btn-success" onclick="academiaApp.criarInstrutor()">
                                👨‍💼 Novo Instrutor
                            </button>
                        ` : ''}
                    </div>
                </div>

                <div class="stats-bar">
                    <div class="stat">
                        <strong>${instrutores.length}</strong>
                        <span>Total de Instrutores</span>
                    </div>
                    <div class="stat">
                        <strong>${instrutores.filter(i => i.turno === 'MANHA').length}</strong>
                        <span>Turno Manhã</span>
                    </div>
                    <div class="stat">
                        <strong>${instrutores.filter(i => i.turno === 'TARDE').length}</strong>
                        <span>Turno Tarde</span>
                    </div>
                </div>

                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Especialidade</th>
                                <th>CREF</th>
                                <th>Turno</th>
                                <th>Telefone</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${instrutores.map(instrutor => `
                                <tr>
                                    <td>
                                        <div class="user-avatar">
                                            <strong>${instrutor.nome}</strong>
                                        </div>
                                    </td>
                                    <td>${instrutor.especialidade}</td>
                                    <td>${instrutor.cref}</td>
                                    <td>
                                        <span class="turno-badge ${instrutor.turno.toLowerCase()}">
                                            ${instrutor.turno}
                                        </span>
                                    </td>
                                    <td>${instrutor.telefone}</td>
                                    <td>
                                        <div class="action-buttons">
                                            <button class="btn btn-sm" onclick="academiaApp.verInstrutor('${instrutor.id}')">
                                                👁️ Ver
                                            </button>
                                            ${this.usuarioLogado.tipo === 'ADMIN' ? `
                                                <button class="btn btn-sm" onclick="academiaApp.editarInstrutor('${instrutor.id}')">
                                                    ✏️ Editar
                                                </button>
                                            ` : ''}
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (error) {
            this.mostrarMensagem('Erro ao carregar instrutores', 'error');
        }
    }

    // 📊 AVALIAÇÕES FÍSICAS (SISTEMA COMPLETO)
    async carregarAvaliacoes() {
        try {
            const avaliacoes = await this.apiService.getAvaliacoes();
            const alunos = await this.apiService.getAlunos();

            document.getElementById('app').innerHTML = `
                <div class="page-header">
                    <h1>📊 Avaliações Físicas</h1>
                    <div>
                        <button class="btn" onclick="academiaApp.carregarDashboard()">
                            ← Voltar
                        </button>
                        <button class="btn btn-success" onclick="academiaApp.criarAvaliacao()">
                            📝 Nova Avaliação
                        </button>
                    </div>
                </div>

                <div class="stats-bar">
                    <div class="stat">
                        <strong>${avaliacoes.length}</strong>
                        <span>Total de Avaliações</span>
                    </div>
                    <div class="stat">
                        <strong>${new Set(avaliacoes.map(a => a.alunoId)).size}</strong>
                        <span>Alunos Avaliados</span>
                    </div>
                    <div class="stat">
                        <strong>${avaliacoes.filter(a => new Date(a.dataAvaliacao) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}</strong>
                        <span>Avaliações (30 dias)</span>
                    </div>
                </div>

                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Aluno</th>
                                <th>Data</th>
                                <th>Peso</th>
                                <th>Altura</th>
                                <th>IMC</th>
                                <th>% Gordura</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${avaliacoes.map(avaliacao => {
                                const aluno = alunos.find(a => a.id === avaliacao.alunoId);
                                const imc = avaliacao.composicaoCorporal?.imc || 
                                           (avaliacao.peso / ((avaliacao.altura / 100) ** 2));
                                const classificacao = this.classificarIMC(imc);
                                
                                return `
                                    <tr>
                                        <td>
                                            <div class="user-avatar">
                                                <strong>${aluno?.nome || 'N/A'}</strong>
                                            </div>
                                        </td>
                                        <td>${new Date(avaliacao.dataAvaliacao).toLocaleDateString()}</td>
                                        <td>${avaliacao.peso} kg</td>
                                        <td>${avaliacao.altura} cm</td>
                                        <td>
                                            <span class="imc-badge ${classificacao.cor}">
                                                ${imc.toFixed(1)}
                                            </span>
                                        </td>
                                        <td>
                                            <span class="percentual-badge">
                                                ${avaliacao.composicaoCorporal?.percentualGordura || '--'}%
                                            </span>
                                        </td>
                                        <td>
                                            <div class="action-buttons">
                                                <button class="btn btn-sm btn-primary" onclick="academiaApp.visualizarAvaliacao('${avaliacao.id}')">
                                                    👁️ Visualizar
                                                </button>
                                                <button class="btn btn-sm" onclick="academiaApp.editarAvaliacao('${avaliacao.id}')">
                                                    ✏️ Editar
                                                </button>
                                                <button class="btn btn-sm btn-danger" onclick="academiaApp.excluirAvaliacao('${avaliacao.id}')">
                                                    🗑️ Excluir
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } catch (error) {
            this.mostrarMensagem('Erro ao carregar avaliações', 'error');
        }
    }

    // 📝 CRIAR AVALIAÇÃO FÍSICA
    async criarAvaliacao() {
        try {
            const alunos = await this.apiService.getAlunos();
            const alunosAtivos = alunos.filter(a => a.status === 'ATIVO');

            document.getElementById('app').innerHTML = `
                <div class="page-header">
                    <h1>📝 Nova Avaliação Física</h1>
                    <button class="btn" onclick="academiaApp.carregarAvaliacoes()">
                        ← Voltar
                    </button>
                </div>

                <div class="form-container">
                    <form id="formAvaliacao" class="avaliacao-form">
                        <!-- Dados do Aluno -->
                        <div class="form-section">
                            <h3>👤 Dados do Aluno</h3>
                            <div class="form-group">
                                <label>Selecionar Aluno *</label>
                                <select id="alunoId" required>
                                    <option value="">Selecione um aluno...</option>
                                    ${alunosAtivos.map(aluno => `
                                        <option value="${aluno.id}">
                                            ${aluno.nome} - ${aluno.email}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>

                        <!-- Medidas Básicas -->
                        <div class="form-section">
                            <h3>📏 Medidas Básicas</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Peso (kg) *</label>
                                    <input type="number" id="peso" step="0.1" min="0" required 
                                           placeholder="Ex: 70.5">
                                </div>
                                <div class="form-group">
                                    <label>Altura (cm) *</label>
                                    <input type="number" id="altura" step="0.1" min="0" required 
                                           placeholder="Ex: 175">
                                </div>
                            </div>
                        </div>

                        <!-- Circunferências -->
                        <div class="form-section">
                            <h3>📐 Circunferências Corporais (cm)</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Torácica</label>
                                    <input type="number" id="torax" step="0.1" placeholder="Ex: 95">
                                </div>
                                <div class="form-group">
                                    <label>Abdominal</label>
                                    <input type="number" id="abdominal" step="0.1" placeholder="Ex: 85">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Cintura</label>
                                    <input type="number" id="cintura" step="0.1" placeholder="Ex: 80">
                                </div>
                                <div class="form-group">
                                    <label>Quadril</label>
                                    <input type="number" id="quadril" step="0.1" placeholder="Ex: 95">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Braço Direito</label>
                                    <input type="number" id="bracoDireito" step="0.1" placeholder="Ex: 32">
                                </div>
                                <div class="form-group">
                                    <label>Braço Esquerdo</label>
                                    <input type="number" id="bracoEsquerdo" step="0.1" placeholder="Ex: 31.5">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Coxa Direita</label>
                                    <input type="number" id="coxaDireita" step="0.1" placeholder="Ex: 55">
                                </div>
                                <div class="form-group">
                                    <label>Coxa Esquerda</label>
                                    <input type="number" id="coxaEsquerda" step="0.1" placeholder="Ex: 54.5">
                                </div>
                            </div>
                        </div>

                        <!-- Composição Corporal -->
                        <div class="form-section">
                            <h3>💪 Composição Corporal</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Percentual de Gordura (%)</label>
                                    <input type="number" id="percentualGordura" step="0.1" 
                                           placeholder="Ex: 18.5">
                                </div>
                                <div class="form-group">
                                    <label>Massa Magra (kg)</label>
                                    <input type="number" id="massaMagra" step="0.1" 
                                           placeholder="Ex: 55">
                                </div>
                            </div>
                        </div>

                        <!-- Observações e Metas -->
                        <div class="form-section">
                            <h3>📋 Análise e Metas</h3>
                            <div class="form-group">
                                <label>Observações e Análise</label>
                                <textarea id="observacoes" rows="4" 
                                          placeholder="Análise da avaliação, pontos fortes, áreas de melhoria..."></textarea>
                            </div>
                            <div class="form-group">
                                <label>Metas para Próxima Avaliação</label>
                                <textarea id="metas" rows="3" 
                                          placeholder="Metas específicas e mensuráveis..."></textarea>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn btn-large btn-success">
                                💾 Salvar Avaliação
                            </button>
                            <button type="button" class="btn btn-secondary" 
                                    onclick="academiaApp.carregarAvaliacoes()">
                                ❌ Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            `;

            document.getElementById('formAvaliacao').addEventListener('submit', (e) => {
                e.preventDefault();
                this.salvarAvaliacao();
            });

        } catch (error) {
            this.mostrarMensagem('Erro ao carregar formulário', 'error');
        }
    }

    // 💾 SALVAR AVALIAÇÃO
    async salvarAvaliacao() {
        try {
            const formData = new FormData(document.getElementById('formAvaliacao'));
            
            const avaliacao = new DataModels.AvaliacaoFisica({
                alunoId: document.getElementById('alunoId').value,
                instrutorId: this.usuarioLogado.id,
                peso: parseFloat(document.getElementById('peso').value),
                altura: parseFloat(document.getElementById('altura').value),
                circunferencias: {
                    torax: document.getElementById('torax').value ? parseFloat(document.getElementById('torax').value) : null,
                    abdominal: document.getElementById('abdominal').value ? parseFloat(document.getElementById('abdominal').value) : null,
                    cintura: document.getElementById('cintura').value ? parseFloat(document.getElementById('cintura').value) : null,
                    quadril: document.getElementById('quadril').value ? parseFloat(document.getElementById('quadril').value) : null,
                    bracoDireito: document.getElementById('bracoDireito').value ? parseFloat(document.getElementById('bracoDireito').value) : null,
                    bracoEsquerdo: document.getElementById('bracoEsquerdo').value ? parseFloat(document.getElementById('bracoEsquerdo').value) : null,
                    coxaDireita: document.getElementById('coxaDireita').value ? parseFloat(document.getElementById('coxaDireita').value) : null,
                    coxaEsquerda: document.getElementById('coxaEsquerda').value ? parseFloat(document.getElementById('coxaEsquerda').value) : null
                },
                composicaoCorporal: {
                    percentualGordura: document.getElementById('percentualGordura').value ? 
                        parseFloat(document.getElementById('percentualGordura').value) : null,
                    massaMagra: document.getElementById('massaMagra').value ? 
                        parseFloat(document.getElementById('massaMagra').value) : null
                },
                observacoes: document.getElementById('observacoes').value,
                metas: document.getElementById('metas').value
            });

            // Validações
            if (!avaliacao.alunoId) {
                this.mostrarMensagem('Selecione um aluno!', 'error');
                return;
            }

            if (!avaliacao.peso || !avaliacao.altura) {
                this.mostrarMensagem('Peso e altura são obrigatórios!', 'error');
                return;
            }

            // Calcula IMC automaticamente
            avaliacao.calcularIMC();

            this.mostrarLoading('Salvando avaliação...');
            await this.apiService.saveAvaliacao(avaliacao);
            
            this.mostrarMensagem('Avaliação salva com sucesso!', 'success');
            this.carregarAvaliacoes();

        } catch (error) {
            this.mostrarMensagem('Erro ao salvar avaliação: ' + error.message, 'error');
        } finally {
            this.esconderLoading();
        }
    }

    // 👁️ VISUALIZAR AVALIAÇÃO COMPLETA
    async visualizarAvaliacao(avaliacaoId) {
        try {
            const avaliacoes = await this.apiService.getAvaliacoes();
            const alunos = await this.apiService.getAlunos();
            
            const avaliacao = avaliacoes.find(a => a.id === avaliacaoId);
            if (!avaliacao) {
                this.mostrarMensagem('Avaliação não encontrada!', 'error');
                return;
            }

            const aluno = alunos.find(a => a.id === avaliacao.alunoId);
            const imc = avaliacao.composicaoCorporal?.imc || avaliacao.calcularIMC?.() || 
                       (avaliacao.peso / ((avaliacao.altura / 100) ** 2));
            const classificacao = this.classificarIMC(imc);

            document.getElementById('app').innerHTML = `
                <div class="page-header">
                    <h1>📊 Avaliação Física - ${aluno?.nome || 'Aluno'}</h1>
                    <div>
                        <button class="btn" onclick="academiaApp.carregarAvaliacoes()">
                            ← Voltar
                        </button>
                        <button class="btn" onclick="academiaApp.editarAvaliacao('${avaliacao.id}')">
                            ✏️ Editar
                        </button>
                        <button class="btn btn-outline" onclick="academiaApp.gerarRelatorioAvaliacao('${avaliacao.id}')">
                            📄 Relatório
                        </button>
                    </div>
                </div>

                <div class="avaliacao-detalhes">
                    <!-- Cabeçalho -->
                    <div class="avaliacao-header">
                        <div class="avaliacao-info">
                            <h3>${aluno?.nome || 'Aluno não encontrado'}</h3>
                            <p><strong>Data da avaliação:</strong> ${new Date(avaliacao.dataAvaliacao).toLocaleDateString()}</p>
                            <p><strong>Instrutor responsável:</strong> ${this.usuarioLogado.nome}</p>
                            <p><strong>Status:</strong> <span class="status-badge ${avaliacao.status.toLowerCase()}">${avaliacao.status}</span></p>
                        </div>
                        <div class="avaliacao-resumo">
                            <div class="resumo-card">
                                <h4>IMC</h4>
                                <div class="valor ${classificacao.cor}">${imc.toFixed(1)}</div>
                                <small>${classificacao.texto}</small>
                            </div>
                            <div class="resumo-card">
                                <h4>Peso</h4>
                                <div class="valor">${avaliacao.peso} kg</div>
                            </div>
                            <div class="resumo-card">
                                <h4>Altura</h4>
                                <div class="valor">${avaliacao.altura} cm</div>
                            </div>
                            ${avaliacao.composicaoCorporal?.percentualGordura ? `
                                <div class="resumo-card">
                                    <h4>% Gordura</h4>
                                    <div class="valor">${avaliacao.composicaoCorporal.percentualGordura}%</div>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Grid de Informações -->
                    <div class="avaliacao-grid">
                        <!-- Medidas Antropométricas -->
                        <div class="avaliacao-section">
                            <h4>📏 Medidas Antropométricas</h4>
                            <div class="medidas-grid">
                                ${Object.entries(avaliacao.circunferencias || {}).map(([key, value]) => 
                                    value ? `
                                        <div class="medida-item">
                                            <span>${this.formatarNomeCampo(key)}:</span>
                                            <strong>${value} cm</strong>
                                        </div>
                                    ` : ''
                                ).join('')}
                            </div>
                        </div>

                        <!-- Composição Corporal -->
                        <div class="avaliacao-section">
                            <h4>💪 Composição Corporal</h4>
                            <div class="medidas-grid">
                                ${avaliacao.composicaoCorporal?.percentualGordura ? `
                                    <div class="medida-item">
                                        <span>Percentual de Gordura:</span>
                                        <strong>${avaliacao.composicaoCorporal.percentualGordura}%</strong>
                                    </div>
                                ` : ''}
                                ${avaliacao.composicaoCorporal?.massaMagra ? `
                                    <div class="medida-item">
                                        <span>Massa Magra:</span>
                                        <strong>${avaliacao.composicaoCorporal.massaMagra} kg</strong>
                                    </div>
                                ` : ''}
                                ${avaliacao.composicaoCorporal?.massaGorda ? `
                                    <div class="medida-item">
                                        <span>Massa Gorda:</span>
                                        <strong>${avaliacao.composicaoCorporal.massaGorda} kg</strong>
                                    </div>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Observações -->
                        ${avaliacao.observacoes ? `
                            <div class="avaliacao-section">
                                <h4>📋 Análise e Observações</h4>
                                <div class="observacoes-box">
                                    ${avaliacao.observacoes}
                                </div>
                            </div>
                        ` : ''}

                        <!-- Metas -->
                        ${avaliacao.metas ? `
                            <div class="avaliacao-section">
                                <h4>🎯 Metas e Objetivos</h4>
                                <div class="metas-box">
                                    ${avaliacao.metas}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        } catch (error) {
            this.mostrarMensagem('Erro ao carregar avaliação', 'error');
        }
    }

    // 🛠️ MÉTODOS AUXILIARES
    classificarIMC(imc) {
        if (imc < 18.5) return { 
            classificacao: 'ABAIXO_PESO', 
            cor: 'warning', 
            texto: 'Abaixo do peso' 
        };
        if (imc < 25) return { 
            classificacao: 'PESO_NORMAL', 
            cor: 'success', 
            texto: 'Peso normal' 
        };
        if (imc < 30) return { 
            classificacao: 'SOBREPESO', 
            cor: 'warning', 
            texto: 'Sobrepeso' 
        };
        if (imc < 35) return { 
            classificacao: 'OBESIDADE_I', 
            cor: 'danger', 
            texto: 'Obesidade Grau I' 
        };
        if (imc < 40) return { 
            classificacao: 'OBESIDADE_II', 
            cor: 'danger', 
            texto: 'Obesidade Grau II' 
        };
        return { 
            classificacao: 'OBESIDADE_III', 
            cor: 'danger', 
            texto: 'Obesidade Grau III' 
        };
    }

    formatarNomeCampo(nome) {
        const nomes = {
            torax: 'Torácica',
            abdominal: 'Abdominal',
            cintura: 'Cintura',
            quadril: 'Quadril',
            bracoDireito: 'Braço Direito',
            bracoEsquerdo: 'Braço Esquerdo',
            coxaDireita: 'Coxa Direita',
            coxaEsquerda: 'Coxa Esquerda'
        };
        return nomes[nome] || nome;
    }

    // 📱 MÉTODOS DE INTERFACE
    mostrarMensagem(mensagem, tipo = 'info') {
        // Remove mensagem anterior se existir
        const mensagemAnterior = document.querySelector('.mensagem-flutuante');
        if (mensagemAnterior) {
            mensagemAnterior.remove();
        }

        const divMensagem = document.createElement('div');
        divMensagem.className = `mensagem-flutuante ${tipo}`;
        divMensagem.innerHTML = `
            <div class="mensagem-conteudo">
                <span class="mensagem-icon">${tipo === 'success' ? '✅' : tipo === 'error' ? '❌' : 'ℹ️'}</span>
                <span>${mensagem}</span>
            </div>
        `;

        document.body.appendChild(divMensagem);

        // Remove após 5 segundos
        setTimeout(() => {
            if (divMensagem.parentNode) {
                divMensagem.remove();
            }
        }, 5000);
    }

    mostrarLoading(mensagem = 'Carregando...') {
        // Implementação do loading
        const loading = document.createElement('div');
        loading.className = 'loading-overlay';
        loading.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>${mensagem}</p>
            </div>
        `;
        loading.id = 'loadingOverlay';
        document.body.appendChild(loading);
    }

    esconderLoading() {
        const loading = document.getElementById('loadingOverlay');
        if (loading) {
            loading.remove();
        }
    }

    // 🚪 LOGOUT
    sair() {
        localStorage.removeItem(CONFIG.STORAGE.USER_KEY);
        this.usuarioLogado = null;
        this.carregarLogin();
        this.mostrarMensagem('Logout realizado com sucesso!', 'success');
    }

    // 🔧 MÉTODOS DE PLACEHOLDER (para implementar)
    criarAluno() { this.mostrarMensagem('Funcionalidade em desenvolvimento', 'info'); }
    editarAluno(id) { this.mostrarMensagem(`Editar aluno ${id} - Em desenvolvimento`, 'info'); }
    verAluno(id) { this.mostrarMensagem(`Ver aluno ${id} - Em desenvolvimento`, 'info'); }
    excluirAluno(id) { 
        if (confirm('Tem certeza que deseja excluir este aluno?')) {
            this.mostrarMensagem(`Aluno ${id} excluído - Em desenvolvimento`, 'success');
        }
    }

    criarTreino() { this.mostrarMensagem('Criar treino - Em desenvolvimento', 'info'); }
    editarTreino(id) { this.mostrarMensagem(`Editar treino ${id} - Em desenvolvimento`, 'info'); }
    visualizarTreino(id) { this.mostrarMensagem(`Visualizar treino ${id} - Em desenvolvimento`, 'info'); }
    atribuirTreino(id) { this.mostrarMensagem(`Atribuir treino ${id} - Em desenvolvimento`, 'info'); }

    criarInstrutor() { this.mostrarMensagem('Criar instrutor - Em desenvolvimento', 'info'); }
    editarInstrutor(id) { this.mostrarMensagem(`Editar instrutor ${id} - Em desenvolvimento`, 'info'); }
    verInstrutor(id) { this.mostrarMensagem(`Ver instrutor ${id} - Em desenvolvimento`, 'info'); }

    editarAvaliacao(id) { this.mostrarMensagem(`Editar avaliação ${id} - Em desenvolvimento`, 'info'); }
    excluirAvaliacao(id) { 
        if (confirm('Tem certeza que deseja excluir esta avaliação?')) {
            this.mostrarMensagem(`Avaliação ${id} excluída - Em desenvolvimento`, 'success');
        }
    }
    gerarRelatorioAvaliacao(id) { this.mostrarMensagem(`Gerar relatório ${id} - Em desenvolvimento`, 'info'); }

    carregarUsuarios() { this.mostrarMensagem('Gestão de usuários - Em desenvolvimento', 'info'); }
    carregarRelatorios() { this.mostrarMensagem('Relatórios - Em desenvolvimento', 'info'); }

    // 🛠️ SERVICE WORKER (PWA)
    inicializarServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        }
    }
}

// Inicialização global
window.AcademiaApp = AcademiaApp;