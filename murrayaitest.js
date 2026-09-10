(function () {
  var VERSION = 3;

  if (window !== window.top) return; // Don't run inside iframes

  // Take over from an older copy instead of bailing out. The original guard was
  // `if (window.SB_SURVEY_EMBED) return;` — with that, a stale cached copy that
  // loaded first would win and the new script would silently do nothing.
  if (window.SB_SURVEY_EMBED) {
    if (window.SB_SURVEY_EMBED.VERSION >= VERSION) return;
    try { window.SB_SURVEY_EMBED.unmount(); } catch (e) {}
  }

  window.SB_SURVEY_EMBED = {
    VERSION: VERSION,

    // Flip to true and reload to log every mount/unmount decision.
    DEBUG: false,

    SURVEY_URL: 'https://oneconnect.wilsonco.com/content/staffbase.murrayai/6a85b0631fe4f95947a0c360',

    // Verified against oneconnect.wilsonco.com: Staffbase sets
    // data-menu-id on <html> to the current page's ID and updates it on every
    // client-side route change. For
    // /content/page/6a57fa40c8e6e36dfd2cf27d that value is:
    TARGET_PAGE_ID: '6a57fa40c8e6e36dfd2cf27d',

    _observers: [],
    _mounted: false,

    init: function () {
      SB_SURVEY_EMBED.injectStyles();
      SB_SURVEY_EMBED.watchRoute();
      SB_SURVEY_EMBED.syncToRoute();
    },

    log: function () {
      if (!SB_SURVEY_EMBED.DEBUG) return;
      console.log.apply(console, ['[sb-survey]'].concat([].slice.call(arguments)));
    },

    // data-menu-id is Staffbase's own signal and is independent of URL shape,
    // locale prefixes and query strings. Path matching is only a fallback for
    // the case where the attribute is missing (e.g. a future markup change).
    isTargetPage: function () {
      var root = document.documentElement;
      if (root.hasAttribute('data-menu-id')) {
        return root.getAttribute('data-menu-id') === SB_SURVEY_EMBED.TARGET_PAGE_ID;
      }
      var path = (location.pathname || '').replace(/\/+$/, '').toLowerCase();
      return path.endsWith('/' + SB_SURVEY_EMBED.TARGET_PAGE_ID.toLowerCase());
    },

    // Staffbase's frontend is a single-page app: this file is evaluated once per
    // hard load, so a one-time check at startup would leave the tab stranded on
    // every subsequent page. Watching data-menu-id catches every route change,
    // including back/forward; the rest are belt-and-braces.
    watchRoute: function () {
      var mo = new MutationObserver(function () {
        SB_SURVEY_EMBED.syncToRoute('attr');
      });
      mo.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-menu-id', 'data-installation-id', 'data-current-page-type'],
      });
      // Deliberately not added to _observers: this one must outlive unmount.
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

      setInterval(function () {
        if (!SB_SURVEY_EMBED.isTargetPage()) {
          SB_SURVEY_EMBED.sweep(); // clear anything a stale copy re-added
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

    // Remove tab/overlay nodes regardless of which copy of the script created
    // them, so a lingering older version can't leave its UI on screen.
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
    },

    unmount: function () {
      SB_SURVEY_EMBED._observers.forEach(function (o) {
        try { o.disconnect(); } catch (e) {}
      });
      SB_SURVEY_EMBED._observers = [];
      SB_SURVEY_EMBED.sweep();
      SB_SURVEY_EMBED._mounted = false;
    },

    injectStyles: function () {
      if (document.getElementById('sb-survey-styles')) return;
      var style = document.createElement('style');
      style.id = 'sb-survey-styles';
      style.textContent = `
        #sb-survey-tab {
          position: fixed;
          bottom: 120px;
          right: 0;
          background: #006400;
          color: white;
          padding: 10px 14px;
          cursor: pointer;
          font-family: sans-serif;
          font-size: 14px;
          border-radius: 4px 0 0 4px;
          z-index: 9999;
          writing-mode: vertical-rl;
          transform: rotate(180deg);
        }
        #sb-survey-overlay {
          display: none;
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.5);
          z-index: 10000;
          justify-content: center;
          align-items: center;
        }
        #sb-survey-overlay.open {
          display: flex;
        }
        #sb-survey-modal-wrapper {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          width: 700px;
          max-width: 95vw;
        }
        #sb-survey-modal {
          background: white;
          width: 100%;
          height: 80vh;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
        }
        #sb-survey-close {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: white;
          color: #333;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          border: none;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        #sb-survey-iframe-wrapper {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        #sb-survey-iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }
      `;
      document.head.appendChild(style);
    },
    createTab: function () {
      var tab = document.createElement('div');
      tab.id = 'sb-survey-tab';
      tab.textContent = 'Give Us Feedback';
      tab.addEventListener('click', SB_SURVEY_EMBED.openModal);
      document.body.appendChild(tab);
    },
    createModal: function () {
      var overlay = document.createElement('div');
      overlay.id = 'sb-survey-overlay';

      var wrapper = document.createElement('div');
      wrapper.id = 'sb-survey-modal-wrapper';

      var closeBtn = document.createElement('button');
      closeBtn.id = 'sb-survey-close';
      closeBtn.textContent = '✕';
      closeBtn.addEventListener('click', SB_SURVEY_EMBED.closeModal);

      var modal = document.createElement('div');
      modal.id = 'sb-survey-modal';

      var iframe = document.createElement('iframe');
      iframe.id = 'sb-survey-iframe';
      iframe.src = SB_SURVEY_EMBED.SURVEY_URL;
      iframe.addEventListener('load', function () {
        SB_SURVEY_EMBED.cleanIframeDoc(iframe.contentDocument);
      });

      var iframeWrapper = document.createElement('div');
      iframeWrapper.id = 'sb-survey-iframe-wrapper';
      iframeWrapper.appendChild(iframe);

      modal.appendChild(iframeWrapper);
      wrapper.appendChild(closeBtn);   // close button sits above the modal
      wrapper.appendChild(modal);
      overlay.appendChild(wrapper);

      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) SB_SURVEY_EMBED.closeModal();
      });

      document.body.appendChild(overlay);
    },
    openModal: function () {
      var overlay = document.getElementById('sb-survey-overlay');
      var tab = document.getElementById('sb-survey-tab');
      if (overlay) overlay.classList.add('open');
      if (tab) tab.style.display = 'none';
    },
    closeModal: function () {
      var overlay = document.getElementById('sb-survey-overlay');
      var tab = document.getElementById('sb-survey-tab');
      if (overlay) overlay.classList.remove('open');
      if (tab) tab.style.display = '';
    },
    cleanIframeDoc: function (doc) {
      // Depends on the survey being same-origin. If it ever moves to another
      // host, or Staffbase adds a frame sandbox, this throws and is swallowed
      // below — the modal then renders with full app chrome and no visible
      // error. Turn on DEBUG to see it.
      if (!doc) return;
      try {
        // Scrollbar CSS — only thing CSS handles reliably here
        if (doc.head) {
          var s = doc.createElement('style');
          s.textContent = `
            html, body { background: white !important; }
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
    watchForModals: function () {
      function hasHostModal() {
        // ARIA semantics (standard)
        if (document.querySelector(
          '[role="dialog"]:not(#sb-survey-overlay):not(#sb-survey-modal),' +
          '[aria-modal="true"]:not(#sb-survey-overlay):not(#sb-survey-modal)'
        )) return true;
        // Body/html scroll-lock (many modal libraries set this)
        var bodyStyle = window.getComputedStyle(document.body);
        if (bodyStyle.overflow === 'hidden' || bodyStyle.overflowY === 'hidden') return true;
        return false;
      }

      function updateTabVisibility() {
        var tab = document.getElementById('sb-survey-tab');
        var overlay = document.getElementById('sb-survey-overlay');
        if (!tab || !overlay) return; // unmounted
        // Our own modal handles tab visibility via openModal/closeModal
        if (overlay.classList.contains('open')) return;
        tab.style.display = hasHostModal() ? 'none' : '';
      }

      var observer = new MutationObserver(updateTabVisibility);
      // Watch for DOM additions and attribute changes on body/html
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['role', 'aria-modal', 'class', 'style'],
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'style'],
      });
      SB_SURVEY_EMBED._observers.push(observer);
    },
  };
  if (document.readyState === 'complete') {
    window.SB_SURVEY_EMBED.init();
  } else {
    window.addEventListener('load', window.SB_SURVEY_EMBED.init);
  }
})();