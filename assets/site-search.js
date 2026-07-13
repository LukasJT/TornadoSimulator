(function () {
  'use strict';

  var input = document.querySelector('[data-site-search-input]');
  var results = document.querySelector('[data-site-search-results]');
  var count = document.querySelector('[data-site-search-count]');
  var chips = document.querySelectorAll('[data-search-chip]');
  var data = window.TORNADO_CONTENT_INDEX || [];
  var activeCategory = 'All';

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function score(item, query) {
    if (!query) return item.path === '/' ? 8 : 1;
    var haystack = normalize(item.keywords);
    var title = normalize(item.title);
    var path = normalize(item.path);
    var score = 0;
    query.split(' ').forEach(function (part) {
      if (!part) return;
      if (title.indexOf(part) !== -1) score += 8;
      if (path.indexOf(part) !== -1) score += 5;
      if (haystack.indexOf(part) !== -1) score += 2;
    });
    return score;
  }

  function render() {
    if (!results) return;
    var query = normalize(input ? input.value : '');
    var matches = data
      .map(function (item) { return { item: item, score: score(item, query) }; })
      .filter(function (entry) {
        if (activeCategory !== 'All' && entry.item.category !== activeCategory) return false;
        return query ? entry.score > 0 : entry.item.path !== '/';
      })
      .sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return a.item.title.localeCompare(b.item.title);
      })
      .slice(0, Number(results.getAttribute('data-result-limit') || 48))
      .map(function (entry) { return entry.item; });

    if (count) count.textContent = matches.length + ' results';
    results.innerHTML = matches.map(function (item) {
      return [
        '<a class="search-result" href="' + escapeHtml(item.path) + '">',
        '<span>' + escapeHtml(item.category) + '</span>',
        '<strong>' + escapeHtml(item.title) + '</strong>',
        '<small>' + escapeHtml(item.description || item.path) + '</small>',
        '</a>'
      ].join('');
    }).join('') || '<p class="search-empty">No matches yet. Try tornado safety, EF5, radar, Joplin, shelter, quiz, or simulator.</p>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  if (input) input.addEventListener('input', render);
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      activeCategory = chip.getAttribute('data-search-chip') || 'All';
      chips.forEach(function (node) { node.classList.toggle('active', node === chip); });
      render();
    });
  });

  render();
})();
