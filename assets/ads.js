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
      '.inline-ad{max-width:100vw;box-sizing:border-box;position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;isolation:isolate}',
      '.inline-ad>*{max-width:100%}',
      '.inline-ad iframe{display:block!important;max-width:100%;margin:0 auto!important;position:static!important}',
      '.inline-ad,.native-ad-wrap{clear:both}',
      '.native-ad-wrap{position:relative;z-index:1;overflow:hidden;isolation:isolate}',
      '.medium-rectangle-ad{text-align:center;margin:30px auto;min-height:250px;max-width:336px}',
      '.medium-rectangle-ad .ad-label{font:10px/1.2 Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#8b8f9c;text-align:center;margin-bottom:6px}',
      '@media (max-width:767px){.inline-ad iframe[width="728"]{display:none!important}}',
      '@media (max-width:767px){.inline-ad iframe[width="468"]{display:none!important}}',
      '#adsterra-side,#adsterra-left,.ad-rail{display:none!important;pointer-events:none!important}',
      '.ad-rail{position:fixed;top:96px;z-index:20;width:160px;min-height:300px}',
      '.ad-rail iframe{border:0;display:block;max-width:160px;background:transparent}',
      '.ad-rail-label{font:10px/1.2 Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#8b8f9c;text-align:center;margin-bottom:6px}',
      '.ad-rail-left{left:max(12px,calc((100vw - 1120px)/2 - 190px))!important}.ad-rail-right{right:max(12px,calc((100vw - 1120px)/2 - 190px))!important}',
      'body.ad-side-rails-ok #adsterra-side,body.ad-side-rails-ok #adsterra-left{position:fixed!important;top:96px!important;transform:none!important;width:160px!important;z-index:20!important}',
      'body.ad-side-rails-ok #adsterra-side{right:max(12px,calc((100vw - 1120px)/2 - 190px))!important;height:600px!important}',
      'body.ad-side-rails-ok #adsterra-left{left:max(12px,calc((100vw - 1120px)/2 - 190px))!important;height:300px!important}',
      '@media (min-width:1480px){body.ad-side-rails-ok .ad-rail,body.ad-side-rails-ok #adsterra-side,body.ad-side-rails-ok #adsterra-left{display:block!important;pointer-events:auto!important}}',
      '@media (max-width:1479px){.side-ad,#adsterra-side,#adsterra-left,.ad-rail{display:none!important;pointer-events:none!important}}',
      '.mobile-ad-swap{display:none;justify-content:center;margin:12px auto;width:100%;min-height:50px}',
      '@media (max-width:767px){.mobile-ad-swap{display:flex}}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function normalizeUrl(value) {
    return String(value || '').replace(/^https?:/, '');
  }

  function blockedClickNeedles() {
    var fromConfig = [CFG.disabledClickunderSrc, CFG.disabledDirectLink]
      .concat(CFG.blockedClickAdNeedles || [])
      .filter(Boolean);
    return fromConfig.map(normalizeUrl);
  }

  function nodeUrl(node) {
    if (!node || node.nodeType !== 1) return '';
    return node.getAttribute('src') || node.getAttribute('href') || node.getAttribute('data-src') || '';
  }

  function isBlockedClickAdValue(value) {
    var normalized = normalizeUrl(value);
    if (!normalized) return false;
    return blockedClickNeedles().some(function (src) {
      return normalized.indexOf(src) !== -1 || src.indexOf(normalized) !== -1;
    });
  }

  function nodeContainsBlockedClickAd(node) {
    if (!node || node.nodeType !== 1) return false;
    if (isBlockedClickAdValue(nodeUrl(node))) return true;
    return !!node.querySelector && !!node.querySelector('script[src],a[href],iframe[src],iframe[data-src]') &&
      Array.prototype.some.call(node.querySelectorAll('script[src],a[href],iframe[src],iframe[data-src]'), function (child) {
        return isBlockedClickAdValue(nodeUrl(child));
      });
  }

  function removeNode(node) {
    if (node && node.parentNode) node.parentNode.removeChild(node);
  }

  function removeUnsafeClickAds() {
    var blocked = blockedClickNeedles();
    if (!blocked.length) return 0;
    var removed = 0;

    document.querySelectorAll('script[src],a[href],iframe[src]').forEach(function (node) {
      if (isBlockedClickAdValue(nodeUrl(node))) {
        removeNode(node);
        removed += 1;
      }
    });
    return removed;
  }

  function isLikelyInvisibleFullPageOverlay(node) {
    if (!node || node.nodeType !== 1 || !node.getBoundingClientRect) return false;
    if (node.closest && node.closest('.result-modal,.modal,.ad-rail,.inline-ad,.native-ad-wrap')) return false;
    var style = window.getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    if (style.position !== 'fixed' && style.position !== 'absolute') return false;

    var rect = node.getBoundingClientRect();
    var viewportArea = Math.max(1, window.innerWidth * window.innerHeight);
    var nodeArea = Math.max(0, rect.width * rect.height);
    var coversMostScreen = nodeArea / viewportArea > 0.65 || (
      rect.left <= 8 && rect.top <= 8 &&
      rect.right >= window.innerWidth - 8 &&
      rect.bottom >= window.innerHeight - 8
    );
    if (!coversMostScreen) return false;

    var opacity = parseFloat(style.opacity || '1');
    var highZ = parseInt(style.zIndex, 10);
    var looksInvisible = opacity < 0.08 || style.backgroundColor === 'rgba(0, 0, 0, 0)';
    var hasAdTarget = nodeContainsBlockedClickAd(node) || /effectivecpmnetwork|highperformanceformat|topcreativeformat/i.test(node.innerHTML || '');
    return hasAdTarget && (looksInvisible || highZ >= 999);
  }

  function removeClickHijackOverlays(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var removed = 0;
    var candidates = [];
    if (scope.nodeType === 1) candidates.push(scope);
    if (scope.querySelectorAll) {
      candidates = candidates.concat(Array.prototype.slice.call(scope.querySelectorAll('a,iframe,div,ins,section,aside')));
    }
    candidates.forEach(function (node) {
      if (nodeContainsBlockedClickAd(node) || isLikelyInvisibleFullPageOverlay(node)) {
        removeNode(node);
        removed += 1;
      }
    });
    return removed;
  }

  function installClickHijackGuard() {
    removeUnsafeClickAds();
    removeClickHijackOverlays(document);

    document.addEventListener('click', function (event) {
      var target = event.target && event.target.closest ? event.target.closest('a,iframe,div,ins,section,aside') : null;
      if (!target) return;
      if (!nodeContainsBlockedClickAd(target) && !isLikelyInvisibleFullPageOverlay(target)) return;
      event.preventDefault();
      event.stopPropagation();
      removeNode(target);
    }, true);

    if (!('MutationObserver' in window)) return;
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        Array.prototype.forEach.call(mutation.addedNodes || [], function (node) {
          if (node.nodeType !== 1) return;
          if (nodeContainsBlockedClickAd(node) || isLikelyInvisibleFullPageOverlay(node)) removeNode(node);
          else removeClickHijackOverlays(node);
        });
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
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

  function isArticleLikePage() {
    if (document.body && document.body.hasAttribute('data-no-side-ads')) return false;
    if (isGamePage()) return false;
    if (location.pathname === '/' || location.pathname === '/articles/') return false;

    var article = document.querySelector('article.article') || document.querySelector('article');
    if (!article) return false;
    var paragraphCount = article.querySelectorAll('p').length;
    var hasArticleHeader = !!article.querySelector('h1,.article-header,.eyebrow,.lede');
    return hasArticleHeader && paragraphCount >= 3;
  }

  function updateSideRailEligibility() {
    if (!document.body) return;
    document.body.classList.toggle('ad-side-rails-ok', isArticleLikePage());
  }

  function makeAdFrame(key, width, height) {
    var frame = document.createElement('iframe');
    frame.width = String(width);
    frame.height = String(height);
    frame.setAttribute('frameborder', '0');
    frame.setAttribute('scrolling', 'no');
    frame.style.cssText = 'width:' + width + 'px;height:' + height + 'px;border:0;overflow:hidden;';
    frame.srcdoc = [
      '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">',
      '<style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style></head><body>',
      '<script>var atOptions={key:"' + key + '",format:"iframe",height:' + height + ',width:' + width + ',params:{}};<\/script>',
      '<script src="https://www.highperformanceformat.com/' + key + '/invoke.js"><\/script>',
      '</body></html>'
    ].join('');
    return frame;
  }

  function makeMediumRectangleSlot(source) {
    if (!CFG.banner300x250) return null;
    var slot = document.createElement('div');
    slot.className = 'inline-ad medium-rectangle-ad';
    slot.setAttribute('data-auto-medium-rectangle', source || 'auto');
    slot.setAttribute('aria-label', 'Advertisement');

    var label = document.createElement('div');
    label.className = 'ad-label';
    label.textContent = 'Ad';
    slot.appendChild(label);
    slot.appendChild(makeAdFrame(CFG.banner300x250, 300, 250));
    return slot;
  }

  function autoPlaceMediumRectangles() {
    if (!isArticleLikePage()) return;
    if (!CFG.banner300x250) return;

    var host = document.querySelector('article') || document.querySelector('main');
    if (!host) return;

    var maxSlots = parseInt(CFG.maxAutoMediumRectangles, 10);
    if (!maxSlots || maxSlots < 1) maxSlots = 3;

    var existing = document.querySelectorAll('[data-auto-medium-rectangle], .inline-ad iframe[width="300"][height="250"]').length;
    var remaining = Math.max(0, maxSlots - existing);
    if (!remaining) return;

    var candidates = Array.prototype.slice.call(host.querySelectorAll('h2, h3'));
    if (candidates.length < 2) return;

    var indexes = [];
    if (candidates.length >= 2) indexes.push(1);
    if (candidates.length >= 5) indexes.push(Math.floor(candidates.length / 2));
    if (candidates.length >= 8) indexes.push(Math.max(2, candidates.length - 3));

    indexes = indexes.filter(function (value, index, list) {
      return list.indexOf(value) === index && candidates[value];
    }).slice(0, remaining);

    indexes.forEach(function (index, count) {
      var anchor = candidates[index];
      if (!anchor || !anchor.parentNode) return;
      var previous = anchor.previousElementSibling;
      var next = anchor.nextElementSibling;
      if ((previous && previous.classList && previous.classList.contains('inline-ad')) ||
          (next && next.classList && next.classList.contains('inline-ad'))) return;
      var slot = makeMediumRectangleSlot('content-' + (count + 1));
      if (slot) anchor.parentNode.insertBefore(slot, anchor);
    });
  }

  function injectSideRailAds() {
    if (!isArticleLikePage()) return;
    if (!CFG.banner160x600 && !CFG.banner160x300) return;
    var hasLeftRail = !!document.querySelector('.ad-rail-left,#adsterra-left');
    var hasRightRail = !!document.querySelector('.ad-rail-right,#adsterra-side');

    if (CFG.banner160x300 && !hasLeftRail) {
      var left = document.createElement('aside');
      left.className = 'ad-rail ad-rail-left';
      left.setAttribute('aria-label', 'Advertisement');
      left.innerHTML = '<div class="ad-rail-label">Ad</div>';
      left.appendChild(makeAdFrame(CFG.banner160x300, 160, 300));
      document.body.appendChild(left);
    }

    if (CFG.banner160x600 && !hasRightRail) {
      var right = document.createElement('aside');
      right.className = 'ad-rail ad-rail-right';
      right.setAttribute('aria-label', 'Advertisement');
      right.innerHTML = '<div class="ad-rail-label">Ad</div>';
      right.appendChild(makeAdFrame(CFG.banner160x600, 160, 600));
      document.body.appendChild(right);
    }
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

  function makeArticleCardsClickable() {
    document.querySelectorAll('.article-card').forEach(function (card) {
      if (card.getAttribute('data-card-clickable') === '1') return;
      var link = card.querySelector('.article-title a,h3 a,a[href]');
      if (!link || !link.href) return;
      card.setAttribute('data-card-clickable', '1');
      card.style.cursor = 'pointer';
      card.addEventListener('click', function (event) {
        if (event.defaultPrevented) return;
        if (event.target && event.target.closest && event.target.closest('a,button,input,select,textarea')) return;
        window.location.href = link.href;
      });
    });
  }

  function run() {
    injectResponsiveCSS();
    updateSideRailEligibility();
    installClickHijackGuard();
    makeArticleCardsClickable();
    injectMobileBanners();
    injectSideRailAds();
    autoPlaceMediumRectangles();
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
