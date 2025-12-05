// js/app.js - SISTEMA ACADEMIA FIT INTEGRADO COM SPRING BOOT
console.log('🚀 Academia Fit - Sistema Integrado com Backend Spring Boot');

// Configurações globais
window.CONFIG = {
    API: {
        BASE_URL: 'http://localhost:8080/api',
        TIMEOUT: 30000
    },
    APP: {
        NAME: '🏋️ Academia Fit Pro',
        VERSION: '2.0.0'
    },
    STORAGE: {
        USER_KEY: 'academia_fit_user',
        TOKEN_KEY: 'academia_fit_token'
    }
};

class AcademiaApp {
    constructor() {
        this.usuarioLogado = null;
        this.init();
    }

    init() {
        this.verificarAutenticacao();
        this.testarConexaoBackend();
    }

    // 🔍 TESTAR CONEXÃO COM BACKEND
    async testarConexaoBackend() {
        try {
            console.log('🔍 Testando conexão com backend Spring Boot...');
            
            const response = await fetch(`${CONFIG.API.BASE_URL}/health`, {
                method: 'GET',
                mode: 'cors'
            });
            
            if (response.ok) {
                console.log('✅ Backend Spring Boot conectado com sucesso!');
            } else {
                console.warn(`⚠️ Backend respondeu com status ${response.status}`);
            }
        } catch (error) {
            console.error('❌ Não foi possível conectar ao backend:', error);
            this.mostrarMensagem('Atenção: Backend não está respondendo. Usando modo offline.', 'warning');
        }
    }

    // 🔐 SISTEMA DE AUTENTICAÇÃO COM SPRING BOOT
    verificarAutenticacao() {
        const usuarioSalvo = localStorage.getItem(CONFIG.STORAGE.USER_KEY);
        
        if (usuarioSalvo) {
            try {
                this.usuarioLogado = JSON.parse(usuarioSalvo);
                this.carregarDashboard();
            } catch (e) {
                localStorage.removeItem(CONFIG.STORAGE.USER_KEY);
                localStorage.removeItem(CONFIG.STORAGE.TOKEN_KEY);
                this.carregarLogin();
            }
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
                        <p>Sistema Integrado Spring Boot</p>
                    </div>

                    <form id="loginForm" class="login-form">
                        <div class="form-group">
                            <label>E-mail</label>
                            <input type="email" id="email" placeholder="admin@academia.com" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Senha</label>
                            <input type="password" id="senha" placeholder="admin123" required>
                        </div>

                        <button type="submit" class="btn btn-large btn-primary">
                            🔐 Entrar no Sistema
                        </button>
                    </form>

                    <div class="demo-credentials">
                        <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-top: 1rem; text-align: center;">
                            <strong>Credenciais para teste:</strong><br>
                            Admin: admin@academia.com / admin123<br>
                            Instrutor: instrutor@academia.com / instrutor123<br>
                            Aluno: aluno@academia.com / aluno123
                        </p>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.fazerLogin();
        });
    }

    async fazerLogin() {
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        // Validação básica
        if (!email || !senha) {
            this.mostrarMensagem('Preencha email e senha!', 'error');
            return;
        }

        try {
            this.mostrarLoading('Autenticando...');
            
            // 🎯 CHAMADA REAL PARA SEU BACKEND SPRING BOOT
            const response = await fetch(`${CONFIG.API.BASE_URL}/usuarios/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    senha: senha
                })
            });

            console.log('Resposta do login:', {
                status: response.status,
                ok: response.ok
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Email ou senha incorretos!');
                }
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Dados do usuário recebidos:', data);

            // 🎯 AJUSTE: Verifique a estrutura que seu backend retorna
            // Normalmente seria: { id, nome, email, tipo, token }
            this.usuarioLogado = {
                id: data.id || data.usuario?.id || 1,
                nome: data.nome || data.usuario?.nome || 'Usuário',
                email: data.email || data.usuario?.email || email,
                tipo: data.tipo || data.usuario?.tipo || 'ADMIN', // ADMIN, INSTRUTOR, ALUNO
                token: data.token || data.accessToken
            };

            // Salva dados no localStorage
            localStorage.setItem(CONFIG.STORAGE.USER_KEY, JSON.stringify(this.usuarioLogado));
            if (this.usuarioLogado.token) {
                localStorage.setItem(CONFIG.STORAGE.TOKEN_KEY, this.usuarioLogado.token);
            }

            this.mostrarMensagem(`Bem-vindo, ${this.usuarioLogado.nome}!`, 'success');
            this.carregarDashboard();

        } catch (error) {
            console.error('Erro no login:', error);
            this.mostrarMensagem(error.message || 'Erro ao fazer login', 'error');
        } finally {
            this.esconderLoading();
        }
    }

    // 🏠 DASHBOARD PRINCIPAL COM DADOS REAIS
    async carregarDashboard() {
        if (!this.usuarioLogado) {
            this.carregarLogin();
            return;
        }

        try {
            // Carrega dados em paralelo
            const [alunosResponse, instrutoresResponse, treinosResponse, avaliacoesResponse] = await Promise.allSettled([
                this.fetchComToken('/alunos'),
                this.fetchComToken('/instrutores'),
                this.fetchComToken('/treinos'),
                this.fetchComToken('/avaliacoes')
            ]);

            const alunos = alunosResponse.status === 'fulfilled' ? await alunosResponse.value.json() : [];
            const instrutores = instrutoresResponse.status === 'fulfilled' ? await instrutoresResponse.value.json() : [];
            const treinos = treinosResponse.status === 'fulfilled' ? await treinosResponse.value.json() : [];
            const avaliacoes = avaliacoesResponse.status === 'fulfilled' ? await avaliacoesResponse.value.json() : [];

            this.renderizarDashboard(alunos, instrutores, treinos, avaliacoes);

        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
            this.renderizarDashboard([], [], [], []);
        }
    }

    renderizarDashboard(alunos, instrutores, treinos, avaliacoes) {
        const alunosAtivos = alunos.filter(a => a.status === 'ATIVO' || a.ativo === true).length;
        const treinosAtivos = treinos.filter(t => t.status === 'ATIVO' || t.ativo === true).length;
        const avaliacoes30Dias = avaliacoes.filter(a => {
            const dataAval = new Date(a.dataAvaliacao || a.dataCriacao);
            const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            return dataAval > trintaDiasAtras;
        }).length;

        document.getElementById('app').innerHTML = `
            <div class="dashboard-container">
                <header class="main-header">
                    <div class="header-content">
                        <h1>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 200 200" style="vertical-align: middle; margin-right: 12px;">
                                <defs>
                                    <linearGradient id="headerLogo" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stop-color="#0a537d"/>
                                        <stop offset="100%" stop-color="#ff6b35"/>
                                    </linearGradient>
                                </defs>
                                <circle cx="100" cy="100" r="85" fill="url(#headerLogo)" stroke="#ffffff" stroke-width="4"/>
                                <path d="M70,100 L100,70 L130,100 L115,115 L100,100 L85,115 Z" fill="#ffffff"/>
                                <path d="M100,130 L85,145 L115,145 Z" fill="#ffffff"/>
                            </svg>
                            ${CONFIG.APP.NAME}
                        </h1>
                        
                        <div class="user-info">
                            <div class="user-avatar ${this.usuarioLogado.tipo.toLowerCase()}">
                                ${this.usuarioLogado.nome.charAt(0)}
                            </div>
                            <span>${this.usuarioLogado.nome}</span>
                            <span class="user-badge ${this.usuarioLogado.tipo.toLowerCase()}">
                                ${this.usuarioLogado.tipo}
                            </span>
                            <button class="btn btn-danger btn-sm" onclick="academiaApp.sair()">
                                🚪 Sair
                            </button>
                        </div>
                    </div>
                </header>

                <main class="main-content">
                    <!-- Welcome Section -->
                    <section class="welcome-section">
                        <h2>Bem-vindo, ${this.usuarioLogado.nome.split(' ')[0]}! 👋</h2>
                        <p>Gerencie sua academia de forma profissional</p>
                    </section>

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
                                <p>Treinos Ativos</p>
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
                        
                        ${this.usuarioLogado.tipo === 'ADMIN' || this.usuarioLogado.tipo === 'INSTRUTOR' ? `
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
                        ` : ''}
                        
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
                        
                        ${this.usuarioLogado.tipo === 'ALUNO' ? `
                            <div class="action-card" onclick="academiaApp.carregarMeusDados()">
                                <div class="action-icon">👤</div>
                                <h3>Meus Dados</h3>
                                <p>Visualize suas informações</p>
                            </div>
                            
                            <div class="action-card" onclick="academiaApp.carregarMeuTreino()">
                                <div class="action-icon">💪</div>
                                <h3>Meu Treino</h3>
                                <p>Veja seu plano de treino</p>
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
                                        Última: ${new Date(avaliacoes[0]?.dataAvaliacao).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            ` : ''}
                            <div class="activity-item">
                                <span class="activity-icon">👥</span>
                                <span>${alunosAtivos} alunos ativos no sistema</span>
                                <span class="activity-time">Atualizado agora</span>
                            </div>
                            ${this.usuarioLogado.tipo !== 'ALUNO' ? `
                                <div class="activity-item">
                                    <span class="activity-icon">💪</span>
                                    <span>${treinosAtivos} planos de treino ativos</span>
                                    <span class="activity-time">Atualizado agora</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

    // 👥 GESTÃO DE ALUNOS (INTEGRADO COM BACKEND)
    async carregarAlunos() {
        if (!this.verificarPermissao('gerenciar_alunos')) {
            this.mostrarMensagem('Acesso não autorizado!', 'error');
            return this.carregarDashboard();
        }

        try {
            this.mostrarLoading('Carregando alunos...');
            
            const response = await this.fetchComToken('/alunos');
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
            
            const alunos = await response.json();
            const ativos = alunos.filter(a => a.status === 'ATIVO' || a.ativo === true).length;

            document.getElementById('app').innerHTML = `
                <div class="page-container">
                    <div class="page-header">
                        <h1>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" style="vertical-align: middle; margin-right: 12px;">
                                <path fill="#0a537d" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                            Gerenciar Alunos
                        </h1>
                        <div>
                            <button class="btn" onclick="academiaApp.carregarDashboard()">
                                ← Voltar
                            </button>
                            ${this.usuarioLogado.tipo === 'ADMIN' || this.usuarioLogado.tipo === 'INSTRUTOR' ? `
                                <button class="btn btn-success" onclick="academiaApp.criarAluno()">
                                    ＋ Novo Aluno
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Stats bar -->
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
                    
                    <!-- Tabela de alunos -->
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
                                            <div class="user-avatar-small">
                                                ${aluno.nome?.charAt(0) || 'A'}
                                            </div>
                                            <strong>${aluno.nome || 'Sem nome'}</strong>
                                        </td>
                                        <td>${aluno.email || 'Sem email'}</td>
                                        <td>${aluno.telefone || 'Sem telefone'}</td>
                                        <td>
                                            <span class="plan-badge ${(aluno.plano || 'MENSAL').toLowerCase()}">
                                                ${aluno.plano || 'MENSAL'}
                                            </span>
                                        </td>
                                        <td>
                                            <span class="status-badge ${(aluno.status || 'ATIVO').toLowerCase()}">
                                                ${aluno.status || 'ATIVO'}
                                            </span>
                                        </td>
                                        <td>
                                            <div class="action-buttons">
                                                <button class="btn btn-sm" onclick="academiaApp.verAluno('${aluno.id}')">
                                                    👁️ Ver
                                                </button>
                                                ${this.usuarioLogado.tipo === 'ADMIN' || this.usuarioLogado.tipo === 'INSTRUTOR' ? `
                                                    <button class="btn btn-sm" onclick="academiaApp.editarAluno('${aluno.id}')">
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
                </div>
            `;

        } catch (error) {
            console.error('Erro ao carregar alunos:', error);
            this.mostrarMensagem('Erro ao carregar alunos: ' + error.message, 'error');
            document.getElementById('app').innerHTML = `
                <div class="page-header">
                    <h1>👥 Gerenciar Alunos</h1>
                    <button class="btn" onclick="academiaApp.carregarDashboard()">← Voltar</button>
                </div>
                <div class="error-message">
                    <p>❌ Erro ao carregar alunos: ${error.message}</p>
                    <button class="btn" onclick="academiaApp.carregarAlunos()">🔄 Tentar novamente</button>
                </div>
            `;
        } finally {
            this.esconderLoading();
        }
    }

    // 👤 CRIAR ALUNO
    criarAluno() {
        document.getElementById('app').innerHTML = `
            <div class="page-header">
                <h1>👤 Cadastrar Novo Aluno</h1>
                <button class="btn" onclick="academiaApp.carregarAlunos()">
                    ← Voltar
                </button>
            </div>

            <div class="form-container">
                <form id="formAluno" class="aluno-form">
                    <div class="form-section">
                        <h3>👤 Dados Pessoais</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Nome completo *</label>
                                <input type="text" id="nomeAluno" required placeholder="Nome do aluno">
                            </div>
                            <div class="form-group">
                                <label>CPF *</label>
                                <input type="text" id="cpfAluno" required placeholder="000.000.000-00">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Data de Nascimento *</label>
                                <input type="date" id="nascimentoAluno" required>
                            </div>
                            <div class="form-group">
                                <label>Sexo *</label>
                                <select id="sexoAluno" required>
                                    <option value="">Selecione</option>
                                    <option value="MASCULINO">Masculino</option>
                                    <option value="FEMININO">Feminino</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3>📞 Contato</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label>E-mail *</label>
                                <input type="email" id="emailAluno" required placeholder="aluno@email.com">
                            </div>
                            <div class="form-group">
                                <label>Telefone *</label>
                                <input type="tel" id="telefoneAluno" required placeholder="(11) 99999-9999">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Endereço completo</label>
                            <textarea id="enderecoAluno" rows="2" placeholder="Rua, número, bairro, cidade"></textarea>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3>🏋️ Dados da Academia</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Plano *</label>
                                <select id="planoAluno" required>
                                    <option value="">Selecione um plano</option>
                                    <option value="MENSAL">Mensal</option>
                                    <option value="TRIMESTRAL">Trimestral</option>
                                    <option value="SEMESTRAL">Semestral</option>
                                    <option value="ANUAL">Anual</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Observações médicas/restrições</label>
                            <textarea id="observacoesAluno" rows="3" placeholder="Alergias, lesões, condições especiais..."></textarea>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-large btn-success">
                            💾 Salvar Aluno
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="academiaApp.carregarAlunos()">
                            ❌ Cancelar
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('formAluno').addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarAluno();
        });
    }

    async salvarAluno() {
        try {
            const aluno = {
                nome: document.getElementById('nomeAluno').value,
                cpf: document.getElementById('cpfAluno').value,
                dataNascimento: document.getElementById('nascimentoAluno').value,
                sexo: document.getElementById('sexoAluno').value,
                email: document.getElementById('emailAluno').value,
                telefone: document.getElementById('telefoneAluno').value,
                endereco: document.getElementById('enderecoAluno').value,
                plano: document.getElementById('planoAluno').value,
                observacoes: document.getElementById('observacoesAluno').value,
                status: 'ATIVO'
            };

            // Validações
            if (!aluno.nome || !aluno.cpf || !aluno.email) {
                this.mostrarMensagem('Preencha os campos obrigatórios!', 'error');
                return;
            }

            this.mostrarLoading('Salvando aluno...');
            
            // 🎯 CHAMADA REAL PARA BACKEND
            const response = await fetch(`${CONFIG.API.BASE_URL}/alunos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem(CONFIG.STORAGE.TOKEN_KEY)}`
                },
                body: JSON.stringify(aluno)
            });

            if (!response.ok) {
                throw new Error(`Erro ao salvar aluno: ${response.status} ${response.statusText}`);
            }

            const novoAluno = await response.json();
            
            this.mostrarMensagem('Aluno cadastrado com sucesso!', 'success');
            this.carregarAlunos();

        } catch (error) {
            this.mostrarMensagem('Erro ao salvar aluno: ' + error.message, 'error');
        } finally {
            this.esconderLoading();
        }
    }

    // 👁️ VER DETALHES DO ALUNO
    async verAluno(alunoId) {
        try {
            this.mostrarLoading('Carregando dados do aluno...');
            
            const response = await this.fetchComToken(`/alunos/${alunoId}`);
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
            
            const aluno = await response.json();
            
            // Buscar avaliações do aluno
            const avaliacoesResponse = await this.fetchComToken(`/avaliacoes/aluno/${alunoId}`);
            const avaliacoes = avaliacoesResponse.ok ? await avaliacoesResponse.json() : [];
            
            // Buscar treinos do aluno
            const treinosResponse = await this.fetchComToken(`/treinos/aluno/${alunoId}`);
            const treinos = treinosResponse.ok ? await treinosResponse.json() : [];

            document.getElementById('app').innerHTML = `
                <div class="page-header">
                    <h1>👤 Detalhes do Aluno</h1>
                    <button class="btn" onclick="academiaApp.carregarAlunos()">
                        ← Voltar
                    </button>
                </div>

                <div class="aluno-detalhes-container">
                    <div class="aluno-header-card">
                        <div class="aluno-avatar-grande">
                            <span>${aluno.nome?.charAt(0) || 'A'}</span>
                        </div>
                        <div class="aluno-info-basica">
                            <h2>${aluno.nome || 'Aluno sem nome'}</h2>
                            <div class="aluno-metadata">
                                <span class="aluno-status ${(aluno.status || 'ATIVO').toLowerCase()}">
                                    ${aluno.status || 'ATIVO'}
                                </span>
                                <span class="aluno-plano ${(aluno.plano || 'MENSAL').toLowerCase()}">
                                    ${aluno.plano || 'MENSAL'}
                                </span>
                                <span class="aluno-email">📧 ${aluno.email || 'Sem email'}</span>
                                <span class="aluno-telefone">📱 ${aluno.telefone || 'Sem telefone'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="aluno-grid">
                        <!-- Informações Pessoais -->
                        <div class="info-card">
                            <h3>📋 Informações Pessoais</h3>
                            <div class="info-list">
                                <div class="info-item">
                                    <strong>CPF:</strong> ${aluno.cpf || 'Não informado'}
                                </div>
                                ${aluno.dataNascimento ? `
                                    <div class="info-item">
                                        <strong>Data Nascimento:</strong> ${new Date(aluno.dataNascimento).toLocaleDateString('pt-BR')}
                                    </div>
                                    <div class="info-item">
                                        <strong>Idade:</strong> ${this.calcularIdade(aluno.dataNascimento)} anos
                                    </div>
                                ` : ''}
                                <div class="info-item">
                                    <strong>Sexo:</strong> ${aluno.sexo || 'Não informado'}
                                </div>
                                ${aluno.endereco ? `
                                    <div class="info-item">
                                        <strong>Endereço:</strong> ${aluno.endereco}
                                    </div>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Avaliações -->
                        <div class="info-card full-width">
                            <h3>📊 Avaliações Físicas (${avaliacoes.length})</h3>
                            ${avaliacoes.length > 0 ? `
                                <div class="table-container">
                                    <table class="data-table">
                                        <thead>
                                            <tr>
                                                <th>Data</th>
                                                <th>Peso</th>
                                                <th>Altura</th>
                                                <th>IMC</th>
                                                <th>% Gordura</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${avaliacoes.map(av => {
                                                const imc = av.imc || this.calcularIMC(av.peso, av.altura);
                                                const classificacao = this.classificarIMC(imc);
                                                return `
                                                    <tr>
                                                        <td>${new Date(av.dataAvaliacao).toLocaleDateString('pt-BR')}</td>
                                                        <td>${av.peso} kg</td>
                                                        <td>${av.altura} cm</td>
                                                        <td>
                                                            <span class="imc-badge ${classificacao.cor}">
                                                                ${imc.toFixed(1)}
                                                            </span>
                                                        </td>
                                                        <td>${av.percentualGordura || '--'}%</td>
                                                        <td>
                                                            <button class="btn btn-sm btn-primary" 
                                                                    onclick="academiaApp.visualizarAvaliacao('${av.id}')">
                                                                👁️ Ver
                                                            </button>
                                                        </td>
                                                    </tr>
                                                `;
                                            }).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            ` : '<p class="no-data">Nenhuma avaliação registrada.</p>'}
                        </div>

                        <!-- Treinos -->
                        <div class="info-card full-width">
                            <h3>💪 Treinos Atribuídos (${treinos.length})</h3>
                            ${treinos.length > 0 ? `
                                <div class="treinos-grid">
                                    ${treinos.map(treino => `
                                        <div class="treino-card">
                                            <div class="treino-header">
                                                <h3>${treino.nome}</h3>
                                                <span class="badge ${treino.dificuldade?.toLowerCase() || 'iniciante'}">
                                                    ${treino.dificuldade || 'INICIANTE'}
                                                </span>
                                            </div>
                                            <div class="treino-info">
                                                <p><strong>Tipo:</strong> ${treino.tipo || 'Não especificado'}</p>
                                                <p><strong>Duração:</strong> ${treino.duracao || 0} semanas</p>
                                            </div>
                                            <div class="treino-actions">
                                                <button class="btn btn-sm" 
                                                        onclick="academiaApp.visualizarTreino('${treino.id}')">
                                                    👁️ Ver Treino
                                                </button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : '<p class="no-data">Nenhum treino atribuído.</p>'}
                        </div>
                    </div>

                    <div class="aluno-actions">
                        ${this.usuarioLogado.tipo === 'ADMIN' || this.usuarioLogado.tipo === 'INSTRUTOR' ? `
                            <button class="btn btn-primary" onclick="academiaApp.editarAluno('${alunoId}')">
                                ✏️ Editar Aluno
                            </button>
                            <button class="btn btn-success" onclick="academiaApp.criarAvaliacaoParaAluno('${alunoId}')">
                                📊 Nova Avaliação
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('Erro ao carregar aluno:', error);
            this.mostrarMensagem('Erro ao carregar aluno: ' + error.message, 'error');
        } finally {
            this.esconderLoading();
        }
    }

    // ✏️ EDITAR ALUNO
    async editarAluno(alunoId) {
        try {
            this.mostrarLoading('Carregando dados do aluno...');
            
            const response = await this.fetchComToken(`/alunos/${alunoId}`);
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
            
            const aluno = await response.json();

            document.getElementById('app').innerHTML = `
                <div class="page-header">
                    <h1>✏️ Editar Aluno: ${aluno.nome}</h1>
                    <button class="btn" onclick="academiaApp.verAluno('${alunoId}')">
                        ← Voltar
                    </button>
                </div>

                <div class="form-container">
                    <form id="formEditarAluno" class="aluno-form">
                        <div class="form-section">
                            <h3>👤 Dados Pessoais</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Nome completo *</label>
                                    <input type="text" id="nomeAluno" value="${aluno.nome || ''}" required>
                                </div>
                                <div class="form-group">
                                    <label>CPF *</label>
                                    <input type="text" id="cpfAluno" value="${aluno.cpf || ''}" required>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Data de Nascimento *</label>
                                    <input type="date" id="nascimentoAluno" value="${aluno.dataNascimento?.split('T')[0] || ''}" required>
                                </div>
                                <div class="form-group">
                                    <label>Sexo *</label>
                                    <select id="sexoAluno" required>
                                        <option value="MASCULINO" ${aluno.sexo === 'MASCULINO' ? 'selected' : ''}>Masculino</option>
                                        <option value="FEMININO" ${aluno.sexo === 'FEMININO' ? 'selected' : ''}>Feminino</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>📞 Contato</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>E-mail *</label>
                                    <input type="email" id="emailAluno" value="${aluno.email || ''}" required>
                                </div>
                                <div class="form-group">
                                    <label>Telefone *</label>
                                    <input type="tel" id="telefoneAluno" value="${aluno.telefone || ''}" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Endereço completo</label>
                                <textarea id="enderecoAluno" rows="2">${aluno.endereco || ''}</textarea>
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>🏋️ Dados da Academia</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Plano *</label>
                                    <select id="planoAluno" required>
                                        <option value="MENSAL" ${aluno.plano === 'MENSAL' ? 'selected' : ''}>Mensal</option>
                                        <option value="TRIMESTRAL" ${aluno.plano === 'TRIMESTRAL' ? 'selected' : ''}>Trimestral</option>
                                        <option value="SEMESTRAL" ${aluno.plano === 'SEMESTRAL' ? 'selected' : ''}>Semestral</option>
                                        <option value="ANUAL" ${aluno.plano === 'ANUAL' ? 'selected' : ''}>Anual</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Status *</label>
                                    <select id="statusAluno" required>
                                        <option value="ATIVO" ${aluno.status === 'ATIVO' ? 'selected' : ''}>Ativo</option>
                                        <option value="INATIVO" ${aluno.status === 'INATIVO' ? 'selected' : ''}>Inativo</option>
                                        <option value="SUSPENSO" ${aluno.status === 'SUSPENSO' ? 'selected' : ''}>Suspenso</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Observações médicas/restrições</label>
                                <textarea id="observacoesAluno" rows="3">${aluno.observacoes || ''}</textarea>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn btn-large btn-success">
                                💾 Atualizar Aluno
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="academiaApp.verAluno('${alunoId}')">
                                ❌ Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            `;

            document.getElementById('formEditarAluno').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.atualizarAluno(alunoId);
            });

        } catch (error) {
            this.mostrarMensagem('Erro ao carregar formulário: ' + error.message, 'error');
        } finally {
            this.esconderLoading();
        }
    }

    async atualizarAluno(alunoId) {
        try {
            const alunoAtualizado = {
                nome: document.getElementById('nomeAluno').value,
                cpf: document.getElementById('cpfAluno').value,
                dataNascimento: document.getElementById('nascimentoAluno').value,
                sexo: document.getElementById('sexoAluno').value,
                email: document.getElementById('emailAluno').value,
                telefone: document.getElementById('telefoneAluno').value,
                endereco: document.getElementById('enderecoAluno').value,
                plano: document.getElementById('planoAluno').value,
                status: document.getElementById('statusAluno').value,
                observacoes: document.getElementById('observacoesAluno').value
            };

            // Validações
            if (!alunoAtualizado.nome || !alunoAtualizado.cpf || !alunoAtualizado.email) {
                this.mostrarMensagem('Preencha os campos obrigatórios!', 'error');
                return;
            }

            this.mostrarLoading('Atualizando aluno...');
            
            // 🎯 CHAMADA REAL PARA BACKEND
            const response = await fetch(`${CONFIG.API.BASE_URL}/alunos/${alunoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem(CONFIG.STORAGE.TOKEN_KEY)}`
                },
                body: JSON.stringify(alunoAtualizado)
            });

            if (!response.ok) {
                throw new Error(`Erro ao atualizar aluno: ${response.status} ${response.statusText}`);
            }

            this.mostrarMensagem('Aluno atualizado com sucesso!', 'success');
            setTimeout(() => {
                this.verAluno(alunoId);
            }, 1500);

        } catch (error) {
            this.mostrarMensagem('Erro ao atualizar aluno: ' + error.message, 'error');
        } finally {
            this.esconderLoading();
        }
    }

    // 🏃 GESTÃO DE INSTRUTORES
    async carregarInstrutores() {
        if (!this.verificarPermissao('gerenciar_instrutores')) {
            this.mostrarMensagem('Acesso não autorizado!', 'error');
            return this.carregarDashboard();
        }

        try {
            this.mostrarLoading('Carregando instrutores...');
            
            const response = await this.fetchComToken('/instrutores');
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
            
            const instrutores = await response.json();

            document.getElementById('app').innerHTML = `
                <div class="page-container">
                    <div class="page-header">
                        <h1>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" style="vertical-align: middle; margin-right: 12px;">
                                <path fill="#ff6b35" d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM8 10c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4 8H4v-.89c0-1 .68-1.92 1.66-2.08 1.26-.21 2.36-.58 3.34-1.08.98.5 2.08.87 3.34 1.08 1 .16 1.66 1.08 1.66 2.08V18z"/>
                            </svg>
                            Gerenciar Instrutores
                        </h1>
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
                    
                    <!-- Stats bar -->
                    <div class="stats-bar">
                        <div class="stat">
                            <strong>${instrutores.length}</strong>
                            <span>Total de Instrutores</span>
                        </div>
                        <div class="stat">
                            <strong>${instrutores.filter(i => i.status === 'ATIVO').length}</strong>
                            <span>Instrutores Ativos</span>
                        </div>
                    </div>
                    
                    <!-- Tabela de instrutores -->
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>CREF</th>
                                    <th>Especialidade</th>
                                    <th>Turno</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${instrutores.map(instrutor => `
                                    <tr>
                                        <td>
                                            <div class="user-avatar-small">
                                                ${instrutor.nome?.charAt(0) || 'I'}
                                            </div>
                                            <strong>${instrutor.nome || 'Sem nome'}</strong>
                                        </td>
                                        <td>${instrutor.cref || 'Sem CREF'}</td>
                                        <td>${instrutor.especialidade || 'Não especificada'}</td>
                                        <td>
                                            <span class="turno-badge ${(instrutor.turno || 'MANHA').toLowerCase()}">
                                                ${instrutor.turno || 'MANHA'}
                                            </span>
                                        </td>
                                        <td>
                                            <span class="status-badge ${(instrutor.status || 'ATIVO').toLowerCase()}">
                                                ${instrutor.status || 'ATIVO'}
                                            </span>
                                        </td>
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
                </div>
            `;

        } catch (error) {
            console.error('Erro ao carregar instrutores:', error);
            this.mostrarMensagem('Erro ao carregar instrutores: ' + error.message, 'error');
        } finally {
            this.esconderLoading();
        }
    }

    // 📊 AVALIAÇÕES FÍSICAS
    async carregarAvaliacoes() {
        if (!this.verificarPermissao('gerenciar_avaliacoes')) {
            this.mostrarMensagem('Acesso não autorizado!', 'error');
            return this.carregarDashboard();
        }

        try {
            this.mostrarLoading('Carregando avaliações...');
            
            const response = await this.fetchComToken('/avaliacoes');
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
            
            const avaliacoes = await response.json();
            
            // Buscar alunos para mostrar nomes
            const alunosResponse = await this.fetchComToken('/alunos');
            const alunos = alunosResponse.ok ? await alunosResponse.json() : [];

            document.getElementById('app').innerHTML = `
                <div class="page-container">
                    <div class="page-header">
                        <h1>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" style="vertical-align: middle; margin-right: 12px;">
                                <path fill="#17a2b8" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 15.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 9.5 12 9.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z"/>
                            </svg>
                            Avaliações Físicas
                        </h1>
                        <div>
                            <button class="btn" onclick="academiaApp.carregarDashboard()">
                                ← Voltar
                            </button>
                            <button class="btn btn-success" onclick="academiaApp.criarAvaliacao()">
                                📝 Nova Avaliação
                            </button>
                        </div>
                    </div>
                    
                    <!-- Stats bar -->
                    <div class="stats-bar">
                        <div class="stat">
                            <strong>${avaliacoes.length}</strong>
                            <span>Total de Avaliações</span>
                        </div>
                    </div>
                    
                    <!-- Tabela de avaliações -->
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Aluno</th>
                                    <th>Data</th>
                                    <th>Peso</th>
                                    <th>Altura</th>
                                    <th>IMC</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${avaliacoes.map(avaliacao => {
                                    const aluno = alunos.find(a => a.id === avaliacao.alunoId);
                                    const imc = avaliacao.imc || this.calcularIMC(avaliacao.peso, avaliacao.altura);
                                    const classificacao = this.classificarIMC(imc);
                                    
                                    return `
                                        <tr>
                                            <td>
                                                <div class="user-avatar-small">
                                                    ${aluno?.nome?.charAt(0) || 'A'}
                                                </div>
                                                <strong>${aluno?.nome || 'Aluno não encontrado'}</strong>
                                            </td>
                                            <td>${new Date(avaliacao.dataAvaliacao).toLocaleDateString('pt-BR')}</td>
                                            <td>${avaliacao.peso} kg</td>
                                            <td>${avaliacao.altura} cm</td>
                                            <td>
                                                <span class="imc-badge ${classificacao.cor}">
                                                    ${imc.toFixed(1)}
                                                </span>
                                            </td>
                                            <td>
                                                <div class="action-buttons">
                                                    <button class="btn btn-sm btn-primary" onclick="academiaApp.visualizarAvaliacao('${avaliacao.id}')">
                                                        👁️ Visualizar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('Erro ao carregar avaliações:', error);
            this.mostrarMensagem('Erro ao carregar avaliações: ' + error.message, 'error');
        } finally {
            this.esconderLoading();
        }
    }

    // 💪 TREINOS
    async carregarTreinos() {
        if (!this.verificarPermissao('gerenciar_treinos')) {
            this.mostrarMensagem('Acesso não autorizado!', 'error');
            return this.carregarDashboard();
        }

        try {
            this.mostrarLoading('Carregando treinos...');
            
            const response = await this.fetchComToken('/treinos');
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
            
            const treinos = await response.json();

            document.getElementById('app').innerHTML = `
                <div class="page-container">
                    <div class="page-header">
                        <h1>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" style="vertical-align: middle; margin-right: 12px;">
                                <path fill="#28a745" d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>
                            </svg>
                            Planos de Treino
                        </h1>
                        <div>
                            <button class="btn" onclick="academiaApp.carregarDashboard()">
                                ← Voltar
                            </button>
                            <button class="btn btn-success" onclick="academiaApp.criarTreino()">
                                🏋️ Criar Treino
                            </button>
                        </div>
                    </div>
                    
                    <!-- Stats bar -->
                    <div class="stats-bar">
                        <div class="stat">
                            <strong>${treinos.length}</strong>
                            <span>Total de Planos</span>
                        </div>
                    </div>
                    
                    <!-- Grid de treinos -->
                    <div class="treinos-grid">
                        ${treinos.map(treino => `
                            <div class="treino-card">
                                <div class="treino-header">
                                    <h3>${treino.nome}</h3>
                                    <span class="badge ${treino.dificuldade?.toLowerCase() || 'iniciante'}">
                                        ${treino.dificuldade || 'INICIANTE'}
                                    </span>
                                </div>
                                <div class="treino-info">
                                    <p><strong>Tipo:</strong> ${treino.tipo || 'Não especificado'}</p>
                                    <p><strong>Duração:</strong> ${treino.duracao || 0} semanas</p>
                                </div>
                                <div class="treino-actions">
                                    <button class="btn btn-sm" onclick="academiaApp.visualizarTreino('${treino.id}')">
                                        👁️ Visualizar
                                    </button>
                                    ${this.usuarioLogado.tipo === 'ADMIN' || this.usuarioLogado.tipo === 'INSTRUTOR' ? `
                                        <button class="btn btn-sm" onclick="academiaApp.editarTreino('${treino.id}')">
                                            ✏️ Editar
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('Erro ao carregar treinos:', error);
            this.mostrarMensagem('Erro ao carregar treinos: ' + error.message, 'error');
        } finally {
            this.esconderLoading();
        }
    }

    // 👨‍💼 GESTÃO DE USUÁRIOS (APENAS ADMIN)
    async carregarUsuarios() {
        if (this.usuarioLogado.tipo !== 'ADMIN') {
            this.mostrarMensagem('Acesso restrito a administradores!', 'error');
            return this.carregarDashboard();
        }

        try {
            this.mostrarLoading('Carregando usuários...');
            
            const response = await this.fetchComToken('/usuarios');
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
            
            const usuarios = await response.json();

            document.getElementById('app').innerHTML = `
                <div class="page-container">
                    <div class="page-header">
                        <h1>👨‍💼 Gestão de Usuários</h1>
                        <div>
                            <button class="btn" onclick="academiaApp.carregarDashboard()">
                                ← Voltar
                            </button>
                            <button class="btn btn-success" onclick="academiaApp.criarUsuario()">
                                👤 Novo Usuário
                            </button>
                        </div>
                    </div>
                    
                    <!-- Tabela de usuários -->
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>E-mail</th>
                                    <th>Tipo</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${usuarios.map(usuario => `
                                    <tr>
                                        <td>
                                            <div class="user-avatar-small">
                                                ${usuario.nome?.charAt(0) || 'U'}
                                            </div>
                                            <strong>${usuario.nome || 'Sem nome'}</strong>
                                        </td>
                                        <td>${usuario.email || 'Sem email'}</td>
                                        <td>
                                            <span class="user-badge ${(usuario.tipo || 'ALUNO').toLowerCase()}">
                                                ${usuario.tipo || 'ALUNO'}
                                            </span>
                                        </td>
                                        <td>
                                            <span class="status-badge ${(usuario.status || 'ATIVO').toLowerCase()}">
                                                ${usuario.status || 'ATIVO'}
                                            </span>
                                        </td>
                                        <td>
                                            <div class="action-buttons">
                                                <button class="btn btn-sm" onclick="academiaApp.editarUsuario('${usuario.id}')">
                                                    ✏️ Editar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            this.mostrarMensagem('Erro ao carregar usuários: ' + error.message, 'error');
        } finally {
            this.esconderLoading();
        }
    }

    // 📈 RELATÓRIOS
    async carregarRelatorios() {
        if (this.usuarioLogado.tipo !== 'ADMIN') {
            this.mostrarMensagem('Acesso restrito a administradores!', 'error');
            return this.carregarDashboard();
        }

        try {
            this.mostrarLoading('Gerando relatórios...');
            
            // Carrega todos os dados para o relatório
            const [alunosResponse, instrutoresResponse, treinosResponse, avaliacoesResponse] = await Promise.allSettled([
                this.fetchComToken('/alunos'),
                this.fetchComToken('/instrutores'),
                this.fetchComToken('/treinos'),
                this.fetchComToken('/avaliacoes')
            ]);

            const alunos = alunosResponse.status === 'fulfilled' ? await alunosResponse.value.json() : [];
            const instrutores = instrutoresResponse.status === 'fulfilled' ? await instrutoresResponse.value.json() : [];
            const treinos = treinosResponse.status === 'fulfilled' ? await treinosResponse.value.json() : [];
            const avaliacoes = avaliacoesResponse.status === 'fulfilled' ? await avaliacoesResponse.value.json() : [];

            // Cálculos para relatório
            const alunosAtivos = alunos.filter(a => a.status === 'ATIVO' || a.ativo === true).length;
            const alunosPorPlano = {};
            alunos.forEach(aluno => {
                const plano = aluno.plano || 'MENSAL';
                alunosPorPlano[plano] = (alunosPorPlano[plano] || 0) + 1;
            });

            document.getElementById('app').innerHTML = `
                <div class="page-container">
                    <div class="page-header">
                        <h1>📈 Relatórios e Analytics</h1>
                        <button class="btn" onclick="academiaApp.carregarDashboard()">
                            ← Voltar
                        </button>
                    </div>
                    
                    <div class="relatorios-container">
                        <!-- Estatísticas Gerais -->
                        <div class="relatorios-grid">
                            <div class="relatorio-card">
                                <h3>📊 Estatísticas Gerais</h3>
                                <div class="stats-list">
                                    <div class="stat-item">
                                        <strong>Total de Alunos:</strong>
                                        <span>${alunos.length}</span>
                                    </div>
                                    <div class="stat-item">
                                        <strong>Alunos Ativos:</strong>
                                        <span>${alunosAtivos}</span>
                                    </div>
                                    <div class="stat-item">
                                        <strong>Taxa de Retenção:</strong>
                                        <span>${alunos.length > 0 ? ((alunosAtivos / alunos.length) * 100).toFixed(1) : 0}%</span>
                                    </div>
                                    <div class="stat-item">
                                        <strong>Total de Avaliações:</strong>
                                        <span>${avaliacoes.length}</span>
                                    </div>
                                    <div class="stat-item">
                                        <strong>Total de Treinos:</strong>
                                        <span>${treinos.length}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Distribuição por Plano -->
                            <div class="relatorio-card">
                                <h3>📋 Distribuição por Plano</h3>
                                <div class="plano-distribuicao">
                                    ${Object.entries(alunosPorPlano).map(([plano, quantidade]) => `
                                        <div class="plano-item">
                                            <div class="plano-info">
                                                <strong>${plano}:</strong>
                                                <span>${quantidade} alunos</span>
                                            </div>
                                            <div class="plano-bar">
                                                <div class="bar-fill" style="width: ${alunos.length > 0 ? (quantidade / alunos.length) * 100 : 0}%"></div>
                                            </div>
                                            <span class="plano-percent">${alunos.length > 0 ? ((quantidade / alunos.length) * 100).toFixed(1) : 0}%</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <div class="relatorio-actions">
                            <button class="btn btn-primary" onclick="academiaApp.exportarRelatorio(alunos, instrutores, treinos, avaliacoes)">
                                📥 Exportar Relatório
                            </button>
                            <button class="btn btn-success" onclick="academiaApp.gerarRelatorioCompleto(alunos, instrutores, treinos, avaliacoes)">
                                📊 Relatório Completo
                            </button>
                        </div>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('Erro ao carregar relatórios:', error);
            this.mostrarMensagem('Erro ao gerar relatórios: ' + error.message, 'error');
        } finally {
            this.esconderLoading();
        }
    }

    // 👤 MEUS DADOS (PARA ALUNOS)
    async carregarMeusDados() {
        if (this.usuarioLogado.tipo !== 'ALUNO') {
            return this.carregarDashboard();
        }

        try {
            this.mostrarLoading('Carregando seus dados...');
            
            // Busca os dados do aluno logado
            const response = await this.fetchComToken(`/alunos/me`);
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
            
            const aluno = await response.json();
            
            // Busca avaliações do aluno
            const avaliacoesResponse = await this.fetchComToken(`/avaliacoes/aluno/${aluno.id}`);
            const avaliacoes = avaliacoesResponse.ok ? await avaliacoesResponse.json() : [];
            
            // Busca treinos do aluno
            const treinosResponse = await this.fetchComToken(`/treinos/aluno/${aluno.id}`);
            const treinos = treinosResponse.ok ? await treinosResponse.json() : [];

            document.getElementById('app').innerHTML = `
                <div class="page-container">
                    <div class="page-header">
                        <h1>👤 Meus Dados</h1>
                        <button class="btn" onclick="academiaApp.carregarDashboard()">
                            ← Voltar
                        </button>
                    </div>
                    
                    <div class="aluno-detalhes-container">
                        <div class="aluno-header-card">
                            <div class="aluno-avatar-grande">
                                <span>${aluno.nome?.charAt(0) || 'A'}</span>
                            </div>
                            <div class="aluno-info-basica">
                                <h2>${aluno.nome || 'Aluno'}</h2>
                                <div class="aluno-metadata">
                                    <span class="aluno-plano ${(aluno.plano || 'MENSAL').toLowerCase()}">
                                        ${aluno.plano || 'MENSAL'}
                                    </span>
                                    <span class="aluno-email">📧 ${aluno.email || 'Sem email'}</span>
                                    <span class="aluno-telefone">📱 ${aluno.telefone || 'Sem telefone'}</span>
                                </div>
                            </div>
                        </div>

                        <div class="aluno-grid">
                            <!-- Informações Pessoais -->
                            <div class="info-card">
                                <h3>📋 Minhas Informações</h3>
                                <div class="info-list">
                                    <div class="info-item">
                                        <strong>CPF:</strong> ${aluno.cpf || 'Não informado'}
                                    </div>
                                    ${aluno.dataNascimento ? `
                                        <div class="info-item">
                                            <strong>Data Nascimento:</strong> ${new Date(aluno.dataNascimento).toLocaleDateString('pt-BR')}
                                        </div>
                                        <div class="info-item">
                                            <strong>Idade:</strong> ${this.calcularIdade(aluno.dataNascimento)} anos
                                        </div>
                                    ` : ''}
                                    <div class="info-item">
                                        <strong>Sexo:</strong> ${aluno.sexo || 'Não informado'}
                                    </div>
                                </div>
                            </div>

                            <!-- Minhas Avaliações -->
                            <div class="info-card full-width">
                                <h3>📊 Minhas Avaliações (${avaliacoes.length})</h3>
                                ${avaliacoes.length > 0 ? `
                                    <div class="table-container">
                                        <table class="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Data</th>
                                                    <th>Peso</th>
                                                    <th>Altura</th>
                                                    <th>IMC</th>
                                                    <th>% Gordura</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                ${avaliacoes.map(av => {
                                                    const imc = av.imc || this.calcularIMC(av.peso, av.altura);
                                                    const classificacao = this.classificarIMC(imc);
                                                    return `
                                                        <tr>
                                                            <td>${new Date(av.dataAvaliacao).toLocaleDateString('pt-BR')}</td>
                                                            <td>${av.peso} kg</td>
                                                            <td>${av.altura} cm</td>
                                                            <td>
                                                                <span class="imc-badge ${classificacao.cor}">
                                                                    ${imc.toFixed(1)}
                                                                </span>
                                                            </td>
                                                            <td>${av.percentualGordura || '--'}%</td>
                                                        </tr>
                                                    `;
                                                }).join('')}
                                            </tbody>
                                        </table>
                                    </div>
                                ` : '<p class="no-data">Nenhuma avaliação registrada.</p>'}
                            </div>

                            <!-- Meus Treinos -->
                            <div class="info-card full-width">
                                <h3>💪 Meus Treinos (${treinos.length})</h3>
                                ${treinos.length > 0 ? `
                                    <div class="treinos-grid">
                                        ${treinos.map(treino => `
                                            <div class="treino-card">
                                                <div class="treino-header">
                                                    <h3>${treino.nome}</h3>
                                                    <span class="badge ${treino.dificuldade?.toLowerCase() || 'iniciante'}">
                                                        ${treino.dificuldade || 'INICIANTE'}
                                                    </span>
                                                </div>
                                                <div class="treino-info">
                                                    <p><strong>Tipo:</strong> ${treino.tipo || 'Não especificado'}</p>
                                                    <p><strong>Duração:</strong> ${treino.duracao || 0} semanas</p>
                                                </div>
                                                <div class="treino-actions">
                                                    <button class="btn btn-sm" 
                                                            onclick="academiaApp.visualizarTreino('${treino.id}')">
                                                        👁️ Ver Treino
                                                    </button>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : '<p class="no-data">Nenhum treino atribuído.</p>'}
                            </div>
                        </div>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('Erro ao carregar dados do aluno:', error);
            this.mostrarMensagem('Erro ao carregar seus dados: ' + error.message, 'error');
        } finally {
            this.esconderLoading();
        }
    }

    // 💪 MEU TREINO (PARA ALUNOS)
    async carregarMeuTreino() {
        if (this.usuarioLogado.tipo !== 'ALUNO') {
            return this.carregarDashboard();
        }

        try {
            this.mostrarLoading('Carregando seu treino...');
            
            // Busca treinos do aluno logado
            const response = await this.fetchComToken(`/treinos/me`);
            
            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }
            
            const treinos = await response.json();

            document.getElementById('app').innerHTML = `
                <div class="page-container">
                    <div class="page-header">
                        <h1>💪 Meu Plano de Treino</h1>
                        <button class="btn" onclick="academiaApp.carregarDashboard()">
                            ← Voltar
                        </button>
                    </div>
                    
                    ${treinos.length > 0 ? `
                        <div class="treinos-grid">
                            ${treinos.map(treino => `
                                <div class="treino-card">
                                    <div class="treino-header">
                                        <h3>${treino.nome}</h3>
                                        <span class="badge ${treino.dificuldade?.toLowerCase() || 'iniciante'}">
                                            ${treino.dificuldade || 'INICIANTE'}
                                        </span>
                                    </div>
                                    <div class="treino-info">
                                        <p><strong>Tipo:</strong> ${treino.tipo || 'Não especificado'}</p>
                                        <p><strong>Duração:</strong> ${treino.duracao || 0} semanas</p>
                                        <p><strong>Descrição:</strong> ${treino.descricao || 'Sem descrição'}</p>
                                    </div>
                                    <div class="treino-actions">
                                        <button class="btn btn-sm" 
                                                onclick="academiaApp.visualizarTreino('${treino.id}')">
                                            👁️ Ver Treino Completo
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="no-data-message">
                            <h3>📝 Nenhum treino atribuído</h3>
                            <p>Entre em contato com seu instrutor para receber um plano de treino personalizado.</p>
                        </div>
                    `}
                </div>
            `;

        } catch (error) {
            console.error('Erro ao carregar treino:', error);
            this.mostrarMensagem('Erro ao carregar seu treino: ' + error.message, 'error');
        } finally {
            this.esconderLoading();
        }
    }

    // 🛠️ MÉTODOS AUXILIARES

    // Método para fazer requisições com token
    async fetchComToken(endpoint, options = {}) {
        const token = localStorage.getItem(CONFIG.STORAGE.TOKEN_KEY);
        const url = `${CONFIG.API.BASE_URL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors'
        };

        if (token) {
            defaultOptions.headers['Authorization'] = `Bearer ${token}`;
        }

        return fetch(url, { ...defaultOptions, ...options });
    }

    // Verificar permissões
    verificarPermissao(permissaoRequerida) {
        if (!this.usuarioLogado) return false;
        
        const permissoes = {
            'ADMIN': ['gerenciar_usuarios', 'gerenciar_instrutores', 'gerenciar_alunos', 'gerenciar_treinos', 'gerenciar_avaliacoes'],
            'INSTRUTOR': ['gerenciar_alunos', 'gerenciar_treinos', 'gerenciar_avaliacoes'],
            'ALUNO': ['ver_proprios_dados', 'ver_treinos']
        };
        
        return permissoes[this.usuarioLogado.tipo]?.includes(permissaoRequerida) || false;
    }

    // Calcular IMC
    calcularIMC(peso, altura) {
        if (!peso || !altura || altura === 0) return 0;
        return peso / ((altura / 100) ** 2);
    }

    // Classificar IMC
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
        return { 
            classificacao: 'OBESIDADE_II', 
            cor: 'danger', 
            texto: 'Obesidade Grau II' 
        };
    }

    // Calcular idade
    calcularIdade(dataNascimento) {
        if (!dataNascimento) return 0;
        const hoje = new Date();
        const nascimento = new Date(dataNascimento);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mes = hoje.getMonth() - nascimento.getMonth();
        
        if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }
        return idade;
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
        // Remove loading anterior se existir
        this.esconderLoading();
        
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
        localStorage.removeItem(CONFIG.STORAGE.TOKEN_KEY);
        this.usuarioLogado = null;
        this.carregarLogin();
        this.mostrarMensagem('Logout realizado com sucesso!', 'success');
    }

    // 🔧 MÉTODOS A IMPLEMENTAR (para funcionalidades futuras)

    criarInstrutor() {
        this.mostrarMensagem('Funcionalidade em desenvolvimento', 'info');
    }

    criarTreino() {
        this.mostrarMensagem('Funcionalidade em desenvolvimento', 'info');
    }

    criarUsuario() {
        this.mostrarMensagem('Funcionalidade em desenvolvimento', 'info');
    }

    criarAvaliacao() {
        this.mostrarMensagem('Funcionalidade em desenvolvimento', 'info');
    }

    criarAvaliacaoParaAluno(alunoId) {
        this.mostrarMensagem('Funcionalidade em desenvolvimento', 'info');
    }

    visualizarAvaliacao(avaliacaoId) {
        this.mostrarMensagem('Funcionalidade em desenvolvimento', 'info');
    }

    visualizarTreino(treinoId) {
        this.mostrarMensagem('Funcionalidade em desenvolvimento', 'info');
    }

    verInstrutor(instrutorId) {
        this.mostrarMensagem('Funcionalidade em desenvolvimento', 'info');
    }

    editarInstrutor(instrutorId) {
        this.mostrarMensagem('Funcionalidade em desenvolvimento', 'info');
    }

    editarTreino(treinoId) {
        this.mostrarMensagem('Funcionalidade em desenvolvimento', 'info');
    }

    editarUsuario(usuarioId) {
        this.mostrarMensagem('Funcionalidade em desenvolvimento', 'info');
    }

    exportarRelatorio(alunos, instrutores, treinos, avaliacoes) {
        this.mostrarMensagem('Funcionalidade em desenvolvimento', 'info');
    }

    gerarRelatorioCompleto(alunos, instrutores, treinos, avaliacoes) {
        this.mostrarMensagem('Funcionalidade em desenvolvimento', 'info');
    }
}

// 🚀 INICIALIZAÇÃO DA APLICAÇÃO
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏋️ Academia Fit - Sistema carregado!');
    window.academiaApp = new AcademiaApp();
    
});