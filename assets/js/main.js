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

  /* ---------- Background music (looping, ~25% volume, state remembered) ---------- */
  function initMusic() {
    var audio = document.getElementById('site-music');
    var button = document.getElementById('music-toggle');
    if (!audio || !button) return;

    var KEY = 'gg-music';
    var stored = null;
    try { stored = window.localStorage.getItem(KEY); } catch (e) { stored = null; }

    // Default is "on": we attempt autoplay. Browsers usually block it, which is fine —
    // the button then simply shows the play state until the visitor opts in.
    var wantsMusic = stored !== 'off';

    audio.loop = true;
    audio.volume = 0.25;

    function remember(value) {
      try { window.localStorage.setItem(KEY, value); } catch (e) { /* private mode */ }
    }

    function paint(playing) {
      button.setAttribute('aria-pressed', playing ? 'true' : 'false');
      button.setAttribute(
        'aria-label',
        playing ? 'Pause background music' : 'Play background music'
      );
    }

    audio.addEventListener('play', function () { paint(true); });
    audio.addEventListener('pause', function () { paint(false); });

    function attemptPlay() {
      var result = audio.play();
      if (result && typeof result.catch === 'function') {
        return result.catch(function () { paint(false); });
      }
      return null;
    }

    paint(false);

    function fromToggle(event) {
      var node = event && event.target;
      return !!(node && node.closest && node.closest('#music-toggle'));
    }

    if (wantsMusic) {
      attemptPlay();

      // If autoplay was blocked, start on the visitor's first interaction instead.
      // Interactions with the button itself are skipped — it has its own handler,
      // and starting playback here too would make the first click toggle twice.
      var unlock = function (event) {
        if (fromToggle(event)) return;
        if (audio.paused) {
          var current = null;
          try { current = window.localStorage.getItem(KEY); } catch (e) { current = null; }
          if (current !== 'off') attemptPlay();
        }
      };
      document.addEventListener('pointerdown', unlock, { once: true });
      document.addEventListener('keydown', unlock, { once: true });
    }

    button.addEventListener('click', function () {
      if (audio.paused) {
        remember('on');
        attemptPlay();
      } else {
        audio.pause();
        remember('off');
      }
    });
  }

  /* ---------- Health library: category filter + newest/oldest sort ---------- */
  function initLibrary() {
    var grid = document.querySelector('[data-lib-grid]');
    if (!grid) return;

    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-category]'));
    var filters = Array.prototype.slice.call(document.querySelectorAll('.lib-filter'));
    var sort = document.getElementById('lib-sort');
    var empty = document.querySelector('[data-lib-empty]');
    var active = 'all';

    function apply() {
      var shown = 0;
      cards.forEach(function (card) {
        var match = active === 'all' || card.getAttribute('data-category') === active;
        card.hidden = !match;
        if (match) shown++;
      });
      if (empty) empty.classList.toggle('is-visible', shown === 0);
    }

    function reorder(order) {
      var sorted = cards.slice().sort(function (a, b) {
        var da = a.getAttribute('data-date') || '';
        var db = b.getAttribute('data-date') || '';
        if (da === db) return 0;
        return order === 'oldest' ? (da < db ? -1 : 1) : (da > db ? -1 : 1);
      });
      sorted.forEach(function (card) { grid.appendChild(card); });
    }

    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        active = btn.getAttribute('data-filter') || 'all';
        filters.forEach(function (other) {
          other.setAttribute('aria-pressed', other === btn ? 'true' : 'false');
        });
        apply();
      });
    });

    if (sort) {
      sort.addEventListener('change', function () { reorder(sort.value); });
      reorder(sort.value);
    }

    // Allow deep links such as /health-library/?category=seasonal
    var requested = new URLSearchParams(window.location.search).get('category');
    if (requested) {
      var match = filters.filter(function (btn) {
        return btn.getAttribute('data-filter') === requested;
      })[0];
      if (match) {
        active = requested;
        filters.forEach(function (other) {
          other.setAttribute('aria-pressed', other === match ? 'true' : 'false');
        });
      }
    }

    apply();
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
    initMusic();
    initLibrary();
  });
})();
