/* House ads — cross-promo for sister sites.
 * Randomly picks 2 of 3 sites per page load and injects them as
 * left/right slots alongside every .inline-ad banner on wide screens. */
(function () {
  'use strict';

  var SITES = [
    { domain: 'celestialvisibility', variants: [
      { href: 'https://celestialvisibility.com', title: 'See the Milky Way tonight',
        sub: 'Real-time night-sky visibility forecast for your city',
        bg: 'linear-gradient(135deg,#0a1128 0%,#1a2456 45%,#4a1a6e 100%)',
        color: '#e8ecff', accent: '#a3d5ff', icon: '🌌' },
      { href: 'https://celestialvisibility.com', title: 'Northern lights forecast',
        sub: 'Know exactly when the aurora is visible near you',
        bg: 'linear-gradient(135deg,#052922 0%,#0e5e4e 45%,#3ac598 100%)',
        color: '#f0fff8', accent: '#c8f7e0', icon: '✨' },
    ]},
    { domain: 'vitamindcalculator', variants: [
      { href: 'https://vitamindcalculator.net', title: '42% of Americans are low',
        sub: 'Free personalized vitamin D deficiency calculator',
        bg: 'linear-gradient(135deg,#fff4c9 0%,#ffb830 45%,#ff7a1a 100%)',
        color: '#3a1e00', accent: '#3a1e00', icon: '☀️' },
      { href: 'https://vitamindcalculator.net', title: 'Fix your vitamin D',
        sub: 'Get your personalized daily dose — free, in 60 seconds',
        bg: 'linear-gradient(135deg,#ffe4a0 0%,#ff9e00 50%,#e85a00 100%)',
        color: '#3a1e00', accent: '#3a1e00', icon: '☀️' },
      { href: 'https://vitamindcalculator.net', title: '1 in 4 Canadians is deficient',
        sub: 'Check your levels with a free 60-second calculator',
        bg: 'linear-gradient(135deg,#fff0d0 0%,#ff8f3a 45%,#c94b1e 100%)',
        color: '#3a1e00', accent: '#3a1e00', icon: '🍁' },
    ]},
    { domain: 'onetwothreevideos', variants: [
      { href: 'https://123videos.net', title: 'Every movie & show',
        sub: 'Search 400,000+ titles across all streamers',
        bg: 'linear-gradient(135deg,#1a0033 0%,#8e2de2 45%,#ff4b6e 100%)',
        color: '#ffe4c8', accent: '#ffe4c8', icon: '🎬' },
      { href: 'https://123videos.net', title: 'What to watch tonight',
        sub: 'Every show and movie in one search bar',
        bg: 'linear-gradient(135deg,#0f0524 0%,#ac1eb1 50%,#ff6b9d 100%)',
        color: '#ffe8f0', accent: '#ffe8f0', icon: '🍿' },
    ]},
    { domain: 'playmabble', variants: [
      { href: 'https://playmabble.com', title: 'Scrabble for math nerds',
        sub: 'Free online competitive math game — play head to head',
        bg: 'linear-gradient(135deg,#0d2544 0%,#1a4d8f 50%,#28a3f5 100%)',
        color: '#e0f0ff', accent: '#e0f0ff', icon: '🔢' },
      { href: 'https://playmabble.com', title: 'Online competitive math',
        sub: 'Race real opponents in the math version of Scrabble',
        bg: 'linear-gradient(135deg,#1a2456 0%,#3a5db9 50%,#5db8ff 100%)',
        color: '#e0f0ff', accent: '#e0f0ff', icon: '➗' },
    ]},
    { domain: 'homelesshelp', variants: [
      { href: 'https://homelesshelp.net', title: 'Volunteer today',
        sub: 'Find shelters, food banks, and outreach in your city',
        bg: 'linear-gradient(135deg,#132c1a 0%,#2d6a4f 50%,#95d5b2 100%)',
        color: '#e8f8ee', accent: '#e8f8ee', icon: '🤝' },
      { href: 'https://homelesshelp.net', title: 'Learn how to help',
        sub: 'A directory of local shelters, food banks, and outreach programs',
        bg: 'linear-gradient(135deg,#1e3f2b 0%,#3a8862 50%,#a0dcbb 100%)',
        color: '#e8f8ee', accent: '#e8f8ee', icon: '❤️' },
    ]},
  ];

  function pickTwo() {
    var shuffled = SITES.slice().sort(function () { return Math.random() - 0.5; });
    var a = shuffled[0], b = shuffled[1];
    return [
      a.variants[Math.floor(Math.random() * a.variants.length)],
      b.variants[Math.floor(Math.random() * b.variants.length)],
    ];
  }

  function renderAd(ad) {
    return (
      '<a href="' + ad.href + '" target="_blank" rel="noopener sponsored" class="house-ad" ' +
      'style="display:flex;flex-direction:column;justify-content:center;align-items:center;' +
      'padding:24px 18px;background:' + ad.bg + ';color:' + ad.color + ';' +
      'text-decoration:none;border-radius:12px;min-height:240px;flex:0 0 220px;' +
      'box-shadow:0 4px 16px rgba(0,0,0,0.12);' +
      'transition:transform 0.15s,box-shadow 0.15s;text-align:center;' +
      'font-family:Inter,system-ui,-apple-system,sans-serif" ' +
      'onmouseover="this.style.transform=&quot;translateY(-3px)&quot;;this.style.boxShadow=&quot;0 8px 24px rgba(0,0,0,0.22)&quot;" ' +
      'onmouseout="this.style.transform=&quot;&quot;;this.style.boxShadow=&quot;0 4px 16px rgba(0,0,0,0.12)&quot;">' +
        '<div style="font-size:44px;line-height:1;margin-bottom:14px">' + ad.icon + '</div>' +
        '<div style="font-family:Fraunces,Georgia,serif;font-weight:700;font-size:20px;line-height:1.15;letter-spacing:-0.01em;margin-bottom:8px">' + ad.title + '</div>' +
        '<div style="font-size:13px;opacity:0.94;line-height:1.4;max-width:190px">' + ad.sub + '</div>' +
        '<div style="margin-top:16px;padding:6px 14px;background:rgba(255,255,255,0.2);border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase">Visit site →</div>' +
      '</a>'
    );
  }

  function isContentArticlePage() {
    if (location.pathname === '/' || location.pathname === '/articles/') return false;
    var article = document.querySelector('article.article') || document.querySelector('article');
    if (!article) return false;
    return !!article.querySelector('h1,.article-header,.eyebrow,.lede') && article.querySelectorAll('p').length >= 3;
  }

  function inject() {
    if (isContentArticlePage()) return;
    var banners = document.querySelectorAll('.inline-ad');
    if (!banners.length) return;

    // Inject style once
    if (!document.getElementById('house-ad-css')) {
      var s = document.createElement('style');
      s.id = 'house-ad-css';
      s.textContent =
        '.inline-ad-row{display:flex;gap:16px;justify-content:center;align-items:stretch;' +
        'margin:32px auto;padding:0 16px;box-sizing:border-box;flex-wrap:nowrap;' +
        'width:min(1200px,calc(100vw - 32px));position:relative;' +
        'left:50%;transform:translateX(-50%)}' +
        '.inline-ad-row .house-ad-wrap{display:none;flex:0 0 210px}' +
        '.inline-ad-row .inline-ad{margin:0;flex:1 1 auto;max-width:728px;align-self:center}' +
        '@media (min-width:1480px){.inline-ad-row .house-ad-wrap{display:block}}' +
        '@media (max-width:1479px){.inline-ad-row{width:auto;left:auto;transform:none;padding:0;max-width:100%}}';
      document.head.appendChild(s);
    }

    var picks = pickTwo();
    var left = picks[0], right = picks[1];

    banners.forEach(function (banner) {
      if (banner.closest('.inline-ad-row')) return;
      if (banner.closest('.house-ad')) return;

      var row = document.createElement('div');
      row.className = 'inline-ad-row';

      var lw = document.createElement('div');
      lw.className = 'house-ad-wrap';
      lw.innerHTML = renderAd(left);

      var rw = document.createElement('div');
      rw.className = 'house-ad-wrap';
      rw.innerHTML = renderAd(right);

      banner.parentNode.insertBefore(row, banner);
      row.appendChild(lw);
      row.appendChild(banner);
      row.appendChild(rw);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
