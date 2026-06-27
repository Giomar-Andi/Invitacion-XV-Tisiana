/* ============================================
   INVITACIÓN XV AÑOS - RAPUNZEL
   Código JavaScript Profesional y Modular
   ============================================ */

// Configuración centralizada
const CONFIG = {
    eventDate: new Date('2026-07-17T20:00:00-05:00'),
    whatsappNumber: '51999999999', // CAMBIAR
    eventName: 'Antonella Luana',
    musicVolume: 0.5
};

// Estado de la aplicación
const AppState = {
    isMusicPlaying: false,
    countdownInterval: null,
    navOpen: false
};

// Referencias al DOM
const DOM = {
    loader: document.getElementById('loader'),
    navbar: document.getElementById('navbar'),
    navToggle: document.getElementById('navToggle'),
    navMenu: document.getElementById('navMenu'),
    musicControl: document.getElementById('musicControl'),
    bgMusic: document.getElementById('bgMusic'),
    heartButton: document.getElementById('heartButton'),
    countdown: {
        days: document.getElementById('days'),
        hours: document.getElementById('hours'),
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds')
    }
};

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    registerServiceWorker();
});

function initializeApp() {
    // Ocultar loader
    setTimeout(() => {
        if (DOM.loader) {
            DOM.loader.classList.add('hidden');
        }
    }, 2000);

    // Iniciar countdown
    startCountdown();

    // Verificar scroll para navbar
    window.addEventListener('scroll', handleScroll, { passive: true });
}

function setupEventListeners() {
    // Navegación móvil
    if (DOM.navToggle && DOM.navMenu) {
        DOM.navToggle.addEventListener('click', toggleNavMenu);
        
        // Cerrar menú al hacer click en un link
        DOM.navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                closeNavMenu();
            });
        });
    }

    // Control de música
    if (DOM.musicControl) {
        DOM.musicControl.addEventListener('click', toggleMusic);
    }

    // Botón corazón
    if (DOM.heartButton) {
        DOM.heartButton.addEventListener('click', playMusicWithHeart);
    }

    // Smooth scroll para anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
}

// ============================================
// NAVEGACIÓN
// ============================================

function toggleNavMenu() {
    AppState.navOpen = !AppState.navOpen;
    
    if (AppState.navOpen) {
        DOM.navMenu.classList.add('active');
        DOM.navToggle.textContent = '✕';
        document.body.style.overflow = 'hidden';
    } else {
        closeNavMenu();
    }
}

function closeNavMenu() {
    AppState.navOpen = false;
    DOM.navMenu.classList.remove('active');
    DOM.navToggle.textContent = '☰';
    document.body.style.overflow = '';
}

function handleScroll() {
    const scrollTop = window.scrollY;
    
    // Agregar clase scrolled al navbar
    if (scrollTop > 100) {
        DOM.navbar.classList.add('scrolled');
    } else {
        DOM.navbar.classList.remove('scrolled');
    }
}

// ============================================
// CONTROL DE MÚSICA
// ============================================

function toggleMusic() {
    if (!DOM.bgMusic) return;

    if (AppState.isMusicPlaying) {
        pauseMusic();
    } else {
        playMusic();
    }
}

function playMusic() {
    if (!DOM.bgMusic) return;

    DOM.bgMusic.volume = CONFIG.musicVolume;
    
    DOM.bgMusic.play().then(() => {
        AppState.isMusicPlaying = true;
        DOM.musicControl.classList.add('playing');
        DOM.musicControl.querySelector('.music-icon').textContent = '🎶';
        
        // Actualizar botón corazón
        if (DOM.heartButton) {
            DOM.heartButton.querySelector('.heart-text').textContent = 'Música reproduciendo';
        }
    }).catch(error => {
        console.error('Error al reproducir música:', error);
        showNotification('Toca el corazón para iniciar la música 💜');
    });
}

function pauseMusic() {
    if (!DOM.bgMusic) return;

    DOM.bgMusic.pause();
    AppState.isMusicPlaying = false;
    DOM.musicControl.classList.remove('playing');
    DOM.musicControl.querySelector('.music-icon').textContent = '🎵';
    
    if (DOM.heartButton) {
        DOM.heartButton.querySelector('.heart-text').textContent = 'Toca para escuchar';
    }
}

function playMusicWithHeart() {
    if (!AppState.isMusicPlaying) {
        playMusic();
        
        // Animación del botón
        DOM.heartButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            DOM.heartButton.style.transform = 'scale(1)';
        }, 150);
    }
}

// ============================================
// CUENTA REGRESIVA
// ============================================

function startCountdown() {
    updateCountdown();
    AppState.countdownInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    const now = new Date();
    const difference = CONFIG.eventDate - now;

    if (difference <= 0) {
        // El evento ya comenzó
        setCountdownValue('00', '00', '00', '00');
        if (AppState.countdownInterval) {
            clearInterval(AppState.countdownInterval);
        }
        return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    setCountdownValue(
        padNumber(days),
        padNumber(hours),
        padNumber(minutes),
        padNumber(seconds)
    );
}

function setCountdownValue(days, hours, minutes, seconds) {
    updateCountdownElement(DOM.countdown.days, days);
    updateCountdownElement(DOM.countdown.hours, hours);
    updateCountdownElement(DOM.countdown.minutes, minutes);
    updateCountdownElement(DOM.countdown.seconds, seconds);
}

function updateCountdownElement(element, value) {
    if (element && element.textContent !== value) {
        element.style.transform = 'scale(1.2)';
        element.style.transition = 'transform 0.2s ease';
        
        setTimeout(() => {
            element.textContent = value;
            element.style.transform = 'scale(1)';
        }, 200);
    }
}

function padNumber(num) {
    return String(num).padStart(2, '0');
}

// ============================================
// SERVICE WORKER (PWA)
// ============================================

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('✅ Service Worker registrado:', registration);
                
                // Verificar actualizaciones periódicamente
                setInterval(() => {
                    registration.update();
                }, 60 * 60 * 1000); // Cada hora
            })
            .catch(error => {
                console.error('❌ Error al registrar Service Worker:', error);
            });

        // Escuchar cambios
        navigator.serviceWorker.addEventListener('message', event => {
            console.log('Mensaje del SW:', event.data);
        });
    }
}

// ============================================
// UTILIDADES
// ============================================

function showNotification(message, duration = 3000) {
    // Remover notificación anterior si existe
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Crear notificación
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: rgba(107, 78, 113, 0.95);
        color: white;
        padding: 15px 30px;
        border-radius: 50px;
        font-family: 'Inter', sans-serif;
        font-size: 0.95rem;
        z-index: 10000;
        box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        opacity: 0;
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(-50%) translateY(0)';
        notification.style.opacity = '1';
    });
    
    // Remover después del tiempo especificado
    setTimeout(() => {
        notification.style.transform = 'translateX(-50%) translateY(100px)';
        notification.style.opacity = '0';
        
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
}

// Lazy loading para imágenes
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Preload de imágenes críticas
function preloadCriticalImages() {
    const criticalImages = [
        'images/corona.png',
        'images/rapunzel.png',
        'images/pascal.png'
    ];

    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Inicializar lazy loading cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    preloadCriticalImages();
    setupLazyLoading();
});

// ============================================
// ANIMACIONES ADICIONALES
// ============================================

// Intersection Observer para animaciones al scroll
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observar secciones
    document.querySelectorAll('.section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(section);
    });
}

// Agregar estilos para animaciones
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(animationStyles);

// Inicializar animaciones de scroll
document.addEventListener('DOMContentLoaded', setupScrollAnimations);

// ============================================
// EFECTOS DE PARTÍCULAS
// ============================================

function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle-particle';
    
    const size = Math.random() * 10 + 5;
    sparkle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, #FFD700 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        animation: sparkleFade 1s ease forwards;
    `;
    
    document.body.appendChild(sparkle);
    
    setTimeout(() => {
        sparkle.remove();
    }, 1000);
}

// Agregar sparkle aleatorio (30% probabilidad al hacer click)
document.addEventListener('click', (e) => {
    // Ignorar clicks en botones y links
    if (e.target.closest('button') || e.target.closest('a')) return;
    
    if (Math.random() > 0.7) {
        createSparkle(e.clientX, e.clientY);
    }
});

// Agregar keyframes de sparkle
const sparkleStyles = document.createElement('style');
sparkleStyles.textContent = `
    @keyframes sparkleFade {
        0% {
            opacity: 1;
            transform: scale(0) rotate(0deg);
        }
        50% {
            opacity: 0.8;
            transform: scale(1.5) rotate(180deg);
        }
        100% {
            opacity: 0;
            transform: scale(0.5) rotate(360deg) translateY(-50px);
        }
    }
`;
document.head.appendChild(sparkleStyles);

// ============================================
// DETECCIÓN DE DISPOSITIVO
// ============================================

function detectDevice() {
    const userAgent = navigator.userAgent;
    
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
        document.body.classList.add('is-mobile');
        return 'mobile';
    } else if (/iPad|Android(?!.*Mobile)/i.test(userAgent)) {
        document.body.classList.add('is-tablet');
        return 'tablet';
    } else {
        document.body.classList.add('is-desktop');
        return 'desktop';
    }
}

// Detectar dispositivo al cargar
document.addEventListener('DOMContentLoaded', detectDevice);

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================

// Debounce para resize
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Manejar resize de ventana
const handleResize = debounce(() => {
    // Cerrar menú móvil si está abierto
    if (AppState.navOpen && window.innerWidth > 768) {
        closeNavMenu();
    }
}, 250);

window.addEventListener('resize', handleResize);

// ============================================
// ACCESIBILIDAD
// ============================================

// Navegación con teclado
document.addEventListener('keydown', (e) => {
    // Cerrar menú con ESC
    if (e.key === 'Escape' && AppState.navOpen) {
        closeNavMenu();
    }
    
    // Control de música con barra espaciadora (si no está en un input)
    if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        toggleMusic();
    }
});

// ============================================
// ANALYTICS (OPCIONAL)
// ============================================

function trackEvent(eventName, eventData = {}) {
    // Aquí puedes integrar Google Analytics, Facebook Pixel, etc.
    console.log(`📊 Event: ${eventName}`, eventData);
    
    // Ejemplo con Google Analytics:
    // if (typeof gtag !== 'undefined') {
    //     gtag('event', eventName, eventData);
    // }
}

// Trackear visitas a secciones
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section');
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                if (sectionId) {
                    trackEvent('section_view', { section: sectionId });
                }
            }
        });
    }, { threshold: 0.5 });

    sections.forEach(section => {
        sectionObserver.observe(section);
    });
});

// Trackear clicks en botones importantes
document.querySelectorAll('.btn-primary, .btn-large').forEach(button => {
    button.addEventListener('click', () => {
        const buttonText = button.textContent.trim();
        trackEvent('button_click', { button: buttonText });
    });
});

console.log('✨ Invitación XV Años - Antonella Luana cargada correctamente ✨');
