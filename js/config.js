// config.js - SEM MOCK
const CONFIG = {
    APP: {
        NAME: 'Academia Fit',
        VERSION: '1.0.0'
    },
    API: {
        BASE_URL: 'http://localhost:8080/api',
        MOCK_MODE: false, // SEMPRE FALSE
        TIMEOUT: 10000
    },
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/auth/login',
            REGISTER: '/auth/cadastro', // Pode ser diferente
            LOGOUT: '/auth/logout'
        },
        ALUNOS: '/alunos',
        INSTRUTORES: '/instrutores',
        TREINOS: '/treinos',
        AVALIACOES: '/avaliacoes'
    },
    STORAGE: {
        USER_KEY: 'academia_user',
        TOKEN_KEY: 'academia_token'
    }
};

window.CONFIG = CONFIG;