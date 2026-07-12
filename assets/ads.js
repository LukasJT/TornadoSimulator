/* Ad optimization + injection layer.
 * Depends on /assets/ads-config.js being loaded first.
 *
 * Responsibilities:
 *   1. Lazy-load banner iframes (IntersectionObserver) to improve Core Web Vitals
 *   2. Inject Social Bar once per page (site-wide sticky format)
 *   3. Inject Native Banner into [data-native-ad] slots
 *   4. Inject In-Page Push into game pages ([data-page-push])
 *   5. Anti-adblock friendly retry
 */
(function () {
  'use strict';
  var CFG = window.ADSTERRA || {};

  // --- 0. Global responsive CSS -------------------------------------------
  // Prevents 728x90 leaderboards from causing horizontal scroll on mobile
  // and keeps sticky Social Bar / native ads from clipping.
  function injectResponsiveCSS() {
    if (document.getElementById('ads-responsive-css')) return;
    var s = document.createElement('style');
    s.id = 'ads-responsive-css';
    s.textContent = [
      'html,body{overflow-x:hidden;max-width:100vw}',
      '.inline-ad{max-width:100vw;box-sizing:border-box}',
      '.inline-ad iframe{max-width:100%}',
      // Hide 728x90 desktop leaderboard on mobile — user can add 320x50 mobile key later
      '@media (max-width:767px){.inline-ad iframe[width="728"]{display:none!important}}',
      // Skyscrapers (160x600) already have desktop-only visibility in the simulator
      '@media (max-width:1024px){.side-ad{display:none!important}}'
    ].join('\n');
    document.head.appendChild(s);
  }

  // --- 1. Lazy-load .inline-ad iframes ------------------------------------
  function lazyLoadBanners() {
    var frames = document.querySelectorAll('.inline-ad iframe, .side-ad iframe');
    if (!('IntersectionObserver' in window)) return;
    frames.forEach(function (f) {
      if (!f.getAttribute('data-src')) {
        var src = f.getAttribute('src');
        if (src) {
          f.setAttribute('data-src', src);
          f.setAttribute('src', 'about:blank');
        }
      }
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var f = e.target;
        var real = f.getAttribute('data-src');
        if (real && f.getAttribute('src') !== real) f.setAttribute('src', real);
        io.unobserve(f);
      });
    }, { rootMargin: '400px 0px' });
    document.querySelectorAll('.inline-ad iframe[data-src], .side-ad iframe[data-src]').forEach(function (f) {
      io.observe(f);
    });
  }

  // --- 2. Social Bar (site-wide, single injection) ------------------------
  function injectSocialBar() {
    if (!CFG.socialBarSrc) return;
    if (document.getElementById('adsterra-social-bar')) return;
    var s = document.createElement('script');
    s.id = 'adsterra-social-bar';
    s.async = true;
    s.setAttribute('data-cfasync', 'false');
    s.src = CFG.socialBarSrc.indexOf('//') === 0 ? CFG.socialBarSrc : '//' + CFG.socialBarSrc;
    document.body.appendChild(s);
  }

  // --- 3. Native Banner ---------------------------------------------------
  function autoPlaceNativeSlot() {
    // If a page has no explicit slot but has an article body, place one after
    // the first h2 for maximum viewability while feeling in-content.
    if (document.querySelector('[data-native-ad]')) return;
    var host = document.querySelector('article') || document.querySelector('main');
    if (!host) return;
    var firstH2 = host.querySelector('h2');
    if (!firstH2) return;
    var slot = document.createElement('div');
    slot.setAttribute('data-native-ad', 'auto');
    firstH2.parentNode.insertBefore(slot, firstH2.nextSibling);
  }
  function injectNativeBanners() {
    if (!CFG.nativeBannerSrc || !CFG.nativeBannerContainerId) return;
    autoPlaceNativeSlot();
    var slots = document.querySelectorAll('[data-native-ad]');
    slots.forEach(function (slot, i) {
      if (slot.getAttribute('data-loaded') === '1') return;
      slot.setAttribute('data-loaded', '1');
      var wrap = document.createElement('div');
      wrap.className = 'native-ad-wrap';
      wrap.style.cssText = 'margin:28px auto;max-width:728px;padding:12px;background:#fffdf7;border:1px solid #e6dfd0;border-radius:10px;';
      var label = document.createElement('div');
      label.textContent = 'Ad';
      label.style.cssText = 'font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#8a8071;margin-bottom:6px;';
      wrap.appendChild(label);
      var container = document.createElement('div');
      // Adsterra requires unique container ids — clone the base and disambiguate
      container.id = i === 0 ? CFG.nativeBannerContainerId : CFG.nativeBannerContainerId + '-' + i;
      wrap.appendChild(container);
      slot.appendChild(wrap);
      // Only load the first native banner's script; subsequent slots reuse it
      if (i === 0) {
        var script = document.createElement('script');
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = CFG.nativeBannerSrc.indexOf('//') === 0 ? CFG.nativeBannerSrc : '//' + CFG.nativeBannerSrc;
        slot.appendChild(script);
      }
    });
  }

  // --- 4. In-Page Push (game pages) ---------------------------------------
  var GAME_PATHS = ['/tornadle/', '/tornado-namer/', '/hurricane-namer/',
    '/weather-memory-match/', '/weather-word-search/', '/weather-crossword/',
    '/simulator/', '/damage-simulator/', '/supercell-simulator/',
    '/cloud-identification-game/', '/radar-signature-game/',
    '/lightning-distance-game/', '/tornado-quiz-for-kids/',
    '/which-tornado-are-you/', '/which-chaser-are-you/',
    '/storm-chaser-adventure/'];
  function isGamePage() {
    if (document.querySelector('[data-page-push]')) return true;
    var p = location.pathname;
    return GAME_PATHS.some(function (g) { return p.indexOf(g) === 0; });
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

  // --- run ---
  function run() {
    injectResponsiveCSS();
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
