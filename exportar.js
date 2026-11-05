// Módulo de Exportação CSV
const Exportar = {
    csv() {
        const transacoes = DB.getTransacoes();

        if (transacoes.length === 0) {
            Utils.toast('Nenhuma transação para exportar!', 'error');
            return;
        }

        // Cabeçalho do CSV
        const headers = [
            'ID',
            'Tipo',
            'Data',
            'Hora',
            'Cliente/Contribuinte',
            'CPF',
            'Telefone',
            'Descricao',
            'Itens',
            'Valor',
            'Observacao'
        ];

        // Converter transações para linhas CSV
        const rows = transacoes.map(t => {
            let nome = '';
            let cpf = '';
            let telefone = '';
            let descricao = '';
            let itens = '';
            let valor = 0;
            let observacao = '';

            if (t.tipo === 'roupa') {
                nome = t.cliente?.nome || '';
                cpf = t.cliente?.cpf || '';
                telefone = t.cliente?.telefone || '';
                itens = t.itens?.map(i => `${i.peca}|${i.tamanho}|${i.cor}|${i.valor}`).join(';') || '';
                valor = t.total || 0;
            } else if (t.tipo === 'artesanato') {
                descricao = t.descricao || '';
                valor = t.valor || 0;
            } else if (t.tipo === 'contribuicao') {
                nome = t.contribuinte?.nome || '';
                cpf = t.contribuinte?.cpf || '';
                telefone = t.contribuinte?.telefone || '';
                valor = t.valor || 0;
                observacao = t.observacao || '';
            }

            return [
                t.id,
                t.tipo,
                t.data,
                t.hora,
                this.escapeCsv(nome),
                cpf,
                telefone,
                this.escapeCsv(descricao),
                this.escapeCsv(itens),
                valor.toFixed(2),
                this.escapeCsv(observacao)
            ];
        });

        // Montar CSV
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Download
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        const dataExport = new Date().toISOString().split('T')[0];
        link.setAttribute('href', url);
        link.setAttribute('download', `bazar_vendas_${dataExport}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        Utils.toast(`${transacoes.length} transações exportadas!`, 'success');
    },

    escapeCsv(str) {
        if (!str) return '';
        str = String(str);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    }
};
