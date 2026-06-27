/* ============================================
   INVITACIÓN XV AÑOS - RAPUNZEL
   Funcionalidad Premium
   ============================================ */

// Configuración
const CONFIG = {
    // Fecha del evento: 17 de julio de 2026, 8:00 PM (hora peruana UTC-5)
    eventDate: new Date('2026-07-17T20:00:00-05:00'),
    eventName: 'XV Años - Antonella Luana',
    whatsappNumber: '51999999999', // CAMBIA ESTO POR EL NÚMERO REAL
    locationQuery: 'Calle+Diseñarte+Lima+Peru'
};

// Estado de la aplicación
const AppState = {
    currentSection: 0,
    isMusicPlaying: false,
    envelopeOpened: false,
    sections: []
};

// Elementos del DOM
const DOM = {
    loadingScreen: document.getElementById('loadingScreen'),
    musicBtn: document.getElementById('musicBtn'),
    bgMusic: document.getElementById('bgMusic'),
    envelope: document.getElementById('envelope'),
    waxSeal: document.getElementById('waxSeal'),
    heartBtn: document.getElementById('heartBtn'),
    countdownElements: {
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
    // Ocultar pantalla de carga
    setTimeout(() => {
        if (DOM.loadingScreen) {
            DOM.loadingScreen.classList.add('fade-out');
            setTimeout(() => {
                DOM.loadingScreen.style.display = 'none';
            }, 1000);
        }
    }, 2500);

    // Obtener todas las secciones
    AppState.sections = document.querySelectorAll('.section');
    
    // Inicializar contador de secciones
    updateVisibleSection();
}

function setupEventListeners() {
    // Abrir sobre
    if (DOM.envelope) {
        DOM.envelope.addEventListener('click', openEnvelope);
    }

    // Control de música
    if (DOM.musicBtn) {
        DOM.musicBtn.addEventListener('click', toggleMusic);
    }

    // Botón corazón
    if (DOM.heartBtn) {
        DOM.heartBtn.addEventListener('click', playMusicWithHeart);
    }

    // Scroll con rueda del mouse
    window.addEventListener('wheel', handleScroll, { passive: false });
    
    // Touch events para móvil
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    window.addEventListener('touchend', (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        handleTouchScroll(touchStartY, touchEndY);
    }, { passive: true });

    // Actualizar sección visible en scroll
    window.addEventListener('scroll', updateVisibleSection, { passive: true });
}

// ============================================
// SOBRE MÁGICO
// ============================================

function openEnvelope() {
    if (AppState.envelopeOpened) return;
    
    AppState.envelopeOpened = true;
    DOM.envelope.classList.add('open');
    
    // Efecto de sonido opcional
    playSound('open');
    
    // Esperar animación y mostrar siguiente sección
    setTimeout(() => {
        showSection(1); // Hero section (índice 1)
    }, 1200);
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
    
    DOM.bgMusic.play().then(() => {
        AppState.isMusicPlaying = true;
        DOM.musicBtn.classList.add('playing');
        DOM.musicBtn.querySelector('.music-icon').textContent = '🎶';
    }).catch(error => {
        console.log('Error al reproducir música:', error);
        showNotification('Toca el corazón para iniciar la música 💜');
    });
}

function pauseMusic() {
    if (!DOM.bgMusic) return;
    
    DOM.bgMusic.pause();
    AppState.isMusicPlaying = false;
    DOM.musicBtn.classList.remove('playing');
    DOM.musicBtn.querySelector('.music-icon').textContent = '🎵';
}

function playMusicWithHeart() {
    if (!AppState.isMusicPlaying) {
        playMusic();
        
        // Animación del corazón
        DOM.heartBtn.style.transform = 'scale(1.3)';
        setTimeout(() => {
            DOM.heartBtn.style.transform = 'scale(1)';
        }, 300);
    }
}

// ============================================
// CUENTA REGRESIVA
// ============================================

function startCountdown() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    const now = new Date();
    const difference = CONFIG.eventDate - now;

    if (difference <= 0) {
        // El evento ya comenzó
        DOM.countdownElements.days.textContent = '00';
        DOM.countdownElements.hours.textContent = '00';
        DOM.countdownElements.minutes.textContent = '00';
        DOM.countdownElements.seconds.textContent = '00';
        return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    // Actualizar DOM con animación
    updateCountdownNumber(DOM.countdownElements.days, days);
    updateCountdownNumber(DOM.countdownElements.hours, hours);
    updateCountdownNumber(DOM.countdownElements.minutes, minutes);
    updateCountdownNumber(DOM.countdownElements.seconds, seconds);
}

function updateCountdownNumber(element, value) {
    const stringValue = String(value).padStart(2, '0');
    if (element.textContent !== stringValue) {
        element.style.transform = 'scale(1.2)';
        setTimeout(() => {
            element.textContent = stringValue;
            element.style.transform = 'scale(1)';
        }, 200);
    }
}

// ============================================
// NAVEGACIÓN ENTRE SECCIONES
// ============================================

function showSection(index) {
    if (index < 0 || index >= AppState.sections.length) return;
    
    // Ocultar sección actual
    AppState.sections[AppState.currentSection].classList.add('hidden');
    
    // Mostrar nueva sección
    AppState.sections[index].classList.remove('hidden');
    AppState.currentSection = index;
    
    // Scroll suave a la sección
    AppState.sections[index].scrollIntoView({ behavior: 'smooth' });
    
    // Iniciar cuenta regresiva si es la sección correspondiente
    if (index === 4) { // Sección de countdown
        startCountdown();
    }
}

function handleScroll(e) {
    e.preventDefault();
    
    const delta = Math.sign(e.deltaY);
    
    if (delta > 0 && AppState.currentSection < AppState.sections.length - 1) {
        showSection(AppState.currentSection + 1);
    } else if (delta < 0 && AppState.currentSection > 0) {
        showSection(AppState.currentSection - 1);
    }
}

function handleTouchScroll(startY, endY) {
    const threshold = 50;
    const diff = startY - endY;
    
    if (Math.abs(diff) > threshold) {
        if (diff > 0 && AppState.currentSection < AppState.sections.length - 1) {
            showSection(AppState.currentSection + 1);
        } else if (diff < 0 && AppState.currentSection > 0) {
            showSection(AppState.currentSection - 1);
        }
    }
}

function updateVisibleSection() {
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    
    AppState.sections.forEach((section, index) => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            AppState.currentSection = index;
            
            // Iniciar countdown si llegamos a esa sección
            if (index === 4 && !AppState.countdownStarted) {
                startCountdown();
                AppState.countdownStarted = true;
            }
        }
    });
}

// ============================================
// SERVICE WORKER (PWA)
// ============================================

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('✅ Service Worker registrado:', registration);
                
                // Verificar actualizaciones
                registration.addEventListener('updatefound', () => {
                    console.log('🔄 Actualización disponible');
                });
            })
            .catch(error => {
                console.log('❌ Error al registrar Service Worker:', error);
            });
            
        // Escuchar cambios en el Service Worker
        navigator.serviceWorker.addEventListener('message', event => {
            console.log('Mensaje del Service Worker:', event.data);
        });
    }
}

// ============================================
// UTILIDADES
// ============================================

function playSound(type) {
    // Aquí puedes agregar sonidos opcionales
    // Por ejemplo: sonido de sobre abriéndose
    console.log(' Sonido:', type);
}

function showNotification(message) {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(107, 78, 113, 0.9);
        color: white;
        padding: 15px 30px;
        border-radius: 50px;
        font-family: 'Montserrat', sans-serif;
        z-index: 10000;
        box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        animation: slideUp 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function formatWhatsAppMessage() {
    return `¡Hola!%20Confirmo%20mi%20asistencia%20a%20los%20XV%20años%20de%20${CONFIG.eventName}`;
}

// Agregar animaciones CSS dinámicas
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translate(-50%, 30px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }
    
    @keyframes slideDown {
        from {
            opacity: 1;
            transform: translate(-50%, 0);
        }
        to {
            opacity: 0;
            transform: translate(-50%, 30px);
        }
    }
    
    .countdown-number {
        transition: transform 0.3s ease;
    }
`;
document.head.appendChild(style);

// ============================================
// DETECCIÓN DE DISPOSITIVO
// ============================================

function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isTablet() {
    return /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
}

// Agregar clase al body según dispositivo
if (isMobile()) {
    document.body.classList.add('is-mobile');
} else if (isTablet()) {
    document.body.classList.add('is-tablet');
} else {
    document.body.classList.add('is-desktop');
}

// ============================================
// PRECARGA DE IMÁGENES
// ============================================

function preloadImages(images) {
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Precargar imágenes importantes
window.addEventListener('load', () => {
    preloadImages([
        'images/corona.png',
        'images/rapunzel.png',
        'images/pascal.png',
        'images/flores.png',
        'images/sol.png'
    ]);
});

// ============================================
// EFECTOS DE PARTÍCULAS (OPCIONAL)
// ============================================

function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle-particle';
    sparkle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 10px;
        height: 10px;
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

// Agregar efecto de brillo al hacer click
document.addEventListener('click', (e) => {
    if (Math.random() > 0.7) { // 30% de probabilidad
        createSparkle(e.clientX, e.clientY);
    }
});

// Agregar animación de sparkle
const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
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
    
    .sparkle-particle {
        pointer-events: none;
    }
`;
document.head.appendChild(sparkleStyle);

console.log('✨ Invitación XV Años - Rapunzel cargada correctamente ✨');