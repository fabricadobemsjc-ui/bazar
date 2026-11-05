// Módulo de banco de dados (localStorage)
const DB = {
    // Chaves
    KEYS: {
        CLIENTES: 'bdob_clientes',
        TRANSACOES: 'bdob_transacoes',
        SAIDAS: 'bdob_saidas_', // + YYYY-MM
        SALDO_ANTERIOR: 'bdob_saldo_anterior_' // + YYYY-MM
    },

    // ========== CLIENTES ==========
    getClientes() {
        const data = localStorage.getItem(this.KEYS.CLIENTES);
        return data ? JSON.parse(data) : [];
    },

    salvarClientes(clientes) {
        localStorage.setItem(this.KEYS.CLIENTES, JSON.stringify(clientes));
    },

    getCliente(id) {
        return this.getClientes().find(c => c.id === id);
    },

    adicionarCliente(cliente) {
        const clientes = this.getClientes();
        cliente.id = Utils.gerarId();
        clientes.push(cliente);
        this.salvarClientes(clientes);
        return cliente;
    },

    atualizarCliente(id, dados) {
        const clientes = this.getClientes();
        const index = clientes.findIndex(c => c.id === id);
        if (index !== -1) {
            clientes[index] = { ...clientes[index], ...dados };
            this.salvarClientes(clientes);
            return clientes[index];
        }
        return null;
    },

    excluirCliente(id) {
        const clientes = this.getClientes().filter(c => c.id !== id);
        this.salvarClientes(clientes);
    },

    buscarClientes(termo) {
        if (!termo) return this.getClientes();
        termo = termo.toLowerCase();
        return this.getClientes().filter(c =>
            c.nome?.toLowerCase().includes(termo) ||
            c.cpf?.includes(termo) ||
            c.telefone?.includes(termo) ||
            c.email?.toLowerCase().includes(termo)
        );
    },

    // ========== TRANSAÇÕES ==========
    getTransacoes() {
        const data = localStorage.getItem(this.KEYS.TRANSACOES);
        return data ? JSON.parse(data) : [];
    },

    salvarTransacoes(transacoes) {
        localStorage.setItem(this.KEYS.TRANSACOES, JSON.stringify(transacoes));
    },

    getTransacao(id) {
        return this.getTransacoes().find(t => t.id === id);
    },

    adicionarTransacao(transacao) {
        const transacoes = this.getTransacoes();
        transacao.id = Utils.gerarId();
        transacao.data = transacao.data || Utils.dataAtual();
        transacao.hora = transacao.hora || Utils.horaAtual();
        transacoes.push(transacao);
        this.salvarTransacoes(transacoes);
        return transacao;
    },

    atualizarTransacao(id, dados) {
        const transacoes = this.getTransacoes();
        const index = transacoes.findIndex(t => t.id === id);
        if (index !== -1) {
            transacoes[index] = { ...transacoes[index], ...dados };
            this.salvarTransacoes(transacoes);
            return transacoes[index];
        }
        return null;
    },

    excluirTransacao(id) {
        const transacoes = this.getTransacoes().filter(t => t.id !== id);
        this.salvarTransacoes(transacoes);
    },

    getTransacoesPorTipo(tipo) {
        return this.getTransacoes().filter(t => t.tipo === tipo);
    },

    getTransacoesPorMes(mesAno) {
        return this.getTransacoes().filter(t =>
            Utils.extrairMes(t.data) === mesAno
        );
    },

    getTransacoesFiltradas(filtros = {}) {
        let transacoes = this.getTransacoes();

        if (filtros.tipo) {
            transacoes = transacoes.filter(t => t.tipo === filtros.tipo);
        }

        if (filtros.dataInicio) {
            transacoes = transacoes.filter(t => t.data >= filtros.dataInicio);
        }

        if (filtros.dataFim) {
            transacoes = transacoes.filter(t => t.data <= filtros.dataFim);
        }

        if (filtros.mesAno) {
            transacoes = transacoes.filter(t =>
                Utils.extrairMes(t.data) === filtros.mesAno
            );
        }

        return transacoes.sort((a, b) => {
            const dataA = `${a.data} ${a.hora}`;
            const dataB = `${b.data} ${b.hora}`;
            return dataB.localeCompare(dataA);
        });
    },

    // ========== SAÍDAS ==========
    getSaidas(mesAno) {
        const key = this.KEYS.SAIDAS + mesAno;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    salvarSaidas(mesAno, saidas) {
        const key = this.KEYS.SAIDAS + mesAno;
        localStorage.setItem(key, JSON.stringify(saidas));
    },

    adicionarSaida(mesAno, saida) {
        const saidas = this.getSaidas(mesAno);
        saida.id = Utils.gerarId();
        saidas.push(saida);
        this.salvarSaidas(mesAno, saidas);
        return saida;
    },

    atualizarSaida(mesAno, id, dados) {
        const saidas = this.getSaidas(mesAno);
        const index = saidas.findIndex(s => s.id === id);
        if (index !== -1) {
            saidas[index] = { ...saidas[index], ...dados };
            this.salvarSaidas(mesAno, saidas);
            return saidas[index];
        }
        return null;
    },

    excluirSaida(mesAno, id) {
        const saidas = this.getSaidas(mesAno).filter(s => s.id !== id);
        this.salvarSaidas(mesAno, saidas);
    },

    getTotalSaidas(mesAno) {
        return this.getSaidas(mesAno).reduce((total, s) => total + (s.valor || 0), 0);
    },

    // ========== SALDO ANTERIOR ==========
    getSaldoAnterior(mesAno) {
        const key = this.KEYS.SALDO_ANTERIOR + mesAno;
        const data = localStorage.getItem(key);
        return data ? parseFloat(data) : 0;
    },

    setSaldoAnterior(mesAno, valor) {
        const key = this.KEYS.SALDO_ANTERIOR + mesAno;
        localStorage.setItem(key, valor.toString());
    },

    // ========== CÁLCULOS ==========
    getTotalEntradas(mesAno) {
        const transacoes = this.getTransacoesPorMes(mesAno);
        return transacoes.reduce((total, t) => {
            if (t.tipo === 'roupa') {
                return total + (t.total || 0);
            } else if (t.tipo === 'artesanato' || t.tipo === 'contribuicao') {
                return total + (t.valor || 0);
            }
            return total;
        }, 0);
    },

    getSaldoAtual(mesAno) {
        const saldoAnterior = this.getSaldoAnterior(mesAno);
        const entradas = this.getTotalEntradas(mesAno);
        const saidas = this.getTotalSaidas(mesAno);
        return saldoAnterior + entradas - saidas;
    },

    getResumoMes(mesAno) {
        const transacoes = this.getTransacoesPorMes(mesAno);

        const vendasRoupas = transacoes
            .filter(t => t.tipo === 'roupa')
            .reduce((total, t) => total + (t.total || 0), 0);

        const vendasArtesanato = transacoes
            .filter(t => t.tipo === 'artesanato')
            .reduce((total, t) => total + (t.valor || 0), 0);

        const contribuicoes = transacoes
            .filter(t => t.tipo === 'contribuicao')
            .reduce((total, t) => total + (t.valor || 0), 0);

        const saidas = this.getTotalSaidas(mesAno);
        const saldoAnterior = this.getSaldoAnterior(mesAno);
        const totalEntradas = vendasRoupas + vendasArtesanato + contribuicoes;

        return {
            saldoAnterior,
            vendasRoupas,
            vendasArtesanato,
            contribuicoes,
            totalEntradas,
            saidas,
            saldoFinal: saldoAnterior + totalEntradas - saidas
        };
    },

    // ========== ÚLTIMAS TRANSAÇÕES ==========
    getUltimasTransacoes(limite = 10) {
        const transacoes = this.getTransacoes();
        return transacoes
            .sort((a, b) => {
                const dataA = `${a.data} ${a.hora}`;
                const dataB = `${b.data} ${b.hora}`;
                return dataB.localeCompare(dataA);
            })
            .slice(0, limite);
    }
};
