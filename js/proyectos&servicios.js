document.addEventListener("DOMContentLoaded", function () {
    // ─── Animación de entrada ─────────────────────────────
    requestAnimationFrame(() => {
        document.body.classList.add('loaded');
    });

    // ─── Configuración de transiciones ────────────────────
    const TRANSITION_CONFIG = {
        duration: 300,
        easing: 'ease',
        yOffset: '-20px',
        properties: 'opacity, transform'
    };

    // ─── Configuración del Sidebar Responsivo ────────────
    function configurarSidebar() {
        const toggleButton = document.querySelector('.toggle-sidebar-button');
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        const footer = document.querySelector('footer');

        if (!toggleButton || !sidebar) return;

        let overlay = document.querySelector('.sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.classList.add('sidebar-overlay');
            document.body.appendChild(overlay);
        }

        // Limpiar eventos anteriores
        toggleButton.onclick = null;
        overlay.onclick = null;
        sidebar.onclick = null;

        if (window.innerWidth <= 1028) {
            toggleButton.style.display = 'flex';
            overlay.style.display = 'none';

            toggleButton.onclick = function() {
                const isShowing = sidebar.classList.toggle('mostrar');
                overlay.style.display = isShowing ? 'block' : 'none';
                overlay.classList.toggle('active', isShowing);
                
                if (isShowing) {
                    document.body.style.overflow = 'hidden';
                    mainContent.style.pointerEvents = 'none';
                    footer.style.pointerEvents = 'none';
                } else {
                    document.body.style.overflow = '';
                    mainContent.style.pointerEvents = '';
                    footer.style.pointerEvents = '';
                }
            };

            sidebar.onclick = function(e) {
                e.stopPropagation();
                if (e.target.tagName === 'A') {
                    e.target.click();
                }
            };

            overlay.onclick = function() {
                sidebar.classList.remove('mostrar');
                overlay.classList.remove('active');
                overlay.style.display = 'none';
                document.body.style.overflow = '';
                mainContent.style.pointerEvents = '';
                footer.style.pointerEvents = '';
            };
        } else {
            toggleButton.style.display = 'none';
            overlay.style.display = 'none';
            sidebar.classList.remove('mostrar');
            document.body.style.overflow = '';
        }
    }

    // ─── Función para toggle content ─────────────────────
    const toggleContent = (button, content) => {
        const isVisible = content.classList.contains('visible');
        
        if (isVisible) {
            content.style.maxHeight = null;
            content.classList.remove('visible');
            const icon = button.querySelector('img');
            if (icon) icon.classList.remove('rotated');
        } else {
            content.style.maxHeight = content.scrollHeight + 'px';
            content.classList.add('visible');
            const icon = button.querySelector('img');
            if (icon) icon.classList.add('rotated');
        }
        
        setTimeout(checkScrollNeeded, 350);
    };

    // ─── Verificar si se necesita scroll ─────────────────
    function checkScrollNeeded() {
        const container = document.querySelector('.container_ProyectosAndServicios');
        const indicator = document.querySelector('.interaccion_detalles');
        
        if (!container || !indicator) return;
        
        if (container.scrollHeight > container.clientHeight) {
            indicator.style.display = 'block';
        } else {
            indicator.style.display = 'none';
        }
    }

    // ─── Inicialización de botones toggle ────────────────
    const toggleButtons = document.querySelectorAll('.toggle-button');
    toggleButtons.forEach((button) => {
        const content = button.nextElementSibling;
        
        if (content && content.classList.contains('toggle-content')) {
            button.addEventListener('click', () => {
                toggleContent(button, content);
                button.setAttribute('aria-expanded', 
                    content.classList.contains('visible').toString());
            });
            
            button.setAttribute('aria-expanded', 'false');
            button.setAttribute('aria-controls', content.id || 
                `toggle-content-${Math.random().toString(36).substr(2, 9)}`);
            
            if (!content.id) {
                content.id = button.getAttribute('aria-controls');
            }
            
            // Inicializar cerrados
            content.style.maxHeight = null;
            content.classList.remove('visible');
        }
    });

    // ─── Manejo de categorías ───────────────────────────
    const handleCategoryClick = (category) => {
        const categoryCards = document.querySelectorAll(`.project-card[data-categoria="${category}"]`);
        const allCards = document.querySelectorAll('.project-card');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');

        // Cerrar sidebar en móviles
        if (window.innerWidth <= 1028) {
            sidebar.classList.remove('mostrar');
            overlay.classList.remove('active');
            overlay.style.display = 'none';
            document.body.style.overflow = '';
            document.querySelector('.main-content').style.pointerEvents = '';
            document.querySelector('footer').style.pointerEvents = '';
        }

        allCards.forEach((card) => {
            card.classList.remove('visible');
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
        });

        setTimeout(() => {
            categoryCards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('visible');
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }, 300);
        
        setTimeout(checkScrollNeeded, 350 + (categoryCards.length * 100));
    };

    // ─── Eventos para las tarjetas de categoría ──────────
    const categoryCards = document.querySelectorAll('.certificate-card');
    categoryCards.forEach((card) => {
        card.addEventListener('click', () => {
            const category = card.dataset.categoria;
            handleCategoryClick(category);
            categoryCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        });
        
        card.addEventListener('mouseenter', () => {
            if (window.matchMedia("(hover: hover)").matches) {
                card.style.transform = 'scale(1.05)';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            if (window.matchMedia("(hover: hover)").matches) {
                card.style.transform = 'scale(1)';
            }
        });
    });

    // ─── Control del scroll ──────────────────────────────
    const container = document.querySelector('.container_ProyectosAndServicios');
    const indicator = document.querySelector('.interaccion_detalles');
    
    if (container && indicator) {
        checkScrollNeeded();
        window.addEventListener('resize', checkScrollNeeded);
        
        new MutationObserver(checkScrollNeeded).observe(container, {
            childList: true,
            subtree: true
        });
        
        container.addEventListener('scroll', function() {
            indicator.style.opacity = '0';
            setTimeout(() => {
                indicator.style.display = 'none';
            }, 500);
        });
    }

    // ─── Animación de salida para enlaces ────────────────
    document.querySelectorAll('a[href^="#"], a[href^="/"], a:not([href^="http"])').forEach((link) => {
        if (link.target !== '_blank' && !link.hasAttribute('download')) {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                if (href && !href.startsWith('http') && !href.startsWith('mailto:')) {
                    e.preventDefault();
                    document.body.classList.add('fade-out');
                    
                    setTimeout(() => {
                        window.location.href = href;
                    }, TRANSITION_CONFIG.duration);
                }
            });
        }
    });

    // ─── Inicialización ──────────────────────────────────
    configurarSidebar();
    window.addEventListener('resize', configurarSidebar);
});