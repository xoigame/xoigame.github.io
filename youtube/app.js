(function () {
'use strict';

var PW_KEY = 'xg_yt_pw', TAB_KEY = 'xg_yt_tab';
var TABS = ['tongquan', 'tap', 'lich', 'viec'];

var CH_STAGE = {
  live: ['Đang chạy', 'accent'], created: ['Đã tạo kênh', 'soft'],
  preparing: ['Đang chuẩn bị', 'soft'], planning: ['Lên kế hoạch', '']
};
var EP_STAGE = {
  idea: ['Ý tưởng', ''], script: ['Kịch bản', 'soft'], building: ['Đang dựng', 'soft'],
  ready: ['Chờ đăng', 'orange'], scheduled: ['Đã lên lịch', 'soft'], published: ['Đã đăng', 'accent']
};
var EP_ORDER = ['published', 'scheduled', 'ready', 'building', 'script', 'idea'];

var state = { data: null, channelFilter: '', stageFilter: '', q: '', open: {} };

/* ---------- helpers ---------- */
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function safeUrl(u) { return /^https?:\/\//i.test(u || '') ? u : ''; }
function ext(url, text, cls) {
  var u = safeUrl(url);
  return u ? '<a' + (cls ? ' class="' + cls + '"' : '') + ' href="' + esc(u) + '" target="_blank" rel="noopener">' + text + '</a>' : '';
}
function chip(label, cls) { return '<span class="chip ' + (cls || '') + '">' + esc(label) + '</span>'; }
function pad(n) { return (n < 10 ? '0' : '') + n; }
function fmtDate(s) {
  var m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(s || '');
  if (!m) return s || '—';
  return m[3] + '/' + m[2] + '/' + m[1] + (m[4] ? ' ' + m[4] + ':' + m[5] : '');
}
function sameName(a, b) {
  var n = function (x) { return String(x || '').toLowerCase().replace(/^truyện\s+/, '').trim(); };
  return n(a) === n(b);
}
function stripTags(html) { return String(html || '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim(); }
function chById(d, id) {
  for (var i = 0; i < d.channels.length; i++) if (d.channels[i].id === id) return d.channels[i];
  return null;
}
function avatar(c, small) {
  var letter = esc((c.name || '?').trim().charAt(0).toUpperCase());
  return '<span class="av' + (small ? ' sm' : '') + '">' + letter +
    (c.avatar ? '<img src="' + esc(c.avatar) + '" alt="" loading="lazy">' : '') + '</span>';
}
function ytLink(id) { return 'https://youtu.be/' + encodeURIComponent(id); }

/* ---------- renderers (pure: data -> html string) ---------- */
function renderStats(d) {
  var t = d.totals || {};
  var items = [[t.live, 'Kênh đang chạy'], [t.published, 'Tập đã đăng'], [t.ready, 'Tập chờ đăng'], [t.episodes, 'Tổng tập']];
  return items.map(function (x) {
    return '<div class="stat"><b>' + esc(x[0] == null ? '—' : x[0]) + '</b><span>' + x[1] + '</span></div>';
  }).join('');
}

function renderChannel(c) {
  var st = CH_STAGE[c.stage] || [c.stage, ''];
  var counts = {};
  (c.episodes || []).forEach(function (e) { counts[e.stage] = (counts[e.stage] || 0) + 1; });
  var cnt = EP_ORDER.filter(function (k) { return counts[k]; })
    .map(function (k) { return chip(EP_STAGE[k][0] + ' ' + counts[k], EP_STAGE[k][1]); }).join('');
  var work = (c.working || []).map(function (w) {
    return '<div class="work-item"><div class="lbl">' + esc(w.label || w.episode) + '</div>' +
      '<div class="clamp">' + (w.step_html || '') + '</div>' +
      (w.next_html ? '<div class="next clamp"><strong>Tiếp: </strong>' + w.next_html + '</div>' : '') + '</div>';
  }).join('');
  var info = '';
  if (c.voice_html) info += '<div><b>Giọng</b>' + c.voice_html + '</div>';
  if (c.visuals_html) info += '<div><b>Hình</b>' + c.visuals_html + '</div>';
  if (c.pipeline_html) info += '<div><b>Pipeline</b>' + c.pipeline_html + '</div>';
  return '<article class="card" data-ch="' + esc(c.id) + '">' +
    '<div class="card-head">' + avatar(c) + '<div><h3>' + esc(c.name) + '</h3>' +
    '<div class="handle">' + (ext(c.youtube_url, esc(c.handle)) || esc(c.handle)) + '</div>' +
    (c.handle_note ? '<div class="handle-note">' + esc(c.handle_note) + '</div>' : '') + '</div></div>' +
    '<div class="meta">' + chip(st[0], st[1]) + (c.launch_wave ? chip('Đợt ra mắt ' + c.launch_wave, '') : '') +
    (c.code ? chip('Mã ' + c.code, '') : '') + '</div>' +
    (c.niche ? '<div class="muted small">' + esc(c.niche) + (c.length ? ' · ' + esc(c.length) : '') + '</div>' : '') +
    '<div class="sched"><span class="sched-lbl">Lịch: </span>' + (c.schedule_html || esc(c.schedule) || '—') + '</div>' +
    '<div class="meta">' + (cnt || '<span class="muted small">Chưa có tập</span>') + '</div>' +
    (work ? '<div class="work">' + work + '</div>' : '') +
    (info ? '<details><summary>Giọng · hình · pipeline</summary><div class="info">' + info + '</div></details>' : '') +
    '</article>';
}

function epFiles(e) {
  var f = e.files || {};
  var hasFinal = f.final && f.final.length;
  return '<span class="fl' + (hasFinal ? '' : ' no') + '">' + (hasFinal ? 'Bản cuối: có' : 'Bản cuối: chưa') + '</span>' +
    '<span class="fl' + (f.shorts ? '' : ' no') + '">' + (f.shorts || 0) + ' Shorts</span>' +
    '<span class="fl' + (f.thumbs ? '' : ' no') + '">' + (f.thumbs || 0) + ' thumbnail</span>' +
    '<span class="fl' + (f.srt ? '' : ' no') + '">SRT: ' + (f.srt ? 'có' : 'chưa') + '</span>';
}

function renderMetrics(m) {
  if (!m || typeof m !== 'object') return '<p class="muted">Chưa có số liệu.</p>';
  var periods = Object.keys(m).filter(function (k) { return m[k] && typeof m[k] === 'object'; });
  if (!periods.length) return '<p class="muted">Chưa có số liệu.</p>';
  var cols = [];
  periods.forEach(function (p) { Object.keys(m[p]).forEach(function (k) { if (cols.indexOf(k) < 0) cols.push(k); }); });
  var head = '<tr><th>Chỉ số</th>' + periods.map(function (p) { return '<th>' + esc(p === '7d' ? '7 ngày' : p === '24h' ? '24 giờ' : p) + '</th>'; }).join('') + '</tr>';
  var rows = cols.map(function (k) {
    return '<tr><th>' + esc(k) + '</th>' + periods.map(function (p) {
      var v = m[p][k]; return '<td>' + esc(v == null ? '—' : v) + '</td>';
    }).join('') + '</tr>';
  }).join('');
  return '<table class="mt">' + head + rows + '</table>';
}

function renderEpDetail(e) {
  var f = e.files || {};
  var h = '<div class="ep-detail">';
  h += '<div><h4>Trạng thái</h4>' + (e.status_html || '<span class="muted">—</span>') + '</div>';
  if (e.status_history && e.status_history.length)
    h += '<div><h4>Lịch sử</h4><ul>' + e.status_history.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>';
  h += '<div><h4>Thư mục</h4><code>' + esc(e.dir) + '</code></div>';
  if (f.final && f.final.length)
    h += '<div><h4>Bản cuối</h4><ul>' + f.final.map(function (x) { return '<li><code>' + esc(x) + '</code></li>'; }).join('') + '</ul></div>';
  if (f.shorts_files && f.shorts_files.length)
    h += '<div><h4>Shorts</h4><ul>' + f.shorts_files.map(function (x) { return '<li><code>' + esc(x) + '</code></li>'; }).join('') + '</ul></div>';
  if (e.links && e.links.length)
    h += '<div><h4>Liên kết YouTube</h4><ul>' + e.links.map(function (l) {
      return '<li>' + ext(ytLink(l.id), esc(l.short ? 'Short ' : 'Video ') + esc(l.id)) + '</li>';
    }).join('') + '</ul></div>';
  h += '<div><h4>Số liệu</h4>' + renderMetrics(e.metrics) + '</div>';
  return h + '</div>';
}

function matchEp(e, c) {
  if (state.channelFilter && c.id !== state.channelFilter) return false;
  if (state.stageFilter && e.stage !== state.stageFilter) return false;
  if (state.q) {
    var hay = (e.code + ' ' + e.title + ' ' + c.name).toLowerCase();
    if (hay.indexOf(state.q.toLowerCase()) < 0) return false;
  }
  return true;
}

function renderEpisodes(d) {
  var list = [];
  d.channels.forEach(function (c) {
    (c.episodes || []).forEach(function (e) { if (matchEp(e, c)) list.push({ e: e, c: c }); });
  });
  list.sort(function (a, b) {
    return (b.e.status_date || '').localeCompare(a.e.status_date || '') || a.e.code.localeCompare(b.e.code);
  });
  var html = list.map(function (x) {
    var e = x.e, c = x.c, st = EP_STAGE[e.stage] || [e.stage, ''];
    var open = !!state.open[e.code];
    return '<div class="ep"><button type="button" class="ep-row" data-ep="' + esc(e.code) + '" aria-expanded="' + open + '">' +
      '<div class="ep-top"><span class="ep-code">' + esc(e.code) + '</span>' + chip(st[0], st[1]) +
      '<span class="ep-ch">' + avatar(c, true) + esc(c.name) + '</span></div>' +
      '<div class="ep-title">' + esc(e.title) + '</div>' +
      '<div class="ep-sub"><span>' + esc(fmtDate(e.status_date)) + '</span>' + epFiles(e) +
      (safeUrl(e.video_url) ? ' <a class="yt" href="' + esc(e.video_url) + '" target="_blank" rel="noopener" data-stop="1">▶ YouTube</a>' : '') +
      '</div></button>' + (open ? renderEpDetail(e) : '') + '</div>';
  }).join('');
  return { html: html || '<p class="empty">Không có tập nào khớp bộ lọc.</p>', count: list.length };
}

/* weekday parsing: "Thứ 2".."Thứ 7", "Chủ nhật" -> 0..6 (Mon..Sun) */
function parseDays(s) {
  var out = [];
  String(s || '').split(/[·,\/]/).forEach(function (p) {
    p = p.trim();
    var m = /^Thứ\s*(\d)$/i.exec(p);
    if (m) out.push(Number(m[1]) - 2);
    else if (/^Chủ\s*nhật$/i.test(p)) out.push(6);
  });
  return out.filter(function (n) { return n >= 0 && n <= 6; });
}
var DAY_NAMES = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
function todayIdx() {
  try {
    var w = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Ho_Chi_Minh', weekday: 'short' });
    return { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }[w];
  } catch (e) { return (new Date().getDay() + 6) % 7; }
}

function renderWeek(d, today) {
  var cols = DAY_NAMES.map(function () { return []; });
  ((d.schedule && d.schedule.weekly) || []).forEach(function (w) {
    parseDays(w.day).forEach(function (i) { cols[i].push(w); });
  });
  return DAY_NAMES.map(function (name, i) {
    var slots = cols[i].map(function (w, k) {
      var chs = (w.channels || []).map(function (id) { return chById(d, id); }).filter(Boolean);
      var chips = chs.map(function (c) { return '<span class="chip soft">' + avatar(c, true) + esc(c.name) + '</span>'; }).join('');
      var note = '';
      if (!chs.length || chs.length > 1) note = w.label_html || '';
      else if (w.label_html && !sameName(stripTags(w.label_html), c0(chs).name)) note = w.label_html;
      return '<div class="slot' + (k === 0 ? ' first' : '') + '"><div class="slot-chips">' + chips +
        (w.time ? '<span class="chip accent">' + esc(w.time) + '</span>' : '') + '</div>' +
        (note ? '<div class="slot-note">' + note + '</div>' : '') + '</div>';
    }).join('');
    return '<div class="day' + (i === today ? ' today' : '') + '"><div class="day-h"><span>' + name + '</span>' +
      (i === today ? '<span class="chip accent">Hôm nay</span>' : '') + '</div>' +
      (slots || '<div class="day-empty">Không có lịch</div>') + '</div>';
  }).join('');
}
function c0(a) { return a[0]; }

function renderLaunch(d) {
  var l = (d.schedule && d.schedule.launch) || [];
  return l.map(function (w) {
    var c = chById(d, w.channel);
    return '<div class="wave"><div class="wave-h">' + chip('Đợt ' + w.wave, 'accent') + (c ? avatar(c, true) : '') +
      esc(w.channel_name || (c && c.name) || w.channel) + '</div>' +
      (w.reason_html ? '<div><span class="k">Lý do</span><br>' + w.reason_html + '</div>' : '') +
      (w.condition_html ? '<div><span class="k">Điều kiện</span><br>' + w.condition_html + '</div>' : '') + '</div>';
  }).join('') || '<p class="muted">Chưa có thứ tự ra mắt.</p>';
}

function renderTodo(d) {
  var chs = d.channels.slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  var html = chs.map(function (c) {
    if (!c.working || !c.working.length) return '';
    return '<div class="tgroup"><div class="tgroup-h">' + avatar(c, true) + '<h2>' + esc(c.name) + '</h2>' +
      chip((CH_STAGE[c.stage] || [c.stage])[0], (CH_STAGE[c.stage] || [0, ''])[1]) + '</div>' +
      c.working.map(function (w) {
        var links = (w.links || []).map(function (id) { return ext(ytLink(id), 'youtu.be/' + esc(id)); }).join(' · ');
        return '<div class="titem"><div class="titem-h"><span class="ep-code">' + esc(w.episode) + '</span><span>' +
          esc(String(w.label || '').replace(w.episode || '', '').trim() || w.label) + '</span></div>' +
          '<div><span class="k">Bước hiện tại</span><div class="cur">' + (w.step_html || '—') + '</div></div>' +
          '<div><span class="k">Tiếp theo</span><div class="nx">' + (w.next_html || '—') + '</div></div>' +
          (links ? '<div class="small">' + links + '</div>' : '') + '</div>';
      }).join('') + '</div>';
  }).join('');
  return html || '<p class="empty">Không có việc đang làm.</p>';
}

/* ---------- crypto ---------- */
function b64(s) {
  var bin = atob(s), a = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
  return a;
}
function decrypt(enc, pw) {
  var te = new TextEncoder();
  return crypto.subtle.importKey('raw', te.encode(pw), 'PBKDF2', false, ['deriveKey']).then(function (base) {
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', hash: 'SHA-256', salt: b64(enc.salt), iterations: enc.iter },
      base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  }).then(function (key) {
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(enc.iv) }, key, b64(enc.ct));
  }).then(function (buf) { return JSON.parse(new TextDecoder().decode(buf)); });
}

/* ---------- DOM wiring ---------- */
function $(id) { return document.getElementById(id); }
function store(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

function show(id) { ['gate', 'fatal', 'app'].forEach(function (x) { $(x).hidden = x !== id; }); }

function fetchJson(url) {
  return fetch(url, { cache: 'no-store' }).then(function (r) {
    if (!r.ok) return null;
    return r.json().catch(function () { return null; });
  }).catch(function () { return null; });
}

function fatal(msg) { $('fatal-msg').textContent = msg; show('fatal'); }

function boot() {
  fetchJson('data.json').then(function (d) {
    if (d && d.channels) return start(d, false);
    return fetchJson('data.enc.json').then(function (enc) {
      if (!enc || !enc.ct) return fatal('Không tìm thấy data.json hoặc data.enc.json cạnh trang này.');
      gate(enc);
    });
  });
}

function gate(enc) {
  show('gate');
  var form = $('gate-form'), msg = $('gate-msg'), btn = $('gate-btn');
  function attempt(pw, remember, auto) {
    msg.textContent = '';
    btn.disabled = true;
    if (!window.crypto || !crypto.subtle) {
      btn.disabled = false;
      msg.textContent = 'Trình duyệt không hỗ trợ giải mã (cần HTTPS hoặc localhost).';
      return;
    }
    decrypt(enc, pw).then(function (d) {
      if (remember) store(PW_KEY, pw);
      start(d, true);
    }, function () {
      btn.disabled = false;
      store(PW_KEY, null);
      msg.textContent = 'Sai mật khẩu';
      if (!auto) { $('gate-pw').value = ''; $('gate-pw').focus(); }
    });
  }
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    attempt($('gate-pw').value, $('gate-remember').checked, false);
  });
  var saved = load(PW_KEY);
  if (saved) attempt(saved, true, true);
}

function start(d, locked) {
  state.data = d;
  show('app');
  $('lock').hidden = !locked;
  $('lock').addEventListener('click', function () { store(PW_KEY, null); location.reload(); });
  $('ft-generated').textContent = fmtDate(d.generated);
  $('ft-working').textContent = fmtDate(d.working_updated);

  $('stats').innerHTML = renderStats(d);
  $('channels').innerHTML = d.channels.slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); }).map(renderChannel).join('');
  $('week').innerHTML = renderWeek(d, todayIdx());
  $('launch').innerHTML = renderLaunch(d);
  $('sched-updated').textContent = 'Lịch cập nhật: ' + fmtDate(d.schedule && d.schedule.updated);
  $('todo').innerHTML = renderTodo(d);

  var fc = $('f-channels');
  fc.innerHTML = '<button type="button" class="chip" data-f="">Tất cả</button>' + d.channels.map(function (c) {
    return '<button type="button" class="chip" data-f="' + esc(c.id) + '">' + esc(c.name) + '</button>';
  }).join('');
  $('f-stage').innerHTML = '<option value="">Mọi trạng thái</option>' + EP_ORDER.map(function (k) {
    return '<option value="' + k + '">' + EP_STAGE[k][0] + '</option>';
  }).join('');

  fc.addEventListener('click', function (ev) {
    var b = ev.target.closest('button[data-f]');
    if (!b) return;
    state.channelFilter = b.getAttribute('data-f');
    drawEpisodes();
  });
  $('f-stage').addEventListener('change', function () { state.stageFilter = this.value; drawEpisodes(); });
  $('f-search').addEventListener('input', function () { state.q = this.value.trim(); drawEpisodes(); });

  $('episodes').addEventListener('click', function (ev) {
    if (ev.target.closest('[data-stop]')) return;
    var b = ev.target.closest('[data-ep]');
    if (!b) return;
    var code = b.getAttribute('data-ep');
    state.open[code] = !state.open[code];
    drawEpisodes();
  });

  $('channels').addEventListener('click', function (ev) {
    if (ev.target.closest('a, button, details')) return;
    var card = ev.target.closest('.card');
    if (!card) return;
    state.channelFilter = card.getAttribute('data-ch');
    drawEpisodes();
    go('tap');
  });

  document.addEventListener('error', function (ev) {
    var t = ev.target;
    if (t && t.tagName === 'IMG' && t.parentNode && t.parentNode.classList.contains('av')) t.remove();
  }, true);

  window.addEventListener('hashchange', route);
  drawEpisodes();
  route();
}

function drawEpisodes() {
  var r = renderEpisodes(state.data);
  $('episodes').innerHTML = r.html;
  $('ep-count').textContent = r.count + ' tập';
  Array.prototype.forEach.call($('f-channels').children, function (b) {
    b.classList.toggle('on', b.getAttribute('data-f') === state.channelFilter);
  });
  $('f-stage').value = state.stageFilter;
}

function go(tab) { if (location.hash !== '#' + tab) location.hash = tab; else route(); }

function route() {
  var t = location.hash.replace('#', '');
  if (TABS.indexOf(t) < 0) { t = load(TAB_KEY); if (TABS.indexOf(t) < 0) t = 'tongquan'; }
  store(TAB_KEY, t);
  TABS.forEach(function (x) { $('tab-' + x).hidden = x !== t; });
  Array.prototype.forEach.call($('tabs').children, function (a) {
    var on = a.getAttribute('data-tab') === t;
    a.classList.toggle('on', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  window.scrollTo(0, 0);
}

if (typeof document !== 'undefined') {
  boot();
} else if (typeof module !== 'undefined') {
  module.exports = {
    state: state, renderStats: renderStats, renderChannel: renderChannel, renderEpisodes: renderEpisodes,
    renderWeek: renderWeek, renderLaunch: renderLaunch, renderTodo: renderTodo, parseDays: parseDays, fmtDate: fmtDate,
    decrypt: decrypt
  };
}
})();
