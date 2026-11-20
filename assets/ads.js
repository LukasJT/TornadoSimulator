/* Responsive, bounded Adsterra placements. Static slots reserve space before scripts run. */
(() => {
  'use strict';
  const cfg = window.ADSTERRA;
  if (!cfg?.enabled || window.__tornadoAdsStarted) return;
  window.__tornadoAdsStarted = true;
  const production = /^(www\.)?tornadosimulator\.net$/.test(location.hostname);
  const preview = !production && new URLSearchParams(location.search).has('ads-preview');
  const requiresCmp = Boolean(document.querySelector('[data-th-ad-consent="required"]'));
  const slots = [...document.querySelectorAll('[data-th-ad]')];
  if (!production && !preview) { slots.forEach(slot => slot.hidden = true); return; }
  const article = document.querySelector('article.article');
  const used = new Set();
  let requests = 0;
  let allowed = false;
  let observer;

  function choose(slot) {
    if (slot.dataset.thAd === 'primary') return slot.clientWidth >= 728 ? 'leaderboard' : 'native';
    if (['secondary','sidebar'].includes(slot.dataset.thAd) && article && innerWidth >= 1500 && article.getBoundingClientRect().right + 208 < innerWidth) return 'skyscraper';
    if (slot.dataset.thAd === 'sidebar') return null;
    // A single native placement on phones; on desktop the second slot complements the leaderboard.
    return used.has('native') ? null : 'native';
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
      const deadline = Date.now() + 15000;
      const waitForCmp = setInterval(() => {
        if (connectCmp() || Date.now() >= deadline) clearInterval(waitForCmp);
      }, 100);
    } else setConsent(true);
  }
})();
