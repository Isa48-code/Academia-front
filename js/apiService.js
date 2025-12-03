// apiService.js - SIMPLIFICADO PARA INTEGRAÇÃO
class ApiService {
    constructor() {
        this.baseURL = CONFIG.API.BASE_URL;
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        const token = localStorage.getItem(CONFIG.STORAGE.TOKEN_KEY);
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    async request(endpoint, options = {}) {
        try {
            console.log(`API Call: ${options.method || 'GET'} ${endpoint}`);
            
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: this.getHeaders(),
                ...options
            });

            // Verificar se tem conteúdo antes de parsear JSON
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else if (response.status === 204) { // No Content
                data = { success: true };
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                // Verificar se é erro de autenticação
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem(CONFIG.STORAGE.TOKEN_KEY);
                    localStorage.removeItem(CONFIG.STORAGE.USER_KEY);
                    window.location.reload();
                    throw new Error('Sessão expirada. Faça login novamente.');
                }
                
                throw new Error(data.message || data || `Erro ${response.status}`);
            }

            return data;
            
        } catch (error) {
            console.error('API Error:', error);
            
            // Erros de conexão
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Servidor não disponível. Verifique se o backend está rodando.');
            }
            
            throw error;
        }
    }

    // ========== MÉTODOS ESPECÍFICOS ==========
    async login(email, senha) {
        const result = await this.request(CONFIG.ENDPOINTS.AUTH.LOGIN, {
            method: 'POST',
            body: JSON.stringify({ email, senha })
        });
        
        // Salvar token se retornado
        if (result.token || result.accessToken) {
            const token = result.token || result.accessToken;
            localStorage.setItem(CONFIG.STORAGE.TOKEN_KEY, token);
        }
        
        return result;
    }

    async register(userData) {
        return this.request(CONFIG.ENDPOINTS.AUTH.REGISTER, {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // ALUNOS
    async getAlunos() {
        return this.request(CONFIG.ENDPOINTS.ALUNOS);
    }

    async createAluno(alunoData) {
        return this.request(CONFIG.ENDPOINTS.ALUNOS, {
            method: 'POST',
            body: JSON.stringify(alunoData)
        });
    }

    async updateAluno(id, alunoData) {
        return this.request(`${CONFIG.ENDPOINTS.ALUNOS}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(alunoData)
        });
    }

    async deleteAluno(id) {
        return this.request(`${CONFIG.ENDPOINTS.ALUNOS}/${id}`, {
            method: 'DELETE'
        });
    }

    // INSTRUTORES
    async getInstrutores() {
        return this.request(CONFIG.ENDPOINTS.INSTRUTORES);
    }

    async createInstrutor(instrutorData) {
        return this.request(CONFIG.ENDPOINTS.INSTRUTORES, {
            method: 'POST',
            body: JSON.stringify(instrutorData)
        });
    }

    // TREINOS
    async getTreinos() {
        return this.request(CONFIG.ENDPOINTS.TREINOS);
    }

    async createTreino(treinoData) {
        return this.request(CONFIG.ENDPOINTS.TREINOS, {
            method: 'POST',
            body: JSON.stringify(treinoData)
        });
    }

    // AVALIAÇÕES
    async getAvaliacoes() {
        return this.request(CONFIG.ENDPOINTS.AVALIACOES);
    }

    async saveAvaliacao(avaliacaoData) {
        return this.request(CONFIG.ENDPOINTS.AVALIACOES, {
            method: 'POST',
            body: JSON.stringify(avaliacaoData)
        });
    }
}

window.apiService = new ApiService();