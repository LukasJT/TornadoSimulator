/* Responsive, bounded Adsterra placements. Static slots reserve space before scripts run. */
(() => {
  'use strict';
  const cfg = window.ADSTERRA;
  if (!cfg?.enabled || window.__tornadoAdsStarted) return;
  window.__tornadoAdsStarted = true;
  const production = /^(www\.)?tornadosimulator\.net$/.test(location.hostname);
  const preview = !production && new URLSearchParams(location.search).has('ads-preview');
  const article = document.querySelector('article.article, article#main-content');
  const main = document.querySelector('main');
  const route = location.pathname.replace(/^(\/(?:de|es|fr|pl|zh))(?=\/)/, '');
  const directories = new Set(['/articles/', '/tornado-history-by-location/', '/weather-calculators/', '/learn/', '/games/']);
  const bannerExcluded = /^\/(?:live-tornado-warnings[^/]*|live-tornado-map|mobile-alerts|tornado-forecast|search|privacy-policy|terms-and-conditions|contact)(?:\/|$)/;
  const canEnhance = Boolean(document.body && route && !bannerExcluded.test(route));

  function addInlineSlot(name, anchor) {
    const slot = document.createElement('aside');
    slot.className = 'th-ad-slot';
    slot.dataset.thAd = name;
    slot.dataset.thAdConsent = 'required';
    if (name === 'primary' && anchor.matches('p')) slot.dataset.thEditorial = 'true';
    slot.setAttribute('aria-label', 'Advertisement');
    const label = document.createElement('span');
    label.className = 'th-ad-label';
    label.textContent = 'Advertisement';
    const creative = document.createElement('div');
    creative.className = 'th-ad-creative';
    slot.append(label, creative);
    anchor.after(slot);
  }

  const editorial = article || (!directories.has(route) && main?.querySelector('h2') ? main : null);
  if ((production || preview) && canEnhance && editorial) {
    const paragraphs = [...editorial.querySelectorAll(':scope > p, :scope > section > p, :scope > .article-body > p')]
      .filter(p => !p.closest('.related, .article-sources, .faq, .sources, [hidden]') && p.textContent.trim().length >= 30);
    const proseLength = paragraphs.reduce((total, p) => total + p.textContent.trim().length, 0);
    if (!document.querySelector('[data-th-ad="primary"]') && paragraphs.length >= 3 && proseLength >= 300) {
      addInlineSlot('primary', paragraphs[1]);
    }
    if (paragraphs.length >= 9 && proseLength >= 2100 && !document.querySelector('[data-th-ad="secondary"]')) {
      const anchor = paragraphs[Math.floor(paragraphs.length * 0.66)];
      const sidebar = document.querySelector('[data-th-ad="sidebar"]');
      if (sidebar) {
        sidebar.dataset.thAd = 'secondary';
        anchor.after(sidebar);
      } else addInlineSlot('secondary', anchor);
    }
  } else if ((production || preview) && canEnhance && directories.has(route) && !document.querySelector('[data-th-ad]')) {
    const anchor = document.querySelector('main > section') || document.querySelector('main h1');
    if (anchor) addInlineSlot('primary', anchor);
  }

  const slots = [...document.querySelectorAll('[data-th-ad]')];
  if (!production && !preview) { slots.forEach(slot => slot.hidden = true); return; }
  if (!slots.length) return;
  const requiresCmp = canEnhance || Boolean(document.querySelector('[data-th-ad-consent="required"]'));
  const used = new Set();
  let requests = 0;
  let allowed = false;
  let observer;

  function choose(slot) {
    if (slot.dataset.thEditorial === 'true') {
      const bounds = slot.getBoundingClientRect();
      if (bounds.left < 0 || bounds.right > innerWidth) delete slot.dataset.thEditorial;
    }
    const width = slot.clientWidth;
    if (slot.dataset.thAd === 'primary') {
      for (const format of ['leaderboard', 'banner468', 'mobileBanner', 'rectangle']) {
        if (format === 'leaderboard' && innerWidth < 768) continue;
        if (cfg[format]?.width && width >= cfg[format].width) return format;
      }
      return width >= 280 && slot.dataset.thAdDisplayOnly !== 'true' ? 'native' : null;
    }
    if (['secondary','sidebar'].includes(slot.dataset.thAd) && article && innerWidth >= 1500 && article.getBoundingClientRect().right + 208 < innerWidth) return 'skyscraper';
    if (slot.dataset.thAd === 'sidebar') return null;
    // A single native placement on phones; on desktop the second slot complements the leaderboard.
    if (innerWidth < 900) return null;
    return ['rectangle', 'banner468', 'mobileBanner', 'native'].find(format =>
      !used.has(format) && (format === 'native' ? width >= 280 : cfg[format]?.width && width >= cfg[format].width));
  }
  const planned = slots.map(slot => {
    const format = choose(slot);
    if (!format || used.has(format) || used.size >= 2) { slot.hidden = true; return null; }
    used.add(format);
    slot.dataset.format = format;
    if (format === 'skyscraper') slot.dataset.position = 'rail';
    return {slot, format};
  }).filter(Boolean);

  function mount({slot, format}) {
    if (!allowed || slot.dataset.requested || document.visibilityState === 'hidden' || requests >= 2) return;
    slot.dataset.requested = 'true'; requests++;
    const host = slot.querySelector('.th-ad-creative');
    if (preview) { host.textContent = `Preview: ${format} placement`; return; }
    if (format === 'native') {
      const container = document.createElement('div'); container.id = cfg.native.container;
      host.append(container);
      const script = document.createElement('script'); script.async = true;
      script.dataset.cfasync = 'false'; script.src = cfg.native.src;
      script.onerror = () => { slot.dataset.status = 'unavailable'; };
      host.append(script);
    } else {
      const unit = cfg[format];
      const frame = document.createElement('iframe');
      frame.title = `Advertisement: ${format}`; frame.width = unit.width; frame.height = unit.height;
      frame.setAttribute('scrolling', 'no'); frame.setAttribute('loading', 'lazy');
      if (slot.dataset.thAdDisplayOnly === 'true') {
        frame.setAttribute('sandbox', 'allow-scripts allow-popups allow-popups-to-escape-sandbox');
      }
      // Isolate each atOptions global. Preserve the provider's code and dimensions.
      frame.srcdoc = '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;padding:0;background:transparent}</style></head><body>' +
        '<script>atOptions=' + JSON.stringify({key:unit.key,format:'iframe',height:unit.height,width:unit.width,params:{}}) + ';<\/script>' +
        '<script src="' + unit.src + '"><\/script></body></html>';
      host.append(frame);
    }
    // Diagnostic event only; not an impression, click, conversion or revenue measurement.
    document.dispatchEvent(new CustomEvent('tornado:ad-requested', {detail:{slot:slot.dataset.thAd,format}}));
  }
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting && document.visibilityState !== 'hidden') {
        const item = planned.find(item => item.slot === entry.target);
        mount(item);
        if (item.slot.dataset.requested) observer.unobserve(entry.target);
      }
    }, {rootMargin:'150px 0px',threshold:0.01});
  }

  function resume() {
    if (!allowed || document.visibilityState !== 'visible') return;
    for (const item of planned) {
      if (item.slot.dataset.requested) continue;
      if (observer) observer.observe(item.slot);
      else mount(item);
    }
  }

  function setConsent(next) {
    if (allowed === next) return;
    allowed = next;
    if (allowed) {
      resume();
    } else {
      for (const {slot} of planned) {
        observer?.unobserve(slot);
        if (slot.dataset.requested) slot.querySelector('.th-ad-creative').replaceChildren();
      }
    }
  }

  document.addEventListener('visibilitychange', resume);
  function connectCmp() {
    if (typeof window.__tcfapi !== 'function') return false;
    window.__tcfapi('addEventListener', 2, (tc, success) => {
      if (!success || !['tcloaded','useractioncomplete'].includes(tc?.eventStatus)) return;
      const vendorApproved = cfg.tcfVendorId != null && tc.vendor?.consents?.[cfg.tcfVendorId] === true;
      setConsent(tc.gdprApplies === false ||
        (tc.gdprApplies === true && tc.purpose?.consents?.[1] === true && (vendorApproved || !requiresCmp)));
    });
    return true;
  }

  if (preview) setConsent(true);
  else if (!connectCmp()) {
    if (requiresCmp) {
      if (!document.querySelector('script[src*="gatekeeperconsent.com"]')) {
        for (const src of ['https://cmp.gatekeeperconsent.com/min.js', 'https://the.gatekeeperconsent.com/cmp.min.js']) {
          const script = document.createElement('script');
          script.async = false;
          script.dataset.cfasync = 'false';
          script.src = src;
          document.head.append(script);
        }
      }
      const deadline = Date.now() + 15000;
      const waitForCmp = setInterval(() => {
        if (connectCmp() || Date.now() >= deadline) clearInterval(waitForCmp);
      }, 100);
    } else setConsent(true);
  }
})();
