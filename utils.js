// Utilitários gerais
const Utils = {
    // Gerar UUID
    gerarId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    // Formatar valor para moeda brasileira
    formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor || 0);
    },

    // Converter string de moeda para número
    parseMoeda(str) {
        if (typeof str === 'number') return str;
        return parseFloat(str.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
    },

    // Formatar data para exibição (DD/MM/YYYY)
    formatarData(data) {
        if (!data) return '';
        const d = new Date(data + 'T00:00:00');
        return d.toLocaleDateString('pt-BR');
    },

    // Formatar data e hora
    formatarDataHora(data, hora) {
        return `${this.formatarData(data)} ${hora || ''}`.trim();
    },

    // Obter data atual no formato YYYY-MM-DD
    dataAtual() {
        return new Date().toISOString().split('T')[0];
    },

    // Obter hora atual no formato HH:MM
    horaAtual() {
        return new Date().toTimeString().slice(0, 5);
    },

    // Obter mês atual no formato YYYY-MM
    mesAtual() {
        const hoje = new Date();
        return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
    },

    // Formatar mês para exibição (Mês/Ano)
    formatarMes(mesAno) {
        const [ano, mes] = mesAno.split('-');
        const meses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return `${meses[parseInt(mes) - 1]}/${ano}`;
    },

    // Extrair mês de uma data (YYYY-MM-DD -> YYYY-MM)
    extrairMes(data) {
        return data ? data.substring(0, 7) : '';
    },

    // Formatar CPF
    formatarCPF(cpf) {
        if (!cpf) return '';
        const nums = cpf.replace(/\D/g, '');
        return nums.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    },

    // Formatar telefone
    formatarTelefone(tel) {
        if (!tel) return '';
        const nums = tel.replace(/\D/g, '');
        if (nums.length === 11) {
            return nums.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        return nums.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    },

    // Máscara para CPF em input
    mascaraCPF(input) {
        let v = input.value.replace(/\D/g, '');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        input.value = v;
    },

    // Máscara para telefone em input
    mascaraTelefone(input) {
        let v = input.value.replace(/\D/g, '');
        v = v.replace(/^(\d{2})(\d)/, '($1) $2');
        v = v.replace(/(\d{5})(\d)/, '$1-$2');
        input.value = v;
    },

    // Debounce para buscas
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Exibir notificação toast
    toast(mensagem, tipo = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${tipo}`;
        toast.textContent = mensagem;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 2000;
            animation: slideIn 0.3s ease;
            background-color: ${tipo === 'success' ? '#22c55e' : tipo === 'error' ? '#ef4444' : '#3b82f6'};
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Confirmar ação
    confirmar(mensagem) {
        return confirm(mensagem);
    },

    // Gerar lista de meses disponíveis
    gerarMesesDisponiveis() {
        const meses = new Set();
        const transacoes = DB.getTransacoes();
        const mesAtual = this.mesAtual();

        meses.add(mesAtual);

        transacoes.forEach(t => {
            if (t.data) {
                meses.add(this.extrairMes(t.data));
            }
        });

        // Buscar saídas de todos os meses salvos
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('bdob_saidas_')) {
                meses.add(key.replace('bdob_saidas_', ''));
            }
        }

        return Array.from(meses).sort().reverse();
    }
};

// Adicionar estilos para toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
