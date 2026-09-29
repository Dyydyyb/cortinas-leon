/**
 * CORTINAS LEÓN - MAIN JAVASCRIPT
 * Control de animación de cortina metálica, slider de rubros, lightbox,
 * formulario WhatsApp y navegación mobile-first.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCurtainIntro();
  initHeaderNavigation();
  initRubrosSlider();
  initGalleryLightbox();
  initContactForm();
  initScrollReveal();
  initHeroShutterDemo();
});

/* ==========================================================================
   1. INTRO ANIMATION: CORTINA METÁLICA
   Apertura realista de cortina galvanizada con traqueteo y subida suave.
   ========================================================================== */
let audioCtx = null;
let soundEnabled = false;

function initCurtainIntro() {
  const introOverlay = document.getElementById('curtain-intro');
  const door = document.getElementById('curtain-door');
  const slatsWrapper = document.getElementById('curtain-slats');
  const skipBtn = document.getElementById('curtain-skip-btn');
  const soundBtn = document.getElementById('curtain-sound-btn');

  if (!introOverlay || !door || !slatsWrapper) return;

  // Generar tablillas metálicas para llenar la pantalla
  generateSlats(slatsWrapper);

  // Verificar si ya fue reproducida en esta sesión
  const alreadySeen = sessionStorage.getItem('cortinas_leon_intro_seen');
  if (alreadySeen === 'true') {
    introOverlay.style.display = 'none';
    return;
  }

  // Configurar botón de sonido (opcional, mute por defecto)
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundBtn.innerHTML = soundEnabled 
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg> Sonido: ON'
        : '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg> Sonido: OFF';
      
      if (soundEnabled && !audioCtx) {
        try {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
          console.warn('Web Audio API no soportado', e);
        }
      }
    });
  }

  // Botón saltar intro
  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      finishCurtainIntro(introOverlay);
    });
  }

  // Iniciar la secuencia de apertura de cortina
  runCurtainSequence(door, introOverlay);
}

function generateSlats(container) {
  container.innerHTML = '';
  // Altura aproximada de cada tablilla: 28px
  const count = Math.ceil(window.innerHeight / 26) + 12;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const slat = document.createElement('div');
    slat.className = 'slat';
    
    const leftRivet = document.createElement('div');
    leftRivet.className = 'slat-rivet';
    
    const rightRivet = document.createElement('div');
    rightRivet.className = 'slat-rivet';

    slat.appendChild(leftRivet);
    slat.appendChild(rightRivet);
    fragment.appendChild(slat);
  }

  container.appendChild(fragment);
}

function runCurtainSequence(door, overlay) {
  // 1. Fase de traqueteo visual mecánico (primeros 350ms)
  door.classList.add('rattling');

  // Si el usuario activó sonido, reproducir síntesis metálica
  if (soundEnabled && audioCtx) {
    playShutterMechanicalSound();
  }

  // 2. Comienza a abrirse hacia arriba deslizándose fluidamente (1.8s a 2.2s)
  setTimeout(() => {
    door.classList.remove('rattling');
    door.classList.add('opening');
  }, 380);

  // 3. Finalizar y desvanecer overlay progresivamente
  setTimeout(() => {
    finishCurtainIntro(overlay);
  }, 2350);
}

function finishCurtainIntro(overlay) {
  overlay.classList.add('fade-out');
  sessionStorage.setItem('cortinas_leon_intro_seen', 'true');
  setTimeout(() => {
    overlay.style.display = 'none';
  }, 500);
}

// Función expuesta para volver a ver la animación desde el footer
window.replayCurtainAnimation = function () {
  const introOverlay = document.getElementById('curtain-intro');
  const door = document.getElementById('curtain-door');
  const slatsWrapper = document.getElementById('curtain-slats');

  if (!introOverlay || !door) return;

  generateSlats(slatsWrapper);
  door.classList.remove('opening', 'rattling');
  introOverlay.classList.remove('fade-out');
  introOverlay.style.display = 'flex';

  window.scrollTo({ top: 0, behavior: 'instant' });
  setTimeout(() => {
    runCurtainSequence(door, introOverlay);
  }, 50);
};

// Síntesis de sonido de engranaje metálico / motor usando Web Audio (100% nativo, sin dependencias)
function playShutterMechanicalSound() {
  if (!audioCtx) return;
  try {
    const bufferSize = audioCtx.sampleRate * 2.0;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1100, audioCtx.currentTime + 1.8);
    filter.Q.value = 3.0;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.95);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    noise.start();
  } catch (err) {
    console.warn('Audio synthesis failed:', err);
  }
}

/* ==========================================================================
   2. HEADER & NAVEGACIÓN MOBILE
   ========================================================================== */
function initHeaderNavigation() {
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.toggle('open');
      mobileToggle.classList.toggle('active', isOpen);
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    // Cerrar al presionar cualquier enlace
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Cerrar al hacer clic fuera del drawer
    document.addEventListener('click', (e) => {
      if (
        mobileDrawer.classList.contains('open') &&
        !mobileDrawer.contains(e.target) &&
        !mobileToggle.contains(e.target)
      ) {
        mobileDrawer.classList.remove('open');
        mobileToggle.classList.remove('active');
      }
    });
  }

  // Highlighting de enlace activo al hacer scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollY = window.pageYOffset + 120;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

/* ==========================================================================
   3. SLIDER ANIMADO DE CORTINAS POR RUBRO
   Locales, Galpones, Cocheras, Viviendas, Industrias
   Soporte para flechas, dots, swipe táctil y auto-reproducción suave.
   ========================================================================== */
function initRubrosSlider() {
  const track = document.getElementById('rubros-track');
  const slides = document.querySelectorAll('.rubro-slide');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');
  const dotsContainer = document.getElementById('slider-dots');

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  let autoPlayTimer = null;
  const totalSlides = slides.length;

  // Calcular cantidad de slides visibles según el ancho de pantalla
  function getVisibleCount() {
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }

  function getMaxIndex() {
    return Math.max(0, totalSlides - getVisibleCount());
  }

  // Generar dots indicadores
  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const maxIdx = getMaxIndex();

    for (let i = 0; i <= maxIdx; i++) {
      const dot = document.createElement('button');
      dot.className = `slider-dot ${i === currentIndex ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Ir a diapositiva ${i + 1}`);
      dot.addEventListener('click', () => {
        goToSlide(i);
        restartAutoPlay();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateSliderPosition() {
    const slide = slides[0];
    const slideStyle = window.getComputedStyle(slide);
    const gap = 24; // var(--gap)
    const slideWidth = slide.getBoundingClientRect().width;
    const moveAmount = (slideWidth + gap) * currentIndex;

    track.style.transform = `translateX(-${moveAmount}px)`;

    // Actualizar dots
    const dots = dotsContainer ? dotsContainer.querySelectorAll('.slider-dot') : [];
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });

    // Estado flechas
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= getMaxIndex();
  }

  function goToSlide(index) {
    const maxIdx = getMaxIndex();
    currentIndex = Math.max(0, Math.min(index, maxIdx));
    updateSliderPosition();
  }

  function nextSlide() {
    const maxIdx = getMaxIndex();
    if (currentIndex >= maxIdx) {
      currentIndex = 0;
    } else {
      currentIndex++;
    }
    updateSliderPosition();
  }

  function prevSlide() {
    if (currentIndex <= 0) {
      currentIndex = getMaxIndex();
    } else {
      currentIndex--;
    }
    updateSliderPosition();
  }

  // Botones de navegación
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      restartAutoPlay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      restartAutoPlay();
    });
  }

  // Soporte Touch Swipe para Mobile
  let startX = 0;
  let currentTranslate = 0;
  let isDragging = false;

  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
    clearInterval(autoPlayTimer);
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    // Si el arrastre es perceptible
    if (Math.abs(diff) > 40) {
      if (diff < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      isDragging = false;
      restartAutoPlay();
    }
  }, { passive: true });

  track.addEventListener('touchend', () => {
    isDragging = false;
    restartAutoPlay();
  });

  // Autoplay pausado al interactuar
  function startAutoPlay() {
    clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(nextSlide, 4800);
  }

  function restartAutoPlay() {
    clearInterval(autoPlayTimer);
    startAutoPlay();
  }

  const sliderBox = document.querySelector('.slider-container');
  if (sliderBox) {
    sliderBox.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
    sliderBox.addEventListener('mouseleave', startAutoPlay);
  }

  window.addEventListener('resize', () => {
    buildDots();
    goToSlide(currentIndex);
  });

  buildDots();
  updateSliderPosition();
  startAutoPlay();
}

/* ==========================================================================
   4. GALERÍA DE TRABAJOS & LIGHTBOX
   Filtros por categoría y vista previa modal en pantalla completa
   Los items de galería usan SVG inline (sin <img>), por lo que el lightbox
   muestra los datos textuales + enlace a WhatsApp en lugar de imagen.
   ========================================================================== */
function initGalleryLightbox() {
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const modal = document.getElementById('lightbox-modal');
  const modalTitle = document.getElementById('lightbox-title');
  const modalBadge = document.getElementById('lightbox-badge');
  const modalClose = document.getElementById('lightbox-close');
  const modalWaBtn = document.getElementById('lightbox-wa-btn');

  // Filtros de categoría
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const itemCat = item.getAttribute('data-category');
        if (filterValue === 'all' || itemCat === filterValue) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Abrir Lightbox al hacer click
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const title = item.querySelector('.gallery-item-title')?.textContent || 'Instalación Cortinas León';
      const badge = item.querySelector('.gallery-item-badge')?.textContent || 'Cortina Metálica';
      const loc = item.querySelector('.gallery-item-loc')?.textContent || '';

      if (modal) {
        // Actualizar el bloque SVG del modal con el SVG del item seleccionado
        const svgSource = item.querySelector('svg');
        const modalSvgBox = document.getElementById('lightbox-svg-box');
        if (modalSvgBox && svgSource) {
          modalSvgBox.innerHTML = '';
          const clonedSvg = svgSource.cloneNode(true);
          clonedSvg.setAttribute('width', '100%');
          clonedSvg.setAttribute('height', '100%');
          clonedSvg.style.maxHeight = '320px';
          clonedSvg.style.borderRadius = '8px';
          modalSvgBox.appendChild(clonedSvg);
        }

        if (modalTitle) modalTitle.textContent = title;
        if (modalBadge) modalBadge.textContent = badge;

        const modalLoc = document.getElementById('lightbox-loc');
        if (modalLoc) modalLoc.textContent = loc;

        if (modalWaBtn) {
          const msg = encodeURIComponent(`Hola, vi en su galería el trabajo: "${title}" (${badge}) y me interesa consultar por un presupuesto similar.`);
          modalWaBtn.href = `https://wa.me/5491126135602?text=${msg}`;
        }

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  // Cerrar Modal
  function closeModal() {
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   5. FORMULARIO DE CONSULTA -> REDIRECCIÓN A WHATSAPP
   Redirige directamente al 11 2613-5602 con datos formateados y limpios.
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('budget-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('form-name')?.value.trim() || 'Cliente';
    const phone = document.getElementById('form-phone')?.value.trim() || 'No especificado';
    const spaceType = document.getElementById('form-rubro')?.value || 'Local';
    const dimensions = document.getElementById('form-dimensions')?.value.trim() || 'A definir';
    const message = document.getElementById('form-message')?.value.trim() || 'Solicito cotización y asesoramiento.';

    // Mensaje estructurado y profesional para WhatsApp
    const waText = 
`*CONSULTA DE PRESUPUESTO - CORTINAS LEÓN*
• *Nombre:* ${name}
• *Teléfono:* ${phone}
• *Tipo de espacio / Rubro:* ${spaceType}
• *Medidas aproximadas:* ${dimensions}
• *Detalles:* ${message}

_Enviado desde el formulario web oficial de Cortinas León._`;

    const encodedText = encodeURIComponent(waText);
    const targetUrl = `https://wa.me/5491126135602?text=${encodedText}`;

    // Abrir WhatsApp
    window.open(targetUrl, '_blank');
  });
}

/* ==========================================================================
   6. SCROLL REVEAL (Transición suave 300-450ms)
   ========================================================================== */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-item');
  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}

/* ==========================================================================
   7. HERO INTERACTIVE SHUTTER DEMO
   Controla el simulador de cortina metálica del Hero:
   - Botones Subir / Bajar: animan el paño de cortina
   - Selector de tipo: cambia apariencia de las tablillas (Ciega / Microperforada / Malla)
   ========================================================================== */
function initHeroShutterDemo() {
  const btnOpen = document.getElementById('demo-btn-open');
  const btnClose = document.getElementById('demo-btn-close');
  const curtainDoor = document.getElementById('hero-curtain-door');
  const typePills = document.querySelectorAll('.btn-type-pill');
  const led = document.getElementById('hero-led');
  const statusText = document.getElementById('hero-status-text');

  if (!btnOpen || !btnClose || !curtainDoor) return;

  let isOpen = false;
  let animating = false;

  function setMotorStatus(text, active) {
    if (statusText) statusText.textContent = `Motor Motic: ${text}`;
    if (led) {
      led.style.background = active ? '#3d7a3d' : '#9ca3af';
      led.style.boxShadow = active ? '0 0 4px rgba(61,122,61,0.5)' : 'none';
    }
  }

  btnOpen.addEventListener('click', () => {
    if (animating || isOpen) return;
    animating = true;
    setMotorStatus('Abriendo...', true);
    curtainDoor.classList.add('hero-door-opening');
    curtainDoor.classList.remove('hero-door-closing');
    setTimeout(() => {
      isOpen = true;
      animating = false;
      setMotorStatus('Abierta', false);
    }, 1400);
  });

  btnClose.addEventListener('click', () => {
    if (animating || !isOpen) return;
    animating = true;
    setMotorStatus('Cerrando...', true);
    curtainDoor.classList.add('hero-door-closing');
    curtainDoor.classList.remove('hero-door-opening');
    setTimeout(() => {
      isOpen = false;
      animating = false;
      setMotorStatus('En Espera', false);
    }, 1400);
  });

  // Selector de tipo de cortina
  typePills.forEach(pill => {
    pill.addEventListener('click', () => {
      typePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const type = pill.getAttribute('data-type');

      // Quitar clases de tipo anteriores
      curtainDoor.classList.remove('curtain-type-ciega', 'curtain-type-microperforada', 'curtain-type-malla');
      curtainDoor.classList.add(`curtain-type-${type}`);

      const labels = {
        ciega: 'Chapa Ciega Reforzada',
        microperforada: 'Microperforada Visión',
        malla: 'Malla de Varilla'
      };
      setMotorStatus(labels[type] || 'Seleccionada', false);
    });
  });

  // Demo automático al cargar: abrir y cerrar una vez (3 seg delay)
  setTimeout(() => {
    if (!isOpen && !animating) {
      btnOpen.click();
      setTimeout(() => {
        if (isOpen) btnClose.click();
      }, 2500);
    }
  }, 2800);
}
