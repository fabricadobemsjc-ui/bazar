// Módulo de Vendas
const Vendas = {
    vendaEditando: null,
    itensRoupa: [],

    // Lista de produtos com valores pré-definidos
    produtos: [
        { nome: 'Bermuda', valor: 40.00 },
        { nome: 'Bermuda Infantil', valor: 20.00 },
        { nome: 'Bicho de Pelúcia', valor: 22.00 },
        { nome: 'Blusa de Inverno Grossa', valor: 50.00 },
        { nome: 'Blusa de Inverno Fina', valor: 40.00 },
        { nome: 'Bolsa', valor: 20.00 },
        { nome: 'Boné', valor: 10.00 },
        { nome: 'Brinco/Anel', valor: 5.00 },
        { nome: 'Cacharrel', valor: 35.00 },
        { nome: 'Calça de Ginástica', valor: 35.00 },
        { nome: 'Calça Jeans', valor: 50.00 },
        { nome: 'Calça Jeans Bordada', valor: 60.00 },
        { nome: 'Calça Social', valor: 50.00 },
        { nome: 'Calçado Adulto', valor: 40.00 },
        { nome: 'Calçado Infantil', valor: 15.00 },
        { nome: 'Calcinha', valor: 10.00 },
        { nome: 'Calcinha Infantil', valor: 7.00 },
        { nome: 'Camiseta Adulto M/D', valor: 35.00 },
        { nome: 'Camiseta Polo', valor: 35.00 },
        { nome: 'Camiseta Adulto', valor: 30.00 },
        { nome: 'Camiseta Inf M/D', valor: 20.00 },
        { nome: 'Camisa Social', valor: 35.00 },
        { nome: 'Camiseta Infantil', valor: 15.00 },
        { nome: 'Cinto', valor: 5.00 },
        { nome: 'Colar', valor: 10.00 },
        { nome: 'Cropped', valor: 25.00 },
        { nome: 'Cueca', valor: 10.00 },
        { nome: 'Garrafa para Água', valor: 10.00 },
        { nome: 'Jaqueta', valor: 60.00 },
        { nome: 'Macacão', valor: 50.00 },
        { nome: 'Maiô', valor: 35.00 },
        { nome: 'Meia Branca', valor: 7.00 },
        { nome: 'Meia Colorida', valor: 10.00 },
        { nome: 'Meia Infantil', valor: 5.00 },
        { nome: 'Mochila', valor: 30.00 },
        { nome: 'Moleton', valor: 45.00 },
        { nome: 'Pantufa', valor: 15.00 },
        { nome: 'Pijama', valor: 40.00 },
        { nome: 'Pulseira', valor: 7.00 },
        { nome: 'Relógio', valor: 10.00 },
        { nome: 'Saia', valor: 35.00 },
        { nome: 'Sapatilhas', valor: 10.00 },
        { nome: 'Short Infantil', valor: 20.00 },
        { nome: 'Shorts', valor: 35.00 },
        { nome: '1 Soutien', valor: 20.00 },
        { nome: '2 Soutien', valor: 35.00 },
        { nome: 'Travesseiro Viagem', valor: 15.00 },
        { nome: 'Vestido Longo', valor: 50.00 },
        { nome: 'Vestido Curto', valor: 40.00 },
        { nome: 'Vestido Infantil', valor: 30.00 }
    ],

    // Desconto atual
    descontoAtual: { tipo: 'valor', quantidade: 0 },

    // Inicialização para vendas.html
    initVendas() {
        this.configurarFiltrosRoupas();
        this.configurarFiltrosArtesanato();
        this.filtrarRoupas();
        this.filtrarArtesanato();
    },

    configurarFiltrosRoupas() {
        const hoje = Utils.dataAtual();
        const inicioMes = hoje.substring(0, 8) + '01';
        const inicio = document.getElementById('filtro-roupas-inicio');
        const fim = document.getElementById('filtro-roupas-fim');
        if (inicio) inicio.value = inicioMes;
        if (fim) fim.value = hoje;
    },

    configurarFiltrosArtesanato() {
        const hoje = Utils.dataAtual();
        const inicioMes = hoje.substring(0, 8) + '01';
        const inicio = document.getElementById('filtro-artesanato-inicio');
        const fim = document.getElementById('filtro-artesanato-fim');
        if (inicio) inicio.value = inicioMes;
        if (fim) fim.value = hoje;
    },

    filtrarRoupas() {
        const inicio = document.getElementById('filtro-roupas-inicio')?.value;
        const fim = document.getElementById('filtro-roupas-fim')?.value;

        const filtros = { tipo: 'roupa', dataInicio: inicio, dataFim: fim };
        const vendas = DB.getTransacoesFiltradas(filtros);

        const lista = document.getElementById('lista-roupas');
        if (!lista) return;

        if (vendas.length === 0) {
            lista.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-muted);">
                        Nenhuma venda de roupa encontrada
                    </td>
                </tr>
            `;
            return;
        }

        lista.innerHTML = vendas.map(venda => `
            <tr>
                <td>${Utils.formatarDataHora(venda.data, venda.hora)}</td>
                <td>${venda.cliente?.nome || 'Cliente não informado'}</td>
                <td>${venda.itens?.length || 0} item(s)</td>
                <td><strong style="color: var(--success-color);">${Utils.formatarMoeda(venda.total)}</strong></td>
                <td class="actions">
                    <button class="btn btn-sm btn-primary" onclick="Vendas.visualizar('${venda.id}')">Ver</button>
                    <button class="btn btn-sm btn-danger" onclick="Vendas.excluirRoupa('${venda.id}')">Excluir</button>
                </td>
            </tr>
        `).join('');
    },

    filtrarArtesanato() {
        const inicio = document.getElementById('filtro-artesanato-inicio')?.value;
        const fim = document.getElementById('filtro-artesanato-fim')?.value;

        const filtros = { tipo: 'artesanato', dataInicio: inicio, dataFim: fim };
        const vendas = DB.getTransacoesFiltradas(filtros);

        const lista = document.getElementById('lista-artesanato');
        if (!lista) return;

        if (vendas.length === 0) {
            lista.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 40px; color: var(--text-muted);">
                        Nenhuma venda de artesanato encontrada
                    </td>
                </tr>
            `;
            return;
        }

        lista.innerHTML = vendas.map(venda => `
            <tr>
                <td>${Utils.formatarDataHora(venda.data, venda.hora)}</td>
                <td>${venda.descricao || '-'}</td>
                <td><strong style="color: var(--success-color);">${Utils.formatarMoeda(venda.valor)}</strong></td>
                <td class="actions">
                    <button class="btn btn-sm btn-primary" onclick="Vendas.editarArtesanato('${venda.id}')">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="Vendas.excluirArtesanato('${venda.id}')">Excluir</button>
                </td>
            </tr>
        `).join('');
    },

    // ========== ROUPA ==========
    abrirModalRoupa(venda = null) {
        this.vendaEditando = venda;
        this.itensRoupa = venda?.itens ? [...venda.itens] : [];
        this.descontoAtual = venda?.desconto || { tipo: 'valor', quantidade: 0 };

        const titulo = venda ? 'Editar Venda de Roupa' : 'Nova Venda de Roupa';

        const conteudo = `
            <form id="form-venda-roupa" onsubmit="Vendas.salvarRoupa(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label>Data</label>
                        <input type="date" name="data" value="${venda?.data || Utils.dataAtual()}" required>
                    </div>
                    <div class="form-group">
                        <label>Hora</label>
                        <input type="time" name="hora" value="${venda?.hora || Utils.horaAtual()}" required>
                    </div>
                </div>

                <div class="form-group autocomplete-container">
                    <label>Cliente</label>
                    <input type="text" id="cliente-nome" value="${venda?.cliente?.nome || ''}"
                           placeholder="Digite para buscar cliente...">
                    <input type="hidden" id="cliente-id" value="${venda?.cliente?.id || ''}">
                    <div class="autocomplete-list"></div>
                </div>

                <div class="itens-container">
                    <h4>Itens</h4>
                    <div id="itens-roupa-lista"></div>
                    <button type="button" class="btn btn-sm btn-secondary add-item-btn" onclick="Vendas.adicionarItemRoupa()">
                        + Adicionar Item
                    </button>
                </div>

                <div class="desconto-container" style="margin-top: 15px; padding: 15px; background: var(--bg-color); border-radius: 8px;">
                    <h4 style="margin-bottom: 10px;">Desconto</h4>
                    <div class="form-row" style="align-items: center;">
                        <div class="form-group" style="flex: 0 0 auto;">
                            <select id="desconto-tipo" onchange="Vendas.calcularTotalRoupa()">
                                <option value="valor" ${this.descontoAtual.tipo === 'valor' ? 'selected' : ''}>R$ (Valor)</option>
                                <option value="percentual" ${this.descontoAtual.tipo === 'percentual' ? 'selected' : ''}>% (Percentual)</option>
                            </select>
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <input type="number" id="desconto-valor" step="0.01" min="0"
                                   value="${this.descontoAtual.quantidade || ''}"
                                   placeholder="0,00"
                                   onchange="Vendas.calcularTotalRoupa()">
                        </div>
                    </div>
                </div>

                <div class="total-venda" style="margin-top: 15px;">
                    <div id="subtotal-venda-roupa" style="font-size: 0.9em; color: var(--text-muted);"></div>
                    <div id="desconto-aplicado" style="font-size: 0.9em; color: var(--danger-color);"></div>
                    Total: <span id="total-venda-roupa">${Utils.formatarMoeda(venda?.total || 0)}</span>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="Modal.fechar()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Salvar</button>
                </div>
            </form>
        `;

        Modal.abrir(titulo, conteudo);

        setTimeout(() => {
            Clientes.criarAutocomplete('cliente-nome', 'cliente-id');
            this.renderizarItensRoupa();
            if (this.itensRoupa.length === 0) {
                this.adicionarItemRoupa();
            }
        }, 100);
    },

    adicionarItemRoupa() {
        this.itensRoupa.push({ peca: '', tamanho: '', cor: '', valor: 0 });
        this.renderizarItensRoupa();
    },

    removerItemRoupa(index) {
        this.itensRoupa.splice(index, 1);
        this.renderizarItensRoupa();
        this.calcularTotalRoupa();
    },

    renderizarItensRoupa() {
        const container = document.getElementById('itens-roupa-lista');
        if (!container) return;

        container.innerHTML = this.itensRoupa.map((item, index) => `
            <div class="item-row">
                <select onchange="Vendas.selecionarProduto(${index}, this.value)" style="flex: 2;">
                    <option value="">Selecione o produto</option>
                    ${this.produtos.map(p =>
                        `<option value="${p.nome}" ${item.peca === p.nome ? 'selected' : ''}>${p.nome} - ${Utils.formatarMoeda(p.valor)}</option>`
                    ).join('')}
                </select>
                <select onchange="Vendas.atualizarItemRoupa(${index}, 'tamanho', this.value)">
                    <option value="">Tam.</option>
                    ${['PP', 'P', 'M', 'G', 'GG', 'XG', 'Único', ...Array.from({length: 26}, (_, i) => String(i * 2))].map(t =>
                        `<option value="${t}" ${item.tamanho === t ? 'selected' : ''}>${t}</option>`
                    ).join('')}
                </select>
                <input type="text" placeholder="Cor" value="${item.cor || ''}" style="flex: 1;"
                       onchange="Vendas.atualizarItemRoupa(${index}, 'cor', this.value)">
                <input type="number" placeholder="Valor" step="0.01" min="0" value="${item.valor || ''}" style="width: 80px;"
                       onchange="Vendas.atualizarItemRoupa(${index}, 'valor', parseFloat(this.value) || 0)">
                <button type="button" class="btn btn-sm btn-danger" onclick="Vendas.removerItemRoupa(${index})">×</button>
            </div>
        `).join('');
    },

    selecionarProduto(index, nomeProduto) {
        const produto = this.produtos.find(p => p.nome === nomeProduto);
        if (produto) {
            this.itensRoupa[index].peca = produto.nome;
            this.itensRoupa[index].valor = produto.valor;
            this.renderizarItensRoupa();
            this.calcularTotalRoupa();
        } else {
            this.itensRoupa[index].peca = '';
            this.itensRoupa[index].valor = 0;
            this.calcularTotalRoupa();
        }
    },

    atualizarItemRoupa(index, campo, valor) {
        this.itensRoupa[index][campo] = valor;
        if (campo === 'valor') {
            this.calcularTotalRoupa();
        }
    },

    calcularTotalRoupa() {
        const subtotal = this.itensRoupa.reduce((sum, item) => sum + (item.valor || 0), 0);

        // Obter valores de desconto
        const tipoDesconto = document.getElementById('desconto-tipo')?.value || 'valor';
        const valorDesconto = parseFloat(document.getElementById('desconto-valor')?.value) || 0;

        // Calcular desconto
        let desconto = 0;
        if (tipoDesconto === 'percentual') {
            desconto = subtotal * (valorDesconto / 100);
        } else {
            desconto = valorDesconto;
        }

        // Garantir que desconto não seja maior que o subtotal
        desconto = Math.min(desconto, subtotal);

        const total = subtotal - desconto;

        // Atualizar exibição
        const subtotalEl = document.getElementById('subtotal-venda-roupa');
        const descontoEl = document.getElementById('desconto-aplicado');
        const totalEl = document.getElementById('total-venda-roupa');

        if (subtotalEl) {
            subtotalEl.textContent = desconto > 0 ? `Subtotal: ${Utils.formatarMoeda(subtotal)}` : '';
        }
        if (descontoEl) {
            descontoEl.textContent = desconto > 0 ? `Desconto: -${Utils.formatarMoeda(desconto)}` : '';
        }
        if (totalEl) {
            totalEl.textContent = Utils.formatarMoeda(total);
        }

        // Salvar desconto atual
        this.descontoAtual = { tipo: tipoDesconto, quantidade: valorDesconto };

        return total;
    },

    salvarRoupa(event) {
        event.preventDefault();
        const form = event.target;

        const clienteId = document.getElementById('cliente-id').value;
        const clienteNome = document.getElementById('cliente-nome').value;
        const cliente = clienteId ? DB.getCliente(clienteId) : null;

        const itensValidos = this.itensRoupa.filter(i => i.peca && i.valor > 0);
        if (itensValidos.length === 0) {
            Utils.toast('Adicione pelo menos um item válido!', 'error');
            return;
        }

        // Calcular subtotal e desconto
        const subtotal = itensValidos.reduce((sum, item) => sum + item.valor, 0);
        const tipoDesconto = document.getElementById('desconto-tipo')?.value || 'valor';
        const valorDesconto = parseFloat(document.getElementById('desconto-valor')?.value) || 0;

        let desconto = 0;
        if (tipoDesconto === 'percentual') {
            desconto = subtotal * (valorDesconto / 100);
        } else {
            desconto = valorDesconto;
        }
        desconto = Math.min(desconto, subtotal);

        const dados = {
            tipo: 'roupa',
            data: form.data.value,
            hora: form.hora.value,
            cliente: cliente ? {
                id: cliente.id,
                nome: cliente.nome,
                cpf: cliente.cpf,
                telefone: cliente.telefone
            } : (clienteNome ? { nome: clienteNome } : null),
            itens: itensValidos,
            subtotal: subtotal,
            desconto: {
                tipo: tipoDesconto,
                quantidade: valorDesconto,
                valorCalculado: desconto
            },
            total: subtotal - desconto
        };

        if (this.vendaEditando) {
            DB.atualizarTransacao(this.vendaEditando.id, dados);
            Utils.toast('Venda atualizada!', 'success');
        } else {
            DB.adicionarTransacao(dados);
            Utils.toast('Venda registrada!', 'success');
        }

        Modal.fechar();
        this.filtrarRoupas();
        this.vendaEditando = null;
        this.itensRoupa = [];
        this.descontoAtual = { tipo: 'valor', quantidade: 0 };
    },

    excluirRoupa(id) {
        if (Utils.confirmar('Deseja excluir esta venda?')) {
            DB.excluirTransacao(id);
            Utils.toast('Venda excluída!', 'success');
            this.filtrarRoupas();
        }
    },

    // ========== ARTESANATO ==========
    abrirModalArtesanato(venda = null) {
        this.vendaEditando = venda;
        const titulo = venda ? 'Editar Venda de Artesanato' : 'Nova Venda de Artesanato';

        const conteudo = `
            <form id="form-venda-artesanato" onsubmit="Vendas.salvarArtesanato(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label>Data</label>
                        <input type="date" name="data" value="${venda?.data || Utils.dataAtual()}" required>
                    </div>
                    <div class="form-group">
                        <label>Hora</label>
                        <input type="time" name="hora" value="${venda?.hora || Utils.horaAtual()}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Descrição *</label>
                    <textarea name="descricao" required placeholder="Ex: Vaso de cerâmica, Quadro decorativo...">${venda?.descricao || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Valor *</label>
                    <input type="number" name="valor" step="0.01" min="0.01" value="${venda?.valor || ''}" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="Modal.fechar()">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Salvar</button>
                </div>
            </form>
        `;

        Modal.abrir(titulo, conteudo);
    },

    editarArtesanato(id) {
        const venda = DB.getTransacao(id);
        if (venda) {
            this.abrirModalArtesanato(venda);
        }
    },

    salvarArtesanato(event) {
        event.preventDefault();
        const form = event.target;

        const dados = {
            tipo: 'artesanato',
            data: form.data.value,
            hora: form.hora.value,
            descricao: form.descricao.value.trim(),
            valor: parseFloat(form.valor.value) || 0
        };

        if (this.vendaEditando) {
            DB.atualizarTransacao(this.vendaEditando.id, dados);
            Utils.toast('Venda atualizada!', 'success');
        } else {
            DB.adicionarTransacao(dados);
            Utils.toast('Venda registrada!', 'success');
        }

        Modal.fechar();
        this.filtrarArtesanato();
        this.vendaEditando = null;
    },

    excluirArtesanato(id) {
        if (Utils.confirmar('Deseja excluir esta venda?')) {
            DB.excluirTransacao(id);
            Utils.toast('Venda excluída!', 'success');
            this.filtrarArtesanato();
        }
    },

    // ========== VISUALIZAR ==========
    visualizar(id) {
        const venda = DB.getTransacao(id);
        if (!venda) return;

        let conteudo = '';

        if (venda.tipo === 'roupa') {
            const itensHtml = venda.itens?.map(item => `
                <tr>
                    <td>${item.peca}</td>
                    <td>${item.tamanho || '-'}</td>
                    <td>${item.cor || '-'}</td>
                    <td>${Utils.formatarMoeda(item.valor)}</td>
                </tr>
            `).join('') || '';

            // Verificar se tem desconto
            const temDesconto = venda.desconto && venda.desconto.valorCalculado > 0;
            const descontoInfo = temDesconto ? `
                <div style="margin-top: 10px; padding: 10px; background: var(--bg-color); border-radius: 8px;">
                    <p style="margin: 0;"><strong>Subtotal:</strong> ${Utils.formatarMoeda(venda.subtotal || venda.total)}</p>
                    <p style="margin: 5px 0; color: var(--danger-color);">
                        <strong>Desconto:</strong> -${Utils.formatarMoeda(venda.desconto.valorCalculado)}
                        (${venda.desconto.tipo === 'percentual' ? venda.desconto.quantidade + '%' : 'R$ ' + venda.desconto.quantidade.toFixed(2)})
                    </p>
                </div>
            ` : '';

            conteudo = `
                <div class="detalhes-venda">
                    <p><strong>Data/Hora:</strong> ${Utils.formatarDataHora(venda.data, venda.hora)}</p>
                    <p><strong>Cliente:</strong> ${venda.cliente?.nome || 'Não informado'}</p>
                    ${venda.cliente?.cpf ? `<p><strong>CPF:</strong> ${Utils.formatarCPF(venda.cliente.cpf)}</p>` : ''}
                    ${venda.cliente?.telefone ? `<p><strong>Telefone:</strong> ${Utils.formatarTelefone(venda.cliente.telefone)}</p>` : ''}

                    <h4 style="margin-top: 20px; margin-bottom: 10px;">Itens</h4>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Peça</th>
                                <th>Tamanho</th>
                                <th>Cor</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody>${itensHtml}</tbody>
                    </table>

                    ${descontoInfo}

                    <div class="total-venda">
                        Total: <strong>${Utils.formatarMoeda(venda.total)}</strong>
                    </div>
                </div>
            `;
        } else {
            conteudo = `
                <div class="detalhes-venda">
                    <p><strong>Data/Hora:</strong> ${Utils.formatarDataHora(venda.data, venda.hora)}</p>
                    <p><strong>Descrição:</strong> ${venda.descricao}</p>
                    <p><strong>Valor:</strong> ${Utils.formatarMoeda(venda.valor)}</p>
                </div>
            `;
        }

        Modal.abrir('Detalhes da Venda', conteudo);
    }
};
