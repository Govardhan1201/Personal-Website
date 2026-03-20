document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. LOADER LOGIC
       ========================================================================== */
    const loader = document.getElementById('loader');
    const loaderBar = document.getElementById('loaderBar');
    const loaderPercent = document.getElementById('loaderPercent');
    
    let currentPercent = 0;
    
    // Simulate loading
    const loadInterval = setInterval(() => {
        currentPercent += Math.floor(Math.random() * 15) + 5;
        
        if (currentPercent >= 100) {
            currentPercent = 100;
            clearInterval(loadInterval);
            
            // Finish loading
            setTimeout(() => {
                loader.classList.add('hidden');
                
                // Trigger entry animations for map section
                setTimeout(() => {
                    document.querySelector('.map-headline').style.opacity = '1';
                }, 500);
            }, 500);
        }
        
        loaderBar.style.width = `${currentPercent}%`;
        loaderPercent.textContent = `${currentPercent}%`;
    }, 100);


    /* ==========================================================================
       2. FULL-SCREEN MENU
       ========================================================================== */
    const menuToggle = document.getElementById('menuToggle');
    const navOverlay = document.getElementById('navOverlay');
    const navClose = document.getElementById('navClose');
    const navLinks = document.querySelectorAll('.nav-item');

    menuToggle.addEventListener('click', () => {
        navOverlay.classList.add('open');
        menuToggle.setAttribute('aria-expanded', 'true');
    });

    navClose.addEventListener('click', () => {
        navOverlay.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navOverlay.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });


    /* ==========================================================================
       3. INTERACTIVE MAP
       ========================================================================== */
    const zones = document.querySelectorAll('.island-zone');
    const tooltip = document.getElementById('mapTooltip');
    const mapCanvas = document.getElementById('mapCanvas');
    const svgMap = document.getElementById('islandMap');
    const zoomIn = document.getElementById('zoomIn');
    const zoomOut = document.getElementById('zoomOut');
    
    let currentZoom = 1;
    const MAX_ZOOM = 2;
    const MIN_ZOOM = 0.5;

    // Hover logic for zones
    zones.forEach(zone => {
        zone.addEventListener('mouseenter', (e) => {
            const label = zone.getAttribute('data-label');
            tooltip.textContent = label;
            tooltip.classList.add('visible');
            
            // Position tooltip roughly over the cursor initially
            updateTooltipPos(e);
        });

        zone.addEventListener('mousemove', updateTooltipPos);

        zone.addEventListener('mouseleave', () => {
            tooltip.classList.remove('visible');
        });

        zone.addEventListener('click', (e) => {
            const targetId = zone.getAttribute('data-target');
            const targetEl = document.querySelector(targetId);
            
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth' });
            }
        });
        
        // Keyboard accessibility
        zone.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                zone.click();
            }
        });
    });

    function updateTooltipPos(e) {
        // Offset slightly above cursor
        tooltip.style.left = `${e.clientX}px`;
        tooltip.style.top = `${e.clientY - 20}px`;
    }

    // Zoom Controls
    zoomIn.addEventListener('click', () => {
        if (currentZoom < MAX_ZOOM) {
            currentZoom += 0.25;
            applyZoom();
        }
    });

    zoomOut.addEventListener('click', () => {
        if (currentZoom > MIN_ZOOM) {
            currentZoom -= 0.25;
            applyZoom();
        }
    });

    function applyZoom() {
        svgMap.style.transform = `scale(${currentZoom})`;
    }

    // Basic map panning (drag to move map) - Polecat style explorer feel
    let isDragging = false;
    let startX, startY, scrollLeft, scrollTop;
    
    const mapSection = document.querySelector('.map-section');

    mapSection.addEventListener('mousedown', (e) => {
        // Don't drag if clicking buttons or interactive zones
        if (e.target.closest('button') || e.target.closest('.island-zone')) return;
        
        isDragging = true;
        startX = e.pageX - mapSection.offsetLeft;
        startY = e.pageY - mapSection.offsetTop;
        
        // Use a wrapper or the container's transforms if we wanted true panning.
        // For this implementation, since it's centered, we just apply a slight translate.
    });

    mapSection.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    mapSection.addEventListener('mouseup', () => {
        isDragging = false;
    });

    mapSection.addEventListener('mousemove', (e) => {
        if (!isDragging || currentZoom <= 1) return;
        e.preventDefault();
        
        // Calculate drag distance
        const x = e.pageX - mapSection.offsetLeft;
        const y = e.pageY - mapSection.offsetTop;
        const walkX = (x - startX) * 1.5;
        const walkY = (y - startY) * 1.5;
        
        // Apply transform along with zoom
        svgMap.style.transform = `scale(${currentZoom}) translate(${walkX/currentZoom}px, ${walkY/currentZoom}px)`;
    });


    /* ==========================================================================
       4. SCROLL REVEAL ANIMATIONS
       ========================================================================== */
    const revealElements = document.querySelectorAll('.project-card, .about-text-block, .stat-card, .edu-item, .skill-block, .contact-link-item');
    
    // Add base class to all target elements
    revealElements.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: unobserve after revealing once
                // observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    /* ==========================================================================
       5. 3D HOVER TILT EFFECTS (Micro Interactions)
       ========================================================================== */
    const tiltElements = document.querySelectorAll('.project-card, .skill-block');
    
    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const maxTilt = 8; // Max tilt rotation in degrees
            
            const tiltX = ((y - centerY) / centerY) * -maxTilt;
            const tiltY = ((x - centerX) / centerX) * maxTilt;
            
            // Add scale and 3D motion based on cursor position
            el.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            // Wait for 300ms transition to clean up inline styles so reveal logic isn't broken
            setTimeout(() => {
                if (!el.matches(':hover')) {
                    el.style.transform = '';
                }
            }, 300);
        });
    });

    /* ==========================================================================
       6. PARALLAX SCROLL EFFECT
       ========================================================================== */
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        
        // Map Dots Parallax
        const mapDots = document.querySelector('.map-dots');
        if(mapDots && scrolled < window.innerHeight) {
            mapDots.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
        
        // Section Titles Parallax
        document.querySelectorAll('.section-title').forEach(title => {
            const rect = title.getBoundingClientRect();
            if(rect.top < window.innerHeight && rect.bottom > 0) {
                const distance = (window.innerHeight / 2) - (rect.top + rect.height / 2);
                title.style.transform = `translateY(${distance * 0.15}px)`;
            }
        });
    });

    /* ==========================================================================
       7. HEADER BLEND MODE SWITCHING
       ========================================================================== */
    // The header is white with mix-blend-mode: difference.
    // This allows it to invert against background colors perfectly without complex JS.

    /* ==========================================================================
       6. MODAL FOR CERTIFICATIONS
       ========================================================================== */
    const viewCertsBtn = document.getElementById('viewCertsBtn');
    const certsModal = document.getElementById('certsModal');
    const closeCertsModal = document.getElementById('closeCertsModal');

    if(viewCertsBtn && certsModal && closeCertsModal) {
        viewCertsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            certsModal.classList.add('active');
            certsModal.setAttribute('aria-hidden', 'false');
            // Ensure overlay displays fully
            certsModal.style.opacity = '1';
            certsModal.style.pointerEvents = 'auto';
        });

        closeCertsModal.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            certsModal.classList.remove('active');
            certsModal.setAttribute('aria-hidden', 'true');
            certsModal.style.opacity = '';
            certsModal.style.pointerEvents = '';
        });

        // Close when clicking outside content
        certsModal.addEventListener('click', (e) => {
            if (e.target === certsModal) {
                certsModal.classList.remove('active');
                certsModal.setAttribute('aria-hidden', 'true');
                certsModal.style.opacity = '';
                certsModal.style.pointerEvents = '';
            }
        });
    }

    console.log('%c🚀 Welcome to the Redesigned Portfolio!', 'color: #00c5ff; font-size: 16px; font-weight: bold;');
});