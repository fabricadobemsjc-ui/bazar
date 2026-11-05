// Módulo de Saídas/Despesas
const Saidas = {
    mesAtual: null,
    saidaEditando: null,

    init() {
        this.mesAtual = Utils.mesAtual();
    },

    renderizarLista() {
        const lista = document.getElementById('lista-saidas');
        if (!lista) return;

        const saidas = DB.getSaidas(this.mesAtual);

        if (saidas.length === 0) {
            lista.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 40px; color: var(--text-muted);">
                        Nenhuma saída registrada neste mês
                    </td>
                </tr>
            `;
            return;
        }

        // Ordenar por data
        saidas.sort((a, b) => b.data.localeCompare(a.data));

        lista.innerHTML = saidas.map(saida => `
            <tr>
                <td>${Utils.formatarData(saida.data)}</td>
                <td>${saida.descricao || '-'}</td>
                <td><strong style="color: var(--danger-color);">${Utils.formatarMoeda(saida.valor)}</strong></td>
                <td class="actions">
                    <button class="btn btn-sm btn-primary" onclick="Saidas.editar('${saida.id}')">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="Saidas.excluir('${saida.id}')">Excluir</button>
                </td>
            </tr>
        `).join('');
    },

    abrirModal(saida = null) {
        this.saidaEditando = saida;
        const titulo = saida ? 'Editar Saída' : 'Nova Saída';

        const dataDefault = saida?.data || Utils.dataAtual();

        const conteudo = `
            <form id="form-saida" onsubmit="Saidas.salvar(event)">
                <div class="form-group">
                    <label>Data *</label>
                    <input type="date" name="data" value="${dataDefault}" required>
                </div>
                <div class="form-group">
                    <label>Descrição *</label>
                    <input type="text" name="descricao" value="${saida?.descricao || ''}" required
                           placeholder="Ex: Compra de material, Conta de luz...">
                </div>
                <div class="form-group">
                    <label>Valor *</label>
                    <input type="number" name="valor" step="0.01" min="0.01" value="${saida?.valor || ''}" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="Modal.fechar()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Salvar</button>
                </div>
            </form>
        `;

        Modal.abrir(titulo, conteudo);
    },

    editar(id) {
        const saidas = DB.getSaidas(this.mesAtual);
        const saida = saidas.find(s => s.id === id);
        if (saida) {
            this.abrirModal(saida);
        }
    },

    salvar(event) {
        event.preventDefault();
        const form = event.target;

        const dados = {
            data: form.data.value,
            descricao: form.descricao.value.trim(),
            valor: parseFloat(form.valor.value) || 0
        };

        const mesSaida = Utils.extrairMes(dados.data);

        if (this.saidaEditando) {
            const mesOriginal = Utils.extrairMes(this.saidaEditando.data);
            if (mesOriginal !== mesSaida) {
                DB.excluirSaida(mesOriginal, this.saidaEditando.id);
                DB.adicionarSaida(mesSaida, dados);
            } else {
                DB.atualizarSaida(mesSaida, this.saidaEditando.id, dados);
            }
            Utils.toast('Saída atualizada!', 'success');
        } else {
            DB.adicionarSaida(mesSaida, dados);
            Utils.toast('Saída registrada!', 'success');
        }

        Modal.fechar();

        // Atualizar livro caixa
        if (typeof LivroCaixa !== 'undefined') {
            if (mesSaida !== this.mesAtual) {
                LivroCaixa.configurarFiltros();
                document.getElementById('filtro-mes').value = mesSaida;
            }
            LivroCaixa.carregar();
        }

        this.saidaEditando = null;
    },

    excluir(id) {
        if (Utils.confirmar('Deseja excluir esta saída?')) {
            DB.excluirSaida(this.mesAtual, id);
            Utils.toast('Saída excluída!', 'success');

            if (typeof LivroCaixa !== 'undefined') {
                LivroCaixa.carregar();
            }
        }
    }
};
