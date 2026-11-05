// Módulo de Importação de Clientes
const ImportarClientes = {
    dadosExcel: [],
    colunasExcel: [],
    mapeamento: {},

    abrirModal() {
        const conteudo = `
            <div class="importar-container">
                <div class="form-group">
                    <label>Selecione o arquivo Excel (.xlsx ou .xls)</label>
                    <input type="file" id="arquivo-excel" accept=".xlsx,.xls" onchange="ImportarClientes.lerArquivo(this)">
                </div>

                <div id="mapeamento-colunas" style="display: none;">
                    <h4 style="margin: 20px 0 10px;">Mapeamento de Colunas</h4>
                    <p style="color: var(--text-muted); font-size: 0.9em; margin-bottom: 15px;">
                        Selecione qual coluna do Excel corresponde a cada campo. Apenas "Nome" é obrigatório.
                    </p>

                    <div class="form-group">
                        <label>Nome do Cliente *</label>
                        <select id="map-nome" onchange="ImportarClientes.atualizarMapeamento()">
                            <option value="">-- Selecione a coluna --</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>CPF</label>
                        <select id="map-cpf" onchange="ImportarClientes.atualizarMapeamento()">
                            <option value="">-- Não importar --</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Telefone</label>
                        <select id="map-telefone" onchange="ImportarClientes.atualizarMapeamento()">
                            <option value="">-- Não importar --</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Email</label>
                        <select id="map-email" onchange="ImportarClientes.atualizarMapeamento()">
                            <option value="">-- Não importar --</option>
                        </select>
                    </div>
                </div>

                <div id="preview-dados" style="display: none;">
                    <h4 style="margin: 20px 0 10px;">Pré-visualização</h4>
                    <div id="preview-tabela" style="max-height: 200px; overflow-y: auto;"></div>
                    <p id="total-registros" style="margin-top: 10px; font-weight: bold;"></p>
                </div>

                <div class="form-actions" style="margin-top: 20px;">
                    <button type="button" class="btn btn-secondary" onclick="Modal.fechar()">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="btn-importar" onclick="ImportarClientes.importar()" disabled>
                        Importar Clientes
                    </button>
                </div>
            </div>
        `;

        Modal.abrir('Importar Clientes do Excel', conteudo);
    },

    lerArquivo(input) {
        const arquivo = input.files[0];
        if (!arquivo) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Pegar a primeira planilha
                const primeiraPlanilha = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[primeiraPlanilha];

                // Converter para JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if (jsonData.length < 2) {
                    Utils.toast('O arquivo está vazio ou não tem dados suficientes!', 'error');
                    return;
                }

                // Primeira linha são os cabeçalhos
                this.colunasExcel = jsonData[0].map(col => String(col || '').trim());
                this.dadosExcel = jsonData.slice(1).filter(row => row.some(cell => cell));

                this.mostrarMapeamento();
            } catch (error) {
                console.error('Erro ao ler arquivo:', error);
                Utils.toast('Erro ao ler o arquivo Excel!', 'error');
            }
        };
        reader.readAsArrayBuffer(arquivo);
    },

    mostrarMapeamento() {
        const container = document.getElementById('mapeamento-colunas');
        container.style.display = 'block';

        // Preencher os selects com as colunas do Excel
        const campos = ['nome', 'cpf', 'telefone', 'email'];
        campos.forEach(campo => {
            const select = document.getElementById(`map-${campo}`);
            const opcaoVazia = campo === 'nome' ? '-- Selecione a coluna --' : '-- Não importar --';

            select.innerHTML = `<option value="">${opcaoVazia}</option>` +
                this.colunasExcel.map((col, i) =>
                    `<option value="${i}">${col}</option>`
                ).join('');
        });

        // Tentar detectar automaticamente as colunas
        this.detectarColunas();
    },

    detectarColunas() {
        const mapeamentos = {
            nome: ['nome', 'name', 'cliente', 'client'],
            cpf: ['cpf', 'documento', 'doc'],
            telefone: ['telefone', 'tel', 'fone', 'phone', 'celular', 'whatsapp', 'whats', 'zap'],
            email: ['email', 'e-mail', 'mail']
        };

        this.colunasExcel.forEach((coluna, index) => {
            const colunaLower = coluna.toLowerCase();

            for (const [campo, palavras] of Object.entries(mapeamentos)) {
                if (palavras.some(p => colunaLower.includes(p))) {
                    const select = document.getElementById(`map-${campo}`);
                    if (select && !select.value) {
                        select.value = index;
                    }
                }
            }
        });

        this.atualizarMapeamento();
    },

    atualizarMapeamento() {
        this.mapeamento = {
            nome: document.getElementById('map-nome').value,
            cpf: document.getElementById('map-cpf').value,
            telefone: document.getElementById('map-telefone').value,
            email: document.getElementById('map-email').value
        };

        const temNome = this.mapeamento.nome !== '';
        document.getElementById('btn-importar').disabled = !temNome;

        if (temNome) {
            this.mostrarPreview();
        } else {
            document.getElementById('preview-dados').style.display = 'none';
        }
    },

    mostrarPreview() {
        const container = document.getElementById('preview-dados');
        const tabela = document.getElementById('preview-tabela');
        const totalEl = document.getElementById('total-registros');

        container.style.display = 'block';

        // Mostrar apenas os primeiros 5 registros como preview
        const preview = this.dadosExcel.slice(0, 5);
        const clientesPreview = preview.map(row => this.converterParaCliente(row)).filter(c => c.nome);

        tabela.innerHTML = `
            <table class="table" style="font-size: 0.85em;">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>CPF</th>
                        <th>Telefone</th>
                        <th>Email</th>
                    </tr>
                </thead>
                <tbody>
                    ${clientesPreview.map(c => `
                        <tr>
                            <td>${c.nome || '-'}</td>
                            <td>${c.cpf || '-'}</td>
                            <td>${c.telefone || '-'}</td>
                            <td>${c.email || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        const totalValidos = this.dadosExcel.filter(row => {
            const nome = this.mapeamento.nome !== '' ? row[parseInt(this.mapeamento.nome)] : null;
            return nome && String(nome).trim();
        }).length;

        totalEl.textContent = `Total de clientes a importar: ${totalValidos}`;
    },

    converterParaCliente(row) {
        const getValue = (campo) => {
            if (this.mapeamento[campo] === '') return '';
            const valor = row[parseInt(this.mapeamento[campo])];
            return valor ? String(valor).trim() : '';
        };

        return {
            nome: getValue('nome'),
            cpf: getValue('cpf'),
            telefone: getValue('telefone'),
            email: getValue('email')
        };
    },

    importar() {
        if (this.mapeamento.nome === '') {
            Utils.toast('Selecione a coluna de Nome!', 'error');
            return;
        }

        let importados = 0;
        let ignorados = 0;

        this.dadosExcel.forEach(row => {
            const cliente = this.converterParaCliente(row);

            if (cliente.nome) {
                DB.adicionarCliente(cliente);
                importados++;
            } else {
                ignorados++;
            }
        });

        Modal.fechar();
        Clientes.renderizar();

        Utils.toast(`Importação concluída! ${importados} clientes importados${ignorados > 0 ? `, ${ignorados} ignorados (sem nome)` : ''}.`, 'success');

        // Limpar dados
        this.dadosExcel = [];
        this.colunasExcel = [];
        this.mapeamento = {};
    }
};
