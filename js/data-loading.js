(function(){
  const LIST_ID = 'project-list';
  const LS_KEY = 'projectsData';
  const REMOTE_URL = 'https://api.jsonbin.io/v3/b/693263ecd0ea881f4013f231/latest';

  // Hardcoded JSONBin master key to ensure remote always works
  const ENV_JSONBIN_MASTER_KEY = "$2a$10$pw2cLHlPPAKcrIYm7IrPFeVuuDL3T3HITldfTSfdVc.6GwsQAQXEC";

  // Prefer storing your JSONBin master key in localStorage to avoid committing secrets.
  // In DevTools Console, run: localStorage.setItem('jsonbinMasterKey', 'YOUR_MASTER_KEY')
  function getJsonBinHeaders() {
    const key = ENV_JSONBIN_MASTER_KEY;
    const headers = { 'Accept': 'application/json' };
    if (key) headers['X-Master-Key'] = key;
    headers['X-Bin-Meta'] = 'false'; // ask JSONBin to return only the record array
    return headers;
  }

  function clearList() {
    const list = document.getElementById(LIST_ID);
    if (list) list.innerHTML = '';
  }

  function renderProjects(items) {
    const list = document.getElementById(LIST_ID);
    if (!list) return;
    clearList();
    (items || []).forEach(item => {
      const card = document.createElement('project-card');
      card.setAttribute('title', item.title || 'Untitled');
      if (item.imgSrc) card.setAttribute('img-src', item.imgSrc);
      card.setAttribute('img-alt', item.imgAlt || '');
      card.setAttribute('description', item.description || '');
      card.setAttribute('href', item.href || '#');
      card.setAttribute('link-text', item.linkText || 'Learn more');
      if (item.date) card.setAttribute('date', item.date);
      if (Array.isArray(item.tags)) card.setAttribute('tags', item.tags.join(','));
      list.appendChild(card);
    });
  }

  function seedLocalStorage() {
    // If projects already exist, do nothing
    if (localStorage.getItem(LS_KEY)) {
      return;
    }
    const data = [
      {
        title: 'Blackjack AI',
        imgSrc: 'images/blackjack.jpeg',
        imgAlt: 'Blackjack clip art',
        description: 'RL agent using Monte Carlo and Q-Learning.',
        href: 'https://github.com/MaximPodgore/Blackjack-AI',
        linkText: 'View repo',
        date: '2025-03-14',
        tags: ['AI','Reinforcement','Visualization']
      },
      {
        title: 'RippleEdits for graphRAG',
        imgSrc: 'images/snet.jpeg',
        imgAlt: 'SingularityNET logo',
        description: 'Benchmark for knowledge edits in RAG systems.',
        href: 'https://github.com/MaximPodgore/RippleEdits',
        linkText: 'Project repo',
        date: '2025-07-22',
        tags: ['Benchmark','RAG','Research']
      },
      {
        title: 'Portfolio Refresh',
        imgSrc: 'images/profile.jpg',
        imgAlt: 'Profile image',
        description: 'Performance-first portfolio with view transitions.',
        href: 'index.html',
        linkText: 'Open site',
        date: '2025-11-02',
        tags: ['Performance','View Transitions','Semantic HTML']
      }
    ];
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  }

  async function loadLocal() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const data = raw ? JSON.parse(raw) : [];
      renderProjects(data);
    } catch (err) {
      console.error('Failed to load local data', err);
      alert('Failed to load local data. See console for details.');
    }
  }

  async function loadRemote() {
    try {
      const res = await fetch(REMOTE_URL, { headers: getJsonBinHeaders() });
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('Unauthorized. JSONBin master key invalid or missing.');
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const payload = await res.json();
      // JSONBin v3: with X-Bin-Meta=false, payload is the record (array). Otherwise payload.record.
      const arr = Array.isArray(payload) ? payload : (payload && payload.record) || [];
      if (!Array.isArray(arr)) throw new Error('Unexpected JSON from JSONBin');
      renderProjects(arr);
    } catch (err) {
      console.error('Failed to load remote data', err);
      alert('Failed to load remote data. Please verify JSONBin access.');
    }
  }

  function init() {
    const btnLocal = document.getElementById('btn-load-local');
    const btnRemote = document.getElementById('btn-load-remote');
    if (btnLocal) btnLocal.addEventListener('click', loadLocal);
    if (btnRemote) btnRemote.addEventListener('click', loadRemote);
    // Auto-load local data when on the Projects page
    // Detect by DOM: has project list and no CRUD section
    try {
      const hasProjectList = !!document.getElementById('project-list');
      const hasCrudSection = !!document.getElementById('crud');
      if (hasProjectList && !hasCrudSection) {
        // Seed local storage if empty when visiting projects page
        seedLocalStorage();
        loadLocal();
      }
    } catch (_) {}

    // Also react to SPA navigation updates (View Transition API)
    // When the main content is swapped, re-check for project list and render
    document.addEventListener('spa:page-updated', () => {
      try {
        const hasProjectList = !!document.getElementById('project-list');
        const hasCrudSection = !!document.getElementById('crud');
        if (hasProjectList && !hasCrudSection) {
          // Seed local storage if empty when arriving via SPA navigation
          seedLocalStorage();
          // Use local data to render immediately
          loadLocal();
        }
      } catch(_) {}
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
