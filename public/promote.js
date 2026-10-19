// ════════════════════════════════════════════════════════════════
//  ClubOS Promote — shared demo runtime
//  Live RSVPs and check-ins travel between phone, TV and staff
//  view over a Supabase Realtime *broadcast* channel. Broadcast is
//  pub/sub only: nothing is written to any database table.
//  Same-device tabs also sync over BroadcastChannel (works offline).
// ════════════════════════════════════════════════════════════════
(function () {
  const SB = 'https://ykfvwqewnfnibpzytspn.supabase.co';
  const SK = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrZnZ3cWV3bmZuaWJwenl0c3BuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MjE2NzYsImV4cCI6MjA5MDM5NzY3Nn0.cnMztZVHDV3Hof-26aRi4NIM7wKwjzxAfoMBR3oItms';
  const V = window.CLUBOS_VENUE;
  const TALLY_KEY = 'clubos_promote_tally_v1';
  const listeners = [];
  const seen = new Set();          // de-dupe messages arriving on both transports
  let channel = null, ready = false, queue = [];

  // ── local storage (wrapped: can be blocked on some players) ──
  function load(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
  }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }

  // tally = { [eventId]: { going: n, checkedIn: n, recent: [{name, at, type}] } }
  let tally = load(TALLY_KEY, {});

  // Staff-added events (admin.html) live in this browser and are merged in.
  const CUSTOM_KEY = 'clubos_promote_custom_events_v1';
  let custom = load(CUSTOM_KEY, []);
  function mergeCustom() {
    window.CLUBOS_EVENTS = window.CLUBOS_EVENTS.filter(e => !e.custom).concat(custom);
  }
  function storeEvent(ev) {
    ev = Object.assign({ going: 0, early: 0, who: [], signup: 'Scan the QR code' }, ev, { custom: true });
    custom = custom.filter(e => e.id !== ev.id).concat(ev);
    save(CUSTOM_KEY, custom); mergeCustom();
    return ev;
  }
  mergeCustom();

  function stats(ev) {
    const t = tally[ev.id] || { going: 0, checkedIn: 0, recent: [] };
    const going = (ev.going || 0) + t.going;
    const recentNames = t.recent.filter(r => r.type === 'rsvp').map(r => r.name);
    const who = [...recentNames.slice().reverse(), ...(ev.who || [])].slice(0, 6);
    return {
      going,
      checkedIn: (ev.checkedIn || 0) + t.checkedIn,
      early: ev.early || 0,
      spotsLeft: ev.cap ? Math.max(ev.cap - going, 0) : null,
      full: ev.cap ? going >= ev.cap : false,
      pct: ev.cap ? Math.min(going / ev.cap, 1) : null,
      who,
      recent: t.recent
    };
  }

  function apply(msg) {
    if (!msg || !msg.id || seen.has(msg.id)) return;
    seen.add(msg.id);
    if (msg.type === 'reset') { tally = {}; save(TALLY_KEY, tally); }
    else if (msg.type === 'event_upsert') { storeEvent(msg.event); }
    else if (msg.type === 'event_delete') {
      custom = custom.filter(e => e.id !== msg.eventId); save(CUSTOM_KEY, custom); mergeCustom();
    }
    else {
      const t = tally[msg.eventId] || (tally[msg.eventId] = { going: 0, checkedIn: 0, recent: [] });
      if (msg.type === 'rsvp') t.going += 1 + (msg.guests || 0);
      if (msg.type === 'checkin') t.checkedIn++;
      t.recent.push({ name: msg.name || 'A member', at: msg.at, type: msg.type, src: msg.src || 'tv', guests: msg.guests || 0 });
      t.recent = t.recent.slice(-20);
      save(TALLY_KEY, tally);
    }
    listeners.forEach(fn => { try { fn(msg); } catch (e) {} });
  }

  // ── transports ──
  let bc = null;
  try { bc = new BroadcastChannel(V.channel); bc.onmessage = e => apply(e.data); } catch (e) {}

  function connect() {
    if (!window.supabase || !window.supabase.createClient) return;
    try {
      const client = window.supabase.createClient(SB, SK, { realtime: { params: { eventsPerSecond: 10 } } });
      channel = client.channel(V.channel, { config: { broadcast: { self: false, ack: false } } });
      channel.on('broadcast', { event: 'promote' }, ({ payload }) => apply(payload));
      channel.subscribe(status => {
        ready = status === 'SUBSCRIBED';
        if (ready) { queue.forEach(p => channel.send({ type: 'broadcast', event: 'promote', payload: p })); queue = []; }
      });
    } catch (e) { console.log('Realtime unavailable — same-device sync only'); }
  }
  connect();

  function send(type, eventId, name, extra) {
    const msg = Object.assign({ id: Math.random().toString(36).slice(2) + Date.now(), type, eventId, name, at: Date.now() }, extra || {});
    apply(msg);                                   // update this device immediately
    if (bc) try { bc.postMessage(msg); } catch (e) {}
    if (channel && ready) channel.send({ type: 'broadcast', event: 'promote', payload: msg });
    else queue.push(msg);
    return msg;
  }

  // ── helpers shared by all pages ──
  function eventById(id) { return window.CLUBOS_EVENTS.find(e => e.id === id); }
  function dateObj(ev) { return new Date(ev.date + 'T12:00:00'); }
  function fmtDay(ev, opts) {
    return dateObj(ev).toLocaleDateString('en-US', opts || { weekday: 'long', month: 'long', day: 'numeric' });
  }
  function relDay(ev, now) {
    now = now || new Date();
    const a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const b = dateObj(ev); const d = Math.round((new Date(b.getFullYear(), b.getMonth(), b.getDate()) - a) / 86400000);
    if (d === 0) return 'Tonight';
    if (d === 1) return 'Tomorrow';
    if (d > 1 && d < 7) return 'This ' + b.toLocaleDateString('en-US', { weekday: 'long' });
    return b.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
  function upcoming(now) {
    now = now || new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const list = window.CLUBOS_EVENTS.filter(e => dateObj(e) >= today).sort((a, b) => dateObj(a) - dateObj(b));
    return list.length ? list : window.CLUBOS_EVENTS.slice();   // demo never goes empty
  }
  // Staff-added events travel inside the QR link, so a phone that has
  // never seen the event can still open it.
  // Short keys and no description keep the QR code easy to scan.
  const PACK = { id: 'i', title: 't', category: 'c', date: 'd', start: 's', end: 'e', location: 'l', cap: 'p', theme: 'h' };
  function pack(ev) {
    const o = {}; Object.keys(PACK).forEach(k => { if (ev[k] !== undefined && ev[k] !== '') o[PACK[k]] = ev[k]; });
    return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function unpack(str) {
    try {
      const b = str.replace(/-/g, '+').replace(/_/g, '/');
      const o = JSON.parse(decodeURIComponent(escape(atob(b)))), ev = {};
      Object.keys(PACK).forEach(k => { if (o[PACK[k]] !== undefined) ev[k] = o[PACK[k]]; });
      return ev.id && ev.title && ev.date ? ev : null;
    } catch (e) { return null; }
  }
  function rsvpUrl(ev, extra) {
    const base = location.href.replace(/[^/]*(\?.*)?(#.*)?$/, '');
    return base + 'rsvp.html?e=' + encodeURIComponent(ev.id) + (extra || '') + (ev.custom ? '&d=' + pack(ev) : '');
  }
  function qrSvg(text, cell) {
    if (typeof qrcode !== 'function') return '';
    const q = qrcode(0, text.length > 160 ? 'L' : 'M'); q.addData(text); q.make();
    return q.createSvgTag({ cellSize: cell || 6, margin: 0, scalable: true });
  }
  function initials(name) { return (name || '?').replace(/^The\s+/i, '').split(/[\s&]+/).filter(Boolean).slice(0, 2).map(s => s[0]).join('').toUpperCase(); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  window.Promote = {
    stats, send, onMessage: fn => listeners.push(fn),
    reset: () => send('reset'),
    upsertEvent: ev => send('event_upsert', ev.id, null, { event: ev }),
    deleteEvent: id => send('event_delete', id),
    registerEvent: ev => storeEvent(ev),          // this device only (from a QR link)
    customEvents: () => custom.slice(),
    unpack,
    eventById, fmtDay, relDay, upcoming, rsvpUrl, qrSvg, initials, esc, load, save
  };
})();
