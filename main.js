/* =====================================================================
   GLÄDIA Café — interaction layer
   Scroll choreography, bilingual switching, gallery lightbox, CTAs.
   ===================================================================== */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Static preview mode (?static) — freeze motion for review captures */
  var STATIC = /[?&]static\b/.test(window.location.search);
  if (STATIC) {
    root.classList.add('is-static');
    reduceMotion = true;
  }

  /* ------------------------------------------------------------------
     0. Utilities
     ------------------------------------------------------------------ */
  function decodeEntities(str) {
    var t = doc.createElement('textarea');
    t.innerHTML = str;
    return t.value;
  }

  function on(el, evt, fn, opts) { if (el) el.addEventListener(evt, fn, opts || false); }

  /* ------------------------------------------------------------------
     1. Language (EN / AR) — full RTL switch
     ------------------------------------------------------------------ */
  var state = { lang: 'ar' };

  var TITLES = {
    en: 'GLÄDIA — Coffee. Art. Experience. | Specialty Café, Al Muhammadiyah, Jeddah',
    ar: 'غلاديا — قهوة. فن. تجربة. | كافيه متخصص، المحمدية، جدة'
  };

  var MODAL_COPY = {
    whatsapp: {
      en: {
        eyebrow: 'Direct line',
        title: 'Contact on WhatsApp',
        body: '<p>The official GLÄDIA WhatsApp line is reserved for reservations, events and quick questions.</p>' +
              '<p><strong>Note:</strong> the number is a placeholder in this prototype. The verified line will be added here before launch.</p>',
        actions: '<button type="button" class="btn btn--dark" data-act="copy" data-copy="@gladia_cafe"><span>Copy @gladia_cafe</span></button>' +
                 '<a class="btn btn--line-dark" href="https://instagram.com/gladia_cafe" target="_blank" rel="noopener"><span>Open Instagram</span></a>'
      },
      ar: {
        eyebrow: 'تواصل مباشر',
        title: 'تواصل عبر واتساب',
        body: '<p>خط واتساب الرسمي لغلاديا مخصّص للحجوزات والفعاليات والأسئلة السريعة.</p>' +
              '<p><strong>ملاحظة:</strong> الرقم في هذا النموذج مؤقت، وسيُضاف الرقم المعتمد قبل الإطلاق.</p>',
        actions: '<button type="button" class="btn btn--dark" data-act="copy" data-copy="@gladia_cafe"><span>نسخ @gladia_cafe</span></button>' +
                 '<a class="btn btn--line-dark" href="https://instagram.com/gladia_cafe" target="_blank" rel="noopener"><span>فتح إنستغرام</span></a>'
      }
    },
    instagram: {
      en: {
        eyebrow: 'Follow the feed',
        title: 'Follow on Instagram',
        body: '<p><strong>@gladia_cafe</strong> is the home of the GLÄDIA feed — new exhibitions, seasonal drinks and moments from the room.</p>' +
              '<p>The account shown here is the brand handle provided for this concept; link tracking will be added at launch.</p>',
        actions: '<a class="btn btn--terracotta" href="https://instagram.com/gladia_cafe" target="_blank" rel="noopener"><span>Open Instagram</span></a>' +
                 '<button type="button" class="btn btn--line-dark" data-act="copy" data-copy="@gladia_cafe"><span>Copy handle</span></button>'
      },
      ar: {
        eyebrow: 'تابع الصفحة',
        title: 'تابعنا على إنستغرام',
        body: '<p><strong>@gladia_cafe</strong> هو home feed غلاديا — معارض جديدة، ومشروبات موسمية، ولحظات من المكان.</p>' +
              '<p>الحساب المعروض هنا هو handle العلامة التجارية المقدم لهذا المفهوم، وسيُضاف التتبّع عند الإطلاق.</p>',
        actions: '<a class="btn btn--terracotta" href="https://instagram.com/gladia_cafe" target="_blank" rel="noopener"><span>فتح إنستغرام</span></a>' +
                 '<button type="button" class="btn btn--line-dark" data-act="copy" data-copy="@gladia_cafe"><span>نسخ الحساب</span></button>'
      }
    },
    events: {
      en: {
        eyebrow: 'Experiences',
        title: 'Event Inquiry',
        body: '<p>Tell us the shape of your gathering and we will reply with options, timings and pricing.</p>' +
              '<ul>' +
              '<li>Private events — full or partial space hire</li>' +
              '<li>Art workshops — painting, calligraphy, cup design</li>' +
              '<li>Private gatherings — reserved tables and corners</li>' +
              '<li>Catering — coffee, pastries and light bites brought to you</li>' +
              '</ul>' +
              '<p><strong>Note:</strong> this prototype does not submit forms. The inquiry channel is confirmed with the client before launch.</p>',
        actions: '<button type="button" class="btn btn--terracotta" data-modal="whatsapp"><span>Message on WhatsApp</span></button>' +
                 '<a class="btn btn--line-dark" href="https://instagram.com/gladia_cafe" target="_blank" rel="noopener"><span>Send via Instagram</span></a>'
      },
      ar: {
        eyebrow: 'التجارب',
        title: 'استفسار عن فعالية',
        body: '<p>أخبرنا بشكل مناسبتك وسيردّ فريقنا بخيارات التوقيت والأسعار.</p>' +
              '<ul>' +
              '<li>فعاليات خاصة — حجز كامل أو جزئي للمكان</li>' +
              '<li>ورش فنية — رسم، خط عربي، تصميم فناجين</li>' +
              '<li>لقاءات خاصة — طاولات وأركان محجوزة</li>' +
              '<li>ضيافة — قهوة ومعجنات وأطباق خفيفة تُقدَّم لك</li>' +
              '</ul>' +
              '<p><strong>ملاحظة:</strong> هذا النموذج لا يرسل نماذج. تُؤكَّد قناة الاستفسار مع العميل قبل الإطلاق.</p>',
        actions: '<button type="button" class="btn btn--terracotta" data-modal="whatsapp"><span>راسلنا على واتساب</span></button>' +
                 '<a class="btn btn--line-dark" href="https://instagram.com/gladia_cafe" target="_blank" rel="noopener"><span>أرسل عبر إنستغرام</span></a>'
      }
    }
  };

  function applyLanguage(lang) {
    state.lang = lang;
    root.setAttribute('lang', lang);
    root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    $$('[data-en]').forEach(function (el) {
      var raw = el.getAttribute(lang === 'ar' ? 'data-ar' : 'data-en');
      if (raw == null) return;
      el.textContent = decodeEntities(raw);
    });

    $$('.lang__btn').forEach(function (b) {
      var on = b.getAttribute('data-lang') === lang;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    // gallery captions
    $$('.shot').forEach(function (shot) {
      var cap = shot.querySelector('.shot__cap span');
      if (!cap) return;
      var raw = shot.getAttribute(lang === 'ar' ? 'data-cap-ar' : 'data-cap-en');
      if (raw) cap.textContent = raw;
      var img = shot.querySelector('img');
      if (img) img.alt = raw || img.alt;
    });

    // accessible names
    $$('[data-aria-en]').forEach(function (el) {
      var v = el.getAttribute(lang === 'ar' ? 'data-aria-ar' : 'data-aria-en');
      if (v) el.setAttribute('aria-label', v);
    });

    document.title = TITLES[lang] || TITLES.ar;

    // lightbox caption
    if (lightbox.index >= 0) paintLightboxCaption();

    // re-render open modal in the new language
    if (modalEl.classList.contains('is-open') && state.modalKey) openModal(state.modalKey, true);

    try { localStorage.setItem('gladia-lang', lang); } catch (e) { /* storage blocked */ }
  }

  $$('.lang__btn').forEach(function (btn) {
    on(btn, 'click', function () { applyLanguage(btn.getAttribute('data-lang')); });
  });

  /* ------------------------------------------------------------------
     2. Preloader
     ------------------------------------------------------------------ */
  var preloader = $('#preloader');
  function dismissPreloader() {
    if (!preloader || preloader.classList.contains('is-done')) return;
    preloader.classList.add('is-done');
    setTimeout(function () { if (preloader && preloader.parentNode) preloader.parentNode.removeChild(preloader); }, 1000);
  }
  if (preloader) {
    window.addEventListener('load', function () { setTimeout(dismissPreloader, reduceMotion ? 0 : 1250); });
    setTimeout(dismissPreloader, 4200); // safety net
  }

  /* ------------------------------------------------------------------
     3. Header state, scroll progress, active section
     ------------------------------------------------------------------ */
  var hdr = $('#hdr');
  var progressBar = $('#progressBar');
  var navLinks = $$('.nav__link');
  var sections = navLinks.map(function (l) { return doc.getElementById(l.getAttribute('href').slice(1)); }).filter(Boolean);

  var ticking = false;
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var docH = doc.documentElement.scrollHeight - window.innerHeight;
    hdr.classList.toggle('is-stuck', y > 40);
    if (progressBar) progressBar.style.width = (docH > 0 ? Math.min(1, y / docH) * 100 : 0) + '%';

    var current = '';
    var probe = y + window.innerHeight * 0.32;
    sections.forEach(function (s) {
      if (s.offsetTop <= probe) current = s.id;
    });
    navLinks.forEach(function (l) {
      var active = l.getAttribute('href') === '#' + current;
      l.classList.toggle('is-active', active);
      if (active) l.setAttribute('aria-current', 'true');
      else l.removeAttribute('aria-current');
    });
    ticking = false;
  }
  on(window, 'scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------
     4. Mobile menu
     ------------------------------------------------------------------ */
  var burger = $('#burger');
  var mmenu = $('#mmenu');
  var mmenuLinks = $$('.mmenu__link');

  function setMenu(open) {
    mmenu.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    mmenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    doc.body.style.overflow = open ? 'hidden' : '';
    mmenuLinks.forEach(function (l, i) { l.style.transitionDelay = open ? (0.08 + i * 0.06) + 's' : '0s'; });
  }
  on(burger, 'click', function () { setMenu(!mmenu.classList.contains('is-open')); });
  mmenuLinks.forEach(function (l) { on(l, 'click', function () { setMenu(false); }); });
  on(doc, 'keydown', function (e) { if (e.key === 'Escape' && mmenu.classList.contains('is-open')) setMenu(false); });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 980 && mmenu.classList.contains('is-open')) setMenu(false);
  });

  /* ------------------------------------------------------------------
     5. Smooth anchor scrolling with header offset
     ------------------------------------------------------------------ */
  function scrollToTarget(hash) {
    var target = doc.querySelector(hash);
    if (!target) return;
    var offset = hdr.offsetHeight + 8;
    var top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: top < 0 ? 0 : top, behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  $$('a[href^="#"]').forEach(function (a) {
    on(a, 'click', function (e) {
      var hash = a.getAttribute('href');
      if (!hash || hash === '#') return;
      var target = doc.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      scrollToTarget(hash);
      if (history.replaceState) history.replaceState(null, '', hash);
    });
  });

  /* ------------------------------------------------------------------
     6. Scroll reveal
     ------------------------------------------------------------------ */
  var revealables = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ------------------------------------------------------------------
     7. Menu category filter
     ------------------------------------------------------------------ */
  var tabs = $$('.menu__tab');
  var grid = $('#menuGrid');
  var cards = $$('.card', grid);

  function filterCategory(cat) {
    tabs.forEach(function (t) {
      var on = t.getAttribute('data-cat') === cat;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    cards.forEach(function (card) {
      var show = cat === 'all' || card.getAttribute('data-cat') === cat;
      if (show) {
        card.classList.remove('is-hidden');
        card.classList.remove('is-enter');
        void card.offsetWidth;
        card.classList.add('is-enter');
      } else {
        card.classList.add('is-hidden');
      }
    });
  }
  tabs.forEach(function (t) {
    on(t, 'click', function () { filterCategory(t.getAttribute('data-cat')); });
  });

  /* ------------------------------------------------------------------
     8. Lightbox
     ------------------------------------------------------------------ */
  var lightbox = { el: null, index: -1, shots: [], cap: null, count: null, img: null };
  lightbox.el = $('#lightbox');
  lightbox.img = $('#lbImg');
  lightbox.cap = $('#lbCap');
  lightbox.count = $('#lbCount');
  lightbox.shots = $$('.shot');

  function paintLightboxCaption() {
    if (lightbox.index < 0) return;
    var shot = lightbox.shots[lightbox.index];
    var attr = state.lang === 'ar' ? 'data-cap-ar' : 'data-cap-en';
    lightbox.cap.textContent = shot.getAttribute(attr) || '';
    lightbox.count.textContent = String(lightbox.index + 1).padStart(2, '0') + ' / ' + String(lightbox.shots.length).padStart(2, '0');
  }

  function openLightbox(i) {
    lightbox.index = i;
    var shot = lightbox.shots[i];
    var img = shot.querySelector('img');
    lightbox.img.src = shot.getAttribute('data-src') || img.src;
    lightbox.img.alt = img.alt;
    paintLightboxCaption();
    lightbox.el.classList.add('is-open');
    lightbox.el.setAttribute('aria-hidden', 'false');
    doc.body.style.overflow = 'hidden';
    $('#lbClose').focus();
  }

  function closeLightbox() {
    lightbox.el.classList.remove('is-open');
    lightbox.el.setAttribute('aria-hidden', 'true');
    lightbox.index = -1;
    doc.body.style.overflow = '';
  }

  function stepLightbox(dir) {
    if (lightbox.index < 0) return;
    var next = (lightbox.index + dir + lightbox.shots.length) % lightbox.shots.length;
    openLightbox(next);
  }

  lightbox.shots.forEach(function (shot, i) {
    shot.addEventListener('click', function () { openLightbox(i); });
  });
  on($('#lbClose'), 'click', closeLightbox);
  on($('#lbPrev'), 'click', function () { stepLightbox(-1); });
  on($('#lbNext'), 'click', function () { stepLightbox(1); });
  on(lightbox.el, 'click', function (e) { if (e.target === lightbox.el) closeLightbox(); });

  // swipe
  var touchX = 0, touchY = 0;
  on(lightbox.el, 'touchstart', function (e) {
    touchX = e.changedTouches[0].clientX; touchY = e.changedTouches[0].clientY;
  }, { passive: true });
  on(lightbox.el, 'touchend', function (e) {
    var dx = e.changedTouches[0].clientX - touchX;
    var dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) stepLightbox(dx < 0 ? 1 : -1);
  }, { passive: true });

  /* ------------------------------------------------------------------
     9. Modal (contact CTAs)
     ------------------------------------------------------------------ */
  var modalEl = $('#modal');
  var modalTitle = $('#modalTitle');
  var modalEyebrow = $('#modalEyebrow');
  var modalBody = $('#modalBody');
  var modalActions = $('#modalActions');
  state.modalKey = null;

  function openModal(key, keepOpen) {
    var pack = MODAL_COPY[key];
    if (!pack) return;
    var copy = pack[state.lang];
    state.modalKey = key;
    modalEyebrow.textContent = copy.eyebrow;
    modalTitle.textContent = copy.title;
    modalBody.innerHTML = copy.body;
    modalActions.innerHTML = copy.actions;
    modalEl.classList.add('is-open');
    modalEl.setAttribute('aria-hidden', 'false');
    if (!keepOpen) {
      doc.body.style.overflow = 'hidden';
      setTimeout(function () { var f = modalEl.querySelector('button, a'); if (f) f.focus(); }, 60);
    }
  }

  function closeModal() {
    modalEl.classList.remove('is-open');
    modalEl.setAttribute('aria-hidden', 'true');
    state.modalKey = null;
    doc.body.style.overflow = '';
  }

  doc.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-modal]');
    if (trigger) {
      e.preventDefault();
      var key = trigger.getAttribute('data-modal');
      if (modalEl.classList.contains('is-open') && state.modalKey === key) closeModal();
      else openModal(key);
      return;
    }
    if (e.target.closest('[data-close]')) { closeModal(); return; }

    var copyBtn = e.target.closest('[data-act="copy"]');
    if (copyBtn) {
      var value = copyBtn.getAttribute('data-copy') || '';
      var label = copyBtn.querySelector('span');
      var original = label ? label.textContent : '';
      copyValue(value).then(function () {
        if (label) label.textContent = state.lang === 'ar' ? 'تم النسخ ✓' : 'Copied ✓';
        setTimeout(function () { if (label) label.textContent = original; }, 1800);
      });
    }
  });

  on(modalEl, 'click', function (e) { if (e.target.hasAttribute && e.target.hasAttribute('data-close')) closeModal(); });

  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (modalEl.classList.contains('is-open')) closeModal();
      else if (lightbox.el.classList.contains('is-open')) closeLightbox();
    }
    if (lightbox.el.classList.contains('is-open')) {
      if (e.key === 'ArrowRight') stepLightbox(state.lang === 'ar' ? -1 : 1);
      if (e.key === 'ArrowLeft') stepLightbox(state.lang === 'ar' ? 1 : -1);
    }
  });

  function copyValue(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    var ta = doc.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    doc.body.appendChild(ta);
    ta.select();
    try { doc.execCommand('copy'); } catch (e) { /* noop */ }
    doc.body.removeChild(ta);
  }

  /* ------------------------------------------------------------------
     10. Footer year
     ------------------------------------------------------------------ */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------------------
     11. Boot language
     ------------------------------------------------------------------ */
  var stored = null;
  try { stored = localStorage.getItem('gladia-lang'); } catch (e) { /* noop */ }
  applyLanguage(stored === 'en' ? 'en' : 'ar');
})();
