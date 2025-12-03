// Dados mockados para desenvolvimento
window.mockData = {
    usuarios: [
        {
            id: 'admin_1',
            nome: 'Administrador Sistema',
            email: 'admin@academia.com',
            senha: 'senha123',
            telefone: '(11) 9999-9999',
            tipo: 'ADMIN',
            dataCadastro: '2024-01-01T00:00:00Z',
            status: 'ATIVO'
        },
        {
            id: 'instrutor_1',
            nome: 'Carlos Silva',
            email: 'carlos@academia.com',
            senha: 'senha123',
            telefone: '(11) 98888-8888',
            tipo: 'INSTRUTOR',
            dataCadastro: '2024-01-02T00:00:00Z',
            status: 'ATIVO'
        }
    ],
    
    alunos: [
        {
            id: 'aluno_1',
            usuarioId: 'user_aluno_1',
            nome: 'João da Silva',
            email: 'joao@email.com',
            telefone: '(11) 97777-7777',
            cpf: '123.456.789-00',
            dataNascimento: '1990-05-15',
            endereco: {
                rua: 'Rua das Flores',
                numero: '123',
                cidade: 'São Paulo',
                estado: 'SP'
            },
            plano: 'MENSAL',
            status: 'ATIVO',
            dataMatricula: '2024-01-10T00:00:00Z',
            instrutorId: 'instrutor_1',
            observacoes: 'Aluno dedicado'
        },
        {
            id: 'aluno_2',
            usuarioId: 'user_aluno_2',
            nome: 'Maria Santos',
            email: 'maria@email.com',
            telefone: '(11) 96666-6666',
            cpf: '987.654.321-00',
            dataNascimento: '1985-08-20',
            endereco: {
                rua: 'Av. Principal',
                numero: '456',
                cidade: 'São Paulo',
                estado: 'SP'
            },
            plano: 'TRIMESTRAL',
            status: 'ATIVO',
            dataMatricula: '2024-01-12T00:00:00Z',
            instrutorId: 'instrutor_1',
            observacoes: 'Foco em emagrecimento'
        }
    ],
    
    instrutores: [
        {
            id: 'instrutor_1',
            usuarioId: 'user_instrutor_1',
            nome: 'Carlos Silva',
            email: 'carlos@academia.com',
            telefone: '(11) 98888-8888',
            especialidade: 'Musculação e Condicionamento',
            cref: '012345-G/SP',
            turno: 'MANHA_TARDE',
            status: 'ATIVO',
            dataAdmissao: '2023-06-01T00:00:00Z'
        },
        {
            id: 'instrutor_2',
            usuarioId: 'user_instrutor_2',
            nome: 'Ana Oliveira',
            email: 'ana@academia.com',
            telefone: '(11) 97777-7777',
            especialidade: 'Pilates e Alongamento',
            cref: '054321-G/SP',
            turno: 'TARDE_NOITE',
            status: 'ATIVO',
            dataAdmissao: '2023-08-15T00:00:00Z'
        }
    ],
    
    treinos: [
        {
            id: 'treino_1',
            nome: 'Treino Iniciante - A',
            descricao: 'Treino básico para iniciantes',
            tipo: 'MUSCULACAO',
            dificuldade: 'INICIANTE',
            duracao: 8,
            exercicios: [
                {
                    nome: 'Supino Reto',
                    series: 3,
                    repeticoes: '12-15',
                    descanso: '60s',
                    observacoes: 'Foco na técnica'
                },
                {
                    nome: 'Agachamento Livre',
                    series: 3,
                    repeticoes: '12-15',
                    descanso: '60s',
                    observacoes: 'Manter coluna reta'
                },
                {
                    nome: 'Puxada Alta',
                    series: 3,
                    repeticoes: '12-15',
                    descanso: '60s'
                }
            ],
            alunos: ['aluno_1', 'aluno_2'],
            instrutorId: 'instrutor_1',
            status: 'ATIVO',
            dataCriacao: '2024-01-15T00:00:00Z'
        }
    ],
    
    avaliacoes: [
        {
            id: 'avaliacao_1',
            alunoId: 'aluno_1',
            instrutorId: 'instrutor_1',
            dataAvaliacao: '2024-01-20T10:00:00Z',
            peso: 75.5,
            altura: 175,
            circunferencias: {
                torax: 95,
                abdominal: 85,
                cintura: 80,
                quadril: 95,
                bracoDireito: 32,
                bracoEsquerdo: 31.5,
                coxaDireita: 55,
                coxaEsquerda: 54.5
            },
            composicaoCorporal: {
                percentualGordura: 18.5,
                massaMagra: 55,
                massaGorda: 13.9,
                imc: 24.7
            },
            capacidadesFisicas: {
                flexibilidade: 'Boa',
                forcaAbdominal: 25,
                resistenciaCardio: 'Moderada'
            },
            observacoes: 'Aluno com boa evolução muscular. Manter foco no fortalecimento abdominal.',
            metas: 'Reduzir percentual de gordura para 16% e aumentar massa muscular em 2kg.',
            status: 'COMPLETA'
        }
    ]
};