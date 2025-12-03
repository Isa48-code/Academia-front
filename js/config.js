// Configurações do sistema
const CONFIG = {
    APP: {
        NAME: 'Academia Fit',
        VERSION: '1.0.0',
        DESCRIPTION: 'Sistema Profissional de Gestão Acadêmica'
    },
    API: {
        BASE_URL: 'http://localhost:8080/api',
        MOCK_MODE: true, // Mudar para false quando backend estiver pronto
        TIMEOUT: 10000
    },
    ENDPOINTS: {
        // Autenticação
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/register',
            LOGOUT: '/auth/logout',
            REFRESH: '/auth/refresh'
        },
        // Entidades principais
        USUARIOS: '/usuarios',
        ALUNOS: '/alunos',
        INSTRUTORES: '/instrutores',
        TREINOS: '/treinos',
        AVALIACOES: '/avaliacoes',
        EXERCICIOS: '/exercicios'
    },
    STORAGE: {
        USER_KEY: 'academia_user',
        TOKEN_KEY: 'academia_token',
        AVALIACOES_KEY: 'academia_avaliacoes'
    }
};

window.CONFIG = CONFIG;