/* Dispensa Radioamatori Super – versione fuori da claude.ai: i dati restano in questo browser (localStorage) */
(function(){
  if (window.claude && window.claude.use) return;
  const KEY = 'dispensa-super-offline-v1';
  let store = {};
  try { store = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch(e){ store = {}; }
  const subs = [];
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch(e){} subs.forEach(f => f()); };
  const coll = name => (store[name] = store[name] || {});
  const snapDocs = (name, ord, lim) => { let docs = Object.entries(coll(name)).map(([id, d]) => ({id, data: () => JSON.parse(JSON.stringify(d))}));
    if (ord) docs.sort((a, b) => { const x = a.data()[ord[0]], y = b.data()[ord[0]]; return (x < y ? -1 : x > y ? 1 : 0) * (ord[1] === 'desc' ? -1 : 1); });
    if (lim) docs = docs.slice(0, lim); return {docs, size: docs.length, empty: !docs.length}; };
  const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  function docRef(path){ const i = path.lastIndexOf('/'); const c = path.slice(0, i), id = path.slice(i + 1);
    const snap = () => { const d = coll(c)[id]; return {id, exists: !!d, data: () => d ? JSON.parse(JSON.stringify(d)) : undefined}; };
    return { id,
      async get(){ return snap(); },
      async set(v){ coll(c)[id] = JSON.parse(JSON.stringify(v)); save(); },
      async update(v){ coll(c)[id] = Object.assign({}, coll(c)[id] || {}, JSON.parse(JSON.stringify(v))); save(); },
      async delete(){ delete coll(c)[id]; save(); },
      onSnapshot(cb){ const f = () => cb(snap()); subs.push(f); setTimeout(f, 0); return () => { const k = subs.indexOf(f); if (k >= 0) subs.splice(k, 1); }; } }; }
  function collRef(name, ord, lim){ return {
      doc: id => docRef(name + '/' + (id || newId())),
      async add(v){ const id = newId(); coll(name)[id] = JSON.parse(JSON.stringify(v)); save(); return {id}; },
      orderBy: (f, dir) => collRef(name, [f, dir || 'asc'], lim),
      limit: n => collRef(name, ord, n),
      where: () => collRef(name, ord, lim),
      async get(){ return snapDocs(name, ord, lim); },
      onSnapshot(cb){ const f = () => cb(snapDocs(name, ord, lim)); subs.push(f); setTimeout(f, 0); return () => { const k = subs.indexOf(f); if (k >= 0) subs.splice(k, 1); }; } }; }
  const db = { collection: n => collRef(n), doc: p => docRef(p) };
  const user = { async canEdit(){ return true; }, async can(){ return true; }, isOwner(){ return true; }, async id(){ return 'locale'; } };
  const downloads = { async save({filename, data}){ const blob = data instanceof Blob ? data : new Blob([data]); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); return {status:'saved'}; } };
  window.claude = { use: async name => ({db, user, downloads}[name] || null) };
  window.__quadernoBackup = () => JSON.stringify(store, null, 1);
})();
