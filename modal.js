// Módulo de Modal
const Modal = {
    overlay: null,
    titulo: null,
    body: null,

    init() {
        this.overlay = document.getElementById('modal-overlay');
        this.titulo = document.getElementById('modal-titulo');
        this.body = document.getElementById('modal-body');
    },

    abrir(titulo, conteudo) {
        this.titulo.textContent = titulo;
        this.body.innerHTML = conteudo;
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus no primeiro input
        setTimeout(() => {
            const firstInput = this.body.querySelector('input, select, textarea');
            if (firstInput) firstInput.focus();
        }, 100);
    },

    fechar() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    },

    // Fechar com ESC
    setupEscListener() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.classList.contains('active')) {
                this.fechar();
            }
        });
    }
};

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    Modal.init();
    Modal.setupEscListener();
});
