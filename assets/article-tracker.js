(function () {
  'use strict';

  var STORAGE_KEY = 'tornadoHub.pageViews.v2';
  var MAX_ITEMS = 80;
  var COUNTER_ENDPOINT = window.TORNADO_VIEW_COUNTER_ENDPOINT ||
    (window.TORNADO_ANALYTICS && window.TORNADO_ANALYTICS.viewCounterEndpoint) ||
    '';
  var POPULAR_STARTING_POINTS = [
    {
      path: '/tornado-warning-polygon-explained/',
      title: 'Tornado warning polygon explained',
      description: 'How to read warning maps and decide when to shelter.',
      category: 'Warning Guide'
    },
    {
      path: '/rain-wrapped-tornado/',
      title: 'Rain-wrapped tornadoes',
      description: 'Why some tornadoes hide in heavy rain and how to stay safer.',
      category: 'Safety'
    },
    {
      path: '/tornado-shelter-without-basement/',
      title: 'Shelter without a basement',
      description: 'Interior rooms, apartments, mobile homes, and last-minute options.',
      category: 'Preparedness'
    },
    {
      path: '/tornado-car-safety-myths/',
      title: 'Tornado car safety myths',
      description: 'Overpasses, ditches, driving away, and what actually lowers risk.',
      category: 'Myth Check'
    },
    {
      path: '/joplin-2011/',
      title: 'Joplin 2011',
      description: 'The warning, the impact, and what changed afterward.',
      category: 'Case File'
    },
    {
      path: '/tornado-debris-signature/',
      title: 'Tornado debris signature',
      description: 'The radar clue that can confirm lofted debris.',
      category: 'Radar'
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

  function getCurrentItem() {
    return {
      path: location.pathname,
      title: cleanTitle(document.title),
      description: getDescription(),
      category: getCategory()
    };
  }

  function recordLocalView() {
    var path = location.pathname;
    if (!isTrackablePath(path)) return readStore();

    var store = readStore();
    var item = store[path] || { path: path, localViews: 0 };
    item.title = cleanTitle(document.title);
    item.description = getDescription();
    item.category = getCategory();
    item.localViews = (item.localViews || item.views || 0) + 1;
    delete item.views;
    item.lastViewed = Date.now();
    store[path] = item;
    writeStore(store);
    return store;
  }

  function fetchRealCounts(currentItem) {
    if (!COUNTER_ENDPOINT || !isTrackablePath(currentItem.path)) {
      return Promise.resolve(null);
    }

    return fetch(COUNTER_ENDPOINT, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: currentItem.path,
        title: currentItem.title,
        description: currentItem.description,
        category: currentItem.category,
        referrer: document.referrer ? new URL(document.referrer, location.href).pathname : ''
      })
    })
      .then(function (response) {
        if (!response.ok) throw new Error('view counter failed');
        return response.json();
      })
      .catch(function () {
        return null;
      });
  }

  function recentItems(store) {
    return Object.keys(store)
      .map(function (path) { return store[path]; })
      .filter(function (item) { return item && item.path !== location.pathname; })
      .sort(function (a, b) { return (b.lastViewed || 0) - (a.lastViewed || 0); });
  }

  function formatCount(item) {
    if (typeof item.views === 'number') {
      return item.views === 1 ? '1 view' : item.views + ' views';
    }
    if (typeof item.localViews === 'number') {
      return item.localViews === 1 ? '1 local view' : item.localViews + ' local views';
    }
    return '';
  }

  function renderList(selector, items, emptyText) {
    document.querySelectorAll(selector).forEach(function (container) {
      var limit = Number(container.getAttribute('data-limit') || 5);
      var selected = items.slice(0, limit);
      if (!selected.length) {
        container.innerHTML = '<p class="tracker-empty">' + escapeHtml(emptyText) + '</p>';
        return;
      }
      container.innerHTML = selected.map(function (item, index) {
        var count = formatCount(item);
        var kicker = escapeHtml(item.category || 'Article') + (count ? ' - ' + escapeHtml(count) : '');
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

  function updateTrendingLabels(text) {
    document.querySelectorAll('[data-trending-label]').forEach(function (node) {
      node.textContent = text;
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

  function renderCurrentViewCount(store, realCount) {
    var item = store[location.pathname];
    document.querySelectorAll('[data-view-count]').forEach(function (node) {
      if (typeof realCount === 'number') {
        node.textContent = realCount === 1 ? '1 view' : realCount + ' views';
        return;
      }
      var count = item ? item.localViews || 0 : 0;
      node.textContent = count === 1 ? '1 local view' : count + ' local views';
    });
  }

  function renderWithRemoteCounts(store, payload) {
    if (payload && Array.isArray(payload.popular) && payload.popular.length) {
      updateTrendingLabels('Live views');
      renderList('[data-trending-articles]', payload.popular, 'Live trending articles will appear after readers browse the site.');
      renderCurrentViewCount(store, typeof payload.views === 'number' ? payload.views : null);
      return;
    }

    updateTrendingLabels(COUNTER_ENDPOINT ? 'Awaiting live data' : 'No fake counts');
    renderList('[data-trending-articles]', POPULAR_STARTING_POINTS, 'Popular guides will appear here.');
    renderCurrentViewCount(store, null);
  }

  function run() {
    var store = recordLocalView();
    var currentItem = getCurrentItem();

    renderWithRemoteCounts(store, null);
    renderList('[data-recently-viewed]', recentItems(store), 'Recently viewed articles will appear after you browse a few pages.');

    fetchRealCounts(currentItem).then(function (payload) {
      if (payload) renderWithRemoteCounts(store, payload);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
