// js/components/workoutBuilder.js
export class WorkoutBuilder {
    constructor() {
        this.exercicios = window.mockData.exercicios || [];
        this.treinoAtual = null;
        this.exerciciosSelecionados = [];
    }

    abrir(treino = null) {
        this.treinoAtual = treino;
        if (treino) {
            this.exerciciosSelecionados = [...treino.exercicios];
        } else {
            this.exerciciosSelecionados = [];
        }
        this.renderizarModal();
    }

    renderizarModal() {
        const modalHTML = `
            <div class="modal-overlay" id="workoutModal">
                <div class="modal-content large">
                    <div class="modal-header">
                        <h2>${this.treinoAtual ? 'Editar' : 'Criar'} Plano de Treino</h2>
                        <button class="close-btn" onclick="workoutBuilder.fechar()">×</button>
                    </div>
                    
                    <div class="workout-builder">
                        <!-- Formulário do Treino -->
                        <div class="workout-form-section">
                            <h3>📝 Informações do Treino</h3>
                            <form id="workoutForm">
                                <div class="form-group">
                                    <label>Nome do Treino *</label>
                                    <input type="text" id="workoutName" 
                                           value="${this.treinoAtual?.nome || ''}" 
                                           placeholder="Ex: Treino ABC Iniciante" required>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Tipo de Treino *</label>
                                        <select id="workoutType" required>
                                            <option value="">Selecione...</option>
                                            <option value="hipertrofia" ${this.treinoAtual?.tipo === 'hipertrofia' ? 'selected' : ''}>Hipertrofia</option>
                                            <option value="emagrecimento" ${this.treinoAtual?.tipo === 'emagrecimento' ? 'selected' : ''}>Emagrecimento</option>
                                            <option value="forca" ${this.treinoAtual?.tipo === 'forca' ? 'selected' : ''}>Força</option>
                                            <option value="resistencia" ${this.treinoAtual?.tipo === 'resistencia' ? 'selected' : ''}>Resistência</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Dificuldade *</label>
                                        <select id="workoutDifficulty" required>
                                            <option value="">Selecione...</option>
                                            <option value="iniciante" ${this.treinoAtual?.dificuldade === 'iniciante' ? 'selected' : ''}>Iniciante</option>
                                            <option value="intermediario" ${this.treinoAtual?.dificuldade === 'intermediario' ? 'selected' : ''}>Intermediário</option>
                                            <option value="avancado" ${this.treinoAtual?.dificuldade === 'avancado' ? 'selected' : ''}>Avançado</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Duração (semanas) *</label>
                                        <input type="number" id="workoutDuration" 
                                               value="${this.treinoAtual?.duracao || 4}" 
                                               min="1" max="12" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Status</label>
                                        <select id="workoutStatus">
                                            <option value="ativo" ${this.treinoAtual?.status === 'ativo' ? 'selected' : ''}>Ativo</option>
                                            <option value="inativo" ${this.treinoAtual?.status === 'inativo' ? 'selected' : ''}>Inativo</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label>Descrição do Treino</label>
                                    <textarea id="workoutDescription" rows="3" 
                                              placeholder="Descreva o objetivo deste treino...">${this.treinoAtual?.descricao || ''}</textarea>
                                </div>
                            </form>
                        </div>

                        <!-- Seleção de Exercícios -->
                        <div class="exercises-section">
                            <h3>💪 Exercícios do Treino</h3>
                            
                            <div class="exercise-search">
                                <input type="text" id="exerciseSearch" 
                                       placeholder="🔍 Buscar exercício por nome ou grupo muscular..."
                                       onkeyup="workoutBuilder.filtrarExercicios()">
                            </div>

                            <div class="exercises-container">
                                <!-- Biblioteca de Exercícios -->
                                <div class="exercise-library">
                                    <h4>Biblioteca de Exercícios</h4>
                                    <div class="exercise-list" id="exerciseList">
                                        ${this.renderizarBibliotecaExercicios()}
                                    </div>
                                </div>

                                <!-- Exercícios Selecionados -->
                                <div class="selected-exercises">
                                    <h4>Exercícios Selecionados 
                                        <span class="counter">(${this.exerciciosSelecionados.length})</span>
                                    </h4>
                                    <div class="selected-list" id="selectedExercisesList">
                                        ${this.renderizarExerciciosSelecionados()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button class="btn btn-secondary" onclick="workoutBuilder.fechar()">
                            Cancelar
                        </button>
                        <button class="btn btn-primary" onclick="workoutBuilder.salvarTreino()">
                            💾 ${this.treinoAtual ? 'Atualizar' : 'Criar'} Treino
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.configurarEventos();
    }

    renderizarBibliotecaExercicios() {
        return this.exercicios.map(exercicio => `
            <div class="exercise-item" data-id="${exercicio.id}">
                <div class="exercise-info">
                    <strong>${exercicio.nome}</strong>
                    <div class="exercise-details">
                        <span class="exercise-muscle">${exercicio.grupoMuscular}</span>
                        <span class="exercise-equipment">${exercicio.equipamento}</span>
                        <span class="exercise-difficulty ${exercicio.dificuldade}">${exercicio.dificuldade}</span>
                    </div>
                    <p class="exercise-instructions">${exercicio.instrucoes}</p>
                </div>
                <button class="btn btn-sm btn-success" 
                        onclick="workoutBuilder.adicionarExercicio('${exercicio.id}')"
                        ${this.exerciciosSelecionados.find(e => e.id === exercicio.id) ? 'disabled' : ''}>
                    ${this.exerciciosSelecionados.find(e => e.id === exercicio.id) ? '✓ Adicionado' : '+ Adicionar'}
                </button>
            </div>
        `).join('');
    }

    renderizarExerciciosSelecionados() {
        if (this.exerciciosSelecionados.length === 0) {
            return '<div class="empty-state">Nenhum exercício selecionado. Adicione exercícios da biblioteca.</div>';
        }

        return this.exerciciosSelecionados.map((exercicio, index) => `
            <div class="selected-exercise-item" data-id="${exercicio.id}">
                <div class="exercise-handle">☰</div>
                <div class="exercise-content">
                    <strong>${index + 1}. ${exercicio.nome}</strong>
                    <div class="exercise-config">
                        <div class="config-group">
                            <label>Séries:</label>
                            <input type="number" value="3" min="1" max="10" class="series-input">
                        </div>
                        <div class="config-group">
                            <label>Repetições:</label>
                            <input type="text" value="8-12" class="reps-input" placeholder="8-12">
                        </div>
                        <div class="config-group">
                            <label>Descanso:</label>
                            <input type="text" value="60s" class="rest-input" placeholder="60s">
                        </div>
                    </div>
                </div>
                <button class="btn btn-sm btn-danger" 
                        onclick="workoutBuilder.removerExercicio('${exercicio.id}')">
                    🗑️ Remover
                </button>
            </div>
        `).join('');
    }

    adicionarExercicio(exercicioId) {
        const exercicio = this.exercicios.find(e => e.id === exercicioId);
        if (exercicio && !this.exerciciosSelecionados.find(e => e.id === exercicioId)) {
            this.exerciciosSelecionados.push(exercicio);
            this.atualizarInterface();
        }
    }

    removerExercicio(exercicioId) {
        this.exerciciosSelecionados = this.exerciciosSelecionados.filter(e => e.id !== exercicioId);
        this.atualizarInterface();
    }

    filtrarExercicios() {
        const termo = document.getElementById('exerciseSearch').value.toLowerCase();
        const exerciseItems = document.querySelectorAll('.exercise-item');
        
        exerciseItems.forEach(item => {
            const texto = item.textContent.toLowerCase();
            item.style.display = texto.includes(termo) ? 'flex' : 'none';
        });
    }

    atualizarInterface() {
        document.getElementById('exerciseList').innerHTML = this.renderizarBibliotecaExercicios();
        document.getElementById('selectedExercisesList').innerHTML = this.renderizarExerciciosSelecionados();
        
        // Atualizar contador
        const counter = document.querySelector('.selected-exercises .counter');
        if (counter) {
            counter.textContent = `(${this.exerciciosSelecionados.length})`;
        }
    }

    configurarEventos() {
        // Configurar drag and drop básico
        this.configurarDragAndDrop();
    }

    configurarDragAndDrop() {
        // Implementação básica de drag and drop
        const selectedList = document.getElementById('selectedExercisesList');
        if (selectedList) {
            selectedList.addEventListener('dragstart', (e) => {
                if (e.target.classList.contains('selected-exercise-item')) {
                    e.dataTransfer.setData('text/plain', e.target.dataset.id);
                }
            });
            
            selectedList.addEventListener('dragover', (e) => {
                e.preventDefault();
            });
            
            selectedList.addEventListener('drop', (e) => {
                e.preventDefault();
                const exercicioId = e.dataTransfer.getData('text/plain');
                // Lógica de reordenação aqui
            });
        }
    }

    async salvarTreino() {
        const nome = document.getElementById('workoutName').value;
        const tipo = document.getElementById('workoutType').value;
        const dificuldade = document.getElementById('workoutDifficulty').value;
        const duracao = document.getElementById('workoutDuration').value;
        const status = document.getElementById('workoutStatus').value;
        const descricao = document.getElementById('workoutDescription').value;

        // Validação
        if (!nome || !tipo || !dificuldade || !duracao) {
            this.mostrarMensagem('Preencha todos os campos obrigatórios!', 'error');
            return;
        }

        if (this.exerciciosSelecionados.length === 0) {
            this.mostrarMensagem('Adicione pelo menos um exercício ao treino!', 'error');
            return;
        }

        const treinoData = {
            id: this.treinoAtual?.id || 'treino_' + Date.now(),
            nome: nome,
            tipo: tipo,
            dificuldade: dificuldade,
            duracao: parseInt(duracao),
            status: status,
            descricao: descricao,
            exercicios: this.exerciciosSelecionados,
            alunos: this.treinoAtual?.alunos || [],
            dataCriacao: this.treinoAtual?.dataCriacao || new Date().toISOString(),
            dataAtualizacao: new Date().toISOString()
        };

        try {
            // Simular salvamento (depois será API)
            if (this.treinoAtual) {
                // Atualizar treino existente
                const index = window.mockData.treinos.findIndex(t => t.id === this.treinoAtual.id);
                if (index !== -1) {
                    window.mockData.treinos[index] = treinoData;
                }
            } else {
                // Criar novo treino
                window.mockData.treinos.push(treinoData);
            }

            this.mostrarMensagem(`Treino "${nome}" salvo com sucesso!`, 'success');
            this.fechar();
            
            // Recarregar a página de treinos se existir
            if (window.academiaApp && window.academiaApp.carregarTreinos) {
                window.academiaApp.carregarTreinos();
            }
        } catch (error) {
            this.mostrarMensagem('Erro ao salvar treino: ' + error.message, 'error');
        }
    }

    fechar() {
        const modal = document.getElementById('workoutModal');
        if (modal) {
            modal.remove();
        }
    }

    mostrarMensagem(mensagem, tipo) {
        // Reutilizar a função do app principal
        if (window.academiaApp && window.academiaApp.mostrarMensagem) {
            window.academiaApp.mostrarMensagem(mensagem, tipo);
        } else {
            alert(mensagem);
        }
    }
}

// Instância global
window.workoutBuilder = new WorkoutBuilder();