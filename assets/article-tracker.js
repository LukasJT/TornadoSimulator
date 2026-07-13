(function () {
  'use strict';

  var STORAGE_KEY = 'tornadoHub.pageViews.v1';
  var MAX_ITEMS = 80;
  var FALLBACK = [
    {
      path: '/tornado-warning-polygon-explained/',
      title: 'Tornado warning polygon explained',
      description: 'How to read the shape on radar apps and decide when to shelter.',
      category: 'Warning Guide',
      seedViews: 184
    },
    {
      path: '/rain-wrapped-tornado/',
      title: 'Rain-wrapped tornadoes',
      description: 'Why some tornadoes disappear inside heavy rain and how to stay safer.',
      category: 'Safety',
      seedViews: 171
    },
    {
      path: '/tornado-shelter-without-basement/',
      title: 'Shelter without a basement',
      description: 'Interior rooms, apartments, mobile homes, and last-minute options.',
      category: 'Preparedness',
      seedViews: 166
    },
    {
      path: '/tornado-car-safety-myths/',
      title: 'Tornado car safety myths',
      description: 'Overpasses, ditches, driving away, and what actually lowers risk.',
      category: 'Myth Check',
      seedViews: 153
    },
    {
      path: '/joplin-2011/',
      title: 'Joplin 2011',
      description: 'The warning, the impact, and what changed after one of the deadliest modern tornadoes.',
      category: 'Case File',
      seedViews: 141
    },
    {
      path: '/tornado-debris-signature/',
      title: 'Tornado debris signature',
      description: 'The radar clue that can confirm lofted debris during a dangerous storm.',
      category: 'Radar',
      seedViews: 132
    }
  ];

  function readStore() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
    } catch (err) {
      return {};
    }
  }

  function writeStore(store) {
    try {
      var sorted = Object.keys(store)
        .map(function (path) { return store[path]; })
        .sort(function (a, b) { return (b.lastViewed || 0) - (a.lastViewed || 0); })
        .slice(0, MAX_ITEMS);
      var trimmed = {};
      sorted.forEach(function (item) { trimmed[item.path] = item; });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (err) {}
  }

  function cleanTitle(value) {
    return String(value || 'Tornado Hub')
      .replace(/\s+[|-]\s+Tornado Hub$/i, '')
      .replace(/\s+[|-]\s+Tornado Information Hub$/i, '')
      .trim();
  }

  function getDescription() {
    var meta = document.querySelector('meta[name="description"]');
    return meta ? meta.getAttribute('content') || '' : '';
  }

  function isTrackablePath(path) {
    if (!path || path === '/' || path.indexOf('/assets/') === 0) return false;
    if (path.indexOf('/quiz/') === 0) return true;
    return /\/$/.test(path);
  }

  function getCategory() {
    var eyebrow = document.querySelector('.eyebrow, .page-eyebrow, .article-cat, .section-eyebrow');
    if (eyebrow && eyebrow.textContent.trim()) return eyebrow.textContent.trim();
    if (location.pathname.indexOf('/quiz/') === 0) return 'Quiz';
    if (location.pathname.indexOf('safety') !== -1 || location.pathname.indexOf('shelter') !== -1) return 'Safety';
    if (location.pathname.indexOf('simulator') !== -1 || location.pathname.indexOf('game') !== -1) return 'Interactive';
    return 'Article';
  }

  function recordView() {
    var path = location.pathname;
    if (!isTrackablePath(path)) return readStore();

    var store = readStore();
    var item = store[path] || { path: path, views: 0 };
    item.title = cleanTitle(document.title);
    item.description = getDescription();
    item.category = getCategory();
    item.views = (item.views || 0) + 1;
    item.lastViewed = Date.now();
    store[path] = item;
    writeStore(store);
    return store;
  }

  function mergeTrending(store) {
    var byPath = {};
    FALLBACK.forEach(function (item) {
      byPath[item.path] = {
        path: item.path,
        title: item.title,
        description: item.description,
        category: item.category,
        views: item.seedViews,
        lastViewed: 0,
        seeded: true
      };
    });

    Object.keys(store).forEach(function (path) {
      var item = store[path];
      if (!item || !item.path || item.path === '/') return;
      var existing = byPath[path] || {};
      byPath[path] = {
        path: path,
        title: item.title || existing.title || cleanTitle(path),
        description: item.description || existing.description || '',
        category: item.category || existing.category || 'Article',
        views: (item.views || 0) + (existing.views || 0),
        lastViewed: item.lastViewed || 0,
        seeded: false
      };
    });

    return Object.keys(byPath)
      .map(function (path) { return byPath[path]; })
      .sort(function (a, b) {
        if ((b.views || 0) !== (a.views || 0)) return (b.views || 0) - (a.views || 0);
        return (b.lastViewed || 0) - (a.lastViewed || 0);
      });
  }

  function renderList(selector, items, emptyText) {
    document.querySelectorAll(selector).forEach(function (container) {
      var limit = Number(container.getAttribute('data-limit') || 5);
      var selected = items.slice(0, limit);
      if (!selected.length) {
        container.innerHTML = '<p class="tracker-empty">' + emptyText + '</p>';
        return;
      }
      container.innerHTML = selected.map(function (item, index) {
        var views = item.views === 1 ? '1 view' : String(item.views || 0) + ' views';
        var kicker = escapeHtml(item.category) + ' · ' + escapeHtml(views);
        return [
          '<a class="trend-row" href="' + escapeHtml(item.path) + '">',
          '<span class="trend-rank">' + String(index + 1).padStart(2, '0') + '</span>',
          '<span class="trend-copy">',
          '<span class="trend-kicker">' + kicker + '</span>',
          '<strong>' + escapeHtml(item.title) + '</strong>',
          item.description ? '<span>' + escapeHtml(item.description) + '</span>' : '',
          '</span>',
          '</a>'
        ].join('');
      }).join('');
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function renderCurrentViewCount(store) {
    var item = store[location.pathname];
    document.querySelectorAll('[data-view-count]').forEach(function (node) {
      var count = item ? item.views || 0 : 0;
      node.textContent = count === 1 ? '1 local view' : count + ' local views';
    });
  }

  function run() {
    var store = recordView();
    var trending = mergeTrending(store);
    var recent = Object.keys(store)
      .map(function (path) { return store[path]; })
      .filter(function (item) { return item && item.path !== location.pathname; })
      .sort(function (a, b) { return (b.lastViewed || 0) - (a.lastViewed || 0); });

    renderList('[data-trending-articles]', trending, 'Trending articles will appear after readers browse the site.');
    renderList('[data-recently-viewed]', recent, 'Recently viewed articles will appear after you browse a few pages.');
    renderCurrentViewCount(store);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
