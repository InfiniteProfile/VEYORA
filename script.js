/* VEYORA — one profile, infinite states.
   No framework. Logical space is every integer (BigInt), both directions.
   The DOM only ever holds what is near the viewport; everything else is
   reconstructed deterministically from its position. */
(() => {
'use strict';

const TITLE = 'VEYORA — One profile. Infinite states.';
const $ = (s, r = document) => r.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtBig = n => n.toLocaleString('en-US').replace('-', '−');

/* ───────────── deterministic core ───────────── */
function h53(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) { const c = str.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
function R(seed) {               // seeded stream: same seed → same numbers, forever
  let a = h53(seed) >>> 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const pick = (r, a) => a[Math.floor(r() * a.length)];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
function fromB36(s) { let n = 0n; for (const ch of s) n = n * 36n + BigInt(parseInt(ch, 36)); return n; }

/* vocabulary */
const ONS = ['k', 'v', 'l', 'm', 'n', 'r', 's', 't', 'z', 'th', 'sh', 'd', 'b', 'f', 'h', 'j', 'q', 'x', 'y', 'c', 'g', 'p', 'w'];
const VOW = ['a', 'e', 'i', 'o', 'u', 'ae', 'ia', 'io', 'ei', 'ou', 'y'];
const COD = ['', '', '', 'n', 'r', 'l', 's', 'th', 'x', 'm', 'k'];
const SUR = ['Vale', 'Ashgrove', 'Noir', 'Lumen', 'Hollow', 'Mercer', 'Quill', 'Ember', 'Sable', 'Rook', 'Wren', 'Thorne', 'Vireo', 'Cairn', 'Orrin', 'Solace', 'Kestrel', 'Marrow', 'Thistle', 'Voss', 'Halcyon', 'Brine', 'Calder', 'Dusk', 'Fenn', 'Gale', 'Hex', 'Iver', 'Lark', 'Morrow', 'Nox', 'Onyx', 'Pyre', 'Quarry', 'Reverie', 'Strand', 'Tarn', 'Umber', 'Wick', 'Yarrow'];
const CHN = ['Relay', 'Frequency', 'Index', 'Commons', 'Archive', 'Wire', 'Loop', 'Atlas', 'Channel', 'Signal'];
const ROLES = ['Keeper', 'Cartographer', 'Archivist', 'Listener', 'Courier', 'Weaver', 'Witness', 'Gardener', 'Cipher', 'Tuner', 'Collector', 'Navigator', 'Lamplighter', 'Translator', 'Surveyor'];
const OF = ['quiet signals', 'forgotten rooms', 'unlit corridors', 'small weather', 'borrowed light', 'paper tides', 'stray frequencies', 'slow fires', 'glass rivers', 'unfinished maps', 'night trains', 'folded time', 'echo gardens', 'distant doors', 'soft static'];
const CLOSE = ['Writes from the margin.', 'Leaves things half-said.', 'Always between states.', 'Reachable after dusk.', 'No two days alike.', 'Collects what drifts.', 'Speaks in fragments.', 'Stays unlabeled.'];
const STATUS = ['Online', 'Away', 'Dormant', 'Sealed', 'Drifting'];
const CATS = ['Origin', 'Relay', 'Archive', 'Signal', 'Vault', 'Atlas', 'Echo', 'Index', 'Orbit', 'Lattice'];
const GREEK = ['alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'theta', 'kappa', 'lambda', 'sigma', 'omega'];
const TAGS = ['alpha', 'beta', 'gamma', 'delta', 'omega', 'signal', 'archive', 'echo', 'void', 'lumen', 'relay', 'cipher', 'orbit', 'ember', 'glass', 'tide', 'static', 'vector', 'prism', 'drift', 'noir', 'atlas', 'ledger', 'harbor', 'mirror', 'vessel', 'fog', 'lattice', 'kiln', 'meridian', 'threshold', 'paper', 'current', 'compass', 'dusk', 'lantern', 'garden', 'horizon', 'corridor', 'window'];
const NOUN = ['signal', 'window', 'harbor', 'ember', 'lantern', 'orbit', 'tide', 'archive', 'mirror', 'corridor', 'static', 'garden', 'compass', 'ledger', 'echo', 'threshold', 'glass', 'cipher', 'meridian', 'fog', 'relay', 'prism', 'kiln', 'atlas', 'vessel', 'dusk', 'paper', 'current', 'lattice', 'horizon'];
const VERB = ['listens', 'folds', 'drifts', 'waits', 'returns', 'hums', 'unlearns', 'settles', 'keeps time', 'forgets', 'bends', 'answers', 'dissolves', 'remains'];
const PLACE = ['the far shore', 'a quiet room', 'the third floor', 'the edge of the map', 'a moving train', 'the last light', 'below the surface', 'the other side'];

/* tiny procedural art: avatars and post images cost a few hundred bytes, zero network */
const svgURI = s => 'data:image/svg+xml,' + encodeURIComponent(s);
function glyph(seed) {
  const r = R('g:' + seed), hue = ((r() < .6 ? 338 + r() * 26 : 255 + r() * 32) | 0) % 360;
  const c1 = `hsl(${hue},55%,52%)`, c2 = `hsl(${(hue + 24) % 360},35%,30%)`, t = Math.floor(r() * 3);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#14141b"/><stop offset="1" stop-color="#0a0a0f"/></linearGradient></defs><rect width="64" height="64" fill="url(#g)"/>`;
  if (t === 0) for (let i = 0; i < 4; i++) s += `<circle cx="${22 + (r() * 20 | 0)}" cy="${22 + (r() * 20 | 0)}" r="${6 + i * 7}" fill="none" stroke="${i % 2 ? c2 : c1}" stroke-opacity="${(.4 + r() * .5).toFixed(2)}"/>`;
  else if (t === 1) for (let i = 0; i < 6; i++) { const x = 6 + i * 10; s += `<path d="M${x} 64L${x + (r() * 30 - 5 | 0)} 0" stroke="${i % 3 ? c2 : c1}" stroke-opacity="${(.35 + r() * .55).toFixed(2)}" stroke-width="${(.8 + r() * 1.8).toFixed(1)}"/>`; }
  else { const a = r() * 90 | 0; s += `<rect x="14" y="14" width="36" height="36" fill="none" stroke="${c2}" transform="rotate(${a} 32 32)"/><rect x="22" y="22" width="20" height="20" fill="${c1}" fill-opacity=".55" transform="rotate(${a + 45} 32 32)"/>`; }
  return svgURI(s + '</svg>');
}
function art(seed) {
  const r = R('a:' + seed), hue = () => ((r() < .6 ? 338 + r() * 26 : 255 + r() * 32) | 0) % 360;
  let s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice"><rect width="160" height="100" fill="#0b0b10"/>';
  const n = 3 + Math.floor(r() * 4);
  for (let i = 0; i < n; i++) {
    const c = `hsl(${hue()},${40 + (r() * 25 | 0)}%,${38 + (r() * 22 | 0)}%)`, o = (.2 + r() * .5).toFixed(2), t = Math.floor(r() * 3), x = r() * 160 | 0, y = r() * 100 | 0;
    if (t === 0) s += `<circle cx="${x}" cy="${y}" r="${8 + (r() * 38 | 0)}" fill="none" stroke="${c}" stroke-opacity="${o}"/>`;
    else if (t === 1) s += `<path d="M${x} 0L${x + (r() * 80 - 40 | 0)} 100" stroke="${c}" stroke-opacity="${o}" stroke-width="${(.5 + r() * 1.5).toFixed(1)}"/>`;
    else s += `<rect x="${x - 20}" y="${y - 14}" width="${20 + (r() * 50 | 0)}" height="${14 + (r() * 40 | 0)}" fill="${c}" fill-opacity="${(o * .35).toFixed(2)}" transform="rotate(${r() * 60 - 30 | 0} ${x} ${y})"/>`;
  }
  return svgURI(s + '</svg>');
}

/* ───────────── logical universe ─────────────
   Profile k exists for every integer k. Its handle encodes k (so a handle
   can be resolved with no lookup). Curated profiles from content/*.txt
   occupy k = 1, 2, 3 … and the universe continues in both directions. */
const S = { profiles: [], byHandle: new Map(), postById: new Map(), lastId: null };
const suffix = k => (k >= 0n ? '_' + k.toString(36) : '-' + (-k).toString(36));

function genProfile(k) {
  const r = R('p:' + k), kind = r() < .26 ? 'channel' : 'profile';
  let given = ''; const syl = 2 + (r() < .4 ? 1 : 0);
  for (let i = 0; i < syl; i++) given += pick(r, ONS) + pick(r, VOW) + (i === syl - 1 ? pick(r, COD) : (r() < .2 ? pick(r, ['n', 'r', 'l']) : ''));
  given = cap(given);
  const sur = pick(r, SUR), of = pick(r, OF), role = pick(r, ROLES), close = pick(r, CLOSE);
  const status = pick(r, STATUS), category = pick(r, CATS), tags = [];
  while (tags.length < 3) { const t = pick(r, TAGS); if (!tags.includes(t)) tags.push(t); }
  const joined = String(2008 + Math.floor(r() * 19)), sector = `${pick(r, GREEK)}-${1 + Math.floor(r() * 97)}`;
  const act = []; for (let i = 0; i < 7; i++) act.push(.15 + r() * .85);
  const name = kind === 'channel' ? `${sur} ${pick(r, CHN)}` : `${given} ${sur}`;
  const base = (kind === 'channel' ? sur : given).toLowerCase();
  const p = { k, kind, name, handle: base + suffix(k), image: '', status, category, tags, joined, sector, act, posts: null, curated: false,
    bio: kind === 'channel' ? `A channel for ${of}. ${close}` : `${role} of ${of}. ${close}` };
  p.hay = hay(p);
  return p;
}
function hay(p) { return (p.name + ' @' + p.handle + ' ' + p.kind + ' ' + p.bio + ' ' + p.tags.join(' ') + ' ' + p.status + ' ' + p.category + ' ' + p.sector + ' ' + p.joined).toLowerCase(); }
const profileAt = k => (k >= 1n && k <= BigInt(S.profiles.length)) ? S.profiles[Number(k) - 1] : genProfile(k);

function resolveHandle(h) {
  h = String(h || '').trim().toLowerCase().replace(/^@/, '');
  if (!h || h.length > 160) return null;
  const c = S.byHandle.get(h); if (c) return c;
  const m = h.match(/^([a-z0-9]+)([_-])([0-9a-z]+)$/); if (!m) return null;
  let k = fromB36(m[3]); if (m[2] === '-') k = -k;
  return profileAt(k);
}
const nStr = n => (n < 0n ? 'n' + (-n) : String(n));

function genPost(p, n) {
  const r = R('q:' + p.handle + ':' + n), a = pick(r, NOUN), b = pick(r, NOUN), c = pick(r, NOUN);
  const T = [
    () => `The ${a} ${pick(r, VERB)} where the ${b} ${pick(r, VERB)}.`,
    () => `Every ${a} is a ${b} that forgot its name.`,
    () => `Seen from ${pick(r, PLACE)}, the ${a} looks like a ${b}.`,
    () => `${cap(a)} before ${b}. ${cap(b)} after ${a}.`,
    () => `Note ${1 + Math.floor(r() * 900)}: ${a} ${pick(r, VERB)}. Nothing else changed.`,
    () => `${a} / ${b} / ${c}`
  ];
  const lines = [pick(r, T)()]; if (r() < .45) lines.push(pick(r, T)());
  if (r() < .3) lines.push('#' + pick(r, p.tags));
  const media = r() < .4 ? [{ type: 'image', src: art(p.handle + ':' + n), gen: true }] : [];
  return { id: p.handle + '.' + nStr(n), n, handle: p.handle, text: lines.join(' ').replace(' #', '\n#'), media, tags: [], authored: false, date: '' };
}
function getPost(p, n) {
  if (p.posts && n >= 1n && n <= BigInt(p.posts.length)) return p.posts[Number(n) - 1];
  return genPost(p, n);
}
function resolvePost(id) {
  id = String(id || ''); if (!id || id.length > 400) return null;
  const c = S.postById.get(id); if (c) return { p: c.p, post: getPost(c.p, c.n) };
  const i = id.lastIndexOf('.'); if (i < 1) return null;
  const m = id.slice(i + 1).match(/^(n?)(\d{1,200})$/); if (!m) return null;
  const p = resolveHandle(id.slice(0, i)); if (!p) return null;
  let n = BigInt(m[2]); if (m[1]) n = -n;
  return { p, post: getPost(p, n) };
}

/* ───────────── content parsing (external .txt files) ───────────── */
const stripComments = t => t.replace(/^\uFEFF/, '').replace(/\r/g, '').replace(/^[ \t]*\/\/(?:[ \t].*)?$/gm, '');
function parseBlocks(text) {         // (- TAG -) delimited blocks; damaged ones are skipped later, individually
  const parts = stripComments(text).split(/^[ \t]*\(-\s*([A-Za-z]+)\s*-\)[ \t]*$/gm), out = [];
  for (let i = 1; i < parts.length; i += 2) { const body = (parts[i + 1] || '').trim(); if (body) out.push({ tag: parts[i].toUpperCase(), body }); }
  return out;
}
const slug = s => String(s || '').toLowerCase().replace(/[^a-z0-9_-]+/g, '').replace(/^[-_]+|[-_]+$/g, '');
const MEDIA_LINE = /^(?:https?:\/\/\S+|(?:\.{1,2}\/|\/)?[\w\-./%]+\.(?:jpe?g|png|gif|webp|avif|svg|mp4|webm|mov|m4v|ogv|mp3|wav|ogg|m4a|aac|flac|opus|pdf|docx?|xlsx?|pptx?|zip|txt|csv))$/i;
const X = { img: new Set('jpg jpeg png gif webp avif svg bmp'.split(' ')), vid: new Set('mp4 webm mov m4v ogv'.split(' ')), aud: new Set('mp3 wav ogg m4a aac flac opus'.split(' ')), file: new Set('pdf doc docx xls xlsx ppt pptx zip rar 7z txt csv apk epub'.split(' ')) };
function classify(u) {
  let url; try { url = new URL(u, location.href); } catch { return null; }
  if (!/^https?:$/.test(url.protocol)) return null;
  const href = url.href, host = url.hostname.replace(/^www\./, ''), seg = url.pathname.split('/').filter(Boolean);
  let id = null, short = false;
  if (host === 'youtu.be') id = seg[0];
  else if (/(^|\.)youtube(-nocookie)?\.com$/.test(host)) { if (['shorts', 'embed', 'live', 'v'].includes(seg[0])) { id = seg[1]; short = seg[0] === 'shorts'; } else id = url.searchParams.get('v'); }
  if (id && /^[\w-]{6,20}$/.test(id)) return { type: 'youtube', id, short, href };
  const ext = ((url.pathname.match(/\.([a-z0-9]+)$/i) || [])[1] || '').toLowerCase();
  if (X.img.has(ext) || /^(picsum\.photos|images\.unsplash\.com|i\.imgur\.com|pbs\.twimg\.com)$/.test(host)) return { type: 'image', src: href, href };
  if (X.vid.has(ext)) return { type: 'video', src: href, href };
  if (X.aud.has(ext)) return { type: 'audio', src: href, href };
  let name = seg[seg.length - 1] || host; try { name = decodeURIComponent(name); } catch { }
  if (X.file.has(ext)) return { type: 'file', href, ext, name };
  return { type: 'link', href, host, path: (url.pathname + url.search).replace(/^\/$/, '') };
}
function parseBody(rest) {
  const text = [], media = [];
  for (const raw of rest.split('\n')) {
    const l = raw.trim();
    if (l && MEDIA_LINE.test(l)) { const m = classify(l); if (m) { media.push(m); continue; } }
    text.push(raw.replace(/\s+$/, ''));
  }
  return { text: text.join('\n').replace(/\n{3,}/g, '\n\n').trim(), media };
}
function buildUniverse(profilesTxt, channelsTxt, postsTxt) {
  S.profiles = []; S.byHandle = new Map(); S.postById = new Map(); S.lastId = null;
  const add = (o, kind) => {
    try {
      let h = slug(o.handle || o.name); if (!h) return;
      for (let c = 2, b = h; S.byHandle.has(h); c++) h = b + '_' + c;
      const k = BigInt(S.profiles.length + 1), g = genProfile(k);
      const p = { ...g, k, handle: h, kind: o.kind === 'channel' ? 'channel' : (o.kind === 'profile' ? 'profile' : kind), curated: true, posts: [],
        name: o.name || h, bio: o.bio || o.about || g.bio, status: o.status || g.status, category: o.category || g.category,
        tags: o.tags ? o.tags.split(/[,\s]+/).map(t => t.replace(/^#/, '').toLowerCase()).filter(Boolean) : g.tags,
        joined: o.joined || g.joined, sector: o.sector || g.sector, image: o.image || o.avatar || '' };
      p.hay = hay(p); S.profiles.push(p); S.byHandle.set(h, p);
    } catch (e) { console.warn('veyora: skipped a damaged profile block', e); }
  };
  const read = (txt, kind) => parseBlocks(txt).forEach(b => {
    if (b.tag !== 'PROFILE' && b.tag !== 'CHANNEL') return;
    const o = {}; b.body.split('\n').forEach(l => { const m = l.match(/^\s*([a-z]+)\s*:\s*(.*)$/i); if (m) o[m[1].toLowerCase()] = m[2].trim(); });
    if (o.name || o.handle) add(o, b.tag === 'CHANNEL' ? 'channel' : kind);
  });
  read(profilesTxt, 'profile'); read(channelsTxt, 'channel');
  if (!S.profiles.length) return false;
  for (const b of parseBlocks(postsTxt)) {
    if (b.tag !== 'POST') continue;
    try {
      const lines = b.body.split('\n'); let handle = null, date = '', tags = [], i = 0, m;
      while (i < lines.length) {
        const l = lines[i].trim();
        if (!l) { i++; continue; }
        if ((m = l.match(/^@([\w-]+)$/))) { handle = m[1].toLowerCase(); i++; }
        else if ((m = l.match(/^date\s*:\s*(.+)$/i))) { date = m[1]; i++; }
        else if ((m = l.match(/^tags\s*:\s*(.+)$/i))) { tags = m[1].split(/[,\s]+/).map(t => t.replace(/^#/, '')).filter(Boolean); i++; }
        else break;
      }
      const rest = lines.slice(i).join('\n').trim(); if (!rest) continue;
      let p = handle && S.byHandle.get(handle); if (!p) { if (handle) console.warn('veyora: unknown @' + handle + ', filed under the first profile'); p = S.profiles[0]; }
      const { text, media } = parseBody(rest);
      let id = 'x' + h53(p.handle + '\u0001' + rest.replace(/\s+/g, ' ')).toString(36);
      for (let c = 2, b0 = id; S.postById.has(id); c++) id = b0 + '-' + c;
      const n = BigInt(p.posts.length + 1), post = { id, n, handle: p.handle, text, media, tags, authored: true, date };
      p.posts.push(post); S.postById.set(id, { p, n }); S.lastId = id;
    } catch (e) { console.warn('veyora: skipped a damaged post block', e); }
  }
  return true;
}
const FALLBACK = {
  p: '(- PROFILE -)\nname: Veyora\nhandle: veyora\nbio: One profile. Infinite states.\nstatus: Online\ncategory: Origin\njoined: 2026\ntags: origin, signal',
  c: '',
  o: '(- POST -)\n@veyora\nThe content files could not be loaded, so this is the built-in origin. Add content/posts.txt next to index.html and serve the folder over http.'
};
async function getText(url) { try { const r = await fetch(url, { cache: 'no-cache' }); if (!r.ok) throw 0; return await r.text(); } catch { return null; } }
async function loadContent() {
  const [a, b, c] = await Promise.all([getText('content/profiles.txt'), getText('content/channels.txt'), getText('content/posts.txt')]);
  if (!buildUniverse(a || '', b || '', c || '')) buildUniverse(FALLBACK.p, FALLBACK.c, FALLBACK.o);
}

/* ───────────── rendering helpers ───────────── */
const joinedLabel = p => (/^\d{4}$/.test(p.joined) ? 'Since ' + p.joined : p.joined);
const fmtK = k => { const a = k < 0n ? -k : k, s = a < 100000n ? a.toString().padStart(5, '0') : fmtBig(a); return 'identity ' + (k < 0n ? '−' : '') + s; };
function linkify(t) {
  return esc(t).replace(/https?:\/\/[^\s<>"']+/g, u => {
    let tail = ''; const m = u.match(/[.,;:!?)\]]+$/); if (m) { tail = m[0]; u = u.slice(0, -tail.length); }
    return `<a href="${u}" target="_blank" rel="noopener nofollow">${u.length > 46 ? u.slice(0, 44) + '…' : u}</a>${tail}`;
  });
}
const avatar = (p, cls = '') => `<span class="av ${cls}${p.kind === 'channel' ? ' ch' : ''}" style="background-image:url('${glyph(p.handle)}')">${p.image ? `<img src="${esc(p.image)}" alt="" loading="lazy" decoding="async">` : ''}</span>`;
const badge = p => (p.kind === 'channel' ? '<i class="bd ch">channel</i>' : '');
const spark = p => `<span class="spark" title="Recent activity">${p.act.map(v => `<s style="height:${Math.round(v * 100)}%"></s>`).join('')}</span>`;
const meta = p => `<span class="s-${esc(p.status.toLowerCase())}"><i class="dot"></i>${esc(p.status)}</span><span>${esc(p.category)}</span><span>${esc(joinedLabel(p))}</span><span>${p.posts && p.posts.length ? p.posts.length + ' written, ∞ echoes' : '∞ posts'}</span>${spark(p)}`;
const hrefProfile = (h, at) => '?profile=' + encodeURIComponent(h) + (at != null ? '&at=' + at : '');
const hrefPost = id => '?post=' + encodeURIComponent(id);
const fmtN = n => fmtBig(n);

function mediaHTML(m, full) {
  switch (m.type) {
    case 'image': { const img = `<img src="${esc(m.src)}" alt="" loading="lazy" decoding="async">`; return full && !m.gen ? `<a class="m img full" href="${esc(m.href)}" target="_blank" rel="noopener">${img}</a>` : `<div class="m img${full ? ' full' : ''}">${img}</div>`; }
    case 'video': return `<div class="m vid"><video src="${esc(m.src)}" controls preload="none" playsinline></video></div>`;
    case 'audio': return `<div class="m aud"><audio src="${esc(m.src)}" controls preload="none"></audio></div>`;
    case 'youtube': return `<div class="m yt${m.short ? ' short' : ''}"><button type="button" data-yt="${esc(m.id)}" aria-label="Play video"><img src="https://i.ytimg.com/vi/${esc(m.id)}/hqdefault.jpg" alt="" loading="lazy" decoding="async"><i></i></button></div>`;
    case 'file': return `<a class="m file" href="${esc(m.href)}" target="_blank" rel="noopener"><b>${esc(m.ext.toUpperCase())}</b><span>${esc(m.name)}</span></a>`;
    default: return `<a class="m link" href="${esc(m.href)}" target="_blank" rel="noopener nofollow"><span>${esc(m.host)}</span>${m.path ? `<em>${esc(m.path)}</em>` : ''}</a>`;
  }
}
function postHTML(post, full) {
  const media = full ? post.media : post.media.slice(0, 1), extra = post.media.length - media.length;
  return `<article class="post ${post.authored ? 'au' : 'ec'}${full ? ' pv' : ''}"${full ? '' : ` data-href="${esc(hrefPost(post.id))}"`}>
<header class="ph"><a class="pn" href="${esc(hrefPost(post.id))}" data-nav>№ ${fmtN(post.n)}</a><span class="pm">${post.authored ? esc(post.date || 'written') : 'echo'}</span></header>
${post.text ? `<div class="pt">${linkify(post.text)}</div>` : ''}${media.map(m => mediaHTML(m, full)).join('')}${extra > 0 ? `<div class="more-m">+${extra} more</div>` : ''}
<footer class="pf2"><span>${esc(post.id)}</span>${post.tags.map(t => `<span>#${esc(t)}</span>`).join('')}</footer></article>`;
}
function profileCard(p) {
  return `<a class="pf" href="${esc(hrefProfile(p.handle))}" data-nav>${avatar(p)}<span class="pfb"><span class="nm">${esc(p.name)}${badge(p)}</span><span class="hd">@${esc(p.handle)}</span><span class="bio">${esc(p.bio)}</span><span class="mr">${meta(p)}</span></span></a>`;
}

/* ───────────── the engine: bidirectional virtual stream ─────────────
   Items are addressed by BigInt index. Only items near the viewport exist
   in the DOM. Prepending above compensates scrollTop, so upward scrolling
   never jumps. Trimmed items are not lost: render(i) rebuilds them. */
class Stream {
  constructor(sc, render, anchor) {
    this.sc = sc; this.render = render; this.first = anchor; this.last = anchor - 1n; this.dead = false; this.raf = 0; this.busy = false;
    this.list = el('div', 'vlist'); sc.appendChild(this.list);
    this.on = () => { if (!this.raf) this.raf = requestAnimationFrame(() => { this.raf = 0; this.fill(); }); };
    sc.addEventListener('scroll', this.on, { passive: true });
    this.ro = new ResizeObserver(this.on); this.ro.observe(sc);
  }
  make(i) {
    let n; try { n = this.render(i); } catch (e) { console.warn('veyora: item failed', e); n = el('div', 'vi', '<div class="fail">This item could not be drawn.</div>'); }
    n.dataset.i = i.toString(); return n;
  }
  fill() {
    if (this.dead || this.busy) return;
    const sc = this.sc, list = this.list, vh = sc.clientHeight; if (!vh) return;
    this.busy = true;
    const buf = Math.max(vh * 1.1, 520), far = buf * 2.6; let g = 0;
    if (!list.firstChild) { list.appendChild(this.make(this.first)); this.last = this.first; }
    while (g++ < 60 && list.offsetHeight - (sc.scrollTop + vh) < buf) { this.last += 1n; list.appendChild(this.make(this.last)); }
    while (g++ < 120 && sc.scrollTop < buf) { this.first -= 1n; const n = this.make(this.first); list.insertBefore(n, list.firstChild); sc.scrollTop += n.offsetHeight; }
    let f; while ((f = list.firstChild) !== list.lastChild) { const h = f.offsetHeight; if (f.offsetTop + h < sc.scrollTop - far) { list.removeChild(f); this.first += 1n; sc.scrollTop -= h; } else break; }
    let l; while ((l = list.lastChild) !== list.firstChild && l.offsetTop > sc.scrollTop + vh + far) { list.removeChild(l); this.last -= 1n; }
    this.busy = false;
  }
  destroy() { this.dead = true; cancelAnimationFrame(this.raf); this.sc.removeEventListener('scroll', this.on); this.ro.disconnect(); this.list.remove(); }
}

/* ───────────── view manager ───────────── */
const viewsEl = $('#views'), cache = new Map(); let current = null;
function mount(key, build) {
  let v = cache.get(key);
  if (v) { cache.delete(key); cache.set(key, v); }
  else { v = build(); v.key = key; cache.set(key, v); viewsEl.appendChild(v.root); if (v.init) v.init(); evict(); }
  if (current && current !== v) { current.root.classList.remove('on'); current.root.setAttribute('aria-hidden', 'true'); }
  current = v; v.root.classList.add('on'); v.root.removeAttribute('aria-hidden');
  document.title = v.title || TITLE; if (v.onShow) v.onShow();
  return v;
}
function evict() {          // memory only: old destinations are rebuilt from their URL when revisited
  if (cache.size <= 7) return;
  for (const [key, v] of cache) {
    if (cache.size <= 7) break;
    if (v === current || key === 'feed' || key === 'search') continue;
    if (v.destroy) v.destroy(); v.root.remove(); cache.delete(key);
  }
}

/* feed */
function renderBlock(k) {
  const p = profileAt(k), w = el('div', 'vi'), len = p.posts ? p.posts.length : 0;
  const m = 2 + (h53(p.handle, 7) % 2), cnt = len ? Math.min(m, len) : m, s = len ? BigInt(Math.max(1, len - cnt + 1)) : 1n;
  let h = k === 1n ? '<div class="origin"><h1>ONE PROFILE. INFINITE STATES.</h1><p>Explore beyond the profile.</p></div>' : '';
  h += `<div class="bound"><span>${fmtK(k)}</span></div>${profileCard(p)}`;
  for (let i = 0n; i < BigInt(cnt); i++) h += '<div class="sep"></div>' + postHTML(getPost(p, s + i), false);
  w.innerHTML = h + `<a class="more" href="${esc(hrefProfile(p.handle))}" data-nav>Open full profile</a>`;
  return w;
}
function showFeed() {
  mount('feed', () => { const root = el('section', 'view'), sc = el('div', 'scroller'); root.append(sc); const v = { root, title: TITLE }; v.init = () => { v.st = new Stream(sc, renderBlock, 1n); }; v.destroy = () => v.st && v.st.destroy(); return v; });
}

/* profile */
const IC = { back: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 4l-6 6 6 6"/></svg>', prev: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 4l-6 6 6 6"/></svg>', next: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M8 4l6 6-6 6"/></svg>', down: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 8l5 5 5-5"/></svg>', link: '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8.5 11.5a3.5 3.5 0 005 0l2.5-2.5a3.5 3.5 0 00-5-5l-1 1M11.5 8.5a3.5 3.5 0 00-5 0L4 11a3.5 3.5 0 005 5l1-1"/></svg>' };
const parseAt = at => (at && /^-?\d{1,200}$/.test(at) ? BigInt(at) : null);
function showProfile(h, at) {
  const p = resolveHandle(h); if (!p) return showNF('That profile address does not resolve to anything.');
  const a = parseAt(at);
  if (h !== p.handle) history.replaceState(history.state, '', hrefProfile(p.handle, a));
  mount('p:' + p.handle + ':' + (a === null ? '' : a), () => buildProfile(p, a === null ? 1n : a));
}
function buildProfile(p, anchor) {
  const root = el('section', 'view'), pv = profileAt(p.k - 1n), nx = profileAt(p.k + 1n);
  root.innerHTML = `<div class="phead"><div class="prow">
<a class="icb" href="./" data-act="back" aria-label="Back">${IC.back}</a>${avatar(p, 'lg')}
<div class="pwho"><div class="nm">${esc(p.name)}${badge(p)}</div><span class="hd">@${esc(p.handle)}</span></div>
<div class="pact"><a class="icb" href="${esc(hrefProfile(pv.handle))}" data-nav aria-label="Previous profile">${IC.prev}</a><a class="icb" href="${esc(hrefProfile(nx.handle))}" data-nav aria-label="Next profile">${IC.next}</a>
<button class="icb" type="button" data-act="copy" data-url="${esc(hrefProfile(p.handle))}" aria-label="Copy profile link">${IC.link}</button>
<button class="icb" type="button" data-act="exp" aria-label="Show or hide details" aria-expanded="true">${IC.down}</button></div></div>
<div class="pexp"><div class="pexi"><div class="pexc"><span class="bio">${esc(p.bio)}</span><span class="mr">${meta(p)}</span>
<div class="tags">${p.tags.map(t => `<a href="?search=${encodeURIComponent(t)}" data-nav>#${esc(t)}</a>`).join('')}</div></div></div></div></div>`;
  const sc = el('div', 'scroller'); root.append(sc);
  const v = { root, title: p.name + ' (@' + p.handle + ') — VEYORA' }, head = $('.phead', root);
  let armed = false, base = 0;
  v.init = () => {
    v.st = new Stream(sc, n => { const w = el('div', 'vi'); w.innerHTML = '<div class="sep"></div>' + postHTML(getPost(p, n), false); return w; }, anchor);
    v.t = setTimeout(() => { armed = true; base = sc.scrollTop; }, 800);
  };
  sc.addEventListener('scroll', () => { if (armed && !head.classList.contains('collapsed') && Math.abs(sc.scrollTop - base) > 90) setExp(head, false); }, { passive: true });
  v.destroy = () => { clearTimeout(v.t); v.st && v.st.destroy(); };
  v.head = head; v.disarm = () => { armed = false; };
  return v;
}
function setExp(head, open) { head.classList.toggle('collapsed', !open); const b = $('[data-act=exp]', head); if (b) b.setAttribute('aria-expanded', open); }

/* post */
function showPost(id) {
  const res = resolvePost(id); if (!res) return showNF('No post lives at this address.');
  const { p, post } = res;
  if (post.id !== id) history.replaceState(history.state, '', hrefPost(post.id));
  mount('o:' + post.id, () => {
    const root = el('section', 'view'), pv = getPost(p, post.n - 1n), nx = getPost(p, post.n + 1n), url = hrefPost(post.id);
    root.innerHTML = `<div class="scroller"><div class="col">
<div class="bar"><a class="icb" href="${esc(hrefProfile(p.handle, post.n))}" data-act="back" data-fallback="${esc(hrefProfile(p.handle, post.n))}" aria-label="Back">${IC.back}</a>
<div class="grp"><button class="icb" type="button" data-act="copy" data-url="${esc(url)}" aria-label="Copy link">${IC.link}</button><button class="icb" type="button" data-act="share" data-url="${esc(url)}" data-title="${esc(p.name)}" aria-label="Share" hidden><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M10 3v10M6 7l4-4 4 4M4 12v4h12v-4"/></svg></button></div></div>
<a class="pf mini" href="${esc(hrefProfile(p.handle, post.n))}" data-nav>${avatar(p, 'sm')}<span class="pfb"><span class="nm">${esc(p.name)}${badge(p)}</span><span class="hd">@${esc(p.handle)}</span></span></a>
<div class="sep"></div>${postHTML(post, true)}
<div class="pnav"><a class="btn" href="${esc(hrefPost(pv.id))}" data-nav>${IC.prev} № ${fmtN(post.n - 1n)}</a><a class="btn" href="${esc(hrefPost(nx.id))}" data-nav>№ ${fmtN(post.n + 1n)} ${IC.next}</a></div>
<a class="btn" style="width:100%;justify-content:center" href="${esc(hrefProfile(p.handle, post.n))}" data-nav>More from ${esc(p.name)}</a>
<div class="url"></div></div></div>`;
    $('.url', root).textContent = new URL(url, location.href).href;
    if (navigator.share) $('[data-act=share]', root).hidden = false;
    return { root, title: `Post № ${fmtN(post.n)} by ${p.name} — VEYORA` };
  });
}

/* not found */
function showNF(msg) {
  const v = mount('nf', () => { const root = el('section', 'view'); root.innerHTML = '<div class="scroller"><div class="col nf"></div></div>'; return { root, title: 'Not found — VEYORA' }; });
  $('.nf', v.root).innerHTML = `<h2>Nothing here</h2><p>${esc(msg)}</p><p><a href="./" data-nav>Return to the feed</a></p>`;
}

/* search — infinite, lazily evaluated.
   Candidates are generated outward from the origin (1, 0, 2, −1, 3, −2 …) in short
   time slices; matches are appended as the person scrolls. Nothing ever says "end". */
const ROW = 72, order = i => (i % 2n === 0n ? i / 2n + 1n : -((i - 1n) / 2n));
function buildSearch() {
  const root = el('section', 'view');
  root.innerHTML = `<div class="shead"><div class="col"><label class="sbox"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="9" r="5.5"/><path d="M13.5 13.5L17 17"/></svg>
<input type="search" placeholder="Search profiles and channels" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" aria-label="Search"><button class="clr" type="button" aria-label="Clear search">×</button></label>
<div class="schips"><button type="button" data-kind="all" aria-pressed="true">All</button><button type="button" data-kind="profile" aria-pressed="false">Profiles</button><button type="button" data-kind="channel" aria-pressed="false">Channels</button><div class="sstat"></div></div></div></div>
<div class="scroller"><div class="slist"></div></div>`;
  const input = $('input', root), sc = $('.scroller', root), list = $('.slist', root), stat = $('.sstat', root), box = $('.sbox', root), chips = root.querySelectorAll('.schips button');
  const v = { root, title: 'Search — VEYORA', q: null, kind: 'all' }, live = new Map(); let run = null, raf = 0, deb = 0;
  const need = () => Math.ceil((sc.scrollTop + sc.clientHeight) / ROW) + 14;
  const status = () => { if (!run) return; stat.classList.toggle('busy', run.scanning); stat.innerHTML = `<span><b>${run.rows.length.toLocaleString()}</b> found</span><span>${run.scanning ? 'searching' : 'scroll for more'}</span><span class="dim">scanned ${fmtBig(run.i)}</span>`; };
  function paint() {
    if (!run) return;
    const top = sc.scrollTop, a = Math.max(0, Math.floor(top / ROW) - 6), b = Math.min(run.rows.length, Math.ceil((top + sc.clientHeight) / ROW) + 6);
    for (const [i, n] of live) if (i < a || i >= b) { n.remove(); live.delete(i); }
    for (let i = a; i < b; i++) if (!live.has(i)) {
      const p = run.rows[i], n = el('a', 'srow');
      n.href = hrefProfile(p.handle); n.setAttribute('data-nav', ''); n.style.transform = `translate3d(0,${i * ROW}px,0)`;
      n.innerHTML = `${avatar(p, 'sm')}<span class="pfb"><span class="nm"><b>${esc(p.name)}</b>${badge(p)}</span><span class="hd">@${esc(p.handle)}</span><span class="bio">${esc(p.bio)}</span></span>`;
      list.appendChild(n); live.set(i, n);
    }
    list.style.height = run.rows.length * ROW + 'px';
  }
  const match = (r, p) => { if (r.kind !== 'all' && p.kind !== r.kind) return false; for (const t of r.tokens) if (!p.hay.includes(t)) return false; return true; };
  function pump() {
    const r = run; if (!r || r.dead || r.timer) return;
    if (r.rows.length >= need()) { r.scanning = false; status(); paint(); return; }
    r.scanning = true;
    r.timer = setTimeout(() => {
      r.timer = 0; if (r.dead) return;
      const t0 = performance.now(), want = need();
      while (r.rows.length < want && performance.now() - t0 < 9) for (let j = 0; j < 150; j++) { const p = profileAt(order(r.i)); r.i += 1n; if (p.handle !== r.pin && match(r, p)) r.rows.push(p); }
      paint(); status(); pump();
    }, 6);
  }
  function start(q, kind) {
    if (run) { run.dead = true; clearTimeout(run.timer); }
    for (const n of live.values()) n.remove(); live.clear(); list.style.height = '0px'; sc.scrollTop = 0;
    const t = (q || '').trim().toLowerCase().replace(/^@/, '');
    run = { dead: false, tokens: (q || '').toLowerCase().split(/\s+/).map(s => s.replace(/^[@#]+/, '')).filter(Boolean), kind, i: 0n, rows: [], timer: 0, scanning: false, pin: null };
    if (t && !/\s/.test(t)) { const p = resolveHandle(t); if (p && p.handle === t && (kind === 'all' || p.kind === kind)) { run.rows.push(p); run.pin = p.handle; } }
    pump();
  }
  function sync() { box.classList.toggle('has', !!input.value); chips.forEach(c => c.setAttribute('aria-pressed', c.dataset.kind === v.kind)); }
  function commit(q, kind) {
    v.q = q; v.kind = kind; sync();
    history.replaceState(history.state, '', '?search=' + encodeURIComponent(q) + (kind !== 'all' ? '&kind=' + kind : ''));
    start(q, kind);
  }
  input.addEventListener('input', () => { box.classList.toggle('has', !!input.value); clearTimeout(deb); deb = setTimeout(() => commit(input.value, v.kind), 180); });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { clearTimeout(deb); commit(input.value, v.kind); input.blur(); } });
  $('.clr', root).addEventListener('click', () => { input.value = ''; commit('', v.kind); input.focus(); });
  chips.forEach(c => c.addEventListener('click', () => commit(input.value, c.dataset.kind)));
  const tick = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; paint(); pump(); }); };
  sc.addEventListener('scroll', tick, { passive: true }); new ResizeObserver(tick).observe(sc);
  v.set = (q, kind) => { if (q === v.q && kind === v.kind) return; v.q = q; v.kind = kind; input.value = q; sync(); start(q, kind); };
  v.onShow = () => { paint(); pump(); if (!v.q && matchMedia('(pointer:fine)').matches) input.focus(); };
  v.destroy = () => { if (run) { run.dead = true; clearTimeout(run.timer); } };
  return v;
}
function showSearch(q, kind) {
  const v = mount('search', buildSearch); v.set(q || '', ['profile', 'channel'].includes(kind) ? kind : 'all');
}

/* ───────────── router ───────────── */
function route() {
  const q = new URLSearchParams(location.search);
  if (q.has('post')) return { t: 'post', id: q.get('post') };
  if (q.has('profile')) return { t: 'profile', h: q.get('profile'), at: q.get('at') };
  if (q.has('search')) return { t: 'search', q: q.get('search'), kind: q.get('kind') };
  return { t: 'feed' };
}
const nav = { s: $('#nSearch'), p: $('#nProfile'), o: $('#nPost') };
function render() {
  const r = route();
  try {
    if (r.t === 'post') showPost(r.id); else if (r.t === 'profile') showProfile(r.h, r.at);
    else if (r.t === 'search') showSearch(r.q, r.kind); else showFeed();
  } catch (e) { console.error(e); showNF('Something went wrong opening this address.'); }
  const sv = cache.get('search'); nav.s.href = '?search=' + (sv && sv.q ? encodeURIComponent(sv.q) : '');
  [['s', 'search'], ['p', 'profile'], ['o', 'post']].forEach(([k, t]) => { if (r.t === t) nav[k].setAttribute('aria-current', 'page'); else nav[k].removeAttribute('aria-current'); });
}
function go(href) {
  const u = new URL(href, location.href);
  if (u.pathname === location.pathname && u.search === location.search) { if (current && current.st) current.st.sc.scrollTo({ top: 0 }); return; }
  history.pushState({ d: ((history.state && history.state.d) || 0) + 1 }, '', u.pathname + u.search);
  render();
}
window.addEventListener('popstate', render);

/* ───────────── interactions ───────────── */
const toastEl = $('#toast'); let toastT = 0;
function toast(t) { toastEl.textContent = t; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 1600); }
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); } catch { const a = document.createElement('textarea'); a.value = t; a.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); } catch { } a.remove(); }
  toast('Link copied');
}
document.addEventListener('click', e => {
  if (e.defaultPrevented || e.button) return;
  const t = e.target, yt = t.closest('button[data-yt]');
  if (yt) { const f = document.createElement('iframe'); f.src = 'https://www.youtube-nocookie.com/embed/' + yt.dataset.yt + '?autoplay=1&rel=0&playsinline=1'; f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true; f.title = 'Video'; yt.replaceWith(f); return; }
  const act = t.closest('[data-act]');
  if (act) {
    const k = act.dataset.act; e.preventDefault();
    if (k === 'back') { if (history.state && history.state.d > 0) history.back(); else go(act.dataset.fallback || './'); }
    else if (k === 'copy') copyText(new URL(act.dataset.url, location.href).href);
    else if (k === 'share') navigator.share({ title: act.dataset.title, url: new URL(act.dataset.url, location.href).href }).catch(() => { });
    else if (k === 'exp') { const h = act.closest('.phead'); setExp(h, h.classList.contains('collapsed')); if (current && current.disarm) current.disarm(); }
    return;
  }
  const a = t.closest('a[data-nav]');
  if (a) { if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; e.preventDefault(); go(a.getAttribute('href')); return; }
  const card = t.closest('.post[data-href]');
  if (card && !t.closest('a,button,video,audio,iframe,input')) { if (String(getSelection && getSelection()).length) return; go(card.dataset.href); }
});
document.addEventListener('error', e => {
  const t = e.target; if (!t || t.tagName !== 'IMG') return;
  if (t.closest('.av')) { t.remove(); return; }
  const m = t.closest('.m'); if (m) { m.classList.add('bad'); t.remove(); }
}, true);
document.addEventListener('load', e => { const t = e.target; if (t && t.tagName === 'IMG') { const m = t.closest('.m'); if (m) m.classList.add('ok'); } }, true);

/* ───────────── boot ───────────── */
(async function boot() {
  await loadContent();
  nav.p.href = hrefProfile(S.profiles[0].handle);
  nav.o.href = hrefPost(S.lastId || getPost(S.profiles[0], 1n).id);
  history.replaceState({ d: (history.state && history.state.d) || 0 }, '', location.pathname + location.search);
  render();
  requestAnimationFrame(() => $('#splash').classList.add('gone'));
})();
})();
