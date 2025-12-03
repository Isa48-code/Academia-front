// Modelos de dados do sistema
class Usuario {
    constructor(data = {}) {
        this.id = data.id || `user_${Date.now()}`;
        this.nome = data.nome || '';
        this.email = data.email || '';
        this.senha = data.senha || '';
        this.telefone = data.telefone || '';
        this.tipo = data.tipo || 'ALUNO';
        this.dataCadastro = data.dataCadastro || new Date().toISOString();
        this.status = data.status || 'ATIVO';
        this.foto = data.foto || null;
    }
}

class Aluno {
    constructor(data = {}) {
        this.id = data.id || `aluno_${Date.now()}`;
        this.usuarioId = data.usuarioId || null;
        this.nome = data.nome || '';
        this.email = data.email || '';
        this.telefone = data.telefone || '';
        this.cpf = data.cpf || '';
        this.dataNascimento = data.dataNascimento || '';
        this.endereco = data.endereco || {
            rua: '',
            numero: '',
            cidade: '',
            estado: ''
        };
        this.plano = data.plano || 'MENSAL';
        this.status = data.status || 'ATIVO';
        this.dataMatricula = data.dataMatricula || new Date().toISOString();
        this.instrutorId = data.instrutorId || null;
        this.observacoes = data.observacoes || '';
    }
}

class Instrutor {
    constructor(data = {}) {
        this.id = data.id || `instrutor_${Date.now()}`;
        this.usuarioId = data.usuarioId || null;
        this.nome = data.nome || '';
        this.email = data.email || '';
        this.telefone = data.telefone || '';
        this.especialidade = data.especialidade || '';
        this.cref = data.cref || '';
        this.turno = data.turno || 'MANHA';
        this.status = data.status || 'ATIVO';
        this.dataAdmissao = data.dataAdmissao || new Date().toISOString();
    }
}

class Treino {
    constructor(data = {}) {
        this.id = data.id || `treino_${Date.now()}`;
        this.nome = data.nome || '';
        this.descricao = data.descricao || '';
        this.tipo = data.tipo || 'MUSCULACAO';
        this.dificuldade = data.dificuldade || 'INICIANTE';
        this.duracao = data.duracao || 4;
        this.exercicios = data.exercicios || [];
        this.alunos = data.alunos || [];
        this.instrutorId = data.instrutorId || null;
        this.status = data.status || 'ATIVO';
        this.dataCriacao = data.dataCriacao || new Date().toISOString();
    }
}

class AvaliacaoFisica {
    constructor(data = {}) {
        this.id = data.id || `avaliacao_${Date.now()}`;
        this.alunoId = data.alunoId || null;
        this.instrutorId = data.instrutorId || null;
        this.dataAvaliacao = data.dataAvaliacao || new Date().toISOString();
        
        // Medidas básicas
        this.peso = data.peso || 0;
        this.altura = data.altura || 0;
        
        // Circunferências
        this.circunferencias = data.circunferencias || {
            torax: null,
            abdominal: null,
            cintura: null,
            quadril: null,
            bracoDireito: null,
            bracoEsquerdo: null,
            antebracoDireito: null,
            antebracoEsquerdo: null,
            coxaDireita: null,
            coxaEsquerda: null,
            panturrilhaDireita: null,
            panturrilhaEsquerda: null
        };
        
        // Dobras cutâneas
        this.dobrasCutaneas = data.dobrasCutaneas || {
            triceps: null,
            subescapular: null,
            suprailiaca: null,
            abdominal: null,
            coxa: null,
            panturrilha: null
        };
        
        // Composição corporal
        this.composicaoCorporal = data.composicaoCorporal || {
            percentualGordura: null,
            massaMagra: null,
            massaGorda: null,
            aguaCorporal: null,
            imc: null
        };
        
        // Capacidades físicas
        this.capacidadesFisicas = data.capacidadesFisicas || {
            flexibilidade: null,
            forcaAbdominal: null,
            resistenciaCardio: null,
            forcaSuperior: null,
            forcaInferior: null
        };
        
        this.observacoes = data.observacoes || '';
        this.metas = data.metas || '';
        this.status = data.status || 'COMPLETA';
    }
    
    calcularIMC() {
        if (this.altura > 0) {
            const imc = this.peso / ((this.altura / 100) ** 2);
            this.composicaoCorporal.imc = parseFloat(imc.toFixed(2));
            return this.composicaoCorporal.imc;
        }
        return 0;
    }
    
    classificarIMC() {
        const imc = this.calcularIMC();
        if (imc < 18.5) return { classificacao: 'ABAIXO_PESO', cor: 'warning' };
        if (imc < 25) return { classificacao: 'PESO_NORMAL', cor: 'success' };
        if (imc < 30) return { classificacao: 'SOBREPESO', cor: 'warning' };
        if (imc < 35) return { classificacao: 'OBESIDADE_I', cor: 'danger' };
        if (imc < 40) return { classificacao: 'OBESIDADE_II', cor: 'danger' };
        return { classificacao: 'OBESIDADE_III', cor: 'danger' };
    }
}

// Export para uso global
window.DataModels = {
    Usuario,
    Aluno,
    Instrutor,
    Treino,
    AvaliacaoFisica
};