document.addEventListener("DOMContentLoaded", function () {
  // ─── 1. Animación de entrada ─────────────────────────────
  requestAnimationFrame(() => {
    document.body.classList.add('loaded');
  });

  // ─── 2. Sidebar mobile ──────────────────────────────────
  const sidebar = document.querySelector('.sidebar');
  const sidebarOverlay = document.querySelector('.sidebar-overlay') || (() => {
    const el = document.createElement('div');
    el.classList.add('sidebar-overlay');
    document.body.appendChild(el);
    return el;
  })();
  const toggleButton = document.querySelector('.toggle-sidebar-button');

  const toggleSidebar = () => {
    sidebar.classList.toggle('mostrar');
    sidebarOverlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('mostrar') ? 'hidden' : '';
  };

  if (toggleButton) toggleButton.addEventListener('click', toggleSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', toggleSidebar);

  // ─── 3. Configuración de animaciones ──────────────
  const TRANSITION_CONFIG = {
    duration: 400,
    easing: 'ease',
    yOffset: '-20px',
    properties: 'opacity, transform'
  };

  const appState = {
    current: {
      category: null,
      subcategory: null,
      details: new Set()
    }
  };

  const getSafeElement = (id, type = 'div') => {
    const el = document.getElementById(id);
    if (!el) {
      console.warn(`Elemento con ID ${id} no encontrado`);
      return document.createElement(type);
    }
    return el;
  };

  const animateElement = (() => {
    const applyStyles = (el, styles) => {
      try {
        Object.assign(el.style, styles);
      } catch (e) {
        console.error('Error aplicando estilos:', e);
      }
    };

    return (element, action) => {
      if (!element || !element.style) return Promise.resolve();

      return new Promise(resolve => {
        const { duration, easing, properties } = TRANSITION_CONFIG;
        const isShowing = action === 'show';

        applyStyles(element, {
          display: isShowing ? 'block' : '',
          willChange: properties,
          transition: `${properties} ${duration}ms ${easing}`,
          opacity: isShowing ? '0' : '1',
          transform: isShowing ? `translateY(${TRANSITION_CONFIG.yOffset})` : 'translateY(0)'
        });

        void element.offsetHeight; // trigger reflow

        applyStyles(element, {
          opacity: isShowing ? '1' : '0',
          transform: isShowing ? 'translateY(0)' : `translateY(${TRANSITION_CONFIG.yOffset})`
        });

        setTimeout(() => {
          if (!isShowing) {
            applyStyles(element, { display: 'none' });
          }
          applyStyles(element, { willChange: '', transition: '' });
          resolve();
        }, duration);
      });
    };
  })();

  // ─── Categorías principales ───────────────────────────
  const handleCategory = async (categoryId) => {
    const categoryElement = getSafeElement(categoryId);

    if (appState.current.category === categoryId) {
      await animateElement(categoryElement, 'hide');
      appState.current.category = null;
      appState.current.subcategory = null;
    } else {
      if (appState.current.category) {
        await animateElement(getSafeElement(appState.current.category), 'hide');
      }
      if (appState.current.subcategory) {
        await animateElement(getSafeElement(appState.current.subcategory), 'hide');
        appState.current.subcategory = null;
      }
      await animateElement(categoryElement, 'show');
      appState.current.category = categoryId;

      if (window.innerWidth <= 1028) {
        toggleSidebar();
      }
    }
  };

  // ─── Subcategorías de ONE ────────────────────────────
  const handleSubcategory = async (subcategoryId) => {
    const subcategoryElement = getSafeElement(subcategoryId);

    if (appState.current.subcategory === subcategoryId) {
      await animateElement(subcategoryElement, 'hide');
      appState.current.subcategory = null;
    } else {
      if (appState.current.subcategory) {
        await animateElement(getSafeElement(appState.current.subcategory), 'hide');
      }
      await animateElement(subcategoryElement, 'show');
      appState.current.subcategory = subcategoryId;
    }
  };

  // ─── Detalles dentro de subcategorías ───────────────
  const handleDetails = async (detailId, btn) => {
    const detailElement = getSafeElement(detailId);
    const isShowing = appState.current.details.has(detailId);

    if (isShowing) {
      await animateElement(detailElement, 'hide');
      appState.current.details.delete(detailId);
      btn.textContent = "▼ Ver cursos específicos";
    } else {
      // Si quieres que solo uno esté abierto a la vez:
      for (const id of appState.current.details) {
        await animateElement(getSafeElement(id), 'hide');
        appState.current.details.delete(id);
      }

      await animateElement(detailElement, 'show');
      appState.current.details.add(detailId);
      btn.textContent = "▲ Ocultar cursos";
    }
  };

  // ─── Delegación de eventos ──────────────────────────
  document.addEventListener('click', (e) => {
    try {
      const card = e.target.closest('.certificate-card');
      if (card) {
        e.preventDefault();
        handleCategory(card.dataset.categoria);
        return;
      }

      const subBtn = e.target.closest('.subcategoria-btn');
      if (subBtn) {
        e.preventDefault();
        handleSubcategory(subBtn.getAttribute('data-subcategoria'));
        return;
      }

      const detBtn = e.target.closest('.ver-detalle-btn');
      if (detBtn) {
        e.preventDefault();
        handleDetails(detBtn.getAttribute('data-detalle'), detBtn);
      }
    } catch (error) {
      console.error('Error en el manejo de eventos:', error);
    }
  });

  // ─── 4. Animación de salida en enlaces internos ──────
  document.querySelectorAll('a[href]:not([target="_blank"])').forEach(link => {
    link.addEventListener('click', e => {
      if (e.target.closest('.sidebar') || e.target.closest('.toggle-sidebar-button')) return;

      e.preventDefault();
      const url = link.href;
      document.body.classList.add('fade-out');
      setTimeout(() => window.location = url,
        parseFloat(getComputedStyle(document.body).transitionDuration) * 1000);
    });
  });

  // ─── 5. Polyfill para requestAnimationFrame ──────────
  (function() {
    const vendors = ['ms', 'moz', 'webkit', 'o'];
    for (let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[`${vendors[x]}RequestAnimationFrame`];
      window.cancelAnimationFrame = window[`${vendors[x]}CancelAnimationFrame`] 
                                 || window[`${vendors[x]}CancelRequestAnimationFrame`];
    }
    if (!window.requestAnimationFrame) {
      let lastTime = 0;
      window.requestAnimationFrame = function(callback) {
        const currTime = new Date().getTime();
        const timeToCall = Math.max(0, 16 - (currTime - lastTime));
        const id = setTimeout(() => callback(currTime + timeToCall), timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    }
  })();
});
