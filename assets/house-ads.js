/* Retain the shared language switcher for pages that load this legacy asset. */
(() => {
  function injectLangBar() {
    if (document.getElementById('ml-langbar')) return;
    var langs = [['/', 'English'], ['/es/', 'Español'], ['/fr/', 'Français'],
                 ['/de/', 'Deutsch'], ['/pl/', 'Polski'], ['/zh/', '中文']];
    var here = document.documentElement.lang || 'en';
    var bar = document.createElement('div');
    bar.id = 'ml-langbar';
    bar.setAttribute('aria-label', 'Language');
    bar.style.cssText = 'text-align:center;padding:14px 16px;font-size:13px;color:#8b8f9c;'
      + 'border-top:1px solid #e5e1d8;background:#fbfaf7;line-height:2';
    bar.innerHTML = '🌐 ' + langs.map(function (l) {
      var code = l[0] === '/' ? 'en' : l[0].replace(/\//g, '');
      var on = (code === here);
      return '<a href="' + l[0] + '" hreflang="' + code + '"' + (on ? ' aria-current="true"' : '')
        + ' style="color:' + (on ? '#a02818' : '#8b8f9c') + ';font-weight:' + (on ? '700' : '500')
        + ';margin:0 8px;text-decoration:none">' + l[1] + '</a>';
    }).join('<span style="color:#d4cfc3">·</span>');
    var footer = document.querySelector('footer, .footer');
    if (footer && footer.parentNode) footer.parentNode.insertBefore(bar, footer.nextSibling);
    else document.body.appendChild(bar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectLangBar, {once: true});
  } else {
    injectLangBar();
  }
})();
