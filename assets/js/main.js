/* =========================================================
   Greenberg Acupuncture Chiropractic — site scripts
   Progressive enhancement only. Everything works without JS.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Mobile navigation ---------- */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    function close() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 920) close();
    });
  }

  /* ---------- Current year in footer ---------- */
  function initYear() {
    var nodes = document.querySelectorAll('[data-year]');
    var year = String(new Date().getFullYear());
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = year;
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      for (var i = 0; i < items.length; i++) items[i].classList.add('is-in');
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Form status helpers ---------- */
  function showStatus(form, type, title, message) {
    var box = form.querySelector('.form-status');
    if (!box) return;
    box.classList.toggle('is-error', type === 'error');
    var icon = box.querySelector('.form-status__icon');
    if (icon) icon.textContent = type === 'error' ? '!' : '✓';
    var strong = box.querySelector('strong');
    if (strong) strong.textContent = title;
    var para = box.querySelector('p');
    if (para) para.textContent = message;
    box.classList.add('is-visible');
    box.setAttribute('tabindex', '-1');
    box.focus({ preventScroll: true });
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ---------- Forms: hidden _page + fetch submit ---------- */
  function initForms() {
    var forms = document.querySelectorAll('form[data-leadr]');

    Array.prototype.forEach.call(forms, function (form) {
      // Always stamp the current page URL so visitors return to the right place.
      var pageField = form.querySelector('input[name="_page"]');
      if (pageField) pageField.value = window.location.href;

      form.addEventListener('submit', function (event) {
        if (!window.fetch || !form.action) return; // let the browser post normally

        event.preventDefault();

        var button = form.querySelector('button[type="submit"]');
        var originalLabel = button ? button.textContent : '';
        if (button) {
          button.disabled = true;
          button.textContent = 'Sending…';
        }

        var data = {};
        var entries = new FormData(form);
        entries.forEach(function (value, key) {
          if (data[key] !== undefined) {
            data[key] = [].concat(data[key], value);
          } else {
            data[key] = value;
          }
        });
        data._page = window.location.href;

        fetch(form.action, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(data)
        })
          .then(function (response) {
            return response.json().catch(function () { return { ok: response.ok }; });
          })
          .then(function (result) {
            if (result && result.ok) {
              form.reset();
              var newPage = form.querySelector('input[name="_page"]');
              if (newPage) newPage.value = window.location.href;
              showStatus(
                form,
                'success',
                'Thanks, your message was sent.',
                'Dr. Geri will get back to you shortly. For anything urgent, call or text (818) 324-1539.'
              );
            } else {
              throw new Error('Submission failed');
            }
          })
          .catch(function () {
            showStatus(
              form,
              'error',
              'Sorry, that did not go through.',
              'Please try again, or call or text Dr. Geri directly at (818) 324-1539.'
            );
          })
          .then(function () {
            if (button) {
              button.disabled = false;
              button.textContent = originalLabel;
            }
          });
      });
    });
  }

  /* ---------- ?submitted=1 confirmation (no-JS round trip) ---------- */
  function initSubmittedNotice() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('submitted') !== '1') return;

    var form = document.querySelector('form[data-leadr]');
    if (form) {
      showStatus(
        form,
        'success',
        'Thanks, your message was sent.',
        'Dr. Geri will get back to you shortly. For anything urgent, call or text (818) 324-1539.'
      );
    }
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    initNav();
    initYear();
    initReveal();
    initForms();
    initSubmittedNotice();
  });
})();
