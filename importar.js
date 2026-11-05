// Módulo de Importação CSV
const Importar = {
    csv(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const lines = content.split('\n').filter(line => line.trim());

                if (lines.length < 2) {
                    Utils.toast('Arquivo CSV vazio ou inválido!', 'error');
                    return;
                }

                // Pular cabeçalho
                const dataLines = lines.slice(1);
                let importados = 0;
                let duplicados = 0;

                const transacoesExistentes = DB.getTransacoes();
                const idsExistentes = new Set(transacoesExistentes.map(t => t.id));

                dataLines.forEach(line => {
                    const campos = this.parseCsvLine(line);

                    if (campos.length < 10) return;

                    const [id, tipo, data, hora, nome, cpf, telefone, descricao, itens, valor, observacao] = campos;

                    // Verificar se já existe
                    if (idsExistentes.has(id)) {
                        duplicados++;
                        return;
                    }

                    let transacao = {
                        id: id || Utils.gerarId(),
                        tipo: tipo,
                        data: data,
                        hora: hora
                    };

                    if (tipo === 'roupa') {
                        transacao.cliente = nome ? { nome, cpf, telefone } : null;
                        transacao.itens = this.parseItens(itens);
                        transacao.total = parseFloat(valor) || 0;
                    } else if (tipo === 'artesanato') {
                        transacao.descricao = descricao;
                        transacao.valor = parseFloat(valor) || 0;
                    } else if (tipo === 'contribuicao') {
                        transacao.contribuinte = nome ? { nome, cpf, telefone } : null;
                        transacao.valor = parseFloat(valor) || 0;
                        transacao.observacao = observacao || '';
                    }

                    transacoesExistentes.push(transacao);
                    importados++;
                });

                DB.salvarTransacoes(transacoesExistentes);

                let msg = `${importados} transações importadas!`;
                if (duplicados > 0) {
                    msg += ` (${duplicados} duplicadas ignoradas)`;
                }

                Utils.toast(msg, 'success');
                LivroCaixa.carregar();

            } catch (err) {
                console.error(err);
                Utils.toast('Erro ao processar arquivo CSV!', 'error');
            }
        };

        reader.readAsText(file, 'UTF-8');
        input.value = '';
    },

    parseCsvLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current.trim());
        return result;
    },

    parseItens(itensStr) {
        if (!itensStr) return [];

        return itensStr.split(';').map(item => {
            const [peca, tamanho, cor, valor] = item.split('|');
            return {
                peca: peca || '',
                tamanho: tamanho || '',
                cor: cor || '',
                valor: parseFloat(valor) || 0
            };
        }).filter(i => i.peca);
    }
};
