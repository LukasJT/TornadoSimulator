/* Ad optimization + injection layer.
 * Depends on /assets/ads-config.js being loaded first.
 */
(function () {
  'use strict';
  var CFG = window.ADSTERRA || {};

  function injectResponsiveCSS() {
    if (document.getElementById('ads-responsive-css')) return;
    var s = document.createElement('style');
    s.id = 'ads-responsive-css';
    s.textContent = [
      'html,body{overflow-x:hidden;max-width:100vw}',
      '.inline-ad{max-width:100vw;box-sizing:border-box}',
      '.inline-ad iframe{max-width:100%}',
      '.inline-ad,.native-ad-wrap{clear:both}',
      '@media (max-width:767px){.inline-ad iframe[width="728"]{display:none!important}}',
      '@media (max-width:767px){.inline-ad iframe[width="468"]{display:none!important}}',
      '@media (max-width:1319px){.side-ad,#adsterra-side,#adsterra-left{display:none!important}}',
      '.mobile-ad-swap{display:none;justify-content:center;margin:12px auto;width:100%;min-height:50px}',
      '@media (max-width:767px){.mobile-ad-swap{display:flex}}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function normalizeUrl(value) {
    return String(value || '').replace(/^https?:/, '');
  }

  function removeUnsafeClickAds() {
    var blocked = [CFG.disabledClickunderSrc, CFG.disabledDirectLink]
      .filter(Boolean)
      .map(normalizeUrl);
    if (!blocked.length) return;

    document.querySelectorAll('script[src],a[href],iframe[src]').forEach(function (node) {
      var value = node.getAttribute('src') || node.getAttribute('href');
      var normalized = normalizeUrl(value);
      var isBlocked = blocked.some(function (src) {
        return normalized.indexOf(src) !== -1 || src.indexOf(normalized) !== -1;
      });
      if (isBlocked && node.parentNode) node.parentNode.removeChild(node);
    });
  }

  function injectMobileBanners() {
    if (!CFG.banner320x50) return;
    var slots = document.querySelectorAll('.inline-ad');
    slots.forEach(function (slot) {
      if (slot.querySelector('.mobile-ad-swap')) return;
      var wrap = document.createElement('div');
      wrap.className = 'mobile-ad-swap';
      var f = document.createElement('iframe');
      f.setAttribute('src', '//www.topcreativeformat.com/' + CFG.banner320x50 + '/invoke.html');
      f.setAttribute('width', '320');
      f.setAttribute('height', '50');
      f.setAttribute('frameborder', '0');
      f.setAttribute('scrolling', 'no');
      f.style.cssText = 'border:0;max-width:100%';
      wrap.appendChild(f);
      slot.appendChild(wrap);
    });
  }

  function lazyLoadBanners() {
    if (!('IntersectionObserver' in window)) return;
    var frames = document.querySelectorAll('.inline-ad iframe, .side-ad iframe');
    frames.forEach(function (f) {
      if (f.getAttribute('data-src')) return;
      var src = f.getAttribute('src');
      if (!src) return;
      f.setAttribute('data-src', src);
      f.setAttribute('src', 'about:blank');
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var frame = entry.target;
        var real = frame.getAttribute('data-src');
        if (real && frame.getAttribute('src') !== real) frame.setAttribute('src', real);
        io.unobserve(frame);
      });
    }, { rootMargin: '500px 0px' });

    document.querySelectorAll('.inline-ad iframe[data-src], .side-ad iframe[data-src]').forEach(function (f) {
      io.observe(f);
    });
  }

  function injectSocialBar() {
    if (!CFG.socialBarSrc) return;
    if (normalizeUrl(CFG.socialBarSrc) === normalizeUrl(CFG.disabledClickunderSrc)) return;
    if (document.getElementById('adsterra-social-bar')) return;

    var s = document.createElement('script');
    s.id = 'adsterra-social-bar';
    s.async = true;
    s.setAttribute('data-cfasync', 'false');
    s.src = CFG.socialBarSrc.indexOf('//') === 0 ? CFG.socialBarSrc : '//' + CFG.socialBarSrc;
    document.body.appendChild(s);
  }

  function hasExistingNativeBanner() {
    return !!(CFG.nativeBannerContainerId && document.getElementById(CFG.nativeBannerContainerId));
  }

  function autoPlaceNativeSlot() {
    if (document.querySelector('[data-native-ad]')) return;
    if (hasExistingNativeBanner()) return;

    var host = document.querySelector('article') || document.querySelector('main');
    if (!host) return;

    var anchor = host.querySelector('h2');
    if (!anchor) {
      var paragraphs = host.querySelectorAll('p');
      anchor = paragraphs.length > 2 ? paragraphs[1] : null;
    }
    if (!anchor) return;

    var slot = document.createElement('div');
    slot.setAttribute('data-native-ad', 'auto');
    anchor.parentNode.insertBefore(slot, anchor.nextSibling);
  }

  function injectNativeBanners() {
    if (!CFG.nativeBannerSrc || !CFG.nativeBannerContainerId) return;
    if (hasExistingNativeBanner()) return;

    autoPlaceNativeSlot();
    var slots = document.querySelectorAll('[data-native-ad]');
    slots.forEach(function (slot, index) {
      if (slot.getAttribute('data-loaded') === '1') return;
      slot.setAttribute('data-loaded', '1');

      var wrap = document.createElement('div');
      wrap.className = 'native-ad-wrap';
      wrap.style.cssText = 'margin:28px auto;max-width:728px;padding:12px;background:#fffdf7;border:1px solid #e6dfd0;border-radius:8px;';

      var label = document.createElement('div');
      label.textContent = 'Ad';
      label.style.cssText = 'font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#8a8071;margin-bottom:6px;';
      wrap.appendChild(label);

      var container = document.createElement('div');
      container.id = index === 0 ? CFG.nativeBannerContainerId : CFG.nativeBannerContainerId + '-' + index;
      wrap.appendChild(container);
      slot.appendChild(wrap);

      if (index === 0) {
        var script = document.createElement('script');
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = CFG.nativeBannerSrc.indexOf('//') === 0 ? CFG.nativeBannerSrc : '//' + CFG.nativeBannerSrc;
        slot.appendChild(script);
      }
    });
  }

  var GAME_PATHS = [
    '/tornadle/', '/tornado-namer/', '/hurricane-namer/',
    '/weather-memory-match/', '/weather-word-search/', '/weather-crossword/',
    '/simulator/', '/damage-simulator/', '/supercell-simulator/',
    '/cloud-identification-game/', '/radar-signature-game/',
    '/lightning-distance-game/', '/tornado-quiz-for-kids/',
    '/which-tornado-are-you/', '/which-chaser-are-you/',
    '/storm-chaser-adventure/', '/ef-scale-game/', '/tornado-shape-game/',
    '/tornado-risk-calculator/', '/weather-trivia/'
  ];

  function isGamePage() {
    if (document.querySelector('[data-page-push]')) return true;
    return GAME_PATHS.some(function (path) {
      return location.pathname.indexOf(path) === 0;
    });
  }

  function injectInPagePush() {
    if (!CFG.inPagePushSrc) return;
    if (!isGamePage()) return;
    if (document.getElementById('adsterra-inpage-push')) return;

    var s = document.createElement('script');
    s.id = 'adsterra-inpage-push';
    s.async = true;
    s.setAttribute('data-cfasync', 'false');
    s.src = CFG.inPagePushSrc.indexOf('//') === 0 ? CFG.inPagePushSrc : '//' + CFG.inPagePushSrc;
    document.body.appendChild(s);
  }

  function run() {
    injectResponsiveCSS();
    removeUnsafeClickAds();
    injectMobileBanners();
    lazyLoadBanners();
    injectSocialBar();
    injectNativeBanners();
    injectInPagePush();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
