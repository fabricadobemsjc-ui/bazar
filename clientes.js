// Módulo de Clientes
const Clientes = {
    listaElement: null,
    clienteEditando: null,

    init() {
        this.listaElement = document.getElementById('lista-clientes');
        this.renderizar();
    },

    renderizar(clientes = null) {
        const lista = clientes || DB.getClientes();

        if (lista.length === 0) {
            this.listaElement.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-muted);">
                        Nenhum cliente cadastrado
                    </td>
                </tr>
            `;
            return;
        }

        this.listaElement.innerHTML = lista.map(cliente => `
            <tr>
                <td><strong>${cliente.nome || '-'}</strong></td>
                <td>${Utils.formatarCPF(cliente.cpf) || '-'}</td>
                <td>${Utils.formatarTelefone(cliente.telefone) || '-'}</td>
                <td>${cliente.email || '-'}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-primary" onclick="Clientes.editar('${cliente.id}')">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="Clientes.excluir('${cliente.id}')">Excluir</button>
                </td>
            </tr>
        `).join('');
    },

    buscar(termo) {
        const clientes = DB.buscarClientes(termo);
        this.renderizar(clientes);
    },

    abrirModal(cliente = null) {
        this.clienteEditando = cliente;
        const titulo = cliente ? 'Editar Cliente' : 'Novo Cliente';

        const conteudo = `
            <form id="form-cliente" onsubmit="Clientes.salvar(event)">
                <div class="form-group">
                    <label>Nome *</label>
                    <input type="text" name="nome" value="${cliente?.nome || ''}" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>CPF</label>
                        <input type="text" name="cpf" value="${cliente?.cpf || ''}"
                               oninput="Utils.mascaraCPF(this)" maxlength="14" placeholder="000.000.000-00">
                    </div>
                    <div class="form-group">
                        <label>Telefone</label>
                        <input type="text" name="telefone" value="${cliente?.telefone || ''}"
                               oninput="Utils.mascaraTelefone(this)" maxlength="15" placeholder="(00) 00000-0000">
                    </div>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value="${cliente?.email || ''}" placeholder="email@exemplo.com">
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
        const cliente = DB.getCliente(id);
        if (cliente) {
            this.abrirModal(cliente);
        }
    },

    salvar(event) {
        event.preventDefault();
        const form = event.target;
        const dados = {
            nome: form.nome.value.trim(),
            cpf: form.cpf.value.trim(),
            telefone: form.telefone.value.trim(),
            email: form.email.value.trim()
        };

        if (this.clienteEditando) {
            DB.atualizarCliente(this.clienteEditando.id, dados);
            Utils.toast('Cliente atualizado com sucesso!', 'success');
        } else {
            DB.adicionarCliente(dados);
            Utils.toast('Cliente cadastrado com sucesso!', 'success');
        }

        Modal.fechar();
        this.renderizar();
        this.clienteEditando = null;
    },

    excluir(id) {
        const cliente = DB.getCliente(id);
        if (cliente && Utils.confirmar(`Deseja excluir o cliente "${cliente.nome}"?`)) {
            DB.excluirCliente(id);
            Utils.toast('Cliente excluído!', 'success');
            this.renderizar();
        }
    },

    // Autocomplete para seleção de cliente
    criarAutocomplete(inputId, hiddenId, onSelect = null) {
        const input = document.getElementById(inputId);
        const hidden = document.getElementById(hiddenId);

        if (!input) return;

        let listContainer = input.parentElement.querySelector('.autocomplete-list');
        if (!listContainer) {
            listContainer = document.createElement('div');
            listContainer.className = 'autocomplete-list';
            input.parentElement.appendChild(listContainer);
        }

        const buscar = Utils.debounce((termo) => {
            if (!termo || termo.length < 2) {
                listContainer.classList.remove('active');
                return;
            }

            const clientes = DB.buscarClientes(termo);
            if (clientes.length === 0) {
                listContainer.classList.remove('active');
                return;
            }

            listContainer.innerHTML = clientes.map(c => `
                <div class="autocomplete-item" data-id="${c.id}" data-nome="${c.nome}"
                     data-cpf="${c.cpf || ''}" data-telefone="${c.telefone || ''}">
                    <strong>${c.nome}</strong>
                    <small>${Utils.formatarCPF(c.cpf) || ''} ${Utils.formatarTelefone(c.telefone) || ''}</small>
                </div>
            `).join('');

            listContainer.classList.add('active');
        }, 300);

        input.addEventListener('input', (e) => {
            hidden.value = '';
            buscar(e.target.value);
        });

        listContainer.addEventListener('click', (e) => {
            const item = e.target.closest('.autocomplete-item');
            if (item) {
                input.value = item.dataset.nome;
                hidden.value = item.dataset.id;
                listContainer.classList.remove('active');

                if (onSelect) {
                    onSelect({
                        id: item.dataset.id,
                        nome: item.dataset.nome,
                        cpf: item.dataset.cpf,
                        telefone: item.dataset.telefone
                    });
                }
            }
        });

        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !listContainer.contains(e.target)) {
                listContainer.classList.remove('active');
            }
        });
    }
};
