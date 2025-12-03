// Serviço de comunicação com API
class ApiService {
    constructor() {
        this.baseURL = CONFIG.API.BASE_URL;
        this.mockMode = CONFIG.API.MOCK_MODE;
    }

    // Headers padrão
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        const user = JSON.parse(localStorage.getItem(CONFIG.STORAGE.USER_KEY) || 'null');
        if (user && user.token) {
            headers['Authorization'] = `Bearer ${user.token}`;
        }

        return headers;
    }

    // Request genérico
    async request(endpoint, options = {}) {
        if (this.mockMode) {
            return this.mockRequest(endpoint, options);
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: this.getHeaders(),
                timeout: CONFIG.API.TIMEOUT,
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Mock requests para desenvolvimento
    async mockRequest(endpoint, options = {}) {
        // Simula delay de rede
        await new Promise(resolve => setTimeout(resolve, 500));

        const method = options.method || 'GET';
        const body = options.body ? JSON.parse(options.body) : {};

        // Mock de autenticação
        if (endpoint === CONFIG.ENDPOINTS.AUTH.LOGIN && method === 'POST') {
            const user = mockData.usuarios.find(u => 
                u.email === body.email && u.senha === body.senha
            );
            
            if (user) {
                return {
                    success: true,
                    user: { ...user, token: 'mock_jwt_token' },
                    message: 'Login realizado com sucesso'
                };
            } else {
                throw new Error('Credenciais inválidas');
            }
        }

        // Mock de dados
        if (endpoint === CONFIG.ENDPOINTS.ALUNOS && method === 'GET') {
            return mockData.alunos;
        }

        if (endpoint === CONFIG.ENDPOINTS.INSTRUTORES && method === 'GET') {
            return mockData.instrutores;
        }

        if (endpoint === CONFIG.ENDPOINTS.TREINOS && method === 'GET') {
            return mockData.treinos;
        }

        if (endpoint === CONFIG.ENDPOINTS.AVALIACOES) {
            if (method === 'GET') {
                const stored = localStorage.getItem(CONFIG.STORAGE.AVALIACOES_KEY);
                return stored ? JSON.parse(stored) : mockData.avaliacoes;
            }
            if (method === 'POST') {
                const avaliacoes = JSON.parse(localStorage.getItem(CONFIG.STORAGE.AVALIACOES_KEY) || '[]');
                const novaAvaliacao = { ...body, id: `avaliacao_${Date.now()}` };
                avaliacoes.push(novaAvaliacao);
                localStorage.setItem(CONFIG.STORAGE.AVALIACOES_KEY, JSON.stringify(avaliacoes));
                return novaAvaliacao;
            }
        }

        // Fallback
        return { success: true, message: 'Mock operation completed' };
    }

    // Métodos específicos
    async login(email, senha) {
        return this.request(CONFIG.ENDPOINTS.AUTH.LOGIN, {
            method: 'POST',
            body: JSON.stringify({ email, senha })
        });
    }

    async getAlunos() {
        return this.request(CONFIG.ENDPOINTS.ALUNOS);
    }

    async getInstrutores() {
        return this.request(CONFIG.ENDPOINTS.INSTRUTORES);
    }

    async getTreinos() {
        return this.request(CONFIG.ENDPOINTS.TREINOS);
    }

    async getAvaliacoes() {
        return this.request(CONFIG.ENDPOINTS.AVALIACOES);
    }

    async saveAvaliacao(avaliacao) {
        return this.request(CONFIG.ENDPOINTS.AVALIACOES, {
            method: 'POST',
            body: JSON.stringify(avaliacao)
        });
    }

    async updateAvaliacao(id, avaliacao) {
        return this.request(`${CONFIG.ENDPOINTS.AVALIACOES}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(avaliacao)
        });
    }

    async deleteAvaliacao(id) {
        return this.request(`${CONFIG.ENDPOINTS.AVALIACOES}/${id}`, {
            method: 'DELETE'
        });
    }
}

// Instância global do serviço
window.apiService = new ApiService();