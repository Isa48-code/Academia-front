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
    
    // 👤 CADASTRO DE ALUNOS
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
                                    <option value="OUTRO">Outro</option>
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
                            <div class="form-group">
                                <label>Instrutor Responsável</label>
                                <select id="instrutorAluno">
                                    <option value="">Selecionar instrutor...</option>
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

        this.carregarInstrutoresParaSelect();
        
        document.getElementById('formAluno').addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarAluno();
        });
    }

    async carregarInstrutoresParaSelect() {
        try {
            const instrutores = await this.apiService.getInstrutores();
            const select = document.getElementById('instrutorAluno');
            
            select.innerHTML = '<option value="">Selecionar instrutor...</option>' +
                instrutores.map(instrutor => 
                    `<option value="${instrutor.id}">${instrutor.nome}</option>`
                ).join('');
        } catch (error) {
            console.error('Erro ao carregar instrutores:', error);
        }
    }

    async salvarAluno() {
        const aluno = {
            nome: document.getElementById('nomeAluno').value,
            cpf: document.getElementById('cpfAluno').value,
            dataNascimento: document.getElementById('nascimentoAluno').value,
            sexo: document.getElementById('sexoAluno').value,
            email: document.getElementById('emailAluno').value,
            telefone: document.getElementById('telefoneAluno').value,
            endereco: document.getElementById('enderecoAluno').value,
            plano: document.getElementById('planoAluno').value,
            instrutorId: document.getElementById('instrutorAluno').value || null,
            observacoes: document.getElementById('observacoesAluno').value,
            status: 'ATIVO'
        };

        // Validações básicas
        if (!aluno.nome || !aluno.cpf || !aluno.email) {
            this.mostrarMensagem('Preencha os campos obrigatórios!', 'error');
            return;
        }

        try {
            this.mostrarLoading('Salvando aluno...');
            // Simular salvamento
            const novoAluno = new DataModels.Aluno(aluno);
            window.mockData.alunos.push(novoAluno);
            
            this.mostrarMensagem('Aluno cadastrado com sucesso!', 'success');
            this.carregarAlunos();
        } catch (error) {
            this.mostrarMensagem('Erro ao salvar aluno: ' + error.message, 'error');
        } finally {
            this.esconderLoading();
        }
    }

    // 👁️ VER DETALHES DO ALUNO (AGORA COMPLETO)
    async verAluno(alunoId) {
        try {
            const aluno = window.mockData.alunos.find(a => a.id === alunoId);
            if (!aluno) {
                this.mostrarMensagem('Aluno não encontrado!', 'error');
                return;
            }

            const avaliacoes = window.mockData.avaliacoes.filter(a => a.alunoId === alunoId);
            const treinos = window.mockData.treinos.filter(t => t.alunos?.includes(alunoId) || false);
            const instrutor = window.mockData.instrutores.find(i => i.id === aluno.instrutorId);

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
                            <span>${aluno.nome.charAt(0)}</span>
                        </div>
                        <div class="aluno-info-basica">
                            <h2>${aluno.nome}</h2>
                            <div class="aluno-metadata">
                                <span class="aluno-status ${aluno.status.toLowerCase()}">${aluno.status}</span>
                                <span class="aluno-plano ${aluno.plano.toLowerCase()}">${aluno.plano}</span>
                                <span class="aluno-email">📧 ${aluno.email}</span>
                                <span class="aluno-telefone">📱 ${aluno.telefone}</span>
                            </div>
                        </div>
                    </div>

                    <div class="aluno-grid">
                        <!-- Informações Pessoais -->
                        <div class="info-card">
                            <h3>📋 Informações Pessoais</h3>
                            <div class="info-list">
                                <div class="info-item">
                                    <strong>CPF:</strong> ${aluno.cpf}
                                </div>
                                <div class="info-item">
                                    <strong>Data Nascimento:</strong> ${new Date(aluno.dataNascimento).toLocaleDateString('pt-BR')}
                                </div>
                                <div class="info-item">
                                    <strong>Idade:</strong> ${this.calcularIdade(aluno.dataNascimento)} anos
                                </div>
                                <div class="info-item">
                                    <strong>Sexo:</strong> ${aluno.sexo}
                                </div>
                                ${aluno.endereco ? `
                                    <div class="info-item">
                                        <strong>Endereço:</strong> ${aluno.endereco}
                                    </div>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Dados da Academia -->
                        <div class="info-card">
                            <h3>🏋️ Dados da Academia</h3>
                            <div class="info-list">
                                <div class="info-item">
                                    <strong>Data Matrícula:</strong> ${new Date(aluno.dataMatricula).toLocaleDateString('pt-BR')}
                                </div>
                                <div class="info-item">
                                    <strong>Instrutor:</strong> ${instrutor ? instrutor.nome : 'Não atribuído'}
                                </div>
                                ${aluno.observacoes ? `
                                    <div class="info-item">
                                        <strong>Observações:</strong> ${aluno.observacoes}
                                    </div>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Avaliações Recentes -->
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
                                                const imc = av.composicaoCorporal?.imc || this.calcularIMC(av.peso, av.altura);
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
                                                        <td>${av.composicaoCorporal?.percentualGordura || '--'}%</td>
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

                        <!-- Treinos Atribuídos -->
                        <div class="info-card full-width">
                            <h3>💪 Treinos Atribuídos (${treinos.length})</h3>
                            ${treinos.length > 0 ? `
                                <div class="treinos-grid">
                                    ${treinos.map(treino => `
                                        <div class="treino-card">
                                            <div class="treino-header">
                                                <h3>${treino.nome}</h3>
                                                <span class="badge ${treino.dificuldade}">
                                                    ${treino.dificuldade}
                                                </span>
                                            </div>
                                            <div class="treino-info">
                                                <p><strong>Tipo:</strong> ${treino.tipo}</p>
                                                <p><strong>Duração:</strong> ${treino.duracao} semanas</p>
                                                <p><strong>Exercícios:</strong> ${treino.exercicios?.length || 0}</p>
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
                        <button class="btn btn-primary" onclick="academiaApp.editarAluno('${alunoId}')">
                            ✏️ Editar Aluno
                        </button>
                        <button class="btn btn-success" onclick="academiaApp.criarAvaliacaoParaAluno('${alunoId}')">
                            📊 Nova Avaliação
                        </button>
                        <button class="btn btn-danger" onclick="academiaApp.excluirAluno('${alunoId}')">
                            🗑️ Excluir Aluno
                        </button>
                    </div>
                </div>
            `;
        } catch (error) {
            this.mostrarMensagem('Erro ao carregar detalhes do aluno: ' + error.message, 'error');
        }
    }

    // 🏠 DASHBOARD PRINCIPAL
    async carregarDashboard() {
        if (!this.usuarioLogado) {
            this.carregarLogin();
            return;
        }

        try {
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
        const treinosAtivos = treinos.filter(t => t.status === 'ATIVO' || t.status === 'ativo').length;
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
            const ativos = treinos.filter(t => t.status === 'ATIVO' || t.status === 'ativo').length;

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
                                    ${treino.exercicios?.slice(0, 3).map(ex => 
                                        `<span class="exercise-tag">${ex.nome}</span>`
                                    ).join('') || 'Nenhum exercício'}
                                    ${treino.exercicios?.length > 3 ? 
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
    async criarAvaliacao(alunoId = null) {
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
                                <select id="alunoId" required ${alunoId ? 'disabled' : ''}>
                                    <option value="">Selecione um aluno...</option>
                                    ${alunosAtivos.map(aluno => `
                                        <option value="${aluno.id}" ${alunoId === aluno.id ? 'selected' : ''}>
                                            ${aluno.nome} - ${aluno.email}
                                        </option>
                                    `).join('')}
                                </select>
                                ${alunoId ? '<input type="hidden" id="hiddenAlunoId" value="' + alunoId + '">' : ''}
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
            const alunoId = document.getElementById('hiddenAlunoId')?.value || document.getElementById('alunoId').value;
            
            const avaliacao = new DataModels.AvaliacaoFisica({
                alunoId: alunoId,
                instrutorId: this.usuarioLogado.id,
                peso: parseFloat(document.getElementById('peso').value) || 0,
                altura: parseFloat(document.getElementById('altura').value) || 0,
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

    calcularIdade(dataNascimento) {
        const hoje = new Date();
        const nascimento = new Date(dataNascimento);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mes = hoje.getMonth() - nascimento.getMonth();
        
        if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }
        return idade;
    }

    calcularIMC(peso, altura) {
        if (!peso || !altura || altura === 0) return 0;
        return peso / ((altura / 100) ** 2);
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
        this.usuarioLogado = null;
        this.carregarLogin();
        this.mostrarMensagem('Logout realizado com sucesso!', 'success');
    }

    // 🔧 MÉTODOS IMPLEMENTADOS

    // 📝 EDITAR ALUNO (Implementação Completa)
    async editarAluno(alunoId) {
        try {
            const aluno = window.mockData.alunos.find(a => a.id === alunoId);
            if (!aluno) {
                this.mostrarMensagem('Aluno não encontrado!', 'error');
                return;
            }

            const instrutores = await this.apiService.getInstrutores();

            document.getElementById('app').innerHTML = `
                <div class="page-header">
                    <h1>✏️ Editar Aluno</h1>
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
                                    <input type="text" id="nomeAluno" value="${aluno.nome}" required>
                                </div>
                                <div class="form-group">
                                    <label>CPF *</label>
                                    <input type="text" id="cpfAluno" value="${aluno.cpf}" required>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Data de Nascimento *</label>
                                    <input type="date" id="nascimentoAluno" value="${aluno.dataNascimento.split('T')[0]}" required>
                                </div>
                                <div class="form-group">
                                    <label>Sexo *</label>
                                    <select id="sexoAluno" required>
                                        <option value="MASCULINO" ${aluno.sexo === 'MASCULINO' ? 'selected' : ''}>Masculino</option>
                                        <option value="FEMININO" ${aluno.sexo === 'FEMININO' ? 'selected' : ''}>Feminino</option>
                                        <option value="OUTRO" ${aluno.sexo === 'OUTRO' ? 'selected' : ''}>Outro</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>📞 Contato</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>E-mail *</label>
                                    <input type="email" id="emailAluno" value="${aluno.email}" required>
                                </div>
                                <div class="form-group">
                                    <label>Telefone *</label>
                                    <input type="tel" id="telefoneAluno" value="${aluno.telefone}" required>
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
                                <div class="form-group">
                                    <label>Instrutor Responsável</label>
                                    <select id="instrutorAluno">
                                        <option value="">Selecionar instrutor...</option>
                                        ${instrutores.map(instrutor => `
                                            <option value="${instrutor.id}" ${aluno.instrutorId === instrutor.id ? 'selected' : ''}>
                                                ${instrutor.nome}
                                            </option>
                                        `).join('')}
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
        }
    }

    async atualizarAluno(alunoId) {
        try {
            const alunoIndex = window.mockData.alunos.findIndex(a => a.id === alunoId);
            if (alunoIndex === -1) {
                this.mostrarMensagem('Aluno não encontrado!', 'error');
                return;
            }

            const alunoAtualizado = {
                ...window.mockData.alunos[alunoIndex],
                nome: document.getElementById('nomeAluno').value,
                cpf: document.getElementById('cpfAluno').value,
                dataNascimento: document.getElementById('nascimentoAluno').value,
                sexo: document.getElementById('sexoAluno').value,
                email: document.getElementById('emailAluno').value,
                telefone: document.getElementById('telefoneAluno').value,
                endereco: document.getElementById('enderecoAluno').value,
                plano: document.getElementById('planoAluno').value,
                instrutorId: document.getElementById('instrutorAluno').value || null,
                status: document.getElementById('statusAluno').value,
                observacoes: document.getElementById('observacoesAluno').value,
                dataAtualizacao: new Date().toISOString()
            };

            // Validações
            if (!alunoAtualizado.nome || !alunoAtualizado.cpf || !alunoAtualizado.email) {
                this.mostrarMensagem('Preencha os campos obrigatórios!', 'error');
                return;
            }

            this.mostrarLoading('Atualizando aluno...');
            
            // Atualiza no mock data
            window.mockData.alunos[alunoIndex] = alunoAtualizado;
            
            // Salva no localStorage
            const alunosStorage = JSON.parse(localStorage.getItem('academia_alunos') || '[]');
            const alunoIndexStorage = alunosStorage.findIndex(a => a.id === alunoId);
            if (alunoIndexStorage !== -1) {
                alunosStorage[alunoIndexStorage] = alunoAtualizado;
                localStorage.setItem('academia_alunos', JSON.stringify(alunosStorage));
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

    // 🗑️ EXCLUIR ALUNO
    excluirAluno(alunoId) { 
        if (confirm('Tem certeza que deseja excluir este aluno?')) {
            window.mockData.alunos = window.mockData.alunos.filter(a => a.id !== alunoId);
            this.mostrarMensagem(`Aluno excluído com sucesso!`, 'success');
            this.carregarAlunos();
        }
    }

    // 🏋️ CRIAR TREINO (Implementação Completa)
    criarTreino() { 
        document.getElementById('app').innerHTML = `
            <div class="page-header">
                <h1>🏋️ Criar Novo Plano de Treino</h1>
                <button class="btn" onclick="academiaApp.carregarTreinos()">
                    ← Voltar
                </button>
            </div>

            <div class="form-container">
                <form id="formTreino" class="treino-form">
                    <div class="form-section">
                        <h3>📋 Informações Básicas</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Nome do Treino *</label>
                                <input type="text" id="nomeTreino" placeholder="Ex: Treino Iniciante A" required>
                            </div>
                            <div class="form-group">
                                <label>Tipo *</label>
                                <select id="tipoTreino" required>
                                    <option value="">Selecione...</option>
                                    <option value="FORCA">Força</option>
                                    <option value="HIT">HIIT</option>
                                    <option value="EMAGRECIMENTO">Emagrecimento</option>
                                    <option value="MUSCULACAO">Musculação</option>
                                    <option value="FUNCIONAL">Funcional</option>
                                    <option value="CARDIO">Cardio</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Dificuldade *</label>
                                <select id="dificuldadeTreino" required>
                                    <option value="">Selecione...</option>
                                    <option value="INICIANTE">Iniciante</option>
                                    <option value="INTERMEDIARIO">Intermediário</option>
                                    <option value="AVANCADO">Avançado</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Duração (semanas) *</label>
                                <input type="number" id="duracaoTreino" min="1" max="52" value="4" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Descrição</label>
                            <textarea id="descricaoTreino" rows="3" placeholder="Descreva o objetivo deste treino..."></textarea>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3>💪 Exercícios</h3>
                        <div id="exerciciosContainer">
                            <div class="exercicio-item">
                                <div class="exercicio-header">
                                    <h4>Exercício #1</h4>
                                    <button type="button" class="btn btn-sm btn-danger" onclick="this.closest('.exercicio-item').remove()">
                                        ❌ Remover
                                    </button>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Nome do Exercício *</label>
                                        <input type="text" class="exercicio-nome" placeholder="Ex: Supino Reto" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Grupo Muscular *</label>
                                        <select class="exercicio-grupo" required>
                                            <option value="">Selecione...</option>
                                            <option value="PEITO">Peito</option>
                                            <option value="COSTAS">Costas</option>
                                            <option value="OMBRO">Ombro</option>
                                            <option value="BRACO">Braço</option>
                                            <option value="PERNA">Perna</option>
                                            <option value="ABDOMEN">Abdômen</option>
                                            <option value="CARDIO">Cardio</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Séries *</label>
                                        <input type="number" class="exercicio-series" min="1" max="10" value="3" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Repetições *</label>
                                        <input type="text" class="exercicio-repeticoes" placeholder="Ex: 8-12" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Descanso (segundos)</label>
                                        <input type="number" class="exercicio-descanso" min="0" value="60">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Observações</label>
                                    <textarea class="exercicio-observacoes" rows="2" placeholder="Dicas de execução, variações..."></textarea>
                                </div>
                            </div>
                        </div>
                        
                        <button type="button" class="btn btn-outline" onclick="academiaApp.adicionarExercicio()">
                            ➕ Adicionar Exercício
                        </button>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-large btn-success">
                            💾 Salvar Treino
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="academiaApp.carregarTreinos()">
                            ❌ Cancelar
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('formTreino').addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarTreino();
        });
    }

    adicionarExercicio() {
        const container = document.getElementById('exerciciosContainer');
        const exercicioCount = container.children.length + 1;
        
        const exercicioHTML = `
            <div class="exercicio-item">
                <div class="exercicio-header">
                    <h4>Exercício #${exercicioCount}</h4>
                    <button type="button" class="btn btn-sm btn-danger" onclick="this.closest('.exercicio-item').remove()">
                        ❌ Remover
                    </button>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Nome do Exercício *</label>
                        <input type="text" class="exercicio-nome" placeholder="Ex: Supino Reto" required>
                    </div>
                    <div class="form-group">
                        <label>Grupo Muscular *</label>
                        <select class="exercicio-grupo" required>
                            <option value="">Selecione...</option>
                            <option value="PEITO">Peito</option>
                            <option value="COSTAS">Costas</option>
                            <option value="OMBRO">Ombro</option>
                            <option value="BRACO">Braço</option>
                            <option value="PERNA">Perna</option>
                            <option value="ABDOMEN">Abdômen</option>
                            <option value="CARDIO">Cardio</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Séries *</label>
                        <input type="number" class="exercicio-series" min="1" max="10" value="3" required>
                    </div>
                    <div class="form-group">
                        <label>Repetições *</label>
                        <input type="text" class="exercicio-repeticoes" placeholder="Ex: 8-12" required>
                    </div>
                    <div class="form-group">
                        <label>Descanso (segundos)</label>
                        <input type="number" class="exercicio-descanso" min="0" value="60">
                    </div>
                </div>
                <div class="form-group">
                    <label>Observações</label>
                    <textarea class="exercicio-observacoes" rows="2" placeholder="Dicas de execução, variações..."></textarea>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', exercicioHTML);
    }

    async salvarTreino() {
        try {
            // Coletar dados básicos
            const treino = {
                nome: document.getElementById('nomeTreino').value,
                tipo: document.getElementById('tipoTreino').value,
                dificuldade: document.getElementById('dificuldadeTreino').value,
                duracao: parseInt(document.getElementById('duracaoTreino').value),
                descricao: document.getElementById('descricaoTreino').value,
                status: 'ATIVO',
                dataCriacao: new Date().toISOString(),
                criadorId: this.usuarioLogado.id
            };

            // Coletar exercícios
            const exercicios = [];
            const exercicioElements = document.querySelectorAll('.exercicio-item');
            
            exercicioElements.forEach((element, index) => {
                const exercicio = {
                    id: `ex_${Date.now()}_${index}`,
                    nome: element.querySelector('.exercicio-nome').value,
                    grupoMuscular: element.querySelector('.exercicio-grupo').value,
                    series: parseInt(element.querySelector('.exercicio-series').value),
                    repeticoes: element.querySelector('.exercicio-repeticoes').value,
                    descanso: element.querySelector('.exercicio-descanso').value || 60,
                    observacoes: element.querySelector('.exercicio-observacoes').value,
                    ordem: index + 1
                };
                exercicios.push(exercicio);
            });

            if (exercicios.length === 0) {
                this.mostrarMensagem('Adicione pelo menos um exercício!', 'error');
                return;
            }

            treino.exercicios = exercicios;
            treino.totalExercicios = exercicios.length;

            // Gerar ID único
            treino.id = `treino_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            this.mostrarLoading('Salvando treino...');

            // Salvar no mock data
            if (!window.mockData.treinos) window.mockData.treinos = [];
            window.mockData.treinos.push(treino);

            // Salvar no localStorage
            const treinosStorage = JSON.parse(localStorage.getItem('academia_treinos') || '[]');
            treinosStorage.push(treino);
            localStorage.setItem('academia_treinos', JSON.stringify(treinosStorage));

            this.mostrarMensagem('Treino criado com sucesso!', 'success');
            setTimeout(() => {
                this.carregarTreinos();
            }, 1500);

        } catch (error) {
            this.mostrarMensagem('Erro ao salvar treino: ' + error.message, 'error');
        } finally {
            this.esconderLoading();
        }
    }

    // ✏️ EDITAR TREINO (Implementação Completa)
    async editarTreino(treinoId) {
        try {
            const treino = window.mockData.treinos.find(t => t.id === treinoId);
            if (!treino) {
                this.mostrarMensagem('Treino não encontrado!', 'error');
                return;
            }

            document.getElementById('app').innerHTML = `
                <div class="page-header">
                    <h1>✏️ Editar Treino: ${treino.nome}</h1>
                    <button class="btn" onclick="academiaApp.visualizarTreino('${treinoId}')">
                        ← Voltar
                    </button>
                </div>

                <div class="form-container">
                    <form id="formEditarTreino" class="treino-form">
                        <div class="form-section">
                            <h3>📋 Informações Básicas</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Nome do Treino *</label>
                                    <input type="text" id="nomeTreino" value="${treino.nome}" required>
                                </div>
                                <div class="form-group">
                                    <label>Tipo *</label>
                                    <select id="tipoTreino" required>
                                        <option value="FORCA" ${treino.tipo === 'FORCA' ? 'selected' : ''}>Força</option>
                                        <option value="HIT" ${treino.tipo === 'HIT' ? 'selected' : ''}>HIIT</option>
                                        <option value="EMAGRECIMENTO" ${treino.tipo === 'EMAGRECIMENTO' ? 'selected' : ''}>Emagrecimento</option>
                                        <option value="MUSCULACAO" ${treino.tipo === 'MUSCULACAO' ? 'selected' : ''}>Musculação</option>
                                        <option value="FUNCIONAL" ${treino.tipo === 'FUNCIONAL' ? 'selected' : ''}>Funcional</option>
                                        <option value="CARDIO" ${treino.tipo === 'CARDIO' ? 'selected' : ''}>Cardio</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Dificuldade *</label>
                                    <select id="dificuldadeTreino" required>
                                        <option value="INICIANTE" ${treino.dificuldade === 'INICIANTE' ? 'selected' : ''}>Iniciante</option>
                                        <option value="INTERMEDIARIO" ${treino.dificuldade === 'INTERMEDIARIO' ? 'selected' : ''}>Intermediário</option>
                                        <option value="AVANCADO" ${treino.dificuldade === 'AVANCADO' ? 'selected' : ''}>Avançado</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Duração (semanas) *</label>
                                    <input type="number" id="duracaoTreino" min="1" max="52" value="${treino.duracao}" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Status *</label>
                                <select id="statusTreino" required>
                                    <option value="ATIVO" ${treino.status === 'ATIVO' ? 'selected' : ''}>Ativo</option>
                                    <option value="INATIVO" ${treino.status === 'INATIVO' ? 'selected' : ''}>Inativo</option>
                                    <option value="ARQUIVADO" ${treino.status === 'ARQUIVADO' ? 'selected' : ''}>Arquivado</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Descrição</label>
                                <textarea id="descricaoTreino" rows="3">${treino.descricao || ''}</textarea>
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>💪 Exercícios (${treino.exercicios?.length || 0})</h3>
                            <div id="exerciciosContainer">
                                ${(treino.exercicios || []).map((exercicio, index) => `
                                    <div class="exercicio-item" data-id="${exercicio.id || index}">
                                        <div class="exercicio-header">
                                            <h4>Exercício #${index + 1}</h4>
                                            <button type="button" class="btn btn-sm btn-danger" onclick="this.closest('.exercicio-item').remove()">
                                                ❌ Remover
                                            </button>
                                        </div>
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label>Nome do Exercício *</label>
                                                <input type="text" class="exercicio-nome" value="${exercicio.nome}" required>
                                            </div>
                                            <div class="form-group">
                                                <label>Grupo Muscular *</label>
                                                <select class="exercicio-grupo" required>
                                                    <option value="PEITO" ${exercicio.grupoMuscular === 'PEITO' ? 'selected' : ''}>Peito</option>
                                                    <option value="COSTAS" ${exercicio.grupoMuscular === 'COSTAS' ? 'selected' : ''}>Costas</option>
                                                    <option value="OMBRO" ${exercicio.grupoMuscular === 'OMBRO' ? 'selected' : ''}>Ombro</option>
                                                    <option value="BRACO" ${exercicio.grupoMuscular === 'BRACO' ? 'selected' : ''}>Braço</option>
                                                    <option value="PERNA" ${exercicio.grupoMuscular === 'PERNA' ? 'selected' : ''}>Perna</option>
                                                    <option value="ABDOMEN" ${exercicio.grupoMuscular === 'ABDOMEN' ? 'selected' : ''}>Abdômen</option>
                                                    <option value="CARDIO" ${exercicio.grupoMuscular === 'CARDIO' ? 'selected' : ''}>Cardio</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="form-row">
                                            <div class="form-group">
                                                <label>Séries *</label>
                                                <input type="number" class="exercicio-series" min="1" max="10" value="${exercicio.series || 3}" required>
                                            </div>
                                            <div class="form-group">
                                                <label>Repetições *</label>
                                                <input type="text" class="exercicio-repeticoes" value="${exercicio.repeticoes || '8-12'}" required>
                                            </div>
                                            <div class="form-group">
                                                <label>Descanso (segundos)</label>
                                                <input type="number" class="exercicio-descanso" min="0" value="${exercicio.descanso || 60}">
                                            </div>
                                        </div>
                                        <div class="form-group">
                                            <label>Observações</label>
                                            <textarea class="exercicio-observacoes" rows="2">${exercicio.observacoes || ''}</textarea>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            
                            <button type="button" class="btn btn-outline" onclick="academiaApp.adicionarExercicio()">
                                ➕ Adicionar Exercício
                            </button>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn btn-large btn-success">
                                💾 Atualizar Treino
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="academiaApp.visualizarTreino('${treinoId}')">
                                ❌ Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            `;

            document.getElementById('formEditarTreino').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.atualizarTreino(treinoId);
            });

        } catch (error) {
            this.mostrarMensagem('Erro ao carregar formulário: ' + error.message, 'error');
        }
    }

    async atualizarTreino(treinoId) {
        try {
            const treinoIndex = window.mockData.treinos.findIndex(t => t.id === treinoId);
            if (treinoIndex === -1) {
                this.mostrarMensagem('Treino não encontrado!', 'error');
                return;
            }

            // Coletar dados atualizados
            const treinoAtualizado = {
                ...window.mockData.treinos[treinoIndex],
                nome: document.getElementById('nomeTreino').value,
                tipo: document.getElementById('tipoTreino').value,
                dificuldade: document.getElementById('dificuldadeTreino').value,
                duracao: parseInt(document.getElementById('duracaoTreino').value),
                status: document.getElementById('statusTreino').value,
                descricao: document.getElementById('descricaoTreino').value,
                dataAtualizacao: new Date().toISOString()
            };

            // Coletar exercícios atualizados
            const exercicios = [];
            const exercicioElements = document.querySelectorAll('.exercicio-item');
            
            exercicioElements.forEach((element, index) => {
                const exercicioId = element.getAttribute('data-id') || `ex_${Date.now()}_${index}`;
                const exercicio = {
                    id: exercicioId,
                    nome: element.querySelector('.exercicio-nome').value,
                    grupoMuscular: element.querySelector('.exercicio-grupo').value,
                    series: parseInt(element.querySelector('.exercicio-series').value),
                    repeticoes: element.querySelector('.exercicio-repeticoes').value,
                    descanso: element.querySelector('.exercicio-descanso').value || 60,
                    observacoes: element.querySelector('.exercicio-observacoes').value,
                    ordem: index + 1
                };
                exercicios.push(exercicio);
            });

            if (exercicios.length === 0) {
                this.mostrarMensagem('O treino deve ter pelo menos um exercício!', 'error');
                return;
            }

            treinoAtualizado.exercicios = exercicios;
            treinoAtualizado.totalExercicios = exercicios.length;

            this.mostrarLoading('Atualizando treino...');

            // Atualizar no mock data
            window.mockData.treinos[treinoIndex] = treinoAtualizado;

            // Atualizar no localStorage
            const treinosStorage = JSON.parse(localStorage.getItem('academia_treinos') || '[]');
            const treinoIndexStorage = treinosStorage.findIndex(t => t.id === treinoId);
            if (treinoIndexStorage !== -1) {
                treinosStorage[treinoIndexStorage] = treinoAtualizado;
                localStorage.setItem('academia_treinos', JSON.stringify(treinosStorage));
            }

            this.mostrarMensagem('Treino atualizado com sucesso!', 'success');
            setTimeout(() => {
                this.visualizarTreino(treinoId);
            }, 1500);

        } catch (error) {
            this.mostrarMensagem('Erro ao atualizar treino: ' + error.message, 'error');
        } finally {
            this.esconderLoading();
        }
    }

    // 👁️ VISUALIZAR TREINO
    visualizarTreino(id) { 
        const treino = window.mockData.treinos.find(t => t.id === id);
        if (treino) {
            document.getElementById('app').innerHTML = `
                <div class="page-header">
                    <h1>💪 ${treino.nome}</h1>
                    <button class="btn" onclick="academiaApp.carregarTreinos()">
                        ← Voltar
                    </button>
                </div>
                
                <div class="treino-detalhes">
                    <div class="treino-info-card">
                        <h3>Informações do Treino</h3>
                        <div class="treino-metadata">
                            <p><strong>Tipo:</strong> ${treino.tipo}</p>
                            <p><strong>Dificuldade:</strong> ${treino.dificuldade}</p>
                            <p><strong>Duração:</strong> ${treino.duracao} semanas</p>
                            <p><strong>Status:</strong> ${treino.status}</p>
                        </div>
                        ${treino.descricao ? `<p><strong>Descrição:</strong> ${treino.descricao}</p>` : ''}
                    </div>
                    
                    <div class="exercicios-list">
                        <h3>Exercícios (${treino.exercicios?.length || 0})</h3>
                        ${treino.exercicios?.map((ex, index) => `
                            <div class="exercicio-item">
                                <div class="exercicio-numero">${index + 1}</div>
                                <div class="exercicio-conteudo">
                                    <h4>${ex.nome}</h4>
                                    <div class="exercicio-detalhes">
                                        <span>Séries: ${ex.series || 3}</span>
                                        <span>Repetições: ${ex.repeticoes || '8-12'}</span>
                                        <span>Descanso: ${ex.descanso || '60s'}</span>
                                    </div>
                                    ${ex.observacoes ? `<p class="exercicio-obs">${ex.observacoes}</p>` : ''}
                                </div>
                            </div>
                        `).join('') || '<p>Nenhum exercício definido</p>'}
                    </div>
                </div>
            `;
        } else {
            this.mostrarMensagem(`Treino não encontrado`, 'error');
        }
    }

    // ➕ ATRIBUIR TREINO (Implementação Completa)
    async atribuirTreino(treinoId) {
        try {
            const treino = window.mockData.treinos.find(t => t.id === treinoId);
            if (!treino) {
                this.mostrarMensagem('Treino não encontrado!', 'error');
                return;
            }

            const alunos = await this.apiService.getAlunos();
            const alunosAtivos = alunos.filter(a => a.status === 'ATIVO');
            
            // Alunos que já têm este treino atribuído
            const alunosComTreino = treino.alunos || [];

            document.getElementById('app').innerHTML = `
                <div class="page-header">
                    <h1>➕ Atribuir Treino: ${treino.nome}</h1>
                    <button class="btn" onclick="academiaApp.carregarTreinos()">
                        ← Voltar
                    </button>
                </div>

                <div class="atribuir-container">
                    <div class="info-card">
                        <h3>Informações do Treino</h3>
                        <p><strong>Nome:</strong> ${treino.nome}</p>
                        <p><strong>Tipo:</strong> ${treino.tipo}</p>
                        <p><strong>Dificuldade:</strong> ${treino.dificuldade}</p>
                        <p><strong>Exercícios:</strong> ${treino.exercicios?.length || 0}</p>
                    </div>

                    <div class="atribuir-form">
                        <h3>👥 Selecionar Alunos</h3>
                        <p class="subtitle">Selecione os alunos para atribuir este treino:</p>
                        
                        <div class="alunos-grid">
                            ${alunosAtivos.map(aluno => {
                                const jaAtribuido = alunosComTreino.includes(aluno.id);
                                return `
                                    <div class="aluno-checkbox-card ${jaAtribuido ? 'selected' : ''}">
                                        <label class="checkbox-label">
                                            <input type="checkbox" 
                                                   class="aluno-checkbox" 
                                                   value="${aluno.id}"
                                                   ${jaAtribuido ? 'checked' : ''}
                                                   onchange="this.closest('.aluno-checkbox-card').classList.toggle('selected')">
                                            <div class="aluno-info">
                                                <div class="aluno-avatar-small">
                                                    <span>${aluno.nome.charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <strong>${aluno.nome}</strong>
                                                    <p>${aluno.email}</p>
                                                    <p>Plano: ${aluno.plano}</p>
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        
                        ${alunosAtivos.length === 0 ? `
                            <div class="no-data">
                                <p>Nenhum aluno ativo encontrado.</p>
                                <button class="btn" onclick="academiaApp.criarAluno()">
                                    ➕ Cadastrar Aluno
                                </button>
                            </div>
                        ` : ''}

                        <div class="form-section">
                            <div class="form-group">
                                <label>Data de Início</label>
                                <input type="date" id="dataInicio" value="${new Date().toISOString().split('T')[0]}">
                            </div>
                            
                            <div class="form-group">
                                <label>Data de Término (opcional)</label>
                                <input type="date" id="dataTermino">
                            </div>
                            
                            <div class="form-group">
                                <label>Observações</label>
                                <textarea id="observacoesAtribuicao" rows="3" placeholder="Instruções especiais para o aluno..."></textarea>
                            </div>
                        </div>

                        <div class="atribuir-actions">
                            <button class="btn btn-large btn-success" onclick="academiaApp.salvarAtribuicaoTreino('${treinoId}')">
                                💾 Atribuir Treino
                            </button>
                            <button class="btn btn-secondary" onclick="academiaApp.carregarTreinos()">
                                ❌ Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            `;

        } catch (error) {
            this.mostrarMensagem('Erro ao carregar formulário: ' + error.message, 'error');
        }
    }

    async salvarAtribuicaoTreino(treinoId) {
        try {
            const treinoIndex = window.mockData.treinos.findIndex(t => t.id === treinoId);
            if (treinoIndex === -1) {
                this.mostrarMensagem('Treino não encontrado!', 'error');
                return;
            }

            // Coletar alunos selecionados
            const checkboxes = document.querySelectorAll('.aluno-checkbox:checked');
            const alunosSelecionados = Array.from(checkboxes).map(cb => cb.value);

            if (alunosSelecionados.length === 0) {
                this.mostrarMensagem('Selecione pelo menos um aluno!', 'error');
                return;
            }

            const dataInicio = document.getElementById('dataInicio').value || new Date().toISOString();
            const dataTermino = document.getElementById('dataTermino').value || null;
            const observacoes = document.getElementById('observacoesAtribuicao').value;

            this.mostrarLoading('Atribuindo treino...');

            // Atualizar treino com alunos atribuídos
            window.mockData.treinos[treinoIndex].alunos = alunosSelecionados;
            window.mockData.treinos[treinoIndex].atribuicoes = window.mockData.treinos[treinoIndex].atribuicoes || [];
            
            // Adicionar histórico de atribuições
            alunosSelecionados.forEach(alunoId => {
                const atribuicaoExistente = window.mockData.treinos[treinoIndex].atribuicoes?.find(
                    a => a.alunoId === alunoId && a.status === 'ATIVO'
                );
                
                if (!atribuicaoExistente) {
                    const novaAtribuicao = {
                        id: `attr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        alunoId: alunoId,
                        treinoId: treinoId,
                        dataInicio: dataInicio,
                        dataTermino: dataTermino,
                        observacoes: observacoes,
                        status: 'ATIVO',
                        dataAtribuicao: new Date().toISOString(),
                        instrutorId: this.usuarioLogado.id
                    };
                    
                    window.mockData.treinos[treinoIndex].atribuicoes.push(novaAtribuicao);
                }
            });

            // Atualizar localStorage
            const treinosStorage = JSON.parse(localStorage.getItem('academia_treinos') || '[]');
            const treinoIndexStorage = treinosStorage.findIndex(t => t.id === treinoId);
            if (treinoIndexStorage !== -1) {
                treinosStorage[treinoIndexStorage] = window.mockData.treinos[treinoIndex];
                localStorage.setItem('academia_treinos', JSON.stringify(treinosStorage));
            }

            this.mostrarMensagem(`Treino atribuído a ${alunosSelecionados.length} aluno(s) com sucesso!`, 'success');
            setTimeout(() => {
                this.carregarTreinos();
            }, 1500);

        } catch (error) {
            this.mostrarMensagem('Erro ao atribuir treino: ' + error.message, 'error');
        } finally {
            this.esconderLoading();
        }
    }

    // 👨‍💼 CRIAR INSTRUTOR (Implementação Completa)
    criarInstrutor() {
        document.getElementById('app').innerHTML = `
            <div class="page-header">
                <h1>👨‍💼 Cadastrar Novo Instrutor</h1>
                <button class="btn" onclick="academiaApp.carregarInstrutores()">
                    ← Voltar
                </button>
            </div>

            <div class="form-container">
                <form id="formInstrutor" class="instrutor-form">
                    <div class="form-section">
                        <h3>👤 Dados Pessoais</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Nome completo *</label>
                                <input type="text" id="nomeInstrutor" placeholder="Nome do instrutor" required>
                            </div>
                            <div class="form-group">
                                <label>CPF *</label>
                                <input type="text" id="cpfInstrutor" placeholder="000.000.000-00" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Data de Nascimento *</label>
                                <input type="date" id="nascimentoInstrutor" required>
                            </div>
                            <div class="form-group">
                                <label>Sexo *</label>
                                <select id="sexoInstrutor" required>
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
                                <input type="email" id="emailInstrutor" placeholder="instrutor@academia.com" required>
                            </div>
                            <div class="form-group">
                                <label>Telefone *</label>
                                <input type="tel" id="telefoneInstrutor" placeholder="(11) 99999-9999" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Endereço completo</label>
                            <textarea id="enderecoInstrutor" rows="2" placeholder="Rua, número, bairro, cidade"></textarea>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3>🏋️ Dados Profissionais</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label>CREF *</label>
                                <input type="text" id="crefInstrutor" placeholder="000000-G/SP" required>
                            </div>
                            <div class="form-group">
                                <label>Especialidade *</label>
                                <select id="especialidadeInstrutor" required>
                                    <option value="">Selecione</option>
                                    <option value="MUSCULACAO">Musculação</option>
                                    <option value="FUNCIONAL">Funcional</option>
                                    <option value="CROSSFIT">CrossFit</option>
                                    <option value="PILATES">Pilates</option>
                                    <option value="YOGA">Yoga</option>
                                    <option value="NATACAO">Natação</option>
                                    <option value="DANCA">Dança</option>
                                    <option value="LUTAS">Lutas</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Formação Acadêmica</label>
                                <input type="text" id="formacaoInstrutor" placeholder="Ex: Educação Física - USP">
                            </div>
                            <div class="form-group">
                                <label>Anos de Experiência</label>
                                <input type="number" id="experienciaInstrutor" min="0" max="50" placeholder="5">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Turno *</label>
                                <select id="turnoInstrutor" required>
                                    <option value="">Selecione</option>
                                    <option value="MANHA">Manhã</option>
                                    <option value="TARDE">Tarde</option>
                                    <option value="NOITE">Noite</option>
                                    <option value="INTEGRAL">Integral</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Salário Base (R$)</label>
                                <input type="number" id="salarioInstrutor" step="0.01" min="0" placeholder="2500.00">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Certificações/Cursos</label>
                            <textarea id="certificacoesInstrutor" rows="3" placeholder="Liste certificações relevantes..."></textarea>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-large btn-success">
                            💾 Salvar Instrutor
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="academiaApp.carregarInstrutores()">
                            ❌ Cancelar
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('formInstrutor').addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarInstrutor();
        });
    }

    async salvarInstrutor() {
        try {
            const instrutor = {
                nome: document.getElementById('nomeInstrutor').value,
                cpf: document.getElementById('cpfInstrutor').value,
                dataNascimento: document.getElementById('nascimentoInstrutor').value,
                sexo: document.getElementById('sexoInstrutor').value,
                email: document.getElementById('emailInstrutor').value,
                telefone: document.getElementById('telefoneInstrutor').value,
                endereco: document.getElementById('enderecoInstrutor').value,
                cref: document.getElementById('crefInstrutor').value,
                especialidade: document.getElementById('especialidadeInstrutor').value,
                formacao: document.getElementById('formacaoInstrutor').value,
                experiencia: parseInt(document.getElementById('experienciaInstrutor').value) || 0,
                turno: document.getElementById('turnoInstrutor').value,
                salario: parseFloat(document.getElementById('salarioInstrutor').value) || 0,
                certificacoes: document.getElementById('certificacoesInstrutor').value,
                status: 'ATIVO',
                dataAdmissao: new Date().toISOString(),
                tipo: 'INSTRUTOR'
            };

            // Validações
            if (!instrutor.nome || !instrutor.cpf || !instrutor.email || !instrutor.cref) {
                this.mostrarMensagem('Preencha os campos obrigatórios!', 'error');
                return;
            }

            // Verificar se CREF já existe
            const instrutoresExistentes = window.mockData.instrutores || [];
            if (instrutoresExistentes.find(i => i.cref === instrutor.cref)) {
                this.mostrarMensagem('Este CREF já está cadastrado!', 'error');
                return;
            }

            this.mostrarLoading('Salvando instrutor...');

            // Gerar ID
            instrutor.id = `instr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Salvar no mock data
            if (!window.mockData.instrutores) window.mockData.instrutores = [];
            window.mockData.instrutores.push(instrutor);

            // Salvar no localStorage
            const instrutoresStorage = JSON.parse(localStorage.getItem('academia_instrutores') || '[]');
            instrutoresStorage.push(instrutor);
            localStorage.setItem('academia_instrutores', JSON.stringify(instrutoresStorage));

            this.mostrarMensagem('Instrutor cadastrado com sucesso!', 'success');
            setTimeout(() => {
                this.carregarInstrutores();
            }, 1500);

        } catch (error) {
            this.mostrarMensagem('Erro ao salvar instrutor: ' + error.message, 'error');
        } finally {
            this.esconderLoading();
        }
    }

    // 👁️ VER INSTRUTOR (Implementação Completa)
    async verInstrutor(instrutorId) {
        try {
            const instrutor = window.mockData.instrutores.find(i => i.id === instrutorId);
            if (!instrutor) {
                this.mostrarMensagem('Instrutor não encontrado!', 'error');
                return;
            }

            // Buscar alunos deste instrutor
            const alunos = window.mockData.alunos || [];
            const alunosDoInstrutor = alunos.filter(a => a.instrutorId === instrutorId);
            
            // Buscar treinos criados por este instrutor
            const treinos = window.mockData.treinos || [];
            const treinosDoInstrutor = treinos.filter(t => t.criadorId === instrutorId);

            document.getElementById('app').innerHTML = `
                <div class="page-header">
                    <h1>👨‍💼 Perfil do Instrutor</h1>
                    <button class="btn" onclick="academiaApp.carregarInstrutores()">
                        ← Voltar
                    </button>
                </div>

                <div class="instrutor-detalhes">
                    <!-- Cabeçalho -->
                    <div class="instrutor-header">
                        <div class="instrutor-avatar-grande">
                            <span>${instrutor.nome.charAt(0)}</span>
                        </div>
                        <div class="instrutor-info-principal">
                            <h2>${instrutor.nome}</h2>
                            <div class="instrutor-metadata">
                                <span class="instrutor-status ${instrutor.status.toLowerCase()}">
                                    ${instrutor.status}
                                </span>
                                <span class="instrutor-especialidade">
                                    ${instrutor.especialidade}
                                </span>
                                <span class="instrutor-cref">
                                    📋 ${instrutor.cref}
                                </span>
                                <span class="instrutor-turno ${instrutor.turno.toLowerCase()}">
                                    ⏰ ${instrutor.turno}
                                </span>
                            </div>
                            <div class="instrutor-contato">
                                <span>📧 ${instrutor.email}</span>
                                <span>📱 ${instrutor.telefone}</span>
                            </div>
                        </div>
                    </div>

                    <div class="instrutor-grid">
                        <!-- Informações Pessoais -->
                        <div class="info-card">
                            <h3>👤 Informações Pessoais</h3>
                            <div class="info-list">
                                <div class="info-item">
                                    <strong>CPF:</strong> ${instrutor.cpf}
                                </div>
                                <div class="info-item">
                                    <strong>Data Nascimento:</strong> ${new Date(instrutor.dataNascimento).toLocaleDateString('pt-BR')}
                                </div>
                                <div class="info-item">
                                    <strong>Idade:</strong> ${this.calcularIdade(instrutor.dataNascimento)} anos
                                </div>
                                <div class="info-item">
                                    <strong>Sexo:</strong> ${instrutor.sexo}
                                </div>
                                ${instrutor.endereco ? `
                                    <div class="info-item">
                                        <strong>Endereço:</strong> ${instrutor.endereco}
                                    </div>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Dados Profissionais -->
                        <div class="info-card">
                            <h3>🏋️ Dados Profissionais</h3>
                            <div class="info-list">
                                <div class="info-item">
                                    <strong>Data Admissão:</strong> ${new Date(instrutor.dataAdmissao).toLocaleDateString('pt-BR')}
                                </div>
                                <div class="info-item">
                                    <strong>Experiência:</strong> ${instrutor.experiencia || 0} anos
                                </div>
                                ${instrutor.formacao ? `
                                    <div class="info-item">
                                        <strong>Formação:</strong> ${instrutor.formacao}
                                    </div>
                                ` : ''}
                                ${instrutor.salario ? `
                                    <div class="info-item">
                                        <strong>Salário Base:</strong> R$ ${instrutor.salario.toFixed(2)}
                                    </div>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Alunos sob responsabilidade -->
                        <div class="info-card full-width">
                            <h3>👥 Alunos Responsáveis (${alunosDoInstrutor.length})</h3>
                            ${alunosDoInstrutor.length > 0 ? `
                                <div class="table-container">
                                    <table class="data-table">
                                        <thead>
                                            <tr>
                                                <th>Nome</th>
                                                <th>Plano</th>
                                                <th>Status</th>
                                                <th>Telefone</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${alunosDoInstrutor.map(aluno => `
                                                <tr>
                                                    <td>
                                                        <div class="user-avatar">
                                                            <span>${aluno.nome.charAt(0)}</span>
                                                            <strong>${aluno.nome}</strong>
                                                        </div>
                                                    </td>
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
                                                    <td>${aluno.telefone}</td>
                                                    <td>
                                                        <button class="btn btn-sm" 
                                                                onclick="academiaApp.verAluno('${aluno.id}')">
                                                            👁️ Ver
                                                        </button>
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            ` : '<p class="no-data">Nenhum aluno atribuído.</p>'}
                        </div>

                        <!-- Treinos Criados -->
                        <div class="info-card full-width">
                            <h3>💪 Treinos Criados (${treinosDoInstrutor.length})</h3>
                            ${treinosDoInstrutor.length > 0 ? `
                                <div class="treinos-grid">
                                    ${treinosDoInstrutor.map(treino => `
                                        <div class="treino-card">
                                            <div class="treino-header">
                                                <h3>${treino.nome}</h3>
                                                <span class="badge ${treino.dificuldade.toLowerCase()}">
                                                    ${treino.dificuldade}
                                                </span>
                                            </div>
                                            <div class="treino-info">
                                                <p><strong>Tipo:</strong> ${treino.tipo}</p>
                                                <p><strong>Exercícios:</strong> ${treino.exercicios?.length || 0}</p>
                                                <p><strong>Alunos:</strong> ${treino.alunos?.length || 0}</p>
                                            </div>
                                            <div class="treino-actions">
                                                <button class="btn btn-sm" 
                                                        onclick="academiaApp.visualizarTreino('${treino.id}')">
                                                    👁️ Ver
                                                </button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : '<p class="no-data">Nenhum treino criado.</p>'}
                        </div>

                        <!-- Certificações -->
                        ${instrutor.certificacoes ? `
                            <div class="info-card full-width">
                                <h3>📜 Certificações</h3>
                                <div class="certificacoes-box">
                                    ${instrutor.certificacoes}
                                </div>
                            </div>
                        ` : ''}
                    </div>

                    <div class="instrutor-actions">
                        <button class="btn btn-primary" onclick="academiaApp.editarInstrutor('${instrutorId}')">
                            ✏️ Editar Instrutor
                        </button>
                        ${this.usuarioLogado.tipo === 'ADMIN' ? `
                            <button class="btn btn-danger" onclick="academiaApp.excluirInstrutor('${instrutorId}')">
                                🗑️ Excluir Instrutor
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;

        } catch (error) {
            this.mostrarMensagem('Erro ao carregar instrutor: ' + error.message, 'error');
        }
    }

    // ✏️ EDITAR INSTRUTOR (Implementação Completa)
    async editarInstrutor(instrutorId) {
        try {
            const instrutor = window.mockData.instrutores.find(i => i.id === instrutorId);
            if (!instrutor) {
                this.mostrarMensagem('Instrutor não encontrado!', 'error');
                return;
            }

            document.getElementById('app').innerHTML = `
                <div class="page-header">
                    <h1>✏️ Editar Instrutor: ${instrutor.nome}</h1>
                    <button class="btn" onclick="academiaApp.verInstrutor('${instrutorId}')">
                        ← Voltar
                    </button>
                </div>

                <div class="form-container">
                    <form id="formEditarInstrutor" class="instrutor-form">
                        <div class="form-section">
                            <h3>👤 Dados Pessoais</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Nome completo *</label>
                                    <input type="text" id="nomeInstrutor" value="${instrutor.nome}" required>
                                </div>
                                <div class="form-group">
                                    <label>CPF *</label>
                                    <input type="text" id="cpfInstrutor" value="${instrutor.cpf}" required>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Data de Nascimento *</label>
                                    <input type="date" id="nascimentoInstrutor" value="${instrutor.dataNascimento.split('T')[0]}" required>
                                </div>
                                <div class="form-group">
                                    <label>Sexo *</label>
                                    <select id="sexoInstrutor" required>
                                        <option value="MASCULINO" ${instrutor.sexo === 'MASCULINO' ? 'selected' : ''}>Masculino</option>
                                        <option value="FEMININO" ${instrutor.sexo === 'FEMININO' ? 'selected' : ''}>Feminino</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>📞 Contato</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>E-mail *</label>
                                    <input type="email" id="emailInstrutor" value="${instrutor.email}" required>
                                </div>
                                <div class="form-group">
                                    <label>Telefone *</label>
                                    <input type="tel" id="telefoneInstrutor" value="${instrutor.telefone}" required>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Endereço completo</label>
                                <textarea id="enderecoInstrutor" rows="2">${instrutor.endereco || ''}</textarea>
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>🏋️ Dados Profissionais</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>CREF *</label>
                                    <input type="text" id="crefInstrutor" value="${instrutor.cref}" required>
                                </div>
                                <div class="form-group">
                                    <label>Especialidade *</label>
                                    <select id="especialidadeInstrutor" required>
                                        <option value="MUSCULACAO" ${instrutor.especialidade === 'MUSCULACAO' ? 'selected' : ''}>Musculação</option>
                                        <option value="FUNCIONAL" ${instrutor.especialidade === 'FUNCIONAL' ? 'selected' : ''}>Funcional</option>
                                        <option value="CROSSFIT" ${instrutor.especialidade === 'CROSSFIT' ? 'selected' : ''}>CrossFit</option>
                                        <option value="PILATES" ${instrutor.especialidade === 'PILATES' ? 'selected' : ''}>Pilates</option>
                                        <option value="YOGA" ${instrutor.especialidade === 'YOGA' ? 'selected' : ''}>Yoga</option>
                                        <option value="NATACAO" ${instrutor.especialidade === 'NATACAO' ? 'selected' : ''}>Natação</option>
                                        <option value="DANCA" ${instrutor.especialidade === 'DANCA' ? 'selected' : ''}>Dança</option>
                                        <option value="LUTAS" ${instrutor.especialidade === 'LUTAS' ? 'selected' : ''}>Lutas</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Formação Acadêmica</label>
                                    <input type="text" id="formacaoInstrutor" value="${instrutor.formacao || ''}">
                                </div>
                                <div class="form-group">
                                    <label>Anos de Experiência</label>
                                    <input type="number" id="experienciaInstrutor" min="0" max="50" value="${instrutor.experiencia || 0}">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Turno *</label>
                                    <select id="turnoInstrutor" required>
                                        <option value="MANHA" ${instrutor.turno === 'MANHA' ? 'selected' : ''}>Manhã</option>
                                        <option value="TARDE" ${instrutor.turno === 'TARDE' ? 'selected' : ''}>Tarde</option>
                                        <option value="NOITE" ${instrutor.turno === 'NOITE' ? 'selected' : ''}>Noite</option>
                                        <option value="INTEGRAL" ${instrutor.turno === 'INTEGRAL' ? 'selected' : ''}>Integral</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Salário Base (R$)</label>
                                    <input type="number" id="salarioInstrutor" step="0.01" min="0" value="${instrutor.salario || 0}">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Status *</label>
                                    <select id="statusInstrutor" required>
                                        <option value="ATIVO" ${instrutor.status === 'ATIVO' ? 'selected' : ''}>Ativo</option>
                                        <option value="INATIVO" ${instrutor.status === 'INATIVO' ? 'selected' : ''}>Inativo</option>
                                        <option value="FERIAS" ${instrutor.status === 'FERIAS' ? 'selected' : ''}>Férias</option>
                                        <option value="AFASTADO" ${instrutor.status === 'AFASTADO' ? 'selected' : ''}>Afastado</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Certificações/Cursos</label>
                                <textarea id="certificacoesInstrutor" rows="3">${instrutor.certificacoes || ''}</textarea>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn btn-large btn-success">
                                💾 Atualizar Instrutor
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="academiaApp.verInstrutor('${instrutorId}')">
                                ❌ Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            `;

            document.getElementById('formEditarInstrutor').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.atualizarInstrutor(instrutorId);
            });

        } catch (error) {
            this.mostrarMensagem('Erro ao carregar formulário: ' + error.message, 'error');
        }
    }

    async atualizarInstrutor(instrutorId) {
        try {
            const instrutorIndex = window.mockData.instrutores.findIndex(i => i.id === instrutorId);
            if (instrutorIndex === -1) {
                this.mostrarMensagem('Instrutor não encontrado!', 'error');
                return;
            }

            const instrutorAtualizado = {
                ...window.mockData.instrutores[instrutorIndex],
                nome: document.getElementById('nomeInstrutor').value,
                cpf: document.getElementById('cpfInstrutor').value,
                dataNascimento: document.getElementById('nascimentoInstrutor').value,
                sexo: document.getElementById('sexoInstrutor').value,
                email: document.getElementById('emailInstrutor').value,
                telefone: document.getElementById('telefoneInstrutor').value,
                endereco: document.getElementById('enderecoInstrutor').value,
                cref: document.getElementById('crefInstrutor').value,
                especialidade: document.getElementById('especialidadeInstrutor').value,
                formacao: document.getElementById('formacaoInstrutor').value,
                experiencia: parseInt(document.getElementById('experienciaInstrutor').value) || 0,
                turno: document.getElementById('turnoInstrutor').value,
                salario: parseFloat(document.getElementById('salarioInstrutor').value) || 0,
                status: document.getElementById('statusInstrutor').value,
                certificacoes: document.getElementById('certificacoesInstrutor').value,
                dataAtualizacao: new Date().toISOString()
            };

            // Validações
            if (!instrutorAtualizado.nome || !instrutorAtualizado.cpf || 
                !instrutorAtualizado.email || !instrutorAtualizado.cref) {
                this.mostrarMensagem('Preencha os campos obrigatórios!', 'error');
                return;
            }

            this.mostrarLoading('Atualizando instrutor...');

            // Atualizar no mock data
            window.mockData.instrutores[instrutorIndex] = instrutorAtualizado;

            // Atualizar no localStorage
            const instrutoresStorage = JSON.parse(localStorage.getItem('academia_instrutores') || '[]');
            const instrutorIndexStorage = instrutoresStorage.findIndex(i => i.id === instrutorId);
            if (instrutorIndexStorage !== -1) {
                instrutoresStorage[instrutorIndexStorage] = instrutorAtualizado;
                localStorage.setItem('academia_instrutores', JSON.stringify(instrutoresStorage));
            }

            this.mostrarMensagem('Instrutor atualizado com sucesso!', 'success');
            setTimeout(() => {
                this.verInstrutor(instrutorId);
            }, 1500);

        } catch (error) {
            this.mostrarMensagem('Erro ao atualizar instrutor: ' + error.message, 'error');
        } finally {
            this.esconderLoading();
        }
    }

    // 🗑️ EXCLUIR INSTRUTOR
    excluirInstrutor(instrutorId) {
        if (!confirm('Tem certeza que deseja excluir este instrutor? Esta ação não pode ser desfeita.')) {
            return;
        }

        try {
            // Verificar se o instrutor tem alunos atribuídos
            const alunosDoInstrutor = (window.mockData.alunos || []).filter(a => a.instrutorId === instrutorId);
            
            if (alunosDoInstrutor.length > 0) {
                if (!confirm(`Este instrutor tem ${alunosDoInstrutor.length} aluno(s) atribuído(s). Deseja reassigná-los para outro instrutor?`)) {
                    // Se não quiser reassignar, apenas remove a referência
                    alunosDoInstrutor.forEach(aluno => {
                        aluno.instrutorId = null;
                    });
                } else {
                    // Aqui poderia implementar uma interface para escolher novo instrutor
                    this.mostrarMensagem('Funcionalidade de reassignação em desenvolvimento', 'info');
                    return;
                }
            }

            // Remover do mock data
            window.mockData.instrutores = window.mockData.instrutores.filter(i => i.id !== instrutorId);

            // Remover do localStorage
            const instrutoresStorage = JSON.parse(localStorage.getItem('academia_instrutores') || '[]');
            const novasInstrutores = instrutoresStorage.filter(i => i.id !== instrutorId);
            localStorage.setItem('academia_instrutores', JSON.stringify(novasInstrutores));

            this.mostrarMensagem('Instrutor excluído com sucesso!', 'success');
            this.carregarInstrutores();

        } catch (error) {
            this.mostrarMensagem('Erro ao excluir instrutor: ' + error.message, 'error');
        }
    }

    // 📝 EDITAR AVALIAÇÃO (Implementação Completa)
    async editarAvaliacao(avaliacaoId) {
        try {
            const avaliacoes = await this.apiService.getAvaliacoes();
            const alunos = await this.apiService.getAlunos();
            
            const avaliacao = avaliacoes.find(a => a.id === avaliacaoId);
            if (!avaliacao) {
                this.mostrarMensagem('Avaliação não encontrada!', 'error');
                return;
            }

            const aluno = alunos.find(a => a.id === avaliacao.alunoId);

            document.getElementById('app').innerHTML = `
                <div class="page-header">
                    <h1>✏️ Editar Avaliação Física</h1>
                    <button class="btn" onclick="academiaApp.visualizarAvaliacao('${avaliacaoId}')">
                        ← Voltar
                    </button>
                </div>

                <div class="form-container">
                    <form id="formEditarAvaliacao" class="avaliacao-form">
                        <!-- Dados do Aluno -->
                        <div class="form-section">
                            <h3>👤 Dados do Aluno</h3>
                            <div class="aluno-info-static">
                                <p><strong>Aluno:</strong> ${aluno?.nome || 'N/A'}</p>
                                <p><strong>Data da Avaliação:</strong> ${new Date(avaliacao.dataAvaliacao).toLocaleDateString()}</p>
                                <input type="hidden" id="avaliacaoId" value="${avaliacaoId}">
                            </div>
                        </div>

                        <!-- Medidas Básicas -->
                        <div class="form-section">
                            <h3>📏 Medidas Básicas</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Peso (kg) *</label>
                                    <input type="number" id="peso" step="0.1" min="0" 
                                           value="${avaliacao.peso}" required>
                                </div>
                                <div class="form-group">
                                    <label>Altura (cm) *</label>
                                    <input type="number" id="altura" step="0.1" min="0" 
                                           value="${avaliacao.altura}" required>
                                </div>
                            </div>
                        </div>

                        <!-- Circunferências -->
                        <div class="form-section">
                            <h3>📐 Circunferências Corporais (cm)</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Torácica</label>
                                    <input type="number" id="torax" step="0.1" 
                                           value="${avaliacao.circunferencias?.torax || ''}">
                                </div>
                                <div class="form-group">
                                    <label>Abdominal</label>
                                    <input type="number" id="abdominal" step="0.1" 
                                           value="${avaliacao.circunferencias?.abdominal || ''}">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Cintura</label>
                                    <input type="number" id="cintura" step="0.1" 
                                           value="${avaliacao.circunferencias?.cintura || ''}">
                                </div>
                                <div class="form-group">
                                    <label>Quadril</label>
                                    <input type="number" id="quadril" step="0.1" 
                                           value="${avaliacao.circunferencias?.quadril || ''}">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Braço Direito</label>
                                    <input type="number" id="bracoDireito" step="0.1" 
                                           value="${avaliacao.circunferencias?.bracoDireito || ''}">
                                </div>
                                <div class="form-group">
                                    <label>Braço Esquerdo</label>
                                    <input type="number" id="bracoEsquerdo" step="0.1" 
                                           value="${avaliacao.circunferencias?.bracoEsquerdo || ''}">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Coxa Direita</label>
                                    <input type="number" id="coxaDireita" step="0.1" 
                                           value="${avaliacao.circunferencias?.coxaDireita || ''}">
                                </div>
                                <div class="form-group">
                                    <label>Coxa Esquerda</label>
                                    <input type="number" id="coxaEsquerda" step="0.1" 
                                           value="${avaliacao.circunferencias?.coxaEsquerda || ''}">
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
                                           value="${avaliacao.composicaoCorporal?.percentualGordura || ''}">
                                </div>
                                <div class="form-group">
                                    <label>Massa Magra (kg)</label>
                                    <input type="number" id="massaMagra" step="0.1" 
                                           value="${avaliacao.composicaoCorporal?.massaMagra || ''}">
                                </div>
                            </div>
                        </div>

                        <!-- Observações e Metas -->
                        <div class="form-section">
                            <h3>📋 Análise e Metas</h3>
                            <div class="form-group">
                                <label>Observações e Análise</label>
                                <textarea id="observacoes" rows="4">${avaliacao.observacoes || ''}</textarea>
                            </div>
                            <div class="form-group">
                                <label>Metas para Próxima Avaliação</label>
                                <textarea id="metas" rows="3">${avaliacao.metas || ''}</textarea>
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>📊 Resultados Calculados</h3>
                            <div class="resultados-calculados">
                                <div class="resultado-item">
                                    <strong>IMC Atual:</strong>
                                    <span id="imcCalculado">${this.calcularIMC(avaliacao.peso, avaliacao.altura).toFixed(1)}</span>
                                </div>
                                <div class="resultado-item">
                                    <strong>Classificação:</strong>
                                    <span id="classificacaoIMC">${this.classificarIMC(this.calcularIMC(avaliacao.peso, avaliacao.altura)).texto}</span>
                                </div>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn btn-large btn-success">
                                💾 Atualizar Avaliação
                            </button>
                            <button type="button" class="btn btn-secondary" 
                                    onclick="academiaApp.visualizarAvaliacao('${avaliacaoId}')">
                                ❌ Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            `;

            // Adicionar listeners para cálculo automático
            document.getElementById('peso').addEventListener('input', this.atualizarCalculos.bind(this));
            document.getElementById('altura').addEventListener('input', this.atualizarCalculos.bind(this));

            document.getElementById('formEditarAvaliacao').addEventListener('submit', (e) => {
                e.preventDefault();
                this.atualizarAvaliacao(avaliacaoId);
            });

        } catch (error) {
            this.mostrarMensagem('Erro ao carregar formulário: ' + error.message, 'error');
        }
    }

    atualizarCalculos() {
        const peso = parseFloat(document.getElementById('peso').value) || 0;
        const altura = parseFloat(document.getElementById('altura').value) || 0;
        
        if (peso > 0 && altura > 0) {
            const imc = this.calcularIMC(peso, altura);
            const classificacao = this.classificarIMC(imc);
            
            document.getElementById('imcCalculado').textContent = imc.toFixed(1);
            document.getElementById('classificacaoIMC').textContent = classificacao.texto;
            document.getElementById('classificacaoIMC').className = `imc-badge ${classificacao.cor}`;
        }
    }

    async atualizarAvaliacao(avaliacaoId) {
        try {
            const avaliacoes = await this.apiService.getAvaliacoes();
            const avaliacaoIndex = avaliacoes.findIndex(a => a.id === avaliacaoId);
            
            if (avaliacaoIndex === -1) {
                this.mostrarMensagem('Avaliação não encontrada!', 'error');
                return;
            }

            const avaliacaoAtualizada = {
                ...avaliacoes[avaliacaoIndex],
                peso: parseFloat(document.getElementById('peso').value) || 0,
                altura: parseFloat(document.getElementById('altura').value) || 0,
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
                        parseFloat(document.getElementById('massaMagra').value) : null,
                    imc: this.calcularIMC(
                        parseFloat(document.getElementById('peso').value) || 0,
                        parseFloat(document.getElementById('altura').value) || 0
                    )
                },
                observacoes: document.getElementById('observacoes').value,
                metas: document.getElementById('metas').value,
                dataAtualizacao: new Date().toISOString()
            };

            // Validações
            if (!avaliacaoAtualizada.peso || !avaliacaoAtualizada.altura) {
                this.mostrarMensagem('Peso e altura são obrigatórios!', 'error');
                return;
            }

            this.mostrarLoading('Atualizando avaliação...');

            // Atualizar no mock data
            window.mockData.avaliacoes[avaliacaoIndex] = avaliacaoAtualizada;

            // Atualizar no localStorage
            const avaliacoesStorage = JSON.parse(localStorage.getItem('academia_avaliacoes') || '[]');
            const avaliacaoIndexStorage = avaliacoesStorage.findIndex(a => a.id === avaliacaoId);
            if (avaliacaoIndexStorage !== -1) {
                avaliacoesStorage[avaliacaoIndexStorage] = avaliacaoAtualizada;
                localStorage.setItem('academia_avaliacoes', JSON.stringify(avaliacoesStorage));
            }

            this.mostrarMensagem('Avaliação atualizada com sucesso!', 'success');
            setTimeout(() => {
                this.visualizarAvaliacao(avaliacaoId);
            }, 1500);

        } catch (error) {
            this.mostrarMensagem('Erro ao atualizar avaliação: ' + error.message, 'error');
        } finally {
            this.esconderLoading();
        }
    }

    // 🗑️ EXCLUIR AVALIAÇÃO
    excluirAvaliacao(id) { 
        if (confirm('Tem certeza que deseja excluir esta avaliação?')) {
            const stored = JSON.parse(localStorage.getItem(CONFIG.STORAGE.AVALIACOES_KEY) || '[]');
            const novasAvaliacoes = stored.filter(a => a.id !== id);
            localStorage.setItem(CONFIG.STORAGE.AVALIACOES_KEY, JSON.stringify(novasAvaliacoes));
            this.mostrarMensagem(`Avaliação excluída com sucesso!`, 'success');
            this.carregarAvaliacoes();
        }
    }

    // 📄 GERAR RELATÓRIO DE AVALIAÇÃO (Implementação Completa)
    async gerarRelatorioAvaliacao(avaliacaoId) {
        try {
            const avaliacoes = await this.apiService.getAvaliacoes();
            const alunos = await this.apiService.getAlunos();
            
            const avaliacao = avaliacoes.find(a => a.id === avaliacaoId);
            if (!avaliacao) {
                this.mostrarMensagem('Avaliação não encontrada!', 'error');
                return;
            }

            const aluno = alunos.find(a => a.id === avaliacao.alunoId);
            const imc = avaliacao.composicaoCorporal?.imc || this.calcularIMC(avaliacao.peso, avaliacao.altura);
            const classificacao = this.classificarIMC(imc);

            // Criar conteúdo do relatório
            const relatorioHTML = `
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Relatório de Avaliação Física - ${aluno?.nome}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
                        .header { text-align: center; border-bottom: 3px solid #4CAF50; padding-bottom: 20px; margin-bottom: 30px; }
                        .header h1 { color: #2c3e50; margin: 0; }
                        .header .subtitle { color: #7f8c8d; font-size: 16px; }
                        .section { margin-bottom: 30px; }
                        .section h2 { color: #3498db; border-bottom: 2px solid #eee; padding-bottom: 10px; }
                        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
                        .info-item { margin-bottom: 15px; }
                        .info-item strong { display: block; color: #2c3e50; margin-bottom: 5px; }
                        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                        .table th { background-color: #f8f9fa; color: #2c3e50; }
                        .badge { display: inline-block; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; }
                        .badge-success { background-color: #d4edda; color: #155724; }
                        .badge-warning { background-color: #fff3cd; color: #856404; }
                        .badge-danger { background-color: #f8d7da; color: #721c24; }
                        .footer { margin-top: 50px; text-align: center; color: #7f8c8d; font-size: 14px; }
                        .signature { margin-top: 50px; border-top: 1px solid #ddd; padding-top: 20px; }
                        .logo { font-size: 24px; font-weight: bold; color: #4CAF50; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">🏋️ ACADEMIA FIT PRO</div>
                        <h1>Relatório de Avaliação Física</h1>
                        <div class="subtitle">${new Date(avaliacao.dataAvaliacao).toLocaleDateString('pt-BR')}</div>
                    </div>

                    <div class="section">
                        <h2>👤 Dados do Aluno</h2>
                        <div class="info-grid">
                            <div class="info-item">
                                <strong>Nome:</strong>
                                <span>${aluno?.nome || 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <strong>Data da Avaliação:</strong>
                                <span>${new Date(avaliacao.dataAvaliacao).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <div class="info-item">
                                <strong>Instrutor Responsável:</strong>
                                <span>${this.usuarioLogado.nome}</span>
                            </div>
                            <div class="info-item">
                                <strong>Status:</strong>
                                <span class="badge badge-success">${avaliacao.status}</span>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <h2>📏 Medidas Antropométricas</h2>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Medida</th>
                                    <th>Valor (cm)</th>
                                    <th>Medida</th>
                                    <th>Valor (cm)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Peso</td>
                                    <td>${avaliacao.peso} kg</td>
                                    <td>Altura</td>
                                    <td>${avaliacao.altura} cm</td>
                                </tr>
                                <tr>
                                    <td>Torácica</td>
                                    <td>${avaliacao.circunferencias?.torax || '--'}</td>
                                    <td>Abdominal</td>
                                    <td>${avaliacao.circunferencias?.abdominal || '--'}</td>
                                </tr>
                                <tr>
                                    <td>Cintura</td>
                                    <td>${avaliacao.circunferencias?.cintura || '--'}</td>
                                    <td>Quadril</td>
                                    <td>${avaliacao.circunferencias?.quadril || '--'}</td>
                                </tr>
                                <tr>
                                    <td>Braço Direito</td>
                                    <td>${avaliacao.circunferencias?.bracoDireito || '--'}</td>
                                    <td>Braço Esquerdo</td>
                                    <td>${avaliacao.circunferencias?.bracoEsquerdo || '--'}</td>
                                </tr>
                                <tr>
                                    <td>Coxa Direita</td>
                                    <td>${avaliacao.circunferencias?.coxaDireita || '--'}</td>
                                    <td>Coxa Esquerda</td>
                                    <td>${avaliacao.circunferencias?.coxaEsquerda || '--'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="section">
                        <h2>📊 Resultados Calculados</h2>
                        <div class="info-grid">
                            <div class="info-item">
                                <strong>Índice de Massa Corporal (IMC):</strong>
                                <span>${imc.toFixed(1)}</span>
                                <span class="badge badge-${classificacao.cor}">${classificacao.texto}</span>
                            </div>
                            ${avaliacao.composicaoCorporal?.percentualGordura ? `
                                <div class="info-item">
                                    <strong>Percentual de Gordura:</strong>
                                    <span>${avaliacao.composicaoCorporal.percentualGordura}%</span>
                                </div>
                            ` : ''}
                            ${avaliacao.composicaoCorporal?.massaMagra ? `
                                <div class="info-item">
                                    <strong>Massa Magra:</strong>
                                    <span>${avaliacao.composicaoCorporal.massaMagra} kg</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    ${avaliacao.observacoes ? `
                        <div class="section">
                            <h2>📋 Análise e Observações</h2>
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px;">
                                ${avaliacao.observacoes}
                            </div>
                        </div>
                    ` : ''}

                    ${avaliacao.metas ? `
                        <div class="section">
                            <h2>🎯 Metas e Objetivos</h2>
                            <div style="background: #e8f4f8; padding: 20px; border-radius: 5px;">
                                ${avaliacao.metas}
                            </div>
                        </div>
                    ` : ''}

                    <div class="signature">
                        <div style="float: right; text-align: center;">
                            <div style="margin-top: 60px;">
                                <div>___________________________________</div>
                                <div>${this.usuarioLogado.nome}</div>
                                <div>Instrutor Responsável</div>
                                <div>CREF: ${this.usuarioLogado.cref || '--'}</div>
                            </div>
                        </div>
                        <div style="clear: both;"></div>
                    </div>

                    <div class="footer">
                        <p>Relatório gerado automaticamente pelo Sistema Academia Fit Pro</p>
                        <p>Data de geração: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}</p>
                    </div>
                </body>
                </html>
            `;

            // Abrir em nova janela para impressão
            const janelaRelatorio = window.open('', '_blank');
            janelaRelatorio.document.write(relatorioHTML);
            janelaRelatorio.document.close();
            
            // Aguardar carregamento e mostrar opção de impressão
            janelaRelatorio.onload = function() {
                janelaRelatorio.focus();
                // Opcional: auto-print
                // janelaRelatorio.print();
            };

        } catch (error) {
            this.mostrarMensagem('Erro ao gerar relatório: ' + error.message, 'error');
        }
    }

    // 👨‍💼 GESTÃO DE USUÁRIOS (Implementação Completa)
    async carregarUsuarios() {
        if (this.usuarioLogado.tipo !== 'ADMIN') {
            this.mostrarMensagem('Acesso restrito a administradores!', 'error');
            this.carregarDashboard();
            return;
        }

        try {
            const usuarios = JSON.parse(localStorage.getItem('academia_usuarios') || '[]');

            document.getElementById('app').innerHTML = `
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

                <div class="stats-bar">
                    <div class="stat">
                        <strong>${usuarios.length}</strong>
                        <span>Total de Usuários</span>
                    </div>
                    <div class="stat">
                        <strong>${usuarios.filter(u => u.tipo === 'ADMIN').length}</strong>
                        <span>Administradores</span>
                    </div>
                    <div class="stat">
                        <strong>${usuarios.filter(u => u.tipo === 'INSTRUTOR').length}</strong>
                        <span>Instrutores</span>
                    </div>
                    <div class="stat">
                        <strong>${usuarios.filter(u => u.tipo === 'ALUNO').length}</strong>
                        <span>Alunos</span>
                    </div>
                </div>

                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>E-mail</th>
                                <th>Tipo</th>
                                <th>Status</th>
                                <th>Data Cadastro</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${usuarios.map(usuario => `
                                <tr>
                                    <td>
                                        <div class="user-avatar">
                                            <span>${usuario.nome.charAt(0)}</span>
                                            <strong>${usuario.nome}</strong>
                                        </div>
                                    </td>
                                    <td>${usuario.email}</td>
                                    <td>
                                        <span class="user-badge ${usuario.tipo.toLowerCase()}">
                                            ${usuario.tipo}
                                        </span>
                                    </td>
                                    <td>
                                        <span class="status-badge ${(usuario.status || 'ATIVO').toLowerCase()}">
                                            ${usuario.status || 'ATIVO'}
                                        </span>
                                    </td>
                                    <td>${new Date(usuario.dataCadastro || Date.now()).toLocaleDateString('pt-BR')}</td>
                                    <td>
                                        <div class="action-buttons">
                                            <button class="btn btn-sm" onclick="academiaApp.editarUsuario('${usuario.id}')">
                                                ✏️ Editar
                                            </button>
                                            ${usuario.id !== this.usuarioLogado.id ? `
                                                <button class="btn btn-sm btn-danger" onclick="academiaApp.excluirUsuario('${usuario.id}')">
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
            this.mostrarMensagem('Erro ao carregar usuários', 'error');
        }
    }

    criarUsuario() {
        document.getElementById('app').innerHTML = `
            <div class="page-header">
                <h1>👤 Criar Novo Usuário</h1>
                <button class="btn" onclick="academiaApp.carregarUsuarios()">
                    ← Voltar
                </button>
            </div>

            <div class="form-container">
                <form id="formUsuario" class="usuario-form">
                    <div class="form-section">
                        <h3>👤 Dados Pessoais</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Nome completo *</label>
                                <input type="text" id="nomeUsuario" placeholder="Nome completo" required>
                            </div>
                            <div class="form-group">
                                <label>E-mail *</label>
                                <input type="email" id="emailUsuario" placeholder="usuario@email.com" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Senha *</label>
                                <input type="password" id="senhaUsuario" placeholder="Mínimo 6 caracteres" required minlength="6">
                            </div>
                            <div class="form-group">
                                <label>Confirmar Senha *</label>
                                <input type="password" id="confirmarSenhaUsuario" placeholder="Digite novamente" required>
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3>🏢 Dados de Acesso</h3>
                        <div class="form-row">
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
                                <label>Status *</label>
                                <select id="statusUsuario" required>
                                    <option value="ATIVO">Ativo</option>
                                    <option value="INATIVO">Inativo</option>
                                    <option value="BLOQUEADO">Bloqueado</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Permissões Especiais</label>
                            <div class="checkbox-group">
                                <label>
                                    <input type="checkbox" id="podeCriarTreinos" value="true">
                                    Pode criar planos de treino
                                </label>
                                <label>
                                    <input type="checkbox" id="podeCriarAvaliacoes" value="true" checked>
                                    Pode criar avaliações físicas
                                </label>
                                <label>
                                    <input type="checkbox" id="podeGerenciarAlunos" value="true">
                                    Pode gerenciar alunos
                                </label>
                                <label>
                                    <input type="checkbox" id="podeGerenciarInstrutores" value="true">
                                    Pode gerenciar instrutores
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3>📞 Informações Adicionais</h3>
                        <div class="form-group">
                            <label>Telefone</label>
                            <input type="tel" id="telefoneUsuario" placeholder="(11) 99999-9999">
                        </div>
                        <div class="form-group">
                            <label>Observações</label>
                            <textarea id="observacoesUsuario" rows="3" placeholder="Observações sobre o usuário..."></textarea>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn-large btn-success">
                            💾 Criar Usuário
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="academiaApp.carregarUsuarios()">
                            ❌ Cancelar
                        </button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('formUsuario').addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarUsuario();
        });
    }

    async salvarUsuario() {
        try {
            const nome = document.getElementById('nomeUsuario').value;
            const email = document.getElementById('emailUsuario').value;
            const senha = document.getElementById('senhaUsuario').value;
            const confirmarSenha = document.getElementById('confirmarSenhaUsuario').value;
            const tipo = document.getElementById('tipoUsuario').value;
            const status = document.getElementById('statusUsuario').value;
            const telefone = document.getElementById('telefoneUsuario').value;
            const observacoes = document.getElementById('observacoesUsuario').value;

            // Validações
            if (senha !== confirmarSenha) {
                this.mostrarMensagem('As senhas não coincidem!', 'error');
                return;
            }

            if (senha.length < 6) {
                this.mostrarMensagem('A senha deve ter pelo menos 6 caracteres!', 'error');
                return;
            }

            if (!tipo) {
                this.mostrarMensagem('Selecione o tipo de usuário!', 'error');
                return;
            }

            // Verificar se email já existe
            const usuarios = JSON.parse(localStorage.getItem('academia_usuarios') || '[]');
            if (usuarios.find(u => u.email === email)) {
                this.mostrarMensagem('Este e-mail já está cadastrado!', 'error');
                return;
            }

            const novoUsuario = {
                id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                nome: nome,
                email: email,
                senha: senha, // Em produção, hash esta senha!
                tipo: tipo,
                status: status,
                telefone: telefone || null,
                observacoes: observacoes || null,
                permissoes: {
                    podeCriarTreinos: document.getElementById('podeCriarTreinos').checked,
                    podeCriarAvaliacoes: document.getElementById('podeCriarAvaliacoes').checked,
                    podeGerenciarAlunos: document.getElementById('podeGerenciarAlunos').checked,
                    podeGerenciarInstrutores: document.getElementById('podeGerenciarInstrutores').checked
                },
                dataCadastro: new Date().toISOString(),
                criadoPor: this.usuarioLogado.id
            };

            this.mostrarLoading('Salvando usuário...');

            // Salvar no localStorage
            usuarios.push(novoUsuario);
            localStorage.setItem('academia_usuarios', JSON.stringify(usuarios));

            this.mostrarMensagem('Usuário criado com sucesso!', 'success');
            setTimeout(() => {
                this.carregarUsuarios();
            }, 1500);

        } catch (error) {
            this.mostrarMensagem('Erro ao criar usuário: ' + error.message, 'error');
        } finally {
            this.esconderLoading();
        }
    }

    async editarUsuario(usuarioId) {
        try {
            const usuarios = JSON.parse(localStorage.getItem('academia_usuarios') || '[]');
            const usuario = usuarios.find(u => u.id === usuarioId);
            
            if (!usuario) {
                this.mostrarMensagem('Usuário não encontrado!', 'error');
                return;
            }

            document.getElementById('app').innerHTML = `
                <div class="page-header">
                    <h1>✏️ Editar Usuário: ${usuario.nome}</h1>
                    <button class="btn" onclick="academiaApp.carregarUsuarios()">
                        ← Voltar
                    </button>
                </div>

                <div class="form-container">
                    <form id="formEditarUsuario" class="usuario-form">
                        <div class="form-section">
                            <h3>👤 Dados Pessoais</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Nome completo *</label>
                                    <input type="text" id="nomeUsuario" value="${usuario.nome}" required>
                                </div>
                                <div class="form-group">
                                    <label>E-mail *</label>
                                    <input type="email" id="emailUsuario" value="${usuario.email}" required>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Nova Senha (deixe em branco para manter)</label>
                                    <input type="password" id="senhaUsuario" placeholder="Mínimo 6 caracteres" minlength="6">
                                </div>
                                <div class="form-group">
                                    <label>Confirmar Nova Senha</label>
                                    <input type="password" id="confirmarSenhaUsuario" placeholder="Digite novamente">
                                </div>
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>🏢 Dados de Acesso</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Tipo de Usuário *</label>
                                    <select id="tipoUsuario" required>
                                        <option value="ADMIN" ${usuario.tipo === 'ADMIN' ? 'selected' : ''}>Administrador</option>
                                        <option value="INSTRUTOR" ${usuario.tipo === 'INSTRUTOR' ? 'selected' : ''}>Instrutor</option>
                                        <option value="ALUNO" ${usuario.tipo === 'ALUNO' ? 'selected' : ''}>Aluno</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Status *</label>
                                    <select id="statusUsuario" required>
                                        <option value="ATIVO" ${(usuario.status || 'ATIVO') === 'ATIVO' ? 'selected' : ''}>Ativo</option>
                                        <option value="INATIVO" ${(usuario.status || 'ATIVO') === 'INATIVO' ? 'selected' : ''}>Inativo</option>
                                        <option value="BLOQUEADO" ${(usuario.status || 'ATIVO') === 'BLOQUEADO' ? 'selected' : ''}>Bloqueado</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Permissões Especiais</label>
                                <div class="checkbox-group">
                                    <label>
                                        <input type="checkbox" id="podeCriarTreinos" value="true" 
                                               ${usuario.permissoes?.podeCriarTreinos ? 'checked' : ''}>
                                        Pode criar planos de treino
                                    </label>
                                    <label>
                                        <input type="checkbox" id="podeCriarAvaliacoes" value="true" 
                                               ${(usuario.permissoes?.podeCriarAvaliacoes ?? true) ? 'checked' : ''}>
                                        Pode criar avaliações físicas
                                    </label>
                                    <label>
                                        <input type="checkbox" id="podeGerenciarAlunos" value="true" 
                                               ${usuario.permissoes?.podeGerenciarAlunos ? 'checked' : ''}>
                                        Pode gerenciar alunos
                                    </label>
                                    <label>
                                        <input type="checkbox" id="podeGerenciarInstrutores" value="true" 
                                               ${usuario.permissoes?.podeGerenciarInstrutores ? 'checked' : ''}>
                                        Pode gerenciar instrutores
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="form-section">
                            <h3>📞 Informações Adicionais</h3>
                            <div class="form-group">
                                <label>Telefone</label>
                                <input type="tel" id="telefoneUsuario" value="${usuario.telefone || ''}" 
                                       placeholder="(11) 99999-9999">
                            </div>
                            <div class="form-group">
                                <label>Observações</label>
                                <textarea id="observacoesUsuario" rows="3" 
                                          placeholder="Observações sobre o usuário...">${usuario.observacoes || ''}</textarea>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn btn-large btn-success">
                                💾 Atualizar Usuário
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="academiaApp.carregarUsuarios()">
                                ❌ Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            `;

            document.getElementById('formEditarUsuario').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.atualizarUsuario(usuarioId);
            });

        } catch (error) {
            this.mostrarMensagem('Erro ao carregar formulário: ' + error.message, 'error');
        }
    }

    async atualizarUsuario(usuarioId) {
        try {
            const usuarios = JSON.parse(localStorage.getItem('academia_usuarios') || '[]');
            const usuarioIndex = usuarios.findIndex(u => u.id === usuarioId);
            
            if (usuarioIndex === -1) {
                this.mostrarMensagem('Usuário não encontrado!', 'error');
                return;
            }

            const novaSenha = document.getElementById('senhaUsuario').value;
            const confirmarSenha = document.getElementById('confirmarSenhaUsuario').value;

            // Validação de senha se for alterada
            if (novaSenha && novaSenha.length < 6) {
                this.mostrarMensagem('A senha deve ter pelo menos 6 caracteres!', 'error');
                return;
            }

            if (novaSenha && novaSenha !== confirmarSenha) {
                this.mostrarMensagem('As senhas não coincidem!', 'error');
                return;
            }

            const usuarioAtualizado = {
                ...usuarios[usuarioIndex],
                nome: document.getElementById('nomeUsuario').value,
                email: document.getElementById('emailUsuario').value,
                tipo: document.getElementById('tipoUsuario').value,
                status: document.getElementById('statusUsuario').value,
                telefone: document.getElementById('telefoneUsuario').value || null,
                observacoes: document.getElementById('observacoesUsuario').value,
                permissoes: {
                    podeCriarTreinos: document.getElementById('podeCriarTreinos').checked,
                    podeCriarAvaliacoes: document.getElementById('podeCriarAvaliacoes').checked,
                    podeGerenciarAlunos: document.getElementById('podeGerenciarAlunos').checked,
                    podeGerenciarInstrutores: document.getElementById('podeGerenciarInstrutores').checked
                },
                dataAtualizacao: new Date().toISOString()
            };

            // Atualizar senha apenas se fornecida
            if (novaSenha) {
                usuarioAtualizado.senha = novaSenha; // Em produção, usar hash!
            }

            this.mostrarLoading('Atualizando usuário...');

            // Atualizar no array
            usuarios[usuarioIndex] = usuarioAtualizado;
            localStorage.setItem('academia_usuarios', JSON.stringify(usuarios));

            // Se estiver editando o próprio usuário logado, atualizar a sessão
            if (usuarioId === this.usuarioLogado.id) {
                this.usuarioLogado = usuarioAtualizado;
                localStorage.setItem(CONFIG.STORAGE.USER_KEY, JSON.stringify(usuarioAtualizado));
            }

            this.mostrarMensagem('Usuário atualizado com sucesso!', 'success');
            setTimeout(() => {
                this.carregarUsuarios();
            }, 1500);

        } catch (error) {
            this.mostrarMensagem('Erro ao atualizar usuário: ' + error.message, 'error');
        } finally {
            this.esconderLoading();
        }
    }

    excluirUsuario(usuarioId) {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            const usuarios = JSON.parse(localStorage.getItem('academia_usuarios') || '[]');
            const novasUsuarios = usuarios.filter(u => u.id !== usuarioId);
            localStorage.setItem('academia_usuarios', JSON.stringify(novasUsuarios));
            this.mostrarMensagem('Usuário excluído com sucesso!', 'success');
            this.carregarUsuarios();
        }
    }

    // 📈 RELATÓRIOS E ANALYTICS (Implementação Completa)
    async carregarRelatorios() {
        try {
            const alunos = await this.apiService.getAlunos();
            const instrutores = await this.apiService.getInstrutores();
            const treinos = await this.apiService.getTreinos();
            const avaliacoes = await this.apiService.getAvaliacoes();

            // Estatísticas avançadas
            const alunosPorPlano = {};
            const alunosPorMes = {};
            const avaliacoesPorMes = {};
            
            alunos.forEach(aluno => {
                // Por plano
                alunosPorPlano[aluno.plano] = (alunosPorPlano[aluno.plano] || 0) + 1;
                
                // Por mês de matrícula
                const mes = new Date(aluno.dataMatricula).getMonth() + 1;
                alunosPorMes[mes] = (alunosPorMes[mes] || 0) + 1;
            });

            avaliacoes.forEach(avaliacao => {
                const mes = new Date(avaliacao.dataAvaliacao).getMonth() + 1;
                avaliacoesPorMes[mes] = (avaliacoesPorMes[mes] || 0) + 1;
            });

            document.getElementById('app').innerHTML = `
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
                                    <span>${alunos.filter(a => a.status === 'ATIVO').length}</span>
                                </div>
                                <div class="stat-item">
                                    <strong>Taxa de Retenção:</strong>
                                    <span>${((alunos.filter(a => a.status === 'ATIVO').length / alunos.length) * 100).toFixed(1)}%</span>
                                </div>
                                <div class="stat-item">
                                    <strong>Total de Avaliações:</strong>
                                    <span>${avaliacoes.length}</span>
                                </div>
                                <div class="stat-item">
                                    <strong>Avaliações/Mês:</strong>
                                    <span>${(avaliacoes.length / 12).toFixed(1)}</span>
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
                                            <div class="bar-fill" style="width: ${(quantidade / alunos.length) * 100}%"></div>
                                        </div>
                                        <span class="plano-percent">${((quantidade / alunos.length) * 100).toFixed(1)}%</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Performance de Instrutores -->
                        <div class="relatorio-card full-width">
                            <h3>🏆 Performance de Instrutores</h3>
                            <div class="table-container">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>Instrutor</th>
                                            <th>Alunos Atribuídos</th>
                                            <th>Avaliações Realizadas</th>
                                            <th>Treinos Criados</th>
                                            <th>Satisfação Média</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${instrutores.map(instrutor => {
                                            const alunosInstrutor = alunos.filter(a => a.instrutorId === instrutor.id);
                                            const avaliacoesInstrutor = avaliacoes.filter(a => a.instrutorId === instrutor.id);
                                            const treinosInstrutor = treinos.filter(t => t.criadorId === instrutor.id);
                                            
                                            return `
                                                <tr>
                                                    <td>
                                                        <div class="user-avatar">
                                                            <span>${instrutor.nome.charAt(0)}</span>
                                                            <strong>${instrutor.nome}</strong>
                                                        </div>
                                                    </td>
                                                    <td>${alunosInstrutor.length}</td>
                                                    <td>${avaliacoesInstrutor.length}</td>
                                                    <td>${treinosInstrutor.length}</td>
                                                    <td>
                                                        <span class="rating">★★★★☆</span>
                                                        <span class="rating-text">4.2/5</span>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- Evolução Mensal -->
                        <div class="relatorio-card full-width">
                            <h3>📈 Evolução Mensal</h3>
                            <div class="evolucao-mensal">
                                <div class="evolucao-item">
                                    <h4>Novos Alunos por Mês</h4>
                                    <div class="meses-grid">
                                        ${[1,2,3,4,5,6,7,8,9,10,11,12].map(mes => `
                                            <div class="mes-item">
                                                <div class="mes-nome">${this.getNomeMes(mes)}</div>
                                                <div class="mes-valor">${alunosPorMes[mes] || 0}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                                <div class="evolucao-item">
                                    <h4>Avaliações por Mês</h4>
                                    <div class="meses-grid">
                                        ${[1,2,3,4,5,6,7,8,9,10,11,12].map(mes => `
                                            <div class="mes-item">
                                                <div class="mes-nome">${this.getNomeMes(mes)}</div>
                                                <div class="mes-valor">${avaliacoesPorMes[mes] || 0}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="relatorio-actions">
                        <button class="btn btn-primary" onclick="academiaApp.exportarRelatorio()">
                            📥 Exportar Relatório
                        </button>
                        <button class="btn btn-success" onclick="academiaApp.gerarRelatorioCompleto()">
                            📊 Relatório Completo
                        </button>
                    </div>
                </div>
            `;

        } catch (error) {
            this.mostrarMensagem('Erro ao carregar relatórios', 'error');
        }
    }

    getNomeMes(mes) {
        const meses = [
            'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
            'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
        ];
        return meses[mes - 1] || '';
    }

    async exportarRelatorio() {
        try {
            this.mostrarLoading('Gerando arquivo de exportação...');
            
            const alunos = await this.apiService.getAlunos();
            const instrutores = await this.apiService.getInstrutores();
            const treinos = await this.apiService.getTreinos();
            const avaliacoes = await this.apiService.getAvaliacoes();

            // Criar dados CSV
            const dadosCSV = [
                // Cabeçalho
                ['Tipo', 'ID', 'Nome', 'Email', 'Telefone', 'Status', 'Data Cadastro', 'Plano', 'Instrutor'],
                
                // Alunos
                ...alunos.map(aluno => [
                    'ALUNO',
                    aluno.id,
                    aluno.nome,
                    aluno.email,
                    aluno.telefone,
                    aluno.status,
                    new Date(aluno.dataMatricula).toLocaleDateString('pt-BR'),
                    aluno.plano,
                    aluno.instrutorId || 'Não atribuído'
                ]),
                
                // Separador
                [],
                
                // Instrutores
                ['Tipo', 'ID', 'Nome', 'Email', 'CREF', 'Especialidade', 'Turno', 'Status'],
                ...instrutores.map(instrutor => [
                    'INSTRUTOR',
                    instrutor.id,
                    instrutor.nome,
                    instrutor.email,
                    instrutor.cref,
                    instrutor.especialidade,
                    instrutor.turno,
                    instrutor.status
                ]),
                
                // Separador
                [],
                
                // Avaliações
                ['Tipo', 'ID', 'Aluno', 'Data', 'Peso', 'Altura', 'IMC', '% Gordura', 'Instrutor'],
                ...avaliacoes.map(av => {
                    const aluno = alunos.find(a => a.id === av.alunoId);
                    const imc = av.composicaoCorporal?.imc || this.calcularIMC(av.peso, av.altura);
                    
                    return [
                        'AVALIACAO',
                        av.id,
                        aluno?.nome || 'N/A',
                        new Date(av.dataAvaliacao).toLocaleDateString('pt-BR'),
                        av.peso,
                        av.altura,
                        imc.toFixed(1),
                        av.composicaoCorporal?.percentualGordura || '--',
                        this.usuarioLogado.nome
                    ];
                })
            ];

            // Converter para CSV
            const csvContent = dadosCSV.map(row => 
                row.map(cell => `"${cell}"`).join(',')
            ).join('\n');

            // Criar blob e link de download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', `relatorio_academia_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.mostrarMensagem('Relatório exportado com sucesso!', 'success');

        } catch (error) {
            this.mostrarMensagem('Erro ao exportar relatório: ' + error.message, 'error');
        } finally {
            this.esconderLoading();
        }
    }

    async gerarRelatorioCompleto() {
        try {
            this.mostrarLoading('Gerando relatório completo...');
            
            const alunos = await this.apiService.getAlunos();
            const instrutores = await this.apiService.getInstrutores();
            const treinos = await this.apiService.getTreinos();
            const avaliacoes = await this.apiService.getAvaliacoes();

            // Calcular estatísticas
            const estatisticas = {
                totalAlunos: alunos.length,
                alunosAtivos: alunos.filter(a => a.status === 'ATIVO').length,
                alunosInativos: alunos.filter(a => a.status === 'INATIVO').length,
                totalInstrutores: instrutores.length,
                totalTreinos: treinos.length,
                totalAvaliacoes: avaliacoes.length,
                
                distribuicaoPlanos: alunos.reduce((acc, aluno) => {
                    acc[aluno.plano] = (acc[aluno.plano] || 0) + 1;
                    return acc;
                }, {}),
                
                avaliacoesPorMes: avaliacoes.reduce((acc, av) => {
                    const mes = new Date(av.dataAvaliacao).getMonth();
                    acc[mes] = (acc[mes] || 0) + 1;
                    return acc;
                }, {}),
                
                alunosPorInstrutor: alunos.reduce((acc, aluno) => {
                    if (aluno.instrutorId) {
                        const instrutor = instrutores.find(i => i.id === aluno.instrutorId);
                        if (instrutor) {
                            const nome = instrutor.nome;
                            acc[nome] = (acc[nome] || 0) + 1;
                        }
                    }
                    return acc;
                }, {})
            };

            // Criar relatório HTML
            const relatorioHTML = `
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Relatório Completo - Academia Fit</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 40px; 
                            color: #333;
                            line-height: 1.6;
                        }
                        .header { 
                            text-align: center; 
                            border-bottom: 3px solid #4CAF50; 
                            padding-bottom: 20px; 
                            margin-bottom: 30px; 
                        }
                        .header h1 { 
                            color: #2c3e50; 
                            margin: 0; 
                            font-size: 28px;
                        }
                        .header .subtitle { 
                            color: #7f8c8d; 
                            font-size: 16px; 
                            margin-top: 10px;
                        }
                        .section { 
                            margin-bottom: 40px; 
                            page-break-inside: avoid;
                        }
                        .section h2 { 
                            color: #3498db; 
                            border-bottom: 2px solid #eee; 
                            padding-bottom: 10px; 
                            margin-top: 30px;
                        }
                        .stats-grid {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                            gap: 20px;
                            margin: 20px 0;
                        }
                        .stat-card {
                            background: #f8f9fa;
                            border: 1px solid #dee2e6;
                            border-radius: 8px;
                            padding: 20px;
                            text-align: center;
                        }
                        .stat-number {
                            font-size: 32px;
                            font-weight: bold;
                            color: #4CAF50;
                            margin: 10px 0;
                        }
                        .stat-label {
                            color: #6c757d;
                            font-size: 14px;
                        }
                        .table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin: 20px 0; 
                            font-size: 14px;
                        }
                        .table th, .table td { 
                            border: 1px solid #ddd; 
                            padding: 12px; 
                            text-align: left; 
                        }
                        .table th { 
                            background-color: #f8f9fa; 
                            color: #2c3e50; 
                            font-weight: bold;
                        }
                        .table tr:nth-child(even) {
                            background-color: #f9f9f9;
                        }
                        .badge { 
                            display: inline-block; 
                            padding: 5px 10px; 
                            border-radius: 4px; 
                            font-size: 12px; 
                            font-weight: bold; 
                        }
                        .badge-success { background-color: #d4edda; color: #155724; }
                        .badge-warning { background-color: #fff3cd; color: #856404; }
                        .badge-danger { background-color: #f8d7da; color: #721c24; }
                        .badge-info { background-color: #d1ecf1; color: #0c5460; }
                        .footer { 
                            margin-top: 50px; 
                            text-align: center; 
                            color: #7f8c8d; 
                            font-size: 14px; 
                            border-top: 1px solid #ddd;
                            padding-top: 20px;
                        }
                        .logo { 
                            font-size: 24px; 
                            font-weight: bold; 
                            color: #4CAF50; 
                            margin-bottom: 10px;
                        }
                        .chart-container {
                            margin: 20px 0;
                            padding: 20px;
                            background: #f8f9fa;
                            border-radius: 8px;
                        }
                        .print-button {
                            text-align: center;
                            margin: 30px 0;
                        }
                        @media print {
                            .print-button { display: none; }
                            body { margin: 10px; }
                            .section { page-break-inside: avoid; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">🏋️ ACADEMIA FIT PRO</div>
                        <h1>Relatório Completo do Sistema</h1>
                        <div class="subtitle">Período: ${new Date().toLocaleDateString('pt-BR')}</div>
                    </div>

                    <div class="print-button">
                        <button onclick="window.print()" style="
                            background: #4CAF50;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 16px;
                        ">
                            🖨️ Imprimir Relatório
                        </button>
                    </div>

                    <div class="section">
                        <h2>📊 Estatísticas Gerais</h2>
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-number">${estatisticas.totalAlunos}</div>
                                <div class="stat-label">Total de Alunos</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">${estatisticas.alunosAtivos}</div>
                                <div class="stat-label">Alunos Ativos</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">${estatisticas.totalInstrutores}</div>
                                <div class="stat-label">Instrutores</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">${estatisticas.totalAvaliacoes}</div>
                                <div class="stat-label">Avaliações Realizadas</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">${estatisticas.totalTreinos}</div>
                                <div class="stat-label">Planos de Treino</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number">${((estatisticas.alunosAtivos / estatisticas.totalAlunos) * 100).toFixed(1)}%</div>
                                <div class="stat-label">Taxa de Retenção</div>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <h2>📋 Distribuição por Plano</h2>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Plano</th>
                                    <th>Quantidade</th>
                                    <th>Percentual</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(estatisticas.distribuicaoPlanos).map(([plano, quantidade]) => `
                                    <tr>
                                        <td>${plano}</td>
                                        <td>${quantidade}</td>
                                        <td>${((quantidade / estatisticas.totalAlunos) * 100).toFixed(1)}%</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <div class="section">
                        <h2>👥 Alunos por Instrutor</h2>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Instrutor</th>
                                    <th>Alunos Atribuídos</th>
                                    <th>Percentual</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(estatisticas.alunosPorInstrutor).map(([instrutor, quantidade]) => `
                                    <tr>
                                        <td>${instrutor}</td>
                                        <td>${quantidade}</td>
                                        <td>${((quantidade / estatisticas.totalAlunos) * 100).toFixed(1)}%</td>
                                    </tr>
                                `).join('')}
                                <tr>
                                    <td><strong>Total</strong></td>
                                    <td><strong>${estatisticas.totalAlunos}</strong></td>
                                    <td><strong>100%</strong></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="section">
                        <h2>📈 Evolução de Avaliações</h2>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Mês</th>
                                    <th>Avaliações Realizadas</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${Object.entries(estatisticas.avaliacoesPorMes).map(([mes, quantidade]) => `
                                    <tr>
                                        <td>${this.getNomeMesCompleto(parseInt(mes) + 1)}</td>
                                        <td>${quantidade}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <div class="section">
                        <h2>📋 Lista de Alunos Ativos</h2>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Plano</th>
                                    <th>Instrutor</th>
                                    <th>Status</th>
                                    <th>Data Matrícula</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${alunos.filter(a => a.status === 'ATIVO').slice(0, 50).map(aluno => {
                                    const instrutor = instrutores.find(i => i.id === aluno.instrutorId);
                                    return `
                                        <tr>
                                            <td>${aluno.nome}</td>
                                            <td><span class="badge badge-info">${aluno.plano}</span></td>
                                            <td>${instrutor ? instrutor.nome : 'Não atribuído'}</td>
                                            <td><span class="badge badge-success">${aluno.status}</span></td>
                                            <td>${new Date(aluno.dataMatricula).toLocaleDateString('pt-BR')}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>

                    <div class="footer">
                        <p>Relatório gerado automaticamente pelo Sistema Academia Fit Pro</p>
                        <p>Data de geração: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}</p>
                        <p>Gerado por: ${this.usuarioLogado.nome} (${this.usuarioLogado.tipo})</p>
                    </div>

                    <script>
                        // Auto-print após carregar (opcional)
                        window.onload = function() {
                            setTimeout(() => {
                                window.print();
                            }, 1000);
                        };
                    </script>
                </body>
                </html>
            `;

            // Abrir em nova janela para impressão
            const janelaRelatorio = window.open('', '_blank');
            janelaRelatorio.document.write(relatorioHTML);
            janelaRelatorio.document.close();

        } catch (error) {
            this.mostrarMensagem('Erro ao gerar relatório completo: ' + error.message, 'error');
        } finally {
            this.esconderLoading();
        }
    }

    // 🆕 MÉTODO AUXILIAR PARA NOME DO MÊS COMPLETO
    getNomeMesCompleto(mes) {
        const meses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return meses[mes - 1] || '';
    }

    // 📊 NOVA AVALIAÇÃO PARA ALUNO ESPECÍFICO
    criarAvaliacaoParaAluno(alunoId) {
        this.criarAvaliacao(alunoId);
    }

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

    // 🔗 INTEGRAÇÃO COM BACKEND REAL (Substituir mock data)
    async integrarComBackend() {
        try {
            // Exemplo: Substituir window.mockData.alunos por chamada real
            const respostaAlunos = await fetch(`${CONFIG.API.BASE_URL}/alunos`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!respostaAlunos.ok) {
                throw new Error('Erro ao carregar alunos');
            }
            
            return await respostaAlunos.json();
            
        } catch (error) {
            console.error('Erro na integração:', error);
            throw error;
        }
    }

    // 🔒 VALIDAÇÃO DE PERMISSÕES (Melhoria de segurança)
    verificarPermissao(permissaoRequerida) {
        if (!this.usuarioLogado) return false;
        
        const permissoes = {
            'ADMIN': ['gerenciar_usuarios', 'gerenciar_instrutores', 'gerenciar_alunos', 'gerenciar_treinos', 'gerenciar_avaliacoes'],
            'INSTRUTOR': ['gerenciar_alunos', 'gerenciar_treinos', 'gerenciar_avaliacoes'],
            'ALUNO': ['ver_proprios_dados', 'ver_treinos']
        };
        
        return permissoes[this.usuarioLogado.tipo]?.includes(permissaoRequerida) || false;
    }
}

// 🚀 FUNÇÃO DE INICIALIZAÇÃO GLOBAL
function inicializarAplicacao() {
    window.academiaApp = new AcademiaApp();
    
    // Adicionar event listener para erros não tratados
    window.addEventListener('error', function(event) {
        console.error('Erro não tratado:', event.error);
        if (window.academiaApp) {
            window.academiaApp.mostrarMensagem('Ocorreu um erro inesperado. Tente novamente.', 'error');
        }
    });
    
    // Adicionar event listener para offline/online
    window.addEventListener('offline', function() {
        if (window.academiaApp) {
            window.academiaApp.mostrarMensagem('Você está offline. Algumas funcionalidades podem não estar disponíveis.', 'warning');
        }
    });
    
    window.addEventListener('online', function() {
        if (window.academiaApp) {
            window.academiaApp.mostrarMensagem('Conexão restabelecida!', 'success');
        }
    });
    
    // Inicializar Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(function(registration) {
                console.log('Service Worker registrado com sucesso:', registration);
            })
            .catch(function(error) {
                console.log('Falha ao registrar Service Worker:', error);
            });
    }
}

// Executar quando o DOM estiver carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarAplicacao);
} else {
    inicializarAplicacao();
}

// Exportar para uso global
window.AcademiaApp = AcademiaApp;
window.inicializarAplicacao = inicializarAplicacao;

// Inicialização imediata para desenvolvimento
if (window.academiaApp === undefined) {
    inicializarAplicacao();
}