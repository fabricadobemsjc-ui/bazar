// Módulo de Livro Caixa
const LivroCaixa = {
    mesAtual: null,

    init() {
        this.mesAtual = Utils.mesAtual();
        this.configurarFiltros();
        this.carregar();
        Saidas.init();
    },

    configurarFiltros() {
        const select = document.getElementById('filtro-mes');
        const meses = Utils.gerarMesesDisponiveis();

        select.innerHTML = meses.map(mes => `
            <option value="${mes}" ${mes === this.mesAtual ? 'selected' : ''}>
                ${Utils.formatarMes(mes)}
            </option>
        `).join('');
    },

    carregar() {
        this.mesAtual = document.getElementById('filtro-mes').value;

        // Atualizar título
        document.getElementById('livro-titulo').textContent = `Livro Caixa - ${Utils.formatarMes(this.mesAtual)}`;

        // Carregar saldo anterior
        const saldoAnterior = DB.getSaldoAnterior(this.mesAtual);
        document.getElementById('saldo-anterior-input').value = saldoAnterior.toFixed(2);

        // Buscar transações do mês
        const transacoes = DB.getTransacoesPorMes(this.mesAtual);
        const saidas = DB.getSaidas(this.mesAtual);

        // Montar lista de lançamentos
        const lancamentos = [];

        // Adicionar transações (entradas)
        transacoes.forEach(t => {
            let descricao = '';
            let valor = 0;

            if (t.tipo === 'roupa') {
                descricao = `Venda Roupa - ${t.cliente?.nome || 'Cliente não informado'}`;
                valor = t.total || 0;
            } else if (t.tipo === 'artesanato') {
                descricao = `Venda Artesanato - ${t.descricao || ''}`;
                valor = t.valor || 0;
            } else if (t.tipo === 'contribuicao') {
                descricao = `Contribuição - ${t.contribuinte?.nome || 'Anônimo'}`;
                valor = t.valor || 0;
            }

            lancamentos.push({
                data: t.data,
                hora: t.hora || '00:00',
                descricao: descricao,
                entrada: valor,
                saida: 0
            });
        });

        // Adicionar saídas
        saidas.forEach(s => {
            lancamentos.push({
                data: s.data,
                hora: '23:59',
                descricao: s.descricao,
                entrada: 0,
                saida: s.valor || 0
            });
        });

        // Ordenar por data
        lancamentos.sort((a, b) => {
            const dataA = `${a.data} ${a.hora}`;
            const dataB = `${b.data} ${b.hora}`;
            return dataA.localeCompare(dataB);
        });

        // Calcular totais
        const totalEntradas = lancamentos.reduce((sum, l) => sum + l.entrada, 0);
        const totalSaidas = lancamentos.reduce((sum, l) => sum + l.saida, 0);
        const saldoFinal = saldoAnterior + totalEntradas - totalSaidas;

        // Atualizar resumo
        document.getElementById('valor-anterior').textContent = Utils.formatarMoeda(saldoAnterior);
        document.getElementById('valor-entradas').textContent = Utils.formatarMoeda(totalEntradas);
        document.getElementById('valor-saidas').textContent = Utils.formatarMoeda(totalSaidas);
        document.getElementById('valor-final').textContent = Utils.formatarMoeda(saldoFinal);

        // Renderizar tabela
        const tbody = document.getElementById('lista-lancamentos');

        if (lancamentos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-muted);">
                        Nenhum lançamento neste mês
                    </td>
                </tr>
            `;
            return;
        }

        let saldoAcumulado = saldoAnterior;

        tbody.innerHTML = lancamentos.map(l => {
            saldoAcumulado += l.entrada - l.saida;

            return `
                <tr>
                    <td>${Utils.formatarData(l.data)}</td>
                    <td>${l.descricao}</td>
                    <td class="lancamento-entrada">
                        ${l.entrada > 0 ? '+ ' + Utils.formatarMoeda(l.entrada) : '-'}
                    </td>
                    <td class="lancamento-saida">
                        ${l.saida > 0 ? '- ' + Utils.formatarMoeda(l.saida) : '-'}
                    </td>
                    <td><strong>${Utils.formatarMoeda(saldoAcumulado)}</strong></td>
                </tr>
            `;
        }).join('');

        // Atualizar lista de saídas
        Saidas.mesAtual = this.mesAtual;
        Saidas.renderizarLista();
    },

    salvarSaldoAnterior() {
        const input = document.getElementById('saldo-anterior-input');
        const valor = parseFloat(input.value) || 0;
        DB.setSaldoAnterior(this.mesAtual, valor);
        Utils.toast('Saldo anterior atualizado!', 'success');
        this.carregar();
    }
};
