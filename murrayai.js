(function () {
  var VERSION = 9;

  if (window !== window.top) return; // Don't run inside iframes

  // Take over from an older copy instead of bailing out. The original guard was
  // `if (window.SB_SURVEY_EMBED) return;` — with that, a stale cached copy that
  // loaded first would win and this script would silently do nothing.
  if (window.SB_SURVEY_EMBED) {
    if (window.SB_SURVEY_EMBED.VERSION >= VERSION) return;
    try { window.SB_SURVEY_EMBED.unmount(); } catch (e) {}
  }

  window.SB_SURVEY_EMBED = {
    VERSION: VERSION,

    // Flip to true and reload to log every mount/unmount decision.
    DEBUG: false,

    SURVEY_URL: 'https://oneconnect.wilsonco.com/content/staffbase.murrayai/6a85b0631fe4f95947a0c360',

    LABEL: 'Ask Murray',

    // Murray's avatar, inlined as a data URL so the script stays a single
    // self-contained file with no second asset to deploy or cache-bust.
    // Source: murray_avatar_512.png, resized to 96px (2.6x the 36px render box)
    // and palette-quantised to 64 colours — 2.1 KB, alpha preserved.
    // Swapping in a hosted URL works too; nothing else needs to change.
    AVATAR_URL: 'data:image/png;base64,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',

    COLORS: {
      primary: '#0f4c81',  // launcher background, panel header
      accent:  '#f15a29',  // Wilson orange — launcher hover
      text:    '#1f2933',  // panel text
      muted:   '#6b7280',  // muted text
      border:  '#d9dee5',  // borders
      panel:   '#ffffff',  // panel background
      surface: '#f6f7f9',  // secondary surface
    },

    PANEL_WIDTH: 400,
    PANEL_HEIGHT: 600,

    // The only page this may run on:
    // https://oneconnect.wilsonco.com/content/page/6a57fa40c8e6e36dfd2cf27d
    //
    // Staffbase sets data-menu-id on <html> to the current page's ID and
    // updates it on every client-side route change — verified live on this
    // instance. This is checked before anything is added to the DOM, and
    // re-checked on every route change.
    TARGET_PAGE_ID: '6a57fa40c8e6e36dfd2cf27d',

    _observers: [],
    _mounted: false,
    _onKeydown: null,

    init: function () {
      SB_SURVEY_EMBED.injectStyles();
      SB_SURVEY_EMBED.watchRoute();
      SB_SURVEY_EMBED.syncToRoute('init');
    },

    log: function () {
      if (!SB_SURVEY_EMBED.DEBUG) return;
      console.log.apply(console, ['[sb-survey]'].concat([].slice.call(arguments)));
    },

    // data-menu-id is Staffbase's own signal, independent of URL shape, locale
    // prefixes and query strings. The path check is a fallback in case the
    // attribute disappears in a future release.
    isTargetPage: function () {
      var id = SB_SURVEY_EMBED.TARGET_PAGE_ID;
      var root = document.documentElement;
      if (root.hasAttribute('data-menu-id')) {
        return root.getAttribute('data-menu-id') === id;
      }
      var path = (location.pathname || '').replace(/\/+$/, '').toLowerCase();
      return path.endsWith('/' + id.toLowerCase());
    },

    // Staffbase's frontend is a single-page app: this file is evaluated once per
    // hard load, so a one-time check at startup would leave the launcher
    // stranded on every page thereafter. Watching data-menu-id catches every
    // route change, including back/forward. The rest is belt-and-braces.
    watchRoute: function () {
      var mo = new MutationObserver(function () {
        SB_SURVEY_EMBED.syncToRoute('attr');
      });
      mo.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-menu-id', 'data-installation-id', 'data-current-page-type'],
      });
      // Deliberately not in _observers: this one must outlive unmount().
      SB_SURVEY_EMBED._routeObserver = mo;

      ['pushState', 'replaceState'].forEach(function (fn) {
        var original = history[fn];
        history[fn] = function () {
          var result = original.apply(this, arguments);
          SB_SURVEY_EMBED.syncToRoute(fn);
          return result;
        };
      });
      window.addEventListener('popstate', function () {
        SB_SURVEY_EMBED.syncToRoute('popstate');
      });

      // Safety net against a stale copy of this script re-adding the launcher.
      // Cheap: getElementById short-circuits on the common case.
      setInterval(function () {
        if (document.getElementById('sb-survey-tab') && !SB_SURVEY_EMBED.isTargetPage()) {
          SB_SURVEY_EMBED.sweep();
        }
      }, 1000);
    },

    syncToRoute: function (src) {
      var match = SB_SURVEY_EMBED.isTargetPage();
      if (match === SB_SURVEY_EMBED._mounted) return;
      SB_SURVEY_EMBED.log(match ? 'mount' : 'unmount', 'via', src, location.pathname);
      if (match) {
        SB_SURVEY_EMBED.mount();
      } else {
        SB_SURVEY_EMBED.unmount();
      }
    },

    // Remove launcher/panel nodes regardless of which copy of the script
    // created them, so a lingering older version can't leave its UI on screen.
    // The IDs are unchanged from earlier versions on purpose — that is what
    // lets this clean up after an older deployed copy.
    sweep: function () {
      document.querySelectorAll('#sb-survey-tab, #sb-survey-overlay')
        .forEach(function (el) {
          if (el.parentNode) el.parentNode.removeChild(el);
        });
    },

    mount: function () {
      if (SB_SURVEY_EMBED._mounted) return;
      if (!document.body) return;
      SB_SURVEY_EMBED.sweep(); // avoid duplicates
      SB_SURVEY_EMBED._mounted = true;
      SB_SURVEY_EMBED.createTab();
      SB_SURVEY_EMBED.createModal();
      SB_SURVEY_EMBED.watchForModals();

      SB_SURVEY_EMBED._onKeydown = function (e) {
        if (e.key !== 'Escape') return;
        var panel = document.getElementById('sb-survey-overlay');
        if (panel && panel.classList.contains('open')) SB_SURVEY_EMBED.closeModal();
      };
      document.addEventListener('keydown', SB_SURVEY_EMBED._onKeydown);
    },

    unmount: function () {
      SB_SURVEY_EMBED._observers.forEach(function (o) {
        try { o.disconnect(); } catch (e) {}
      });
      SB_SURVEY_EMBED._observers = [];
      if (SB_SURVEY_EMBED._onKeydown) {
        document.removeEventListener('keydown', SB_SURVEY_EMBED._onKeydown);
        SB_SURVEY_EMBED._onKeydown = null;
      }
      SB_SURVEY_EMBED.sweep();
      SB_SURVEY_EMBED._mounted = false;
    },

    injectStyles: function () {
      if (document.getElementById('sb-survey-styles')) return;
      var c = SB_SURVEY_EMBED.COLORS;
      var w = SB_SURVEY_EMBED.PANEL_WIDTH;
      var h = SB_SURVEY_EMBED.PANEL_HEIGHT;
      var style = document.createElement('style');
      style.id = 'sb-survey-styles';
      style.textContent = `
        /* ---------- launcher: round, bottom-right, avatar on primary ------- */
        /* The Staffbase app applies 'margin: 0 auto' and 'padding: 10px' to bare
           <button> elements. Auto margins on a flex item absorb all free space
           and silently override justify-content, so both of our buttons reset
           margin and padding with !important rather than relying on ID
           specificity — the host rules may themselves be !important. */
        #sb-survey-tab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
          min-width: 0 !important;
          border: none;
          border-radius: 50%;
          background: ${c.primary};
          color: #ffffff;
          cursor: pointer;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(15, 76, 129, 0.35);
          transition: background 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
          font-family: inherit;
        }
        #sb-survey-tab:hover {
          background: ${c.accent};
          box-shadow: 0 6px 18px rgba(241, 90, 41, 0.4);
          transform: translateY(-1px);
        }
        #sb-survey-tab:focus-visible {
          outline: 3px solid ${c.accent};
          outline-offset: 2px;
        }
        #sb-survey-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          display: block;
          pointer-events: none;
        }
        #sb-survey-glyph {
          width: 28px;
          height: 28px;
          display: block;
          pointer-events: none;
        }

        /* Label sits beside the launcher, revealed on hover or keyboard focus.
           aria-label on the button carries the same text, so the label being
           hover-only never hides it from assistive tech. */
        #sb-survey-tab-label {
          position: absolute;
          right: 68px;
          top: 50%;
          transform: translateY(-50%) translateX(8px);
          opacity: 0;
          pointer-events: none;
          white-space: nowrap;
          background: ${c.panel};
          color: ${c.text};
          border: 1px solid ${c.border};
          border-radius: 6px;
          padding: 6px 12px;
          font-family: sans-serif;
          font-size: 14px;
          line-height: 1.2;
          box-shadow: 0 2px 8px rgba(31, 41, 51, 0.12);
          transition: opacity 0.18s ease, transform 0.18s ease;
        }
        #sb-survey-tab:hover #sb-survey-tab-label,
        #sb-survey-tab:focus-visible #sb-survey-tab-label {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }

        /* ---------- panel: docked bottom-right, ~${w}x${h} ----------------- */
        #sb-survey-overlay {
          display: none;
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: ${w}px;
          height: ${h}px;
          max-width: calc(100vw - 32px);
          max-height: calc(100vh - 48px);
          background: ${c.panel};
          border: 1px solid ${c.border};
          border-radius: 10px;
          box-shadow: 0 12px 32px rgba(31, 41, 51, 0.22);
          overflow: hidden;
          z-index: 10000;
          flex-direction: column;
        }
        #sb-survey-overlay.open {
          display: flex;
        }
        #sb-survey-header {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 12px 8px 12px 16px;
          background: ${c.primary};
          color: #ffffff;
          font-family: sans-serif;
          font-size: 15px;
          font-weight: 600;
          line-height: 1.3;
        }
        #sb-survey-close {
          width: 28px !important;
          height: 28px !important;
          flex: 0 0 auto !important;
          /* auto on the left, 0 on the right: pushes the button to the header's
             right edge and neutralises the host's centring auto margins. */
          margin: 0 0 0 auto !important;
          padding: 0 !important;
          box-sizing: border-box !important;
          min-width: 0 !important;
          border-radius: 50%;
          background: transparent;
          color: #ffffff;
          font-size: 16px;
          line-height: 1;
          cursor: pointer;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s ease;
        }
        #sb-survey-close:hover {
          background: rgba(255, 255, 255, 0.18);
        }
        #sb-survey-close:focus-visible {
          outline: 2px solid #ffffff;
          outline-offset: 1px;
        }
        #sb-survey-modal {
          flex: 1 1 auto;
          position: relative;
          background: ${c.panel};
          color: ${c.text};
          overflow: hidden;
          min-height: 0;
        }
        #sb-survey-iframe-wrapper {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background: ${c.surface};
        }
        #sb-survey-iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
          background: ${c.panel};
        }

        @media (max-width: 480px) {
          #sb-survey-overlay {
            bottom: 12px;
            right: 12px;
            left: 12px;
            width: auto;
            max-width: none;
            height: calc(100vh - 96px);
          }
        }
      `;
      document.head.appendChild(style);
    },

    createTab: function () {
      var label = SB_SURVEY_EMBED.LABEL;
      // A real <button>, not a div — the original div had no keyboard access.
      var tab = document.createElement('button');
      tab.id = 'sb-survey-tab';
      tab.type = 'button';
      tab.setAttribute('aria-label', label);
      tab.setAttribute('aria-expanded', 'false');
      tab.setAttribute('aria-controls', 'sb-survey-overlay');

      if (SB_SURVEY_EMBED.AVATAR_URL) {
        var img = document.createElement('img');
        img.id = 'sb-survey-avatar';
        img.src = SB_SURVEY_EMBED.AVATAR_URL;
        img.alt = '';
        tab.appendChild(img);
      } else {
        // Neutral chat glyph until an avatar URL is supplied.
        var ns = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('id', 'sb-survey-glyph');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('aria-hidden', 'true');
        var path = document.createElementNS(ns, 'path');
        path.setAttribute('d', 'M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H9l-4 4v-4.2');
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', '1.8');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(path);
        tab.appendChild(svg);
      }

      var text = document.createElement('span');
      text.id = 'sb-survey-tab-label';
      text.textContent = label;
      text.setAttribute('aria-hidden', 'true'); // aria-label already carries it
      tab.appendChild(text);

      tab.addEventListener('click', SB_SURVEY_EMBED.openModal);
      document.body.appendChild(tab);
    },

    createModal: function () {
      var c = SB_SURVEY_EMBED.COLORS;
      var panel = document.createElement('div');
      panel.id = 'sb-survey-overlay';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-label', SB_SURVEY_EMBED.LABEL);

      var header = document.createElement('div');
      header.id = 'sb-survey-header';

      var title = document.createElement('span');
      title.textContent = SB_SURVEY_EMBED.LABEL;
      header.appendChild(title);

      var closeBtn = document.createElement('button');
      closeBtn.id = 'sb-survey-close';
      closeBtn.type = 'button';
      closeBtn.setAttribute('aria-label', 'Close');
      closeBtn.textContent = '✕';
      closeBtn.addEventListener('click', SB_SURVEY_EMBED.closeModal);
      header.appendChild(closeBtn);

      var body = document.createElement('div');
      body.id = 'sb-survey-modal';

      var iframe = document.createElement('iframe');
      iframe.id = 'sb-survey-iframe';
      iframe.title = SB_SURVEY_EMBED.LABEL;
      iframe.src = SB_SURVEY_EMBED.SURVEY_URL;
      iframe.addEventListener('load', function () {
        SB_SURVEY_EMBED.cleanIframeDoc(iframe.contentDocument);
      });

      var iframeWrapper = document.createElement('div');
      iframeWrapper.id = 'sb-survey-iframe-wrapper';
      iframeWrapper.appendChild(iframe);

      body.appendChild(iframeWrapper);
      panel.appendChild(header);
      panel.appendChild(body);

      document.body.appendChild(panel);
    },

    // The launcher and the panel both sit bottom-right, so the launcher hides
    // while the panel is open rather than overlapping it.
    openModal: function () {
      var panel = document.getElementById('sb-survey-overlay');
      var tab = document.getElementById('sb-survey-tab');
      if (panel) panel.classList.add('open');
      if (tab) {
        tab.style.display = 'none';
        tab.setAttribute('aria-expanded', 'true');
      }
      var closeBtn = document.getElementById('sb-survey-close');
      if (closeBtn) closeBtn.focus();
    },
    closeModal: function () {
      var panel = document.getElementById('sb-survey-overlay');
      var tab = document.getElementById('sb-survey-tab');
      if (panel) panel.classList.remove('open');
      if (tab) {
        tab.style.display = '';
        tab.setAttribute('aria-expanded', 'false');
        tab.focus();
      }
    },

    cleanIframeDoc: function (doc) {
      // Only works when SURVEY_URL is same-origin with the page. Verified
      // same-origin on oneconnect.wilsonco.com. On any other instance the
      // iframe is cross-origin, contentDocument is null, and this becomes a
      // silent no-op — the panel then shows the full app chrome.
      if (!doc) {
        SB_SURVEY_EMBED.log('iframe not readable — cross-origin? chrome will not be stripped');
        return;
      }
      try {
        // Scrollbar CSS — only thing CSS handles reliably here
        if (doc.head) {
          var s = doc.createElement('style');
          s.textContent = `
            html, body { background: ${SB_SURVEY_EMBED.COLORS.panel} !important; }
            *::-webkit-scrollbar { display: none !important; }
            * { scrollbar-width: none !important; }
          `;
          doc.head.appendChild(s);
        }

        function applyFixes() {
          // Hide nav/chrome — setProperty wins over SPA inline styles
          ['#header', '.app-header', '.wow-app-header',
           '.contextual-toolbar-container', '.contextual-action-toolbar',
           '#skip-link-container', 'nav'
          ].forEach(function (sel) {
            doc.querySelectorAll(sel).forEach(function (el) {
              el.style.setProperty('display', 'none', 'important');
            });
          });

          // Zero out all spacing/sizing on layout containers
          ['#wrapper', '.page', '.page-content', '.scroller', '#content',
           '.container-fluid', '.app-container', '.sb-user-view', 'form'
          ].forEach(function (sel) {
            doc.querySelectorAll(sel).forEach(function (el) {
              el.style.setProperty('width', '100%', 'important');
              el.style.setProperty('max-width', '100%', 'important');
              el.style.setProperty('padding-top', '0', 'important');
              el.style.setProperty('padding-bottom', '0', 'important');
              el.style.setProperty('padding-left', '0', 'important');
              el.style.setProperty('padding-right', '0', 'important');
              el.style.setProperty('margin-top', '0', 'important');
              el.style.setProperty('margin-bottom', '0', 'important');
              el.style.setProperty('margin-left', '0', 'important');
              el.style.setProperty('margin-right', '0', 'important');
              el.style.setProperty('box-sizing', 'border-box', 'important');
            });
          });

          // Process any iframes we haven't attached to yet
          doc.querySelectorAll('iframe').forEach(function (f) {
            if (f._sbCleaned) return;
            f._sbCleaned = true;
            if (f.contentDocument && f.contentDocument.head) {
              SB_SURVEY_EMBED.cleanIframeDoc(f.contentDocument);
            } else {
              f.addEventListener('load', function () {
                try { SB_SURVEY_EMBED.cleanIframeDoc(f.contentDocument); } catch (e) {}
              });
            }
          });
        }

        applyFixes();

        var mo = new MutationObserver(applyFixes);
        mo.observe(doc.documentElement, {
          childList: true, subtree: true,
          attributes: true, attributeFilter: ['style', 'class'],
        });
        SB_SURVEY_EMBED._observers.push(mo);
      } catch (e) {
        SB_SURVEY_EMBED.log('cleanIframeDoc failed', e);
      }
    },

    // Rewritten to remove a self-triggering observer loop. The previous version
    // observed document.body with { subtree: true, attributeFilter: [...,'style'] }
    // and then wrote tab.style.display inside the callback. The launcher is a
    // child of body, so each write mutated an observed attribute and re-entered
    // the callback. It also ran querySelector + getComputedStyle on every style
    // or class change anywhere in the app, forcing a style recalc each time.
    //
    // Two changes make the loop structurally impossible:
    //   1. The subtree observer watches childList only — no attributes — so our
    //      own style writes cannot re-trigger it.
    //   2. Scroll-lock is watched on body and <html> themselves, without
    //      subtree, and we never write to either.
    // The value-equality guard in update() is a second line of defence, and
    // requestAnimationFrame coalesces bursts into one pass per frame.
    watchForModals: function () {
      var scheduled = null;

      function desiredDisplay() {
        // ARIA semantics (standard). Our own panel is excluded by id.
        if (document.querySelector(
          '[role="dialog"]:not(#sb-survey-overlay):not(#sb-survey-modal),' +
          '[aria-modal="true"]:not(#sb-survey-overlay):not(#sb-survey-modal)'
        )) return 'none';
        // Body/html scroll-lock (many modal libraries set this)
        var bodyStyle = window.getComputedStyle(document.body);
        if (bodyStyle.overflow === 'hidden' || bodyStyle.overflowY === 'hidden') return 'none';
        return '';
      }

      function update() {
        scheduled = null;
        var tab = document.getElementById('sb-survey-tab');
        var panel = document.getElementById('sb-survey-overlay');
        if (!tab || !panel) return; // unmounted
        // Our own panel handles launcher visibility via openModal/closeModal
        if (panel.classList.contains('open')) return;
        var want = desiredDisplay();
        if (tab.style.display !== want) tab.style.display = want;
      }

      function schedule() {
        if (scheduled === null) scheduled = requestAnimationFrame(update);
      }

      var nodeObserver = new MutationObserver(schedule);
      nodeObserver.observe(document.body, { childList: true, subtree: true });

      var lockObserver = new MutationObserver(schedule);
      lockObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['class', 'style'],
      });
      lockObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'style'],
      });

      SB_SURVEY_EMBED._observers.push(nodeObserver, lockObserver);
      update();
    },
  };
  if (document.readyState === 'complete') {
    window.SB_SURVEY_EMBED.init();
  } else {
    window.addEventListener('load', window.SB_SURVEY_EMBED.init);
  }
})();
