(function(){
  const LS_KEY = 'projectsData';
  const REMOTE_READ_URL = 'https://api.jsonbin.io/v3/b/693263ecd0ea881f4013f231/latest';
  const REMOTE_WRITE_URL = 'https://api.jsonbin.io/v3/b/693263ecd0ea881f4013f231';

  let ENV_JSONBIN_MASTER_KEY = null;

  async function loadEnv() {
    try {
      const res = await fetch('env.json', { cache: 'no-store' });
      if (!res.ok) return;
      const env = await res.json();
      if (env && typeof env.JSONBIN_MASTER_KEY === 'string' && env.JSONBIN_MASTER_KEY.trim().length) {
        ENV_JSONBIN_MASTER_KEY = env.JSONBIN_MASTER_KEY.trim();
      }
    } catch(_) {}
  }

  function getJsonBinHeaders(includeContent=false) {
    const key = ENV_JSONBIN_MASTER_KEY || localStorage.getItem('jsonbinMasterKey');
    const headers = { 'Accept': 'application/json' };
    if (key) headers['X-Master-Key'] = key;
    if (includeContent) headers['Content-Type'] = 'application/json';
    return headers;
  }

  function getStore() {
    const el = document.querySelector('input[name="store"]:checked');
    return el ? el.value : 'local';
  }

  function parseTags(str) {
    if (!str) return [];
    return str.split(',').map(s => s.trim()).filter(Boolean);
  }

  function collectItem(form) {
    const fd = new FormData(form);
    return {
      title: (fd.get('title') || '').toString().trim(),
      imgSrc: (fd.get('imgSrc') || '').toString().trim(),
      imgAlt: (fd.get('imgAlt') || '').toString().trim(),
      description: (fd.get('description') || '').toString().trim(),
      href: (fd.get('href') || '').toString().trim(),
      linkText: (fd.get('linkText') || '').toString().trim() || 'Learn more',
      date: (fd.get('date') || '').toString().trim(),
      tags: parseTags((fd.get('tags') || '').toString())
    };
  }

  function getIndex(form) {
    const fd = new FormData(form);
    const raw = fd.get('index');
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 0) throw new Error('Index must be a non-negative integer.');
    return n;
  }

  function readLocal() {
    const raw = localStorage.getItem(LS_KEY);
    try { return raw ? JSON.parse(raw) : []; } catch { return []; }
  }

  function writeLocal(arr) {
    localStorage.setItem(LS_KEY, JSON.stringify(arr));
  }

  async function readRemote() {
    const res = await fetch(REMOTE_READ_URL, { headers: getJsonBinHeaders() });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) throw new Error('Unauthorized. Set JSONBin master key.');
      throw new Error(`HTTP ${res.status}`);
    }
    const payload = await res.json();
    const arr = Array.isArray(payload) ? payload : (payload && payload.record) || [];
    if (!Array.isArray(arr)) throw new Error('Unexpected JSON from JSONBin');
    return arr;
  }

  async function writeRemote(arr) {
    const res = await fetch(REMOTE_WRITE_URL, {
      method: 'PUT',
      headers: getJsonBinHeaders(true),
      body: JSON.stringify(arr)
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) throw new Error('Unauthorized. Set JSONBin master key.');
      throw new Error(`HTTP ${res.status}`);
    }
    return true;
  }

  async function readData() {
    return getStore() === 'local' ? readLocal() : await readRemote();
  }
  async function writeData(arr) {
    return getStore() === 'local' ? writeLocal(arr) : await writeRemote(arr);
  }

  function setStatus(el, msg, ok=true) {
    if (!el) return;
    el.textContent = msg;
    el.className = ok ? 'success' : 'error';
  }

  function validateItem(item) {
    if (!item.title || !item.imgSrc || !item.href || !item.description) {
      throw new Error('Title, Image URL, Link URL, and Description are required.');
    }
  }

  function attachCreate() {
    const form = document.getElementById('form-create');
    const out = document.getElementById('out-create');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      setStatus(out, '');
      try {
        const item = collectItem(form);
        validateItem(item);
        const arr = await readData();
        arr.push(item);
        await writeData(arr);
        form.reset();
        setStatus(out, 'Item created successfully. Reload projects to view.', true);
      } catch (err) {
        setStatus(out, err.message || 'Create failed.', false);
      }
    });
  }

  function attachUpdate() {
    const form = document.getElementById('form-update');
    const out = document.getElementById('out-update');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      setStatus(out, '');
      try {
        const index = getIndex(form);
        const item = collectItem(form);
        validateItem(item);
        const arr = await readData();
        if (index < 0 || index >= arr.length) throw new Error(`Index out of range. Current length: ${arr.length}.`);
        arr[index] = item;
        await writeData(arr);
        setStatus(out, `Item at index ${index} updated. Reload projects to view.`, true);
      } catch (err) {
        setStatus(out, err.message || 'Update failed.', false);
      }
    });
  }

  function attachDelete() {
    const form = document.getElementById('form-delete');
    const out = document.getElementById('out-delete');
    if (!form) return;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      setStatus(out, '');
      try {
        const index = getIndex(form);
        const arr = await readData();
        if (index < 0 || index >= arr.length) throw new Error(`Index out of range. Current length: ${arr.length}.`);
        arr.splice(index, 1);
        await writeData(arr);
        form.reset();
        setStatus(out, `Item at index ${index} deleted. Reload projects to view.`, true);
      } catch (err) {
        setStatus(out, err.message || 'Delete failed.', false);
      }
    });
  }

  async function init() {
    loadEnv();
    attachCreate();
    attachUpdate();
    attachDelete();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
