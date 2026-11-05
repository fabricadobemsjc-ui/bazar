// Módulo de Contribuições
const Contribuicoes = {
    listaElement: null,
    contribuicaoEditando: null,

    init() {
        this.listaElement = document.getElementById('lista-contribuicoes');
        this.configurarFiltros();
        this.renderizar();
    },

    configurarFiltros() {
        const hoje = Utils.dataAtual();
        const inicioMes = hoje.substring(0, 8) + '01';
        document.getElementById('filtro-contrib-inicio').value = inicioMes;
        document.getElementById('filtro-contrib-fim').value = hoje;
    },

    renderizar() {
        this.filtrar();
    },

    filtrar() {
        const inicio = document.getElementById('filtro-contrib-inicio').value;
        const fim = document.getElementById('filtro-contrib-fim').value;

        const filtros = {
            tipo: 'contribuicao',
            dataInicio: inicio,
            dataFim: fim
        };

        const contribuicoes = DB.getTransacoesFiltradas(filtros);

        if (contribuicoes.length === 0) {
            this.listaElement.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-muted);">
                        Nenhuma contribuição encontrada
                    </td>
                </tr>
            `;
            return;
        }

        this.listaElement.innerHTML = contribuicoes.map(contrib => `
            <tr>
                <td>${Utils.formatarDataHora(contrib.data, contrib.hora)}</td>
                <td><strong>${contrib.contribuinte?.nome || 'Anônimo'}</strong></td>
                <td><strong style="color: var(--success-color);">${Utils.formatarMoeda(contrib.valor)}</strong></td>
                <td>${contrib.observacao || '-'}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-primary" onclick="Contribuicoes.editar('${contrib.id}')">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="Contribuicoes.excluir('${contrib.id}')">Excluir</button>
                </td>
            </tr>
        `).join('');
    },

    abrirModal(contribuicao = null) {
        this.contribuicaoEditando = contribuicao;
        const titulo = contribuicao ? 'Editar Contribuição' : 'Nova Contribuição';

        const conteudo = `
            <form id="form-contribuicao" onsubmit="Contribuicoes.salvar(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label>Data</label>
                        <input type="date" name="data" value="${contribuicao?.data || Utils.dataAtual()}" required>
                    </div>
                    <div class="form-group">
                        <label>Hora</label>
                        <input type="time" name="hora" value="${contribuicao?.hora || Utils.horaAtual()}" required>
                    </div>
                </div>

                <div class="form-group autocomplete-container">
                    <label>Contribuinte</label>
                    <input type="text" id="contribuinte-nome" value="${contribuicao?.contribuinte?.nome || ''}"
                           placeholder="Digite para buscar ou deixe em branco para anônimo">
                    <input type="hidden" id="contribuinte-id" value="${contribuicao?.contribuinte?.id || ''}">
                    <div class="autocomplete-list"></div>
                </div>

                <div class="form-group">
                    <label>Valor *</label>
                    <input type="number" name="valor" step="0.01" min="0.01" value="${contribuicao?.valor || ''}" required>
                </div>

                <div class="form-group">
                    <label>Observação</label>
                    <textarea name="observacao" placeholder="Ex: Contribuição mensal, Doação específica...">${contribuicao?.observacao || ''}</textarea>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="Modal.fechar()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Salvar</button>
                </div>
            </form>
        `;

        Modal.abrir(titulo, conteudo);

        // Inicializar autocomplete
        setTimeout(() => {
            Clientes.criarAutocomplete('contribuinte-nome', 'contribuinte-id');
        }, 100);
    },

    editar(id) {
        const contribuicao = DB.getTransacao(id);
        if (contribuicao) {
            this.abrirModal(contribuicao);
        }
    },

    salvar(event) {
        event.preventDefault();
        const form = event.target;

        const contribuinteId = document.getElementById('contribuinte-id').value;
        const contribuinteNome = document.getElementById('contribuinte-nome').value;
        const contribuinte = contribuinteId ? DB.getCliente(contribuinteId) : null;

        const dados = {
            tipo: 'contribuicao',
            data: form.data.value,
            hora: form.hora.value,
            contribuinte: contribuinte ? {
                id: contribuinte.id,
                nome: contribuinte.nome,
                cpf: contribuinte.cpf,
                telefone: contribuinte.telefone
            } : (contribuinteNome ? { nome: contribuinteNome } : null),
            valor: parseFloat(form.valor.value) || 0,
            observacao: form.observacao.value.trim()
        };

        if (this.contribuicaoEditando) {
            DB.atualizarTransacao(this.contribuicaoEditando.id, dados);
            Utils.toast('Contribuição atualizada!', 'success');
        } else {
            DB.adicionarTransacao(dados);
            Utils.toast('Contribuição registrada!', 'success');
        }

        Modal.fechar();
        this.filtrar();
        this.contribuicaoEditando = null;
    },

    excluir(id) {
        const contrib = DB.getTransacao(id);
        if (contrib && Utils.confirmar('Deseja excluir esta contribuição?')) {
            DB.excluirTransacao(id);
            Utils.toast('Contribuição excluída!', 'success');
            this.filtrar();
        }
    }
};
