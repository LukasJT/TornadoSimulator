/* Progressive enhancement: navigation and article contents work without a framework. */
(() => {
  const menu = document.querySelector('.th-menu');
  const links = document.querySelector('.th-links');
  if (menu && links) {
    menu.hidden = false;
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open)); links.classList.toggle('is-open', open);
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && links.classList.contains('is-open')) { links.classList.remove('is-open'); menu.setAttribute('aria-expanded','false'); menu.focus(); } });
  }
  document.querySelectorAll('.th-links a').forEach(a => { if (a.pathname === location.pathname) a.setAttribute('aria-current','page'); });
  const article = document.querySelector('article.article');
  const simulatorLink = document.querySelector('.sim-cta');
  if (article && simulatorLink) article.append(simulatorLink);
  const firstAd=document.querySelector('.th-legacy-ad');
  if(firstAd){const content=article||document.querySelector('main');const section=content?.querySelector(':scope > section');const headings=content?.querySelectorAll(':scope > h2');if(section)section.after(firstAd);else if(headings?.length>1)headings[1].before(firstAd);else if(content)content.append(firstAd);}
  if(article)article.querySelectorAll('div[style*="linear-gradient"]').forEach(box=>{if(box.querySelector('a[rel~="sponsored"]')){box.classList.add('th-affiliate');article.after(box);}});
  if (article && document.documentElement.lang === 'en' && !article.querySelector('.th-toc')) {
    const headings = [...article.querySelectorAll('h2')].filter(h => !h.closest('.related,.faq,.article-brief-v3') && h.textContent.trim());
    if (headings.length >= 3) {
      const toc=document.createElement('details'); toc.className='th-toc';
      const summary=document.createElement('summary'); summary.textContent='In this guide'; toc.append(summary);
      const list=document.createElement('ol');
      headings.slice(0,16).forEach((h,i) => { if(!h.id) h.id='guide-section-'+i; const li=document.createElement('li'); const a=document.createElement('a'); a.href='#'+h.id; a.textContent=h.textContent; li.append(a); list.append(li); });
      toc.append(list); const header=article.querySelector('.article-header'); (header||article.firstElementChild)?.after(toc);
    }
  }
  document.querySelectorAll('[data-site-search-input]').forEach(input => { if(!input.labels?.length && !input.hasAttribute('aria-label')) input.setAttribute('aria-label','Search Tornado Hub'); });
  if (location.pathname === '/articles/') {
    const main=document.querySelector('main');
    const sections=[...document.querySelectorAll('.cat-section')];
    const control=document.createElement('div'); control.className='th-catalog-filter';
    control.innerHTML='<label for="guide-filter">Find a guide in the collection</label><input id="guide-filter" type="search" placeholder="Try radar, Joplin, or tornado safety"><p role="status" aria-live="polite"></p>';
    main?.prepend(control);
    const input=control.querySelector('input'),status=control.querySelector('p');
    input.addEventListener('input',()=>{const q=input.value.trim().toLocaleLowerCase();let total=0;sections.forEach(section=>{let visible=0;section.querySelectorAll('.link-card').forEach(card=>{card.hidden=!card.textContent.toLocaleLowerCase().includes(q);if(!card.hidden)visible++;});section.hidden=visible===0;total+=visible;});status.textContent=total?`${total} guides found`:'No guides found. Try a shorter search.';});
  }
})();
