/* =============================================================================
   Behaviour shared by every page: theme, mobile menu, language selector,
   analytics consent and the contact form.
   All visitor-facing strings come from data-* attributes in the HTML, so they
   stay translated without duplicating text here.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var THEME_KEY = 'theme';
  var LOCALE_KEY = 'locale';

  /* ---------------------------------------------------------------------------
     Theme
     ------------------------------------------------------------------------- */
  var themeToggle = document.querySelector('[data-theme-toggle]');
  var themeRadios = Array.prototype.slice.call(document.querySelectorAll('[data-theme-radio]'));
  var systemQuery = window.matchMedia('(prefers-color-scheme: dark)');
  var modes = ['system', 'light', 'dark'];

  function readMode() {
    try {
      var saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    } catch (e) {}
    return 'system';
  }

  function applyMode(mode, persist) {
    var resolved = mode === 'system' ? (systemQuery.matches ? 'dark' : 'light') : mode;
    root.dataset.themeMode = mode;
    root.dataset.theme = resolved;
    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, mode);
      } catch (e) {}
    }
    themeRadios.forEach(function (radio) {
      radio.checked = radio.value === mode;
    });
    if (themeToggle) {
      var label = themeToggle.dataset.label + ': ' + modeLabel(mode);
      themeToggle.setAttribute('aria-label', label);
      themeToggle.title = label;
    }
  }

  function modeLabel(mode) {
    var input = themeRadios.find(function (r) {
      return r.value === mode;
    });
    var label = input && input.parentElement.querySelector('span');
    return label ? label.textContent.trim() : mode;
  }

  function toggleTheme() {
    var next = modes[(modes.indexOf(readMode()) + 1) % modes.length];
    applyMode(next, true);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  themeRadios.forEach(function (radio) {
    radio.addEventListener('change', function () {
      if (radio.checked) applyMode(radio.value, true);
    });
  });
  applyMode(readMode(), false);

  // Follow the system preference while the visitor keeps "system" selected.
  var onSystemChange = function () {
    if (readMode() === 'system') applyMode('system', false);
  };
  systemQuery.addEventListener('change', onSystemChange);

  /* ---------------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------------- */
  var menuButton = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-nav]');

  function setMenu(open) {
    if (!nav || !menuButton) return;
    nav.dataset.open = String(open);
    menuButton.setAttribute('aria-expanded', String(open));
    if (menuButton.dataset.labelClose && menuButton.dataset.labelOpen) {
      menuButton.setAttribute(
        'aria-label',
        open ? menuButton.dataset.labelClose : menuButton.dataset.labelOpen
      );
    }
    menuButton.querySelectorAll('.icon-menu').forEach(function (el) {
      el.style.display = open ? 'none' : 'block';
    });
    menuButton.querySelectorAll('.icon-close').forEach(function (el) {
      el.style.display = open ? 'block' : 'none';
    });
  }

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      setMenu(nav.dataset.open !== 'true');
    });
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.dataset.open === 'true') {
        setMenu(false);
        menuButton.focus();
      }
    });
    document.addEventListener('click', function (event) {
      if (nav.dataset.open !== 'true') return;
      if (nav.contains(event.target) || menuButton.contains(event.target)) return;
      setMenu(false);
    });
    window.matchMedia('(min-width: 861px)').addEventListener('change', function (event) {
      if (event.matches) setMenu(false);
    });
  }

  /* ---------------------------------------------------------------------------
     Language selector: keep the same route, remember the choice.
     ------------------------------------------------------------------------- */
  var langSelect = document.querySelector('[data-lang-select]');
  if (langSelect) {
    langSelect.addEventListener('change', function () {
      var code = langSelect.value;
      var current = langSelect.dataset.current;
      var segments = window.location.pathname.split('/').filter(Boolean);
      var goHome = langSelect.dataset.fallbackHome === 'true';
      var tail = segments[0] === current ? segments.slice(1) : segments;
      var target = goHome || !tail.length ? '/' + code + '/' : '/' + code + '/' + tail.join('/') + '/';
      try {
        localStorage.setItem(LOCALE_KEY, code);
      } catch (e) {}
      window.location.assign(target);
    });
  }

  var openLang = document.querySelector('[data-open-lang]');
  if (openLang && langSelect) {
    openLang.addEventListener('click', function () {
      langSelect.focus();
      if (typeof langSelect.showPicker === 'function') {
        try {
          langSelect.showPicker();
        } catch (e) {}
      }
      var header = document.querySelector('.site-header');
      if (header) header.scrollIntoView({ block: 'nearest' });
    });
  }

  /* ---------------------------------------------------------------------------
     Consent for analytics (cookieless). Nothing is loaded before a choice.
     ------------------------------------------------------------------------- */
  var banner = document.querySelector('[data-consent]');
  var consentKey = (banner && banner.dataset.storageKey) || 'analytics-consent';

  function readConsent() {
    try {
      return localStorage.getItem(consentKey);
    } catch (e) {
      return null;
    }
  }

  function loadAnalytics() {
    if (!banner) return;
    // The Vercel script only exists on a Vercel deployment; skip it locally.
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') return;
    if (document.querySelector('script[data-analytics]')) return;
    window.va =
      window.va ||
      function () {
        (window.vaq = window.vaq || []).push(arguments);
      };
    var script = document.createElement('script');
    script.defer = true;
    script.src = banner.dataset.scriptPath || '/_vercel/insights/script.js';
    script.setAttribute('data-analytics', '');
    document.head.appendChild(script);
  }

  function showBanner() {
    if (banner) banner.dataset.visible = 'true';
  }

  function hideBanner() {
    if (banner) banner.dataset.visible = 'false';
  }

  if (banner) {
    var stored = readConsent();
    if (stored === 'granted') loadAnalytics();
    else if (stored !== 'denied') showBanner();

    banner.querySelectorAll('[data-consent-accept]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        try {
          localStorage.setItem(consentKey, 'granted');
        } catch (e) {}
        hideBanner();
        loadAnalytics();
      });
    });
    banner.querySelectorAll('[data-consent-reject]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        try {
          localStorage.setItem(consentKey, 'denied');
        } catch (e) {}
        hideBanner();
      });
    });
  }

  document.querySelectorAll('[data-consent-settings]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      try {
        localStorage.removeItem(consentKey);
      } catch (e) {}
      showBanner();
      var accept = banner && banner.querySelector('[data-consent-accept]');
      if (accept) accept.focus();
    });
  });

  /* ---------------------------------------------------------------------------
     Contact form
     ------------------------------------------------------------------------- */
  var form = document.querySelector('[data-contact-form]');
  if (form) {
    var status = form.querySelector('[data-form-status]');
    var submit = form.querySelector('[data-submit]');
    var idleLabel = submit ? submit.textContent : '';
    var endpoint = (form.dataset.endpoint || '').trim();

    function setStatus(message, state) {
      if (!status) return;
      status.textContent = message;
      status.dataset.state = state || '';
    }

    function errorEl(name) {
      return form.querySelector('[data-error-for="' + name + '"]');
    }

    function setFieldError(field, message) {
      var el = errorEl(field.name);
      if (el) el.textContent = message;
      if (message) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
    }

    function validateField(field) {
      var value = field.value.trim();
      var message = '';
      if (field.name === '_gotcha') return true;
      if (!value) message = form.dataset.msgRequired;
      else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value))
        message = form.dataset.msgInvalidEmail;
      setFieldError(field, message);
      return !message;
    }

    var fields = Array.prototype.slice
      .call(form.querySelectorAll('input[name], textarea[name]'))
      .filter(function (field) {
        return field.name !== '_gotcha';
      });

    fields.forEach(function (field) {
      field.addEventListener('blur', function () {
        if (field.value.trim()) validateField(field);
      });
      field.addEventListener('input', function () {
        if (field.getAttribute('aria-invalid') === 'true') validateField(field);
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (form.querySelector('[name="_gotcha"]').value) return; // silently drop bots

      var firstInvalid = null;
      fields.forEach(function (field) {
        if (!validateField(field) && !firstInvalid) firstInvalid = field;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        setStatus('', '');
        return;
      }

      if (!endpoint) return; // A form is never rendered without a configured endpoint.

      var payload = new FormData(form);
      payload.delete('_gotcha');
      if (submit) {
        submit.disabled = true;
        submit.textContent = form.dataset.msgSending || '';
      }
      setStatus(form.dataset.msgSending || '', 'pending');

      fetch(endpoint, {
        method: 'POST',
        body: payload,
        headers: { Accept: 'application/json' },
      })
        .then(function (response) {
          if (!response.ok) throw new Error('Request failed');
          form.reset();
          fields.forEach(function (field) {
            setFieldError(field, '');
          });
          setStatus(form.dataset.msgSuccess || '', 'success');
          if (status) status.focus();
        })
        .catch(function () {
          setStatus(form.dataset.msgError || '', 'error');
        })
        .finally(function () {
          if (submit) {
            submit.disabled = false;
            submit.textContent = idleLabel;
          }
        });
    });
  }
})();
