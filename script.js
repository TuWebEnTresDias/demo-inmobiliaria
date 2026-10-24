/* ========================================
   INMOBILIARIA — Inmobiliaria Landing
   Interacciones limpias y funcionales
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ── PERSONALIZATION ENGINE (?n=&e=&t=) ──────── */
    const Personalization = {
        params: (() => {
            // First try current page URL
            const local = new URLSearchParams(window.__DEMO_PARAMS__ ?? window.location.search);
            if (local.toString()) return local;

            // Fallback: check parent window (iframe scenario)
            try {
                if (window.parent && window.parent !== window) {
                    return new URLSearchParams(window.parent.location.search);
                }
            } catch (e) { /* cross-origin, ignore */ }

            return local;
        })(),

        init() {
            const rawName = this.params.get('n')?.trim().slice(0, 80);
            const rawCompany = this.params.get('e')?.trim().slice(0, 80);
            const phone = this.params.get('t');

            const company = rawCompany ? `${rawCompany} | Propiedades` : null;
            const name = rawName ? `${rawName} | Inmobiliaria` : null;

            if (company) {
                this.apply({ type: 'company', value: company });
            } else if (name) {
                this.apply({ type: 'name', value: name });
            }

            if (phone) {
                this.applyPhone(phone);
            }
        },

        apply({ type, value }) {
            // Update page title
            document.title = `${value} | Inmobiliaria en Buenos Aires`;

            // Update all elements with data-dynamic attribute
            document.querySelectorAll('[data-dynamic]').forEach(el => {
                const key = el.dataset.dynamic;

                switch (key) {
                    case 'name':
                    case 'logo':
                    case 'footer-name':
                        el.textContent = `${value}`;
                        break;
                    case 'title':
                        el.textContent = `${value} | Inmobiliaria en Buenos Aires`;
                        break;
                }
            });

            // Update WhatsApp links with the name
            this.updateWhatsApp(value);

            // Update meta description
            this.updateMeta(value);
        },

        applyPhone(phone) {
            // Clean phone: remove spaces, dashes, parentheses
            const normalized = window.SiteSecurity.normalizePhone(phone);
            if (!normalized) return;
            const cleanPhone = normalized.national;

            // tel: links → use raw phone (ej: tel:1155551234)
            document.querySelectorAll('a[href^="tel:"]').forEach(el => {
                el.href = `tel:${cleanPhone}`;
            });

            // wa.me links → prepend 549 (ej: wa.me/5491155551234)
            const whatsappPhone = `549${cleanPhone}`;
            document.querySelectorAll('[data-whatsapp]').forEach(el => {
                const url = new URL(el.href);
                url.hostname = 'wa.me';
                url.pathname = `/${whatsappPhone}`;
                el.href = url.toString();
            });

            // Update displayed phone numbers (text content)
            const displayPhone = cleanPhone.replace(/(\d{4})(\d{4})/, '$1-$2');
            document.querySelectorAll('.topbar__phone').forEach(el => {
                el.textContent = `Oficina: ${cleanPhone}`;
            });
            document.querySelectorAll('.contact__detail a[href^="tel:"], .footer__col a[href^="tel:"]').forEach(el => {
                el.textContent = displayPhone;
            });

            // Update the contact form WhatsApp number
            this._whatsappNumber = whatsappPhone;
        },

        updateWhatsApp(name) {
            const phone = this.params.get('t');
            const normalized = window.SiteSecurity.normalizePhone(phone ?? '1158055802');
            const phoneClean = normalized?.national || '';
            const whatsappPhone = `549${phoneClean}`;

            document.querySelectorAll('[data-whatsapp]').forEach(el => {
                // Keep per-element message when provided (e.g. property cards)
                const customMsg = el.dataset.waMsg;
                const message = customMsg
                    ? encodeURIComponent(customMsg)
                    : encodeURIComponent(
                        `Hola! Me comunico desde la página de ${name}. Quisiera hacer una consulta.`
                    );
                el.href = `https://wa.me/${whatsappPhone}?text=${message}`;
            });
        },

        updateMeta(name) {
            const meta = document.querySelector('meta[name="description"]');
            if (meta) {
                meta.content = `${name} - Inmobiliaria en Buenos Aires. Compra, venta, alquileres y tasaciones de propiedades en CABA y GBA.`;
            }
        }
    };

    Personalization.init();


    /* ── TOP BAR (hide on scroll) ────── */
    const topbar = document.getElementById('topbar');

    const handleTopbar = () => {
        if (window.scrollY > 80) {
            topbar.classList.add('hidden');
        } else {
            topbar.classList.remove('hidden');
        }
    };

    if (topbar) {
        window.addEventListener('scroll', handleTopbar, { passive: true });
    }


    /* ── HEADER SCROLL EFFECT ─────────── */
    const header = document.getElementById('header');

    const handleHeaderScroll = () => {
        if (window.scrollY > 60) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
    };

    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();


    /* ── MOBILE MENU ──────────────────── */
    const burger = document.getElementById('burgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = mobileMenu.querySelectorAll('.mobile-menu__link');

    const toggleMenu = () => {
        const isOpen = mobileMenu.classList.toggle('active');
        burger.classList.toggle('active', isOpen);
        burger.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    const closeMenu = () => {
        burger.classList.remove('active');
        mobileMenu.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    };

    burger.addEventListener('click', toggleMenu);
    mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMenu();
        }
    });


    /* ── SMOOTH SCROLL ─────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const headerHeight = header.offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });


    /* ── SCROLL REVEAL ANIMATIONS ─────── */
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));


    /* ── PROPERTY FILTER ──────────────── */
    const filterButtons = document.querySelectorAll('.properties__filter');
    const propertyCards = document.querySelectorAll('.prop-card');
    const propertiesCount = document.getElementById('propertiesCount');

    const updateCount = (visibleCount) => {
        if (!propertiesCount) return;
        const label = visibleCount === 1 ? 'propiedad' : 'propiedades';
        propertiesCount.textContent = `Mostrando ${visibleCount} ${label}`;
    };

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;

            filterButtons.forEach(btn => btn.classList.remove('is-active'));
            button.classList.add('is-active');

            let visible = 0;
            propertyCards.forEach(card => {
                const show = filter === 'todos' || card.dataset.tipo === filter;
                card.classList.toggle('is-hidden', !show);
                if (show) visible++;
            });

            updateCount(visible);
        });
    });


    /* ── ANIMATED COUNTERS ────────────── */
    const counters = document.querySelectorAll('.counter__number');
    let countersAnimated = false;

    const animateCounters = () => {
        counters.forEach(counter => {
            const target = parseFloat(counter.dataset.target);
            const suffix = counter.dataset.suffix || '';
            const duration = 2000;
            const isDecimal = target % 1 !== 0;
            const startTime = performance.now();

            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = target * eased;

                if (isDecimal) {
                    counter.textContent = current.toFixed(1) + suffix;
                } else {
                    counter.textContent = Math.floor(current) + suffix;
                }

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            };

            requestAnimationFrame(updateCounter);
        });
    };

    const countersSection = document.querySelector('.counters');
    if (countersSection) {
        const countersObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !countersAnimated) {
                    countersAnimated = true;
                    animateCounters();
                    countersObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        countersObserver.observe(countersSection);
    }


    /* ── CONTACT FORM → WHATSAPP ──────── */
    const contactForm = document.getElementById('contactForm');
    const defaultWhatsappNumber = '5491158055802';

    const interestLabels = {
        comprar: 'Comprar una propiedad',
        alquilar: 'Alquilar una propiedad',
        vender: 'Vender mi propiedad',
        'alquilar-propia': 'Alquilar mi propiedad',
        tasacion: 'Pedir una tasación'
    };

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('contactName').value.trim();
            const phone = document.getElementById('contactPhone').value.trim();
            const interest = document.getElementById('contactInterest').value;
            const message = document.getElementById('contactMessage').value.trim();

            // Use personalized phone if set via ?t= param
            const whatsappNumber = Personalization._whatsappNumber || defaultWhatsappNumber;
            const interestLabel = interestLabels[interest] || 'Consulta general';

            // Build message
            let whatsappMessage = `Hola! Me comunico desde la página web.\n\n`;
            whatsappMessage += `👤 *Nombre:* ${name}\n`;
            whatsappMessage += `📞 *Teléfono:* ${phone}\n`;
            whatsappMessage += `🏠 *Consulta:* ${interestLabel}\n`;

            if (message) {
                whatsappMessage += `💬 *Mensaje:* ${message}\n`;
            }

            whatsappMessage += `\n¡Gracias!`;

            // Encode and open WhatsApp
            const encodedMessage = encodeURIComponent(whatsappMessage);
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

            // Show feedback
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '¡Enviado! ✓';
            submitBtn.style.backgroundColor = '#25D366';

            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.backgroundColor = '';
                contactForm.reset();
            }, 2000);
        });
    }


    /* ── WHATSAPP FLOAT VISIBILITY ─────── */
    const whatsappFloat = document.getElementById('whatsappFloat');

    if (whatsappFloat) {
        const handleWhatsappVisibility = () => {
            if (window.scrollY > 300) {
                whatsappFloat.classList.add('visible');
            } else {
                whatsappFloat.classList.remove('visible');
            }
        };

        window.addEventListener('scroll', handleWhatsappVisibility, { passive: true });
    }


    /* ── MOBILE STICKY CTA ────────────── */
    const mobileCta = document.getElementById('mobileCta');

    if (mobileCta) {
        const handleMobileCta = () => {
            if (window.scrollY > 400) {
                mobileCta.classList.add('visible');
            } else {
                mobileCta.classList.remove('visible');
            }
        };

        window.addEventListener('scroll', handleMobileCta, { passive: true });
    }


    /* ── ACTIVE NAV HIGHLIGHT ──────────── */
    const sections = document.querySelectorAll('section[id]');

    const highlightNav = () => {
        const scrollPosition = window.scrollY + 150;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('.header__nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', highlightNav, { passive: true });


    /* ── CURRENT YEAR ──────────────────── */
    const yearElements = document.querySelectorAll('#currentYear');
    const currentYear = new Date().getFullYear();

    yearElements.forEach(el => {
        el.textContent = currentYear;
    });

});
