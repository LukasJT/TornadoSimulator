// Tornadle — daily tornado-themed Wordle
// One puzzle per UTC day, deterministic selection, variable word length.

(function () {
  'use strict';

  // ─── WORD BANK ────────────────────────────────────────────────────────────
  // Each entry: [answer, category, articleSlug]
  // Answers must be 3–12 letters, A–Z only. Category hint shown above board.
  const WORDS = [
    // Famous towns / locations
    ['ELIE', 'Canadian F5 town (2007)', '/elie-2007/'],
    ['MOORE', 'Oklahoma tornado alley town', '/moore-tornadoes/'],
    ['JARRELL', 'Texas F5 (1997)', '/jarrell-1997/'],
    ['JOPLIN', 'Missouri EF5 (2011)', '/joplin-2011/'],
    ['GREENSBURG', 'Kansas EF5 (2007)', '/greensburg-2007/'],
    ['TUSCALOOSA', 'Alabama EF4 (2011)', '/tuscaloosa-2011/'],
    ['ANDOVER', 'Kansas F5 (1991) and EF3 (2022)', '/andover-1991/'],
    ['XENIA', 'Ohio F5 (1974 Super Outbreak)', '/xenia-1974/'],
    ['UDALL', 'Kansas F5 (1955)', '/udall-1955/'],
    ['WACO', 'Texas F5 (1953)', '/waco-1953/'],
    ['FLINT', 'Michigan F5 (1953)', '/flint-1953/'],
    ['WORCESTER', 'Massachusetts F4 (1953)', '/worcester-1953/'],
    ['PLAINFIELD', 'Illinois F5 (1990)', '/plainfield-1990/'],
    ['LUBBOCK', 'Texas F5 (1970)', '/lubbock-1970/'],
    ['ROCKSPRINGS', 'Texas F5 (1927)', '/'],
    ['GAINESVILLE', 'Georgia F4 (1936)', '/'],
    ['TUPELO', 'Mississippi F5 (1936)', '/tupelo-1936/'],
    ['BRIDGECREEK', 'Oklahoma F5 (1999)', '/moore-1999/'],
    ['HESSTON', 'Kansas F5 (1990)', '/hesston-1990/'],
    ['BARNEVELD', 'Wisconsin F5 (1984)', '/'],
    ['NILES', 'Ohio F5 (1985)', '/'],
    ['SMITHVILLE', 'Mississippi EF5 (2011)', '/smithville-2011/'],
    ['PHILADELPHIA', 'Mississippi EF5 (2011)', '/'],
    ['HACKLEBURG', 'Alabama EF5 (2011)', '/hackleburg-2011/'],
    ['MAYFIELD', 'Kentucky EF4 (2021)', '/mayfield-2021/'],
    ['PARKERSBURG', 'Iowa EF5 (2008)', '/parkersburg-2008/'],
    ['SPENCER', 'South Dakota F4 (1998)', '/'],

    // Chaser & weather terms
    ['WEDGE', 'Wide low-hanging tornado shape', '/tornado-shapes/'],
    ['ROPE', 'Late-stage thin tornado shape', '/tornado-shapes/'],
    ['CONE', 'Classic funnel shape', '/tornado-shapes/'],
    ['FUNNEL', 'Rotating cloud reaching down', '/'],
    ['MULTI', 'Multi-vortex tornado', '/multi-vortex-tornado/'],
    ['VORTEX', 'Rotating column of air', '/'],
    ['SATELLITE', 'Small tornado orbiting a larger one', '/'],
    ['MESOCYCLONE', 'Rotating updraft of a supercell', '/what-is-a-mesocyclone/'],
    ['SUPERCELL', 'Storm type that produces tornadoes', '/what-is-a-supercell/'],
    ['DOWNBURST', 'Straight-line wind event', '/'],
    ['MICROBURST', 'Small localized downburst', '/'],
    ['DERECHO', 'Widespread damaging wind event', '/derecho-vs-tornado/'],
    ['HOOK', 'Radar echo signature of rotation', '/hook-echo/'],
    ['ECHO', 'Radar return', '/hook-echo/'],
    ['DEBRIS', 'Radar debris ball signature', '/tornado-debris-signature/'],
    ['ANVIL', 'Top of a mature thunderstorm', '/'],
    ['UPDRAFT', 'Rising air column in a storm', '/'],
    ['SHEAR', 'Wind speed / direction change with height', '/wind-shear/'],
    ['CAPE', 'Convective available potential energy', '/'],
    ['SIREN', 'Outdoor warning device', '/tornado-sirens/'],
    ['SHELTER', 'Underground safe room', '/best-storm-shelters-2026/'],
    ['RADAR', 'Doppler storm-detection tool', '/'],
    ['CHASER', 'Person who follows storms', '/tornado-chasers/'],
    ['WATCH', 'Storm conditions are possible', '/watch-vs-warning/'],
    ['WARNING', 'Storm imminent — take cover', '/watch-vs-warning/'],
    ['GUSTNADO', 'Non-tornadic swirl on gust front', '/'],
    ['LANDSPOUT', 'Weak tornado from non-supercell', '/landspout/'],
    ['WATERSPOUT', 'Tornado over water', '/waterspouts/'],
    ['FIREWHIRL', 'Tornado made of flame', '/fire-tornado/'],
    ['DUSTDEVIL', 'Small dry-air whirlwind', '/dust-devil-vs-tornado/'],
    ['FUJITA', 'Old damage-rating scale', '/fujita-scale/'],
    ['STOVEPIPE', 'Tall narrow tornado shape', '/tornado-shapes/'],

    // Outbreaks
    ['DIXIE', 'Southeast US tornado zone', '/dixie-alley/'],
    ['ALLEY', 'Central US tornado zone', '/tornado-alley/'],
    ['PALMSUNDAY', '1965 Midwest outbreak', '/1965-palm-sunday/'],
    ['SUPEROUTBREAK', '1974 or 2011 outbreak', '/1974-super-outbreak/'],
    ['ELRENO', 'Widest tornado ever (2013)', '/el-reno-2013/'],
    ['TRISTATE', '1925 record-holder outbreak', '/1925-tri-state-tornado/'],
  ];

  // Only allow letters A-Z (no spaces / hyphens in the puzzle grid)
  const CLEAN = WORDS.filter(w => /^[A-Z]{3,12}$/.test(w[0]));

  // ─── DAILY SELECTION ──────────────────────────────────────────────────────
  // Epoch: 2026-01-01 in US Eastern time = Puzzle #1
  // Puzzle resets at midnight Eastern (EST 05:00 UTC / EDT 04:00 UTC — auto-handled)
  const EPOCH = Date.UTC(2026, 0, 1);
  const DAY_MS = 86400000;

  function todayEastern() {
    // Get the current calendar date in America/New_York (handles EDT/EST automatically)
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(new Date());
    let y=0, m=0, d=0;
    parts.forEach(p => {
      if (p.type === 'year') y = parseInt(p.value);
      else if (p.type === 'month') m = parseInt(p.value);
      else if (p.type === 'day') d = parseInt(p.value);
    });
    return Date.UTC(y, m - 1, d);
  }
  function puzzleNumber() {
    return Math.floor((todayEastern() - EPOCH) / DAY_MS) + 1;
  }
  function dailyIndex(n) {
    // Deterministic scramble so consecutive days aren't neighbors in the list
    let h = n * 2654435761 >>> 0;
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
    return h % CLEAN.length;
  }

  const puzzleNo = puzzleNumber();
  const [ANSWER, CATEGORY, ARTICLE] = CLEAN[dailyIndex(puzzleNo)];
  const N = ANSWER.length;
  const MAX_GUESSES = 6;

  // ─── STORAGE ──────────────────────────────────────────────────────────────
  const STATE_KEY = 'tornadle_state_v1';
  const STATS_KEY = 'tornadle_stats_v1';

  function loadState() {
    try {
      const s = JSON.parse(localStorage.getItem(STATE_KEY) || 'null');
      if (s && s.puzzleNo === puzzleNo) return s;
    } catch (e) {}
    return { puzzleNo, guesses: [], statuses: [], done: false, won: false };
  }
  function saveState(s) {
    try { localStorage.setItem(STATE_KEY, JSON.stringify(s)); } catch (e) {}
  }
  function loadStats() {
    try {
      const s = JSON.parse(localStorage.getItem(STATS_KEY) || 'null');
      if (s) return s;
    } catch (e) {}
    return { played: 0, won: 0, streak: 0, best: 0, dist: [0, 0, 0, 0, 0, 0], lastPlayed: 0 };
  }
  function saveStats(s) {
    try { localStorage.setItem(STATS_KEY, JSON.stringify(s)); } catch (e) {}
  }

  let state = loadState();
  let stats = loadStats();
  let currentGuess = '';
  let animating = false;

  // ─── DOM ──────────────────────────────────────────────────────────────────
  const boardEl = document.getElementById('board');
  const catHint = document.getElementById('cat-hint');
  const kbEl = document.getElementById('keyboard');
  const puzzleNumEl = document.getElementById('puzzle-number');
  const puzzleDateEl = document.getElementById('puzzle-date');
  const toastEl = document.getElementById('toast');
  const modalHelp = document.getElementById('modal-help');
  const modalStats = document.getElementById('modal-stats');

  puzzleNumEl.textContent = 'Puzzle #' + puzzleNo;
  puzzleDateEl.textContent = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  catHint.innerHTML = '<strong>Hint:</strong> ' + CATEGORY;
  catHint.style.display = 'block';

  document.documentElement.style.setProperty('--cols', N);

  // Build board
  boardEl.style.gridTemplateRows = `repeat(${MAX_GUESSES}, auto)`;
  for (let r = 0; r < MAX_GUESSES; r++) {
    const row = document.createElement('div');
    row.className = 'board-row';
    row.dataset.row = r;
    row.style.gridTemplateColumns = `repeat(${N}, 1fr)`;
    for (let c = 0; c < N; c++) {
      const t = document.createElement('div');
      t.className = 'tile';
      t.dataset.row = r; t.dataset.col = c;
      row.appendChild(t);
    }
    boardEl.appendChild(row);
  }

  // Build keyboard
  const KB_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
  KB_ROWS.forEach((r, i) => {
    const row = document.createElement('div');
    row.className = 'kbd-row';
    if (i === 2) {
      const k = document.createElement('button');
      k.className = 'key wide'; k.textContent = 'ENTER';
      k.dataset.key = 'ENTER'; row.appendChild(k);
    }
    for (const ch of r) {
      const k = document.createElement('button');
      k.className = 'key'; k.textContent = ch;
      k.dataset.key = ch; row.appendChild(k);
    }
    if (i === 2) {
      const k = document.createElement('button');
      k.className = 'key wide'; k.textContent = '⌫';
      k.dataset.key = 'BACK'; row.appendChild(k);
    }
    kbEl.appendChild(row);
  });

  // ─── RENDERING ────────────────────────────────────────────────────────────
  function renderState() {
    // Fill in past guesses with colors
    for (let r = 0; r < state.guesses.length; r++) {
      const guess = state.guesses[r];
      const st = state.statuses[r];
      for (let c = 0; c < N; c++) {
        const tile = boardEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
        tile.textContent = guess[c];
        tile.className = 'tile ' + st[c];
      }
    }
    // Update keyboard colors
    updateKeyboardColors();
  }

  function updateKeyboardColors() {
    const best = {};
    const rank = { correct: 3, present: 2, absent: 1 };
    for (let r = 0; r < state.guesses.length; r++) {
      const g = state.guesses[r], s = state.statuses[r];
      for (let c = 0; c < N; c++) {
        const letter = g[c], st = s[c];
        if (!best[letter] || rank[st] > rank[best[letter]]) best[letter] = st;
      }
    }
    kbEl.querySelectorAll('.key').forEach(k => {
      const l = k.dataset.key;
      if (l && best[l]) {
        k.classList.remove('correct', 'present', 'absent');
        k.classList.add(best[l]);
      }
    });
  }

  function paintCurrentGuess() {
    const r = state.guesses.length;
    for (let c = 0; c < N; c++) {
      const tile = boardEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
      if (!tile) continue;
      const ch = currentGuess[c] || '';
      tile.textContent = ch;
      tile.className = 'tile' + (ch ? ' filled' : '');
    }
  }

  // ─── EVALUATION ───────────────────────────────────────────────────────────
  function evaluate(guess) {
    const result = Array(N).fill('absent');
    const remaining = {};
    for (let i = 0; i < N; i++) {
      if (guess[i] === ANSWER[i]) result[i] = 'correct';
      else remaining[ANSWER[i]] = (remaining[ANSWER[i]] || 0) + 1;
    }
    for (let i = 0; i < N; i++) {
      if (result[i] === 'correct') continue;
      if (remaining[guess[i]]) {
        result[i] = 'present';
        remaining[guess[i]]--;
      }
    }
    return result;
  }

  // ─── INPUT ────────────────────────────────────────────────────────────────
  function toast(msg, ms = 1500) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toastEl.classList.remove('show'), ms);
  }

  function pressKey(k) {
    if (state.done || animating) return;
    if (k === 'ENTER') return submit();
    if (k === 'BACK') {
      currentGuess = currentGuess.slice(0, -1);
      paintCurrentGuess();
      return;
    }
    if (/^[A-Z]$/.test(k) && currentGuess.length < N) {
      currentGuess += k;
      paintCurrentGuess();
    }
  }

  function submit() {
    if (currentGuess.length !== N) {
      shakeCurrentRow();
      toast('Not enough letters');
      return;
    }
    const st = evaluate(currentGuess);
    const r = state.guesses.length;
    animating = true;
    // Flip animation per tile
    for (let c = 0; c < N; c++) {
      const tile = boardEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
      setTimeout(() => {
        tile.classList.add('flip');
        setTimeout(() => {
          tile.className = 'tile ' + st[c];
          tile.textContent = currentGuess[c];
        }, 250);
      }, c * 250);
    }
    setTimeout(() => {
      state.guesses.push(currentGuess);
      state.statuses.push(st);
      currentGuess = '';
      const won = st.every(x => x === 'correct');
      if (won) {
        state.done = true; state.won = true;
        saveState(state); recordStats(true, state.guesses.length);
        setTimeout(() => { updateKeyboardColors(); openStatsModal(); }, 400);
      } else if (state.guesses.length >= MAX_GUESSES) {
        state.done = true; state.won = false;
        saveState(state); recordStats(false, 0);
        setTimeout(() => { updateKeyboardColors(); openStatsModal(); }, 400);
      } else {
        saveState(state);
        updateKeyboardColors();
      }
      animating = false;
    }, N * 250 + 300);
  }

  function shakeCurrentRow() {
    const row = boardEl.querySelector(`[data-row="${state.guesses.length}"]`);
    if (!row) return;
    row.classList.add('shake');
    setTimeout(() => row.classList.remove('shake'), 500);
  }

  // ─── STATS ────────────────────────────────────────────────────────────────
  function recordStats(won, guessCount) {
    // Prevent double-count on refresh (we key by puzzleNo)
    if (stats.lastPlayed === puzzleNo) return;
    stats.played++;
    if (won) {
      stats.won++;
      stats.streak = stats.lastPlayed === puzzleNo - 1 || stats.played === 1 ? stats.streak + 1 : 1;
      if (stats.streak > stats.best) stats.best = stats.streak;
      stats.dist[guessCount - 1]++;
    } else {
      stats.streak = 0;
    }
    stats.lastPlayed = puzzleNo;
    saveStats(stats);
  }

  function openStatsModal() {
    const titleEl = document.getElementById('stats-title');
    const revealEl = document.getElementById('reveal-container');
    if (state.done) {
      titleEl.textContent = state.won ? 'Nice work!' : 'Better luck tomorrow';
      const link = ARTICLE && ARTICLE !== '/'
        ? ` <a href="${ARTICLE}" style="font-size:13px;">Learn about it →</a>`
        : '';
      revealEl.innerHTML = `<div class="reveal-note">Today's word was <strong>${ANSWER}</strong>${link}<br><span style="font-size:12px;color:var(--text-muted)">${CATEGORY}</span></div>`;
    } else {
      titleEl.textContent = 'Statistics';
      revealEl.innerHTML = '';
    }
    document.getElementById('s-played').textContent = stats.played;
    document.getElementById('s-winpct').textContent = stats.played ? Math.round(stats.won / stats.played * 100) : 0;
    document.getElementById('s-streak').textContent = stats.streak;
    document.getElementById('s-best').textContent = stats.best;
    const distEl = document.getElementById('dist');
    const max = Math.max(1, ...stats.dist);
    distEl.innerHTML = stats.dist.map((n, i) => {
      const pct = Math.max(8, Math.round(n / max * 100));
      const isWinRow = state.done && state.won && state.guesses.length === i + 1;
      return `<div class="dist-row"><div class="lab">${i + 1}</div><div class="bar ${isWinRow ? 'win' : ''}" style="width:${pct}%">${n}</div></div>`;
    }).join('');
    showModal('modal-stats');
  }

  // ─── SHARE ────────────────────────────────────────────────────────────────
  function shareText() {
    const glyph = { correct: '🟩', present: '🟨', absent: '⬛' };
    const rows = state.statuses.map(s => s.map(x => glyph[x]).join('')).join('\n');
    const score = state.won ? `${state.guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
    return `Tornadle #${puzzleNo} ${score} (${N} letters)\n\n${rows}\n\ntornadosimulator.net/tornadle`;
  }

  document.getElementById('btn-share').addEventListener('click', () => {
    if (!state.done) { toast('Finish the puzzle first'); return; }
    const text = shareText();
    if (navigator.share) {
      navigator.share({ text }).catch(() => copyText(text));
    } else {
      copyText(text);
    }
  });

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => toast('Copied to clipboard!')).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }
  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('Copied to clipboard!'); }
    catch (e) { toast('Copy failed — long-press to copy'); }
    document.body.removeChild(ta);
  }

  // ─── MODALS ───────────────────────────────────────────────────────────────
  function showModal(id) {
    document.getElementById(id).classList.add('show');
  }
  function closeModal(id) {
    document.getElementById(id).classList.remove('show');
  }
  document.getElementById('btn-help').addEventListener('click', () => showModal('modal-help'));
  document.getElementById('btn-stats').addEventListener('click', openStatsModal);
  document.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', () => closeModal(el.dataset.close));
  });
  document.querySelectorAll('.modal-backdrop').forEach(bd => {
    bd.addEventListener('click', e => { if (e.target === bd) bd.classList.remove('show'); });
  });

  // ─── KEYBOARD BINDING ─────────────────────────────────────────────────────
  kbEl.addEventListener('click', e => {
    const btn = e.target.closest('.key');
    if (btn) pressKey(btn.dataset.key);
  });
  document.addEventListener('keydown', e => {
    if (document.querySelector('.modal-backdrop.show')) return;
    if (e.key === 'Enter') pressKey('ENTER');
    else if (e.key === 'Backspace') pressKey('BACK');
    else if (/^[a-zA-Z]$/.test(e.key)) pressKey(e.key.toUpperCase());
  });

  // ─── INITIAL RENDER ───────────────────────────────────────────────────────
  renderState();
  // If page loaded first time today, show how-to-play
  if (state.guesses.length === 0 && stats.played === 0) {
    setTimeout(() => showModal('modal-help'), 400);
  }
  // If puzzle already complete, show stats
  if (state.done) {
    setTimeout(openStatsModal, 300);
  }
})();
