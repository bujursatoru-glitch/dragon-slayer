/* =====================================================================
   DRAGON SLAYER: THE LAST TEAR  |  story engine
   Visual-novel cutscenes, procedural anime pixel portraits, boss story hooks,
   story journal, NPC camp. Loaded after index.html's main script; it only
   wraps existing functions and never removes gameplay code.

   PERINTAH NASKAH
     @bg stage N | flash N | game | temple | stars | black
     @music key|none      @amb rain|wind|fire|none     @fx light|embers|snow|rain|leaves|dust|none
     @show id.expr [L|R]  @expr id expr   @hide L|R|all   @morph id.expr   @wings off
     @dim L|R value       @dissolve L|R   @shake [1-3]    @flash          @fade out|in [ms]
     @wait ms             @sfx name       @cry            @tint sepia|none
     @title BAB|Judul     @card teks      @rel npc +n     @flag nama
     @journal id  @lore id  @boss id  @meet id   @ending
   ===================================================================== */
(function () {
'use strict';
if (typeof G === 'undefined' || typeof UI === 'undefined' || typeof AU === 'undefined') { console.warn('[STORY] game core not found'); return; }
const D = window.STORY_DATA;
if (!D) { console.warn('[STORY] story-data.js not loaded'); return; }

const EXPR = ['normal', 'smile', 'angry', 'confused', 'fear', 'sad', 'cry', 'surprised', 'hurt', 'closed'];
const $q = s => document.querySelector(s);
const sleepMs = ms => new Promise(r => setTimeout(r, ms));

/* ---------------- save state ---------------- */
function S() {
  if (!SAVE.story || typeof SAVE.story !== 'object') SAVE.story = {};
  const s = SAVE.story;
  for (const k of ['seen', 'rel', 'talk', 'lore', 'jour', 'meet', 'boss', 'flags']) if (!s[k] || typeof s[k] !== 'object') s[k] = {};
  if (!Array.isArray(s.log)) s.log = [];
  return s;
}
const setv = (k, d) => (SAVE.set[k] === undefined ? d : SAVE.set[k]);

/* ---------------- text ---------------- */
const TXT = {
  id: { sec: 'Cerita', spd: 'Kecepatan teks', s0: 'Lambat', s1: 'Normal', s2: 'Cepat', s3: 'Instan', auto: 'Dialog otomatis: {v}', replay: 'Putar ulang cutscene yang sudah ditonton: {v}',
    camp: 'Perkemahan', book: 'Buku Cerita', talk: 'Bicara', newt: 'Cerita baru', locked: 'Belum ditemui', unlock: 'Terbuka setelah Bab {n}', wait: 'Menunggu partner menyelesaikan adegan...',
    upd: 'Buku Cerita diperbarui', skip: 'LEWATI', log: 'LOG', autob: 'AUTO', close: 'Tutup', replaybtn: 'Putar ulang kenangan', none: 'Belum ada catatan. Lanjutkan perjalanan.',
    rel: 'Kedekatan', cont: 'Lanjut', jour: 'Jurnal', chars: 'Karakter', boss: 'Kenangan Boss', lore: 'Lore', hist: 'Riwayat Dialog', ch: 'Bab {n}', camph: 'Orang-orang yang kau temui di perjalanan. Kembali ke sini setelah menyelesaikan bab baru.',
    nobody: 'Belum ada yang bisa diajak bicara. Selesaikan Bab I terlebih dulu.', allread: 'Sudah dibaca', past: 'Masa lalu', ded: 'Untuk semua yang pernah terlambat mengucapkan terima kasih.', tap: 'Ketuk untuk lanjut' },
  en: { sec: 'Story', spd: 'Text speed', s0: 'Slow', s1: 'Normal', s2: 'Fast', s3: 'Instant', auto: 'Auto dialogue: {v}', replay: 'Replay cutscenes already seen: {v}',
    camp: 'Camp', book: 'Story Book', talk: 'Talk', newt: 'New story', locked: 'Not met yet', unlock: 'Opens after Chapter {n}', wait: 'Waiting for your partner to finish the scene...',
    upd: 'Story Book updated', skip: 'SKIP', log: 'LOG', autob: 'AUTO', close: 'Close', replaybtn: 'Replay the memory', none: 'Nothing written yet. Keep travelling.',
    rel: 'Bond', cont: 'Continue', jour: 'Journal', chars: 'Characters', boss: 'Boss Memories', lore: 'Lore', hist: 'Dialogue Log', ch: 'Chapter {n}', camph: 'People you met on the road. Come back after each new chapter.',
    nobody: 'Nobody to talk to yet. Finish Chapter I first.', allread: 'Read', past: 'Past', ded: 'For everyone who said thank you too late.', tap: 'Tap to continue' }
};
const tt = (k, v) => { let s = (TXT[LANG] || TXT.id)[k]; if (s == null) s = TXT.id[k] || k; if (v) s = s.replace(/\{(\w+)\}/g, (m, n) => (v[n] != null ? v[n] : m)); return s; };
for (const l of ['id', 'en']) if (D.locale && D.locale[l] && LOC[l]) Object.assign(LOC[l], D.locale[l]);

/* =====================================================================
   PORTRAITS: procedural anime pixel art, 48x56, per expression, with
   blink / talk / hair-sway frames. External sheets override when present.
   ===================================================================== */
const PW = 48, PH = 56, PCACHE = new Map(), SHEETS = {};
const K = () => hex('#24182c');
const EXS = {
  normal:    { eye: 'open',   brow: 'flat',  mouth: 'neutral' },
  smile:     { eye: 'open',   brow: 'flat',  mouth: 'smile', blush: 1 },
  angry:     { eye: 'angry',  brow: 'angry', mouth: 'grit' },
  confused:  { eye: 'open',   brow: 'tilt',  mouth: 'wavy', sweat: 1 },
  fear:      { eye: 'wide',   brow: 'sad',   mouth: 'open', sweat: 1 },
  sad:       { eye: 'sad',    brow: 'sad',   mouth: 'frown', tear: 1 },
  cry:       { eye: 'cry',    brow: 'sad',   mouth: 'cry', tears: 1, blush: 1 },
  surprised: { eye: 'wide',   brow: 'up',    mouth: 'o' },
  hurt:      { eye: 'squint', brow: 'angry', mouth: 'grit', sweat: 1 },
  closed:    { eye: 'closed', brow: 'flat',  mouth: 'neutral' }
};
function charOf(id) { return D.chars[id] || D.chars.sam; }

function eyeDraw(p, x, y, side, kind, col, o) {
  const k = K(), W = hex('#ffffff'), I = hex(col), Id = mul(I, .55), Il = mul(I, 1.4);
  if (kind === 'closed' || kind === 'blink') { for (let i = -2; i <= 2; i++) p.set(x + i, y + 3, k); p.set(x + 3 * side, y + 2, k); return; }
  if (kind === 'cry') { p.set(x - 2, y + 2, k); p.set(x + 2, y + 2, k); for (let i = -1; i <= 1; i++) p.set(x + i, y + 3, k); p.set(x + 3 * side, y + 1, k); return; }
  let top = y, ih = 1;
  if (kind === 'wide') top = y - 1;
  if (kind === 'squint') top = y + 2;
  for (let j = top + 1; j <= y + 5; j++) for (let i = -2; i <= 2; i++) p.set(x + i, j, W);
  const iw = kind === 'wide' ? 0 : 1;
  for (let j = top + 1; j <= y + 5; j++) for (let i = -iw; i <= iw; i++) p.set(x + i, j, j <= top + 2 ? Id : (j === y + 5 ? Il : I));
  if (kind !== 'squint') p.set(x - iw, top + 2, W);
  for (let i = -2; i <= 2; i++) p.set(x + i, top, k);
  p.set(x + 3 * side, top + (kind === 'sad' ? 2 : 1), k);
  if (kind === 'angry') { p.set(x - 2 * side, top + 1, k); p.set(x - side, top + 1, k); }
  if (kind === 'sad') { p.set(x + 2 * side, top + 1, k); }
  p.set(x + 2 * side, y + 6, mul(k, 1.6));
  if (o && o.glow && kind !== 'squint') p.set(x, y + 4, Il);
}
/* brow helper with inner side handled explicitly (inner = toward the nose) */
function brow(p, ex, ey, side, kind, col) {
  const prof = { flat: [0, -1, -1, -1, 0], angry: [1, 1, 0, -1, -1], sad: [-1, -1, 0, 0, 1], up: [-1, -2, -2, -2, -1] }[kind] || [0, -1, -1, -1, 0];
  for (let i = 0; i < 5; i++) { const x = ex + (i - 2) * side; p.set(x, ey + prof[i], col); }
}
function mouthDraw(p, cx, my, kind, skin) {
  const k = mul(hex('#5a2030'), 1), R = hex('#c8506a'), Wt = hex('#ffffff'), lip = mixc(hex(skin), hex('#a04050'), .55);
  switch (kind) {
    case 'neutral': p.set(cx - 1, my, lip); p.set(cx, my, lip); p.set(cx + 1, my, lip); break;
    case 'smile': p.set(cx - 2, my - 1, k); p.set(cx - 1, my, k); p.set(cx, my, k); p.set(cx + 1, my, k); p.set(cx + 2, my - 1, k); break;
    case 'frown': p.set(cx - 2, my + 1, k); p.set(cx - 1, my, k); p.set(cx, my, k); p.set(cx + 1, my, k); p.set(cx + 2, my + 1, k); break;
    case 'wavy': p.set(cx - 2, my, k); p.set(cx - 1, my - 1, k); p.set(cx, my, k); p.set(cx + 1, my - 1, k); p.set(cx + 2, my, k); break;
    case 'o': p.rect(cx - 1, my - 1, 3, 3, k); p.set(cx, my, R); break;
    case 'open': p.rect(cx - 1, my, 3, 2, k); p.set(cx, my + 1, R); break;
    case 'grit': p.rect(cx - 2, my, 5, 2, Wt); p.line(cx - 2, my - 1, cx + 2, my - 1, k); p.line(cx - 2, my + 2, cx + 2, my + 2, k); p.set(cx, my, mul(Wt, .8)); break;
    case 'cry': p.rect(cx - 2, my, 5, 2, k); p.set(cx - 3, my + 1, k); p.set(cx + 3, my + 1, k); p.set(cx, my + 1, R); p.set(cx + 1, my + 1, R); break;
    case 'tA': p.rect(cx - 1, my, 3, 2, k); p.set(cx, my + 1, R); break;
    case 'tB': p.rect(cx - 2, my - 1, 5, 3, k); p.set(cx - 1, my + 1, R); p.set(cx, my + 1, R); p.set(cx + 1, my + 1, R); break;
    case 'tG': p.rect(cx - 2, my, 5, 2, Wt); p.line(cx - 2, my - 1, cx + 2, my - 1, k); p.line(cx - 2, my + 2, cx + 2, my + 2, k); p.rect(cx - 1, my + 1, 3, 1, k); break;
  }
}

function backHair(L, o, cx, hy, hr, sw, HR) {
  switch (o.style) {
    case 'long': L.poly([[cx - hr - 2, hy - 4], [cx - hr - 4 + sw, hy + 26], [cx - 4, hy + 22], [cx + 4, hy + 22], [cx + hr + 4 + sw, hy + 26], [cx + hr + 2, hy - 4]], HR); L.ell(cx, hy - 2, hr + 2, hr + 1, HR); break;
    case 'aurelia': L.poly([[cx - hr - 2, hy - 6], [cx - hr - 6 + sw, PH], [cx + hr + 6 + sw, PH], [cx + hr + 2, hy - 6]], HR); L.ell(cx, hy - 3, hr + 2, hr + 1, HR); break;
    case 'bun': L.ell(cx, hy - hr - 1, 5, 4, HR); L.ell(cx, hy - 2, hr + 1, hr, HR); break;
    case 'braid': case 'pigtails': case 'short': case 'spiky': L.ell(cx, hy - 2, hr + 1, hr, HR); break;
    case 'hood': L.poly([[cx - hr - 4, hy + 16], [cx - hr - 3, hy - 6], [cx, hy - hr - 5], [cx + hr + 3, hy - 6], [cx + hr + 4, hy + 16]], HR); break;
    case 'flame': L.ell(cx, hy - 2, hr + 1, hr, HR); break;
  }
}
function frontHair(p, o, cx, hy, hr, sw, HR, HRd) {
  const L = new PB(PW, PH);
  switch (o.style) {
    case 'spiky':
      L.ell(cx, hy - 6, hr + 1, 6, HR);
      L.poly([[cx - 9, hy - 6], [cx - 13, hy - 13], [cx - 5, hy - 10]], HR); L.poly([[cx - 5, hy - 10], [cx - 3, hy - 19], [cx + 1, hy - 11]], HR);
      L.poly([[cx + 1, hy - 11], [cx + 7, hy - 17], [cx + 6, hy - 9]], HR); L.poly([[cx + 6, hy - 9], [cx + 14, hy - 12], [cx + 10, hy - 3]], HR);
      for (const bx of [-8, -4, 0, 4, 8]) L.poly([[cx + bx - 2, hy - 6], [cx + bx + 2, hy - 6], [cx + bx + (bx < 0 ? -1 : 1), hy - 1]], HR);
      L.poly([[cx - hr - 1, hy - 5], [cx - hr + 2, hy - 5], [cx - hr, hy + 4]], HR); L.poly([[cx + hr + 1, hy - 5], [cx + hr - 2, hy - 5], [cx + hr, hy + 4]], HR);
      break;
    case 'long':
      L.ell(cx, hy - 6, hr + 1, 6, HR);
      L.poly([[cx - hr - 1, hy - 6], [cx + 4, hy - 8], [cx - 1, hy - 2], [cx - 6, hy + 1]], HR); L.poly([[cx + 3, hy - 6], [cx + hr + 1, hy - 5], [cx + hr - 1, hy - 1]], HR);
      L.rect(cx - hr - 1, hy - 4, 3, 14, HR); L.rect(cx + hr - 1, hy - 4, 3, 14, HR);
      L.poly([[cx - hr - 1, hy + 9], [cx - hr + 2, hy + 9], [cx - hr + sw, hy + 15]], HR); L.poly([[cx + hr - 1, hy + 9], [cx + hr + 2, hy + 9], [cx + hr + sw, hy + 15]], HR);
      break;
    case 'aurelia':
      L.ell(cx, hy - 6, hr + 1, 6, HR);
      L.poly([[cx, hy - 10], [cx - hr - 1, hy - 4], [cx - hr, hy + 2], [cx - 5, hy - 3], [cx - 2, hy - 5]], HR);
      L.poly([[cx, hy - 10], [cx + hr + 1, hy - 4], [cx + hr, hy + 2], [cx + 5, hy - 3], [cx + 2, hy - 5]], HR);
      L.rect(cx - hr - 1, hy - 2, 2, 24, HR); L.rect(cx + hr, hy - 2, 2, 24, HR);
      L.poly([[cx - hr - 1, hy + 21], [cx - hr + 1, hy + 21], [cx - hr + sw, hy + 30]], HR); L.poly([[cx + hr, hy + 21], [cx + hr + 2, hy + 21], [cx + hr + 1 + sw, hy + 30]], HR);
      break;
    case 'braid':
      L.ell(cx, hy - 6, hr + 1, 6, HR); L.poly([[cx - hr, hy - 6], [cx + 2, hy - 7], [cx - 4, hy - 1]], HR); L.poly([[cx + 1, hy - 7], [cx + hr, hy - 5], [cx + 6, hy - 2]], HR);
      L.rect(cx - hr - 1, hy - 3, 2, 8, HR);
      for (let i = 0; i < 6; i++) L.ell(cx + hr + 1 + (i > 2 ? 1 : 0) + (i === 5 ? sw : 0), hy + 2 + i * 4, 2.4, 2.2, i % 2 ? HRd : HR);
      break;
    case 'pigtails':
      L.ell(cx, hy - 6, hr + 1, 6, HR); L.rect(cx - hr, hy - 7, hr * 2 + 1, 4, HR);
      for (let x = cx - hr; x <= cx + hr; x += 3) L.set(x + 1, hy - 3, HR);
      L.ell(cx - hr - 4, hy + 4 + sw, 3.5, 7, HR); L.ell(cx + hr + 4, hy + 4 - sw, 3.5, 7, HR);
      break;
    case 'short':
      L.ell(cx, hy - 6, hr + 1, 6, HR);
      for (const [a, b, c2] of [[-10, -6, -6], [-6, -9, -2], [-2, -10, 2], [2, -9, 6], [6, -7, 10]]) L.poly([[cx + a, hy - 4], [cx + (a + c2) / 2, hy + b - 2], [cx + c2, hy - 4]], HR);
      L.rect(cx - hr - 1, hy - 4, 2, 5, HR); L.rect(cx + hr, hy - 4, 2, 5, HR);
      break;
    case 'bald':
      L.rect(cx - hr - 1, hy - 2, 3, 7, HR); L.rect(cx + hr - 1, hy - 2, 3, 7, HR);
      break;
    case 'bun':
      L.ell(cx, hy - 6, hr + 1, 6, HR); L.poly([[cx - hr - 1, hy - 5], [cx + 3, hy - 8], [cx - 3, hy - 2], [cx - hr, hy + 3]], HR); L.rect(cx + hr - 1, hy - 4, 2, 7, HR);
      break;
    case 'hood':
      L.poly([[cx - hr - 4, hy + 18], [cx - hr - 3, hy - 6], [cx - 6, hy - hr - 4], [cx + 6, hy - hr - 4], [cx + hr + 3, hy - 6], [cx + hr + 4, hy + 18], [cx + hr, hy + 18], [cx + hr - 1, hy - 4], [cx, hy - 8], [cx - hr + 1, hy - 4], [cx - hr, hy + 18]], HR);
      break;
    case 'goblin':
      for (const x of [-4, 0, 4]) L.poly([[cx + x - 1, hy - hr], [cx + x + 1, hy - hr], [cx + x + sw, hy - hr - 5]], HR);
      break;
    case 'flame': {
      const F1 = mat('#ff8a20', '#ffd060', '#c8401a'), F2 = hex('#fff0a0');
      for (const [x, h] of [[-9, 10], [-5, 16], [-1, 20], [3, 15], [7, 18], [10, 9]]) L.poly([[cx + x - 3, hy - 4], [cx + x + 3, hy - 4], [cx + x + (sw ? 1 : -1), hy - 4 - h]], F1);
      L.shade(); for (const x of [-5, -1, 3, 7]) L.line(cx + x, hy - 6, cx + x + (sw ? 1 : 0), hy - 12, F2);
      break; }
    case 'helm': {
      const ST = mat('#8a94a8', '#d8e0ee', '#4a5266');
      L.ell(cx, hy - 2, hr + 2, hr - 1, ST); L.rect(cx - hr - 2, hy - 2, hr * 2 + 5, 7, ST); L.poly([[cx - 1, hy - hr - 3], [cx + 1, hy - hr - 3], [cx, hy - hr - 9]], hex('#a8302a'));
      break; }
  }
  L.shade(); p.comp(L);
  if (o.style === 'helm') {
    const k = K(); p.line(cx - hr - 1, hy + 1, cx + hr + 2, hy + 1, k); p.line(cx + 2, hy - 7, cx - 3, hy + 5, k); p.line(cx - 3, hy + 5, cx - 1, hy + 9, k);
  }
}

function paintHuman(p, o, ex, blink, mouth, sw) {
  const E = EXS[ex] || EXS.normal, child = !!o.child, cx = 24, hy = child ? 24 : 22, hr = child ? 11 : 10;
  const SK = mat(o.skin), SKd = mul(hex(o.skin), .8), HR = mat(o.hair), HRd = mul(hex(o.hair), .7), CL = mat(o.cloth), CL2 = o.cloth2 ? hex(o.cloth2) : mul(hex(o.cloth), .7);
  const L = new PB(PW, PH);
  if (o.wings) { const W1 = hex('#d8ecff'), W2 = hex('#9ad0ff'), W3 = hex('#5ab0f0');
    for (const s of [-1, 1]) { L.poly([[cx + s * 6, 42], [cx + s * 22, 14 + sw], [cx + s * 24, 30], [cx + s * 17, 50]], W1); L.poly([[cx + s * 10, 42], [cx + s * 20, 22 + sw], [cx + s * 20, 38]], W2); L.line(cx + s * 7, 42, cx + s * 22, 15 + sw, W3); }
    p.comp(L); L.clear(); }
  backHair(L, o, cx, hy, hr, sw, HR); L.shade(); p.comp(L); L.clear();
  const sy = child ? 44 : 41;
  L.poly([[3, PH], [6, sy + 5], [14, sy], [34, sy], [42, sy + 5], [45, PH]], CL); L.shade(); p.comp(L); L.clear();
  if (o.style === 'aurelia') { p.poly([[cx - 6, sy], [cx + 6, sy], [cx, sy + 8]], hex(o.skin)); p.line(cx - 7, sy, cx, sy + 8, CL2); p.line(cx + 7, sy, cx, sy + 8, CL2); p.set(cx, sy + 9, hex('#9af0ff')); }
  else if (o.style === 'hood' || o.chains) { p.line(10, sy + 3, 38, sy + 3, hex('#8a8a98')); for (let x = 11; x < 38; x += 3) p.set(x, sy + 2, hex('#c8c8d8')); }
  else { p.poly([[cx - 4, sy], [cx + 4, sy], [cx, sy + 4]], SKd); p.line(cx - 5, sy, cx - 1, sy + 4, CL2); p.line(cx + 5, sy, cx + 1, sy + 4, CL2); }
  if (o.chains) { p.disc(cx, sy + 8, 2, hex('#ff3a2a')); p.set(cx, sy + 8, hex('#ffe060')); }
  p.rect(cx - 3, hy + hr - 1, 7, sy - (hy + hr) + 2, SKd);
  const gob = o.style === 'goblin';
  L.ell(cx, hy, hr + (gob ? 2 : 0), hr + (child ? 0 : 1), SK);
  if (!child) L.poly([[cx - hr + 1, hy + 2], [cx + hr - 1, hy + 2], [cx + 5, hy + hr + 1], [cx, hy + hr + 3], [cx - 5, hy + hr + 1]], SK);
  if (gob) { L.poly([[cx - hr - 1, hy - 2], [cx - hr - 11, hy - 7], [cx - hr - 1, hy + 3]], SK); L.poly([[cx + hr + 1, hy - 2], [cx + hr + 11, hy - 7], [cx + hr + 1, hy + 3]], SK); }
  else if (o.dragonEars) { const M = mat('#cfe6ff', '#ffffff', '#7aa8d8'); L.poly([[cx - hr + 1, hy - 1], [cx - hr - 6, hy - 6], [cx - hr - 4, hy + 1], [cx - hr - 1, hy + 4]], M); L.poly([[cx + hr - 1, hy - 1], [cx + hr + 6, hy - 6], [cx + hr + 4, hy + 1], [cx + hr + 1, hy + 4]], M); }
  else { L.rect(cx - hr - 1, hy, 2, 4, SK); L.rect(cx + hr, hy, 2, 4, SK); }
  L.shade(); p.comp(L); L.clear();
  if (o.stubble) for (let x = cx - 6; x <= cx + 6; x += 2) for (let y = hy + 5; y <= hy + hr + 1; y += 2) if (p.get(x, y) === hex(o.skin) || RAMP.get(SK) && RAMP.get(SK).includes(p.get(x, y))) p.set(x, y, mul(hex(o.skin), .82));
  if (o.style === 'hood') { for (let y = hy - hr; y < hy + 2; y++) for (let x = cx - hr; x <= cx + hr; x++) { const c = p.get(x, y); if (c) p.set(x, y, mul(c, .62)); } }
  frontHair(p, o, cx, hy, hr, sw, HR, HRd);
  const ey = hy - 1, ex1 = cx - 5, ex2 = cx + 5, bc = o.old ? hex('#f0ece8') : mul(hex(o.hair), .6);
  let eyeK = blink && !['closed', 'cry'].includes(ex) ? 'blink' : E.eye;
  if (o.style === 'helm') { eyeDraw(p, ex1, ey, -1, eyeK, o.eye, o); p.rect(ex2 - 3, ey + 2, 7, 2, hex('#0e0a14')); if (!blink) p.set(ex2, ey + 2, hex('#8ab0d8')); }
  else if (gob) { for (const [x, s] of [[ex1, -1], [ex2, 1]]) { if (eyeK === 'blink' || eyeK === 'closed') p.line(x - 2, ey + 3, x + 1, ey + 3, K()); else { p.rect(x - 2, ey + 2, 4, 3, hex('#ffe060')); p.rect(x - 1, ey + 2, 2, 3, hex('#1a1008')); } brow(p, x, ey + (E.brow === 'angry' ? 1 : 0), s, E.brow, K()); } }
  else { eyeDraw(p, ex1, ey, -1, eyeK, o.eye, o); eyeDraw(p, ex2, ey, 1, eyeK, o.eye, o);
    const bt = E.brow === 'tilt' ? ['flat', 'up'] : [E.brow, E.brow]; brow(p, ex1, ey - 2, -1, bt[0], bc); brow(p, ex2, ey - 2, 1, bt[1], bc); }
  p.set(cx, hy + 4, mul(hex(o.skin), .78));
  const my = hy + (child ? 7 : 8);
  let mk = E.mouth;
  if (mouth === 1) mk = E.mouth === 'grit' ? 'tG' : 'tA'; else if (mouth === 2) mk = E.mouth === 'grit' ? 'tG' : 'tB';
  if (o.beard) { const Bd = o.old ? mat('#f0ece8', '#ffffff', '#b8b0a8') : mat('#8a8a90', '#b8b8c0', '#5a5a60'); const Lb = new PB(PW, PH); Lb.poly([[cx - hr + 1, hy + 3], [cx - 6, hy + hr + 6], [cx, hy + hr + (o.old ? 12 : 6)], [cx + 6, hy + hr + 6], [cx + hr - 1, hy + 3], [cx + 4, my + 2], [cx - 4, my + 2]], Bd); Lb.poly([[cx - 5, my - 1], [cx, my - 2], [cx + 5, my - 1], [cx + 3, my + 1], [cx - 3, my + 1]], Bd); Lb.shade(); p.comp(Lb); }
  mouthDraw(p, cx, my, mk, o.skin);
  if (gob && o.tusks) { p.poly([[cx - 4, my + 1], [cx - 3, my + 1], [cx - 4, my - 3]], hex('#fff4dc')); p.poly([[cx + 3, my + 1], [cx + 4, my + 1], [cx + 4, my - 3]], hex('#fff4dc')); }
  if (o.paint) { const R = hex('#c8302a'); p.line(cx - 9, hy + 2, cx - 6, hy + 4, R); p.line(cx + 6, hy + 4, cx + 9, hy + 2, R); }
  if (E.blush) { const P = mixc(hex(o.skin), hex('#ff6a8a'), .45); for (const x of [cx - 8, cx - 7, cx + 7, cx + 8]) p.set(x, hy + 5, P); }
  if (o.freckles) for (const [x, y] of [[cx - 7, hy + 4], [cx - 5, hy + 5], [cx + 5, hy + 5], [cx + 7, hy + 4]]) p.set(x, y, mul(hex(o.skin), .7));
  const TR = hex('#9ae8ff');
  if (E.tears) for (const [x, s] of [[ex1, -1], [ex2, 1]]) { for (let j = 0; j < 7; j++) p.set(x + s * 2 + (j > 4 ? s : 0), ey + 5 + j, TR); p.set(x + s * 3, ey + 13, hex('#ffffff')); }
  if (E.tear) p.set(ex2 + 2, ey + 6, TR);
  if (E.sweat) { p.rect(cx + hr - 2, hy - 7, 2, 3, hex('#bfe8ff')); p.set(cx + hr - 2, hy - 8, hex('#bfe8ff')); }
  if (o.scar) { const sc = hex('#a85a5a'); p.line(ex1 - 2, ey - 3, ex1 + 2, ey + 7, sc); }
  if (o.glasses) { const g = hex('#c8a040'); for (const x of [ex1, ex2]) { for (let a = 0; a < TAU; a += .3) p.set(x + Math.round(Math.cos(a) * 3.4), ey + 3 + Math.round(Math.sin(a) * 3.4), g); p.set(x - 1, ey + 1, hex('#ffffff')); } p.line(ex1 + 3, ey + 3, ex2 - 3, ey + 3, g); }
  if (o.old) { const w = mul(hex(o.skin), .78); p.set(ex1 - 4, ey + 4, w); p.set(ex2 + 4, ey + 4, w); p.set(cx - 3, hy - 7, w); p.set(cx + 3, hy - 7, w); }
  if (o.band) { const B = mat(o.band, '#ff7a6a', '#8a1c1c'); const Lb = new PB(PW, PH); Lb.rect(cx - hr - 1, hy - 7, hr * 2 + 3, 2, B); Lb.poly([[cx + hr + 1, hy - 7], [cx + hr + 8, hy - 9 + sw], [cx + hr + 7, hy - 6 + sw], [cx + hr + 1, hy - 5]], B); Lb.shade(); p.comp(Lb); p.set(cx - 1, hy - 7, hex('#e8e8f0')); p.set(cx, hy - 7, hex('#e8e8f0')); }
  if (o.horns) { const Hn = mat('#eef2ff', '#ffffff', '#8a9ac8'), Lh = new PB(PW, PH); Lh.poly([[cx - 6, hy - 9], [cx - 9, hy - 15], [cx - 12, hy - 18], [cx - 10, hy - 14], [cx - 8, hy - 9]], Hn); Lh.poly([[cx + 6, hy - 9], [cx + 9, hy - 15], [cx + 12, hy - 18], [cx + 10, hy - 14], [cx + 8, hy - 9]], Hn); Lh.shade(); p.comp(Lh); p.set(cx - 12, hy - 18, hex('#7ad8ff')); p.set(cx + 12, hy - 18, hex('#7ad8ff')); p.set(cx + 7, hy - 6, hex('#9af0ff')); p.set(cx + 6, hy - 6, hex('#ffffff')); }
  if (o.sigil) { const R = hex('#ff3a2a'); p.set(cx, hy - 7, R); p.set(cx - 1, hy - 6, R); p.set(cx + 1, hy - 6, R); p.set(cx, hy - 5, R); p.set(cx, hy - 6, hex('#ffd060')); }
  if (o.pet) { const Ps = mat('#c8d4f0', '#ffffff', '#7a88b8'), Lp = new PB(PW, PH); Lp.ell(40, sy - 2, 4, 3, Ps); Lp.poly([[37, sy - 4], [35, sy - 9], [39, sy - 5]], Ps); Lp.poly([[43, sy - 4], [46, sy - 7], [44, sy - 2]], Ps); Lp.shade(); p.comp(Lp); p.set(38, sy - 3, blink ? K() : hex('#4ab0e0')); p.set(36, sy - 1, hex('#ff9aa8')); }
}

function paintDragon(p, o, ex, blink, mouth, sw) {
  const S1 = mat('#a8b8e0', '#e8f0ff', '#5a6a98'), S2 = mat('#e4ecfa', '#ffffff', '#9aa8cc'), HN = mat('#f2f4ff', '#ffffff', '#8a9ac8'), MN = mat('#d8e4ff', '#ffffff', '#8a9ad0'), L = new PB(PW, PH);
  const E = EXS[ex] || EXS.normal, jaw = mouth ? (mouth === 2 ? 3 : 2) : (ex === 'angry' || ex === 'surprised' || ex === 'hurt' ? 2 : 0);
  for (const f of [[[34, 12], [46, 7 + sw], [40, 16]], [[36, 17], [47, 15 + sw], [41, 22]], [[37, 22], [46, 25 + sw], [40, 27]], [[36, 27], [44, 34 + sw], [38, 31]]]) L.poly(f, MN);
  L.poly([[28, 56], [29, 40], [30, 30], [36, 25], [42, 25], [47, 31], [47, 56]], S1);
  L.poly([[31, 12], [43, 3], [47, 1], [43, 6], [34, 14]], HN); L.poly([[26, 12], [33, 5], [36, 4], [33, 8], [28, 14]], HN);
  L.poly([[37, 15], [29, 10], [18, 12], [9, 16], [3, 19], [2, 22], [8, 24], [18, 25], [30, 27], [38, 26], [40, 20]], S1);
  L.poly([[6, 24 + jaw], [18, 26 + jaw], [30, 28], [36, 28], [28, 31 + jaw], [14, 29 + jaw], [6, 26 + jaw]], S2);
  L.poly([[31, 56], [32, 44], [35, 37], [38, 35], [36, 45], [35, 56]], S2);
  L.shade(); p.comp(L);
  const k = K(), dk = hex('#3a4a78'), wh = hex('#ffffff'), ey = hex(o.eye || '#4ac8ff');
  p.set(5, 20, k); p.set(6, 20, dk);
  for (const [x, y] of [[14, 15], [19, 13], [24, 12], [17, 18], [33, 22], [37, 33], [41, 38], [39, 45]]) p.set(x, y, mul(hex('#a8b8e0'), 1.35));
  p.set(22, 13, hex('#9af0ff')); p.set(21, 13, wh);
  if (jaw) { p.line(8, 25, 26, 27, hex('#2a1a3a')); for (let x = 9; x < 25; x += 3) p.set(x, 25, wh); }
  const fr = hex('#bfe0ff'); p.line(8, 25 + jaw, 5, 31 + jaw, fr); p.line(5, 31 + jaw, 4 + sw, 36 + jaw, fr); p.line(13, 27 + jaw, 11, 34 + jaw, fr);
  const eye = blink && ex !== 'closed' ? 'blink' : E.eye, cx = 27, cy = 18;
  if (eye === 'blink' || eye === 'closed') { p.line(cx - 3, cy + 1, cx + 3, cy + 1, k); p.set(cx + 4, cy, k); }
  else if (eye === 'cry') { p.set(cx - 3, cy, k); p.line(cx - 2, cy + 1, cx + 2, cy + 1, k); p.set(cx + 3, cy, k); }
  else { const h = eye === 'wide' ? 4 : eye === 'squint' ? 1 : eye === 'sad' ? 2 : 3, top = cy + 2 - h;
    for (let j = 0; j < h; j++) for (let i = -3; i <= 3; i++) if (!(j === 0 && Math.abs(i) === 3)) p.set(cx + i, cy + 1 - j, j === h - 1 ? mul(ey, .7) : ey);
    if (h > 1) { p.set(cx, cy + 1 - (h >> 1), hex('#0e2040')); p.set(cx, cy - (h >> 1), hex('#0e2040')); p.set(cx - 2, top + 1, wh); }
    p.line(cx - 4, top, cx + 3, top - 1, k); p.set(cx + 4, top, k); p.line(cx - 3, cy + 2, cx + 2, cy + 2, dk); }
  if (E.brow === 'sad') p.line(cx - 5, cy - 3, cx + 3, cy - 1, dk);
  else if (E.brow === 'angry') p.line(cx - 5, cy - 1, cx + 3, cy - 4, dk);
  else p.line(cx - 4, cy - 3, cx + 3, cy - 3, dk);
  if (E.tear || E.tears) { const n = E.tears ? 9 : 4; for (let j = 0; j < n; j++) p.set(cx - 3 - (j > 5 ? 1 : 0), cy + 3 + j, hex('#9ae8ff')); p.set(cx - 4, cy + 3 + n, wh); }
  if (ex === 'hurt') { const r = hex('#c85a7a'); p.line(14, 27, 22, 19, r); p.line(17, 28, 24, 21, r); }
  p.set(36, 34, hex('#9af0ff')); p.set(35, 37, wh);
}
function paintSpider(p, o, ex, blink, mouth) {
  const C = mat('#3a2a48', '#6a5a80', '#1a1224'), L = new PB(PW, PH);
  L.ell(24, 26, 16, 14, C); L.ell(24, 46, 20, 10, C);
  for (const s of [-1, 1]) { L.poly([[24 + s * 10, 18], [24 + s * 22, 6], [24 + s * 20, 16]], C); L.poly([[24 + s * 12, 30], [24 + s * 24, 24], [24 + s * 22, 34]], C); }
  L.shade(); p.comp(L);
  const E = EXS[ex] || EXS.normal, r = E.eye === 'wide' ? 2 : E.eye === 'squint' || blink ? 0 : 1, R = hex(ex === 'sad' || ex === 'cry' ? '#c88aff' : '#ff3a4a');
  for (const [x, y, big] of [[19, 22, 1], [29, 22, 1], [15, 26, 0], [33, 26, 0], [21, 17, 0], [27, 17, 0], [17, 30, 0], [31, 30, 0]]) { if (blink || E.eye === 'closed') p.line(x - 1, y, x + 1, y, R); else { p.disc(x, y, big ? r + 1 : r, R); p.set(x - 1, y - 1, hex('#ffffff')); } }
  const m = mouth || (ex === 'angry' ? 1 : 0), F = hex('#c8b0a0');
  p.poly([[20, 34], [22, 40 + m * 2], [23, 34]], F); p.poly([[28, 34], [26, 40 + m * 2], [25, 34]], F);
  if (E.tears) for (let j = 0; j < 6; j++) { p.set(19, 25 + j, hex('#c88aff')); p.set(29, 25 + j, hex('#c88aff')); }
}
function paintGolem(p, o, ex, blink, mouth) {
  const I1 = mat('#8ad8f0', '#e8fbff', '#3a7aa8'), I2 = mat('#c8f0ff', '#ffffff', '#6aaad0'), L = new PB(PW, PH);
  L.poly([[8, 56], [10, 40], [18, 36], [30, 36], [38, 40], [40, 56]], I1);
  L.poly([[12, 12], [20, 4], [32, 6], [38, 14], [38, 30], [30, 38], [18, 38], [10, 30]], I2);
  L.poly([[12, 12], [6, 4], [16, 8]], I1); L.poly([[36, 12], [44, 2], [34, 8]], I1);
  L.shade(); p.comp(L);
  const E = EXS[ex] || EXS.normal, G2 = hex('#5af0ff'), k = hex('#123a5a');
  for (const x of [18, 30]) { if (blink || E.eye === 'closed' || E.eye === 'cry') p.line(x - 3, 21, x + 3, 21, G2); else { const h = E.eye === 'wide' ? 3 : E.eye === 'squint' ? 1 : 2; p.rect(x - 3, 21 - (h >> 1), 7, h, G2); p.set(x, 21, hex('#ffffff')); } }
  if (E.brow === 'angry') { p.line(14, 16, 21, 18, k); p.line(34, 16, 27, 18, k); }
  if (E.brow === 'sad') { p.line(14, 18, 21, 16, k); p.line(34, 18, 27, 16, k); }
  const m = mouth || (ex === 'surprised' ? 2 : 0); p.rect(20, 30, 9, 1 + m, k);
  if (ex === 'hurt' || ex === 'sad' || ex === 'cry') { p.line(26, 6, 22, 16, hex('#ffffff')); p.line(22, 16, 25, 24, hex('#ffffff')); }
  if (E.tears) for (let j = 0; j < 8; j++) { p.set(17, 23 + j, G2); p.set(31, 23 + j, G2); }
}
function frameOf(id, ex, blink, mouth, sw) {
  const C = charOf(id); if (!EXS[ex]) ex = 'normal';
  const key = id + '|' + ex + '|' + (blink ? 1 : 0) + '|' + (mouth | 0) + '|' + (sw | 0);
  let c = PCACHE.get(key); if (c) return c;
  const sh = SHEETS[C.same || id];
  if (sh && sh.ok) { c = mkCanvas(sh.fw, sh.fh); const col = mouth ? 1 + mouth : blink ? 1 : 0; ctx2d(c).drawImage(sh.img, col * sh.fw, Math.max(0, EXPR.indexOf(ex)) * sh.fh, sh.fw, sh.fh, 0, 0, sh.fw, sh.fh); }
  else {
    const p = new PB(PW, PH), o = C.look || {};
    try { if (C.paint === 'dragon') paintDragon(p, o, ex, blink, mouth, sw); else if (C.paint === 'spider') paintSpider(p, o, ex, blink, mouth); else if (C.paint === 'golem') paintGolem(p, o, ex, blink, mouth); else paintHuman(p, o, ex, blink, mouth, sw); } catch (e) { console.warn('[STORY] portrait', id, e); }
    p.outline(OUTL); c = p.toCanvas();
  }
  if (PCACHE.size > 600) PCACHE.clear();
  PCACHE.set(key, c); return c;
}
const swayStyle = id => { const o = charOf(id).look || {}; return o.style === 'flame' ? 160 : ['long', 'aurelia', 'braid', 'pigtails'].includes(o.style) || o.band || o.wings ? 760 : 0; };
function portraitURL2(id, ex) { const k = '_u' + id + (ex || 'normal'); if (!PCACHE.has(k)) PCACHE.set(k, frameOf(id, ex || 'normal', 0, 0, 0).toDataURL()); return PCACHE.get(k); }
/* optional external portrait sheets */
for (const id in (D.assets || {})) { const a = D.assets[id]; if (!a || !a.src || !/^https?:$/.test(location.protocol)) continue; const im = new Image(); SHEETS[id] = { img: im, fw: a.fw || 48, fh: a.fh || 56, ok: false }; im.onload = () => { SHEETS[id].ok = true; PCACHE.clear(); }; im.src = a.src; }

/* =====================================================================
   MUSIC (same compact format as the game's SONGS table) + ambience + sfx
   ===================================================================== */
const Q = '................', E3 = [Q, Q, Q];
Object.assign(SONGS, {
  sorrow: { bpm: 70, root: 57, scale: SC.min, prog: [0, 5, 2, 6, 0, 5, 3, 4], lead: ['2-------1---0---', '0-----------2---', '4-------3---2---', '1-----------0---', '2-------3---4---', '3-----2-----1---', '2-----------1---', '0---------------'], bass: '0.......0.......', arp: 4, dr: E3, lw: 'triangle', lv: .11, l2: 1 },
  aurelia: { bpm: 84, root: 62, scale: SC.dor, prog: [0, 4, 5, 3, 0, 4, 3, 4], lead: ['4---3---2-------', '3---2---1---2---', '0---1---2---4---', '3---------------', '4---5---4---3---', '2---3---4-------', '2---1---0---1---', '2---------------'], bass: '0.......2.......', arp: 2, dr: E3, lw: 'triangle', lv: .1, l2: 1 },
  memory: { bpm: 96, root: 72, scale: SC.maj, prog: [0, 5, 3, 4, 0, 5, 3, 0], lead: ['4-3-2---0---2---', '1-2-3---4-------', '2-1-0---1---2---', '3---------------', '4-3-2---0---2---', '1-2-3---4---5---', '4-3-2---1---0---', '0---------------'], bass: '0...............', arp: 2, dr: E3, lw: 'sine', lv: .09 },
  mystery: { bpm: 76, root: 57, scale: SC.phr, prog: [0, 1, 0, 1, 3, 1, 0, 0], lead: ['0-------1-------', '2-----------1---', '0-------a-------', '1---------------', '3-------2---1---', '2-----------1---', '0---1---0---a---', '0---------------'], bass: '0.......0.......', arp: 4, dr: ['x...............', Q, Q], lw: 'triangle', lv: .1, lo: 2 },
  camp: { bpm: 100, root: 60, scale: SC.maj, prog: [0, 3, 4, 0, 5, 3, 4, 0], lead: ['2-1-0---2-3-4---', '3---2---1-------', '2-3-4---3-2-1---', '0---------------', '4-3-2---3-4-5---', '4---3---2-------', '1-2-3---2-1-0---', '0---------------'], bass: '0...2...0...2...', arp: 2, dr: ['x.......x.......', '....x.......x...', Q], lw: 'triangle', lv: .1 },
  lastdragon: { bpm: 140, root: 50, scale: SC.har, prog: [0, 5, 3, 4, 0, 5, 6, 4], lead: ['4---3---2-------', '3---2---1---0---', '2---3---4---5---', '4---------------', '4---5---6---5---', '4---3---2---1---', '2---3---4---3---', '2---------------'], bass: '0.0.0.0.2.2.2.2.', arp: 1, dr: ['x.......x.......', '....x.......x...', 'x.x.x.x.x.x.x.x.'], lw: 'triangle', lv: .11, l2: 1 },
  boss_grukk: { bpm: 158, root: 55, scale: SC.min, prog: [0, 0, 3, 4, 0, 0, 5, 4], lead: ['0-0-2-0-3-2-0---', '0-0-2-0-4-3-2---', '3-3-2-3-4-3-2---', '1-0-a-0---------', '0-0-2-0-3-2-0---', '4-4-3-4-5-4-3---', '2-3-4-3-2-1-0---', '0---------------'], bass: '0.0.0.2.0.0.3.2.', arp: 1, dr: ['x.x.x...x.x.x...', '....x.......x...', 'x.x.x.x.x.x.x.x.'], lw: 'sawtooth', lv: .07 },
  boss_arachne: { bpm: 146, root: 56, scale: SC.phr, prog: [0, 1, 0, 3, 0, 1, 4, 0], lead: ['0-1-0-1-2-1-0---', '0-1-0-1-3-2-1---', '2-3-2-3-4-3-2---', '1-0-1-a-0-------', '0-1-0-1-2-1-0---', '3-4-3-4-5-4-3---', '2-1-2-1-0-a-0---', '0---------------'], bass: '0..0..0.0..0..1.', arp: 1, dr: ['x..x..x.x..x..x.', '....x.......x...', '..x...x...x...x.'], lw: 'square', lv: .07 },
  boss_ignis: { bpm: 174, root: 57, scale: SC.har, prog: [0, 0, 5, 6, 0, 0, 3, 4], lead: ['0-1-2-3-4-3-2-1-', '0---d---0-------', '2-3-4-5-6-5-4-3-', '2---1---d-------', '0-1-2-3-4-3-2-1-', '4---3---2---1---', '2-3-4-3-2-1-0-d-', '0---------------'], bass: '0.0.0.0.0.0.2.0.', arp: 1, dr: ['x..x..x.x..x..x.', '....x.......x.x.', 'x.x.x.x.x.x.x.x.'], lw: 'sawtooth', lv: .07, l2: 1 },
  boss_glacius: { bpm: 132, root: 59, scale: SC.dor, prog: [0, 3, 0, 4, 5, 3, 4, 0], lead: ['2---3---4---3---', '1---2---3-2-1---', '4---5---4---3---', '2---------------', '4---3---2---3---', '5---4---3---2---', '3---2---1---2---', '0---------------'], bass: '0...0...2...2...', arp: 2, dr: ['x.......x.......', '....x.......x...', '..x...x...x...x.'], lw: 'triangle', lv: .1, lo: 2 },
  boss_malgrim: { bpm: 124, root: 53, scale: SC.har, prog: [0, 3, 4, 0, 5, 3, 4, 4], lead: ['0-------2---1---', '3-------2---1---', '0---1---2---3---', '4---------------', '4-------3---2---', '1-------0---d---', '0---2---3---4---', '0---------------'], bass: '0.......0...0...', arp: 2, dr: ['x.......x.......', '....x.......x...', Q], lw: 'square', lv: .07, l2: 1 }
});
const BOSS_SONG = { grukk: 'boss_grukk', arachne: 'boss_arachne', ignis: 'boss_ignis', glacius: 'boss_glacius', malgrim: 'boss_malgrim', dravok: 'lastdragon' };

const SFX = {
  tone(...a) { try { AU.tone(...a.slice(0, 6), AU.sg); } catch (e) {} },
  noise(...a) { try { AU.noise(...a.slice(0, 7), AU.sg); } catch (e) {} },
  blip(f, w) { if (!AU.ctx) return; const v = f * (0.92 + Math.random() * 0.16); this.tone(w || 'square', v, v * 1.03, .045, .035, 0); },
  sob() { if (!AU.ctx) return; for (let i = 0; i < 3; i++) { this.noise(.22, .22, 'bandpass', 900, 600, 2.4, i * .32); this.tone('sine', 320 - i * 20, 230 - i * 20, .26, .12, i * .32); } this.noise(.6, .12, 'lowpass', 600, 300, 1, 1.05); },
  sparkle() { if (!AU.ctx) return; [1568, 2093, 2637, 3136].forEach((f, i) => this.tone('sine', f, f, .4, .05, i * .07)); },
  play(n) { if (n === 'sparkle') return this.sparkle(); if (n === 'cry') return this.sob(); try { AU.sfx(n); } catch (e) {} }
};
const AMB = {
  cur: null, nodes: [],
  set(kind) {
    if (kind === this.cur) return; this.stop(); this.cur = kind; if (!kind || kind === 'none' || !AU.ctx || !AU.nb) return;
    const c = AU.ctx, mk = (ft, f, q, v) => { const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(); s.buffer = AU.nb; s.loop = true; fl.type = ft; fl.frequency.value = f; fl.Q.value = q; g.gain.value = 0; g.gain.linearRampToValueAtTime(v, c.currentTime + 1.2); s.connect(fl); fl.connect(g); g.connect(AU.sg); s.start(); this.nodes.push({ s, g, fl }); return { s, g, fl }; };
    if (kind === 'rain') { mk('highpass', 3200, .5, .05); mk('bandpass', 900, .7, .03); }
    if (kind === 'wind') { const w = mk('lowpass', 420, 1.2, .06); const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = .13; lg.gain.value = 260; lfo.connect(lg); lg.connect(w.fl.frequency); lfo.start(); this.nodes.push({ s: lfo }); }
    if (kind === 'fire') { mk('lowpass', 260, 1, .07); this.crack = setInterval(() => { if (Math.random() < .55) SFX.noise(.03, .12, 'highpass', 2400, 2400, 1, Math.random() * .2); }, 180); }
  },
  stop() { for (const n of this.nodes) { try { if (n.g) { n.g.gain.cancelScheduledValues(AU.ctx.currentTime); n.g.gain.linearRampToValueAtTime(0, AU.ctx.currentTime + .6); } setTimeout(() => { try { n.s.stop(); } catch (e) {} }, 700); } catch (e) {} } this.nodes = []; clearInterval(this.crack); this.cur = null; }
};

/* =====================================================================
   VISUAL NOVEL OVERLAY
   ===================================================================== */
const css = `
#vn{position:fixed;inset:0;z-index:60;display:none;user-select:none;-webkit-user-select:none;color:#f4ecff;touch-action:manipulation;overflow:hidden;font-family:inherit}
#vn.on{display:block}
#vn .vbg{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;filter:var(--sep)}
#vn.gamebg .vbg{opacity:0}
#vn .veil{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 42%,rgba(10,6,22,.05) 30%,rgba(10,6,22,.72) 100%)}
#vn.gamebg .veil{background:radial-gradient(ellipse at 50% 42%,rgba(10,6,22,.35) 20%,rgba(10,6,22,.85) 100%)}
#vn .vfx{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;image-rendering:pixelated}
#vn .vs{position:absolute;bottom:calc(9vh + env(safe-area-inset-bottom,0px));height:76vh;aspect-ratio:48/56;opacity:0;transition:opacity .35s,transform .35s,filter .35s;filter:var(--sep) brightness(var(--b,1));pointer-events:none}
#vn .vs.L{left:max(2vw,env(safe-area-inset-left,0px));transform:translateX(-6%)}
#vn .vs.R{right:max(2vw,env(safe-area-inset-right,0px));transform:translateX(6%)}
#vn .vs.in{opacity:var(--o,1);transform:none}
#vn .vs.dim{--b:.5}
#vn .vs.glow canvas{filter:drop-shadow(0 0 6px rgba(140,220,255,.75))}
#vn .vs canvas{width:100%;height:100%;image-rendering:pixelated;animation:vnBreath 3.6s ease-in-out infinite;transform-origin:50% 100%}
#vn .vs.pop canvas{animation:vnPop .28s ease-out,vnBreath 3.6s ease-in-out infinite .28s}
#vn .vs.shake canvas{animation:vnShk .32s linear}
#vn .vs.morph{filter:brightness(3) blur(2px);opacity:.2}
@keyframes vnBreath{0%,100%{transform:translateY(0) scaleY(1)}50%{transform:translateY(-.6%) scaleY(1.004)}}
@keyframes vnPop{0%{transform:scale(.97)}60%{transform:scale(1.015)}100%{transform:scale(1)}}
@keyframes vnShk{0%,100%{transform:translateX(0)}25%{transform:translateX(-2%)}75%{transform:translateX(2%)}}
#vn .vbox{position:absolute;left:max(3vw,env(safe-area-inset-left,0px));right:max(3vw,env(safe-area-inset-right,0px));bottom:calc(2.5vh + env(safe-area-inset-bottom,0px));min-height:27vh;max-height:40vh;padding:2.6vh 2.4vw 3vh;background:linear-gradient(180deg,rgba(26,16,46,.93),rgba(14,8,26,.96));border:2px solid #f2b63d;box-shadow:0 0 0 2px #1a1224,0 8px 30px rgba(0,0,0,.6);font-size:clamp(13px,4.4vh,22px);line-height:1.5;transition:opacity .3s}
#vn .vbox.nar{text-align:center;font-style:italic;color:#e8dcc8;border-color:#8a7aa8}
#vn .vbox.hide{opacity:0;pointer-events:none}
#vn .vnm{position:absolute;top:-1.5em;left:1.2em;padding:.15em .8em;background:var(--nc,#f2b63d);color:#120a1a;font-weight:700;letter-spacing:.06em;font-size:.8em;box-shadow:0 0 0 2px #1a1224}
#vn .vbox.nar .vnm{display:none}
#vn .vnx{position:absolute;right:1.2vw;bottom:.6vh;font-size:.75em;color:#f2b63d;animation:vnBlink 1s steps(2) infinite;opacity:0}
#vn .vnx.on{opacity:1}
@keyframes vnBlink{50%{opacity:.2}}
#vn .vctl{position:absolute;top:calc(1.5vh + env(safe-area-inset-top,0px));right:max(2vw,env(safe-area-inset-right,0px));display:flex;gap:8px;z-index:3}
#vn .vctl button{font:inherit;font-size:11px;padding:7px 11px;background:rgba(20,12,36,.85);color:#e8dcff;border:1px solid #5a3f8a;letter-spacing:.08em;min-height:34px}
#vn .vctl button.on{border-color:#f2b63d;color:#ffe27a}
#vn .vchs{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);display:flex;flex-direction:column;gap:10px;z-index:4;width:min(520px,80vw)}
#vn .vchs button{font:inherit;font-size:clamp(13px,4vh,19px);padding:12px 16px;background:rgba(26,16,46,.95);color:#f4ecff;border:2px solid #8a6ad0;text-align:left;min-height:44px}
#vn .vchs button:hover,#vn .vchs button:focus-visible{border-color:#f2b63d;color:#ffe27a;outline:none}
#vn .vcard{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:8vw;font-size:clamp(16px,6vh,34px);letter-spacing:.12em;color:#f4ecff;opacity:0;transition:opacity 1.4s;pointer-events:none;z-index:5;line-height:1.5}
#vn .vcard.on{opacity:1}
#vn .vcard small{display:block;font-size:.45em;letter-spacing:.4em;color:#f2b63d;margin-bottom:1em}
#vn .vfade{position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;z-index:6;transition:opacity .7s}
#vn .vflash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:6}
#vn .vflash.go{animation:vnFlash .7s ease-out}
@keyframes vnFlash{0%{opacity:.95}100%{opacity:0}}
#vn.shk{animation:vnShk2 .45s linear}
@keyframes vnShk2{0%,100%{transform:translate(0,0)}20%{transform:translate(-1.2vw,.6vh)}40%{transform:translate(1vw,-.8vh)}60%{transform:translate(-.8vw,.4vh)}80%{transform:translate(.6vw,-.3vh)}}
#vnwait{position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);padding:10px 16px;background:rgba(14,8,26,.92);border:1px solid #5a3f8a;color:#f4ecff;font-size:13px;display:none;z-index:61}
#vnwait.on{display:block}
#vn .logv{position:absolute;inset:4vh 6vw;background:rgba(14,8,26,.97);border:2px solid #5a3f8a;z-index:8;display:none;flex-direction:column}
#vn .logv.on{display:flex}
#vn .logv ol{list-style:none;margin:0;padding:12px 18px;overflow:auto;flex:1;font-size:clamp(12px,3.6vh,17px);line-height:1.5}
#vn .logv li{margin-bottom:.7em}
#vn .logv b{color:#ffe27a;margin-right:.5em}
#vn .logv button{align-self:flex-end;margin:10px;font:inherit;padding:8px 14px;background:#241640;color:#fff;border:1px solid #f2b63d}
#vn{--sep:sepia(0)}
#vn.sepia{--sep:sepia(.85) saturate(.65) contrast(1.05)}
#bark{position:fixed;left:50%;top:calc(10px + env(safe-area-inset-top,0px));transform:translate(-50%,-140%);z-index:35;display:flex;align-items:center;gap:10px;max-width:min(560px,86vw);padding:6px 14px 6px 6px;background:rgba(18,10,32,.92);border:2px solid var(--bc,#f2b63d);transition:transform .35s ease-out;pointer-events:none;color:#f4ecff;font-size:clamp(11px,3.4vh,15px)}
#bark.on{transform:translate(-50%,0)}
#bark canvas{width:42px;height:49px;image-rendering:pixelated;flex:none}
#bark b{display:block;color:var(--bc,#f2b63d);font-size:.8em;letter-spacing:.08em}
.sb-port{width:44px;height:51px;image-rendering:pixelated;flex:none;background:#120a1a;border:1px solid #3a2a5a}
.sb-tabs{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}
.sb-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.sb-list li{display:flex;gap:12px;align-items:flex-start;padding:10px 12px;background:rgba(26,16,46,.6);border:1px solid #3a2a5a}
.sb-list li.lk{opacity:.5}
.sb-list li .tx{flex:1;min-width:0}
.sb-list li .tx b{display:block;color:#ffe27a;margin-bottom:3px}
.sb-list li .tx p{margin:0;font-size:.92em;line-height:1.5;color:#e8dcff}
.sb-list li .tx small{color:#a898c8}
.sb-hearts{color:#ff6a8a;letter-spacing:2px;font-size:.9em}
.sb-new{display:inline-block;font-size:.72em;padding:1px 6px;margin-left:6px;background:#f2b63d;color:#1a0f00}
.sb-cr{position:relative;height:70vh;overflow:hidden;text-align:center}
.sb-cr .roll{position:absolute;left:0;right:0;top:100%;animation:sbRoll 46s linear forwards}
.sb-cr h3{color:#f2b63d;letter-spacing:.3em;font-size:.8em;margin:2.2em 0 .4em}
.sb-cr p{margin:.25em 0}
@keyframes sbRoll{to{transform:translateY(calc(-100% - 70vh))}}
@media (prefers-reduced-motion:reduce){#vn .vs canvas{animation:none}.sb-cr .roll{animation-duration:1ms}}
`;
const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
const root = document.createElement('div'); root.id = 'vn'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-live', 'polite');
root.innerHTML = `<canvas class="vbg"></canvas><div class="veil"></div><div class="vs L"><canvas width="48" height="56"></canvas></div><div class="vs R"><canvas width="48" height="56"></canvas></div><canvas class="vfx"></canvas>
<div class="vbox"><span class="vnm"></span><div class="vtx"></div><span class="vnx">&#9660;</span></div>
<div class="vctl"><button data-v="auto"></button><button data-v="log"></button><button data-v="skip"></button></div>
<div class="vchs"></div><div class="vcard"></div><div class="vflash"></div><div class="vfade"></div><div class="logv"><ol></ol><button data-v="logx"></button></div>`;
document.body.appendChild(root);
const wt = document.createElement('div'); wt.id = 'vnwait'; document.body.appendChild(wt);
const bark = document.createElement('div'); bark.id = 'bark'; bark.innerHTML = '<canvas width="48" height="56"></canvas><div><b></b><span></span></div>'; document.body.appendChild(bark);
const R = { bg: root.querySelector('.vbg'), fx: root.querySelector('.vfx'), box: root.querySelector('.vbox'), nm: root.querySelector('.vnm'), tx: root.querySelector('.vbox .vtx'), nx: root.querySelector('.vnx'), chs: root.querySelector('.vchs'), card: root.querySelector('.vcard'), fade: root.querySelector('.vfade'), flash: root.querySelector('.vflash'), wt, logv: root.querySelector('.logv'),
  slot: { L: root.querySelector('.vs.L'), R: root.querySelector('.vs.R') } };
const BGX = ctx2d(R.bg), FXX = ctx2d(R.fx);

const VN = {
  active: false, lines: null, slots: { L: null, R: null }, speaking: null, typing: false, wantNext: null, skipping: false, auto: false, bgKind: 'black', bgI: 0, bgT: 0, fxKind: 'none', parts: [], dis: [], raf: 0, log: [], chain: Promise.resolve(), sid: '',
  labels() { root.querySelector('[data-v=auto]').textContent = tt('autob'); root.querySelector('[data-v=log]').textContent = tt('log'); root.querySelector('[data-v=skip]').textContent = tt('skip'); root.querySelector('[data-v=logx]').textContent = tt('close'); root.querySelector('[data-v=auto]').classList.toggle('on', this.auto); },
  play(id, opt) { const run = () => this._play(id, opt || {}); this.chain = this.chain.then(run, run); return this.chain; },
  async _play(id, opt) {
    const lines = D.scenes[id]; if (!lines) return;
    this.sid = id; this.active = true; this.skipping = false; this.auto = !!setv('vnAuto', 0); this.log = [];
    const prevState = G.state, inLevel = !!G.lvl && ['play', 'sync', 'pause'].includes(prevState); if (inLevel) G.state = 'cut';
    this.prevMusic = AU.want; this.prevState = prevState; this.inLevel = inLevel;
    IN.clear(); UI.touchVis();
    this.open();
    try { await this.run(lines); }
    catch (e) { console.error('[STORY] scene', id, e); }
    finally {
      S().seen[id] = 1; try { saveGame(); } catch (e) {}
      await this.close();
      if (inLevel && G.state === 'cut') G.state = prevState === 'pause' ? 'pause' : (prevState === 'sync' ? 'sync' : 'play');
      IN.clear(); UI.touchVis(); STORY.flushNotes();
    }
  },
  open() {
    this.slots = { L: null, R: null }; for (const k of ['L', 'R']) { R.slot[k].className = 'vs ' + k; R.slot[k].style.removeProperty('--o'); }
    R.box.classList.add('hide'); R.card.className = 'vcard'; R.chs.innerHTML = ''; R.fade.style.transition = 'none'; R.fade.style.opacity = 0; root.classList.remove('sepia', 'gamebg');
    this.bg('black'); this.fxKind = 'none'; this.parts = []; this.dis = []; this.labels(); this.size();
    root.classList.add('on'); cancelAnimationFrame(this.raf); this.t0 = performance.now(); const loop = ts => { this.raf = requestAnimationFrame(loop); this.frame(ts); }; this.raf = requestAnimationFrame(loop);
  },
  async close() {
    R.box.classList.add('hide'); for (const k of ['L', 'R']) R.slot[k].classList.remove('in');
    await sleepMs(180); root.classList.remove('on', 'sepia', 'gamebg'); cancelAnimationFrame(this.raf); this.raf = 0; this.active = false; this.parts = []; this.dis = []; AMB.set('none'); R.logv.classList.remove('on');
    if (!this.inLevel && this.prevMusic !== undefined && AU.want !== this.prevMusic) AU.music(this.prevMusic);
  },
  size() { const w = innerWidth, h = innerHeight; const bw = Math.max(160, Math.round(G.SW || 320)), bh = Math.max(90, Math.round((G.SW || 320) * h / w)); R.bg.width = bw; R.bg.height = bh; R.fx.width = Math.ceil(w / 3); R.fx.height = Math.ceil(h / 3); BGX.imageSmoothingEnabled = false; FXX.imageSmoothingEnabled = false; },
  async run(lines) {
    for (const ln of lines) {
      if (!this.active) return;
      if (this.skipping) { this.quiet(ln); continue; }
      await this.exec(ln);
    }
  },
  quiet(ln) { if (typeof ln === 'string' && ln[0] === '@') { const [c, ...a] = ln.slice(1).split(' '); if (['rel', 'flag', 'journal', 'lore', 'boss', 'meet', 'ending', 'music'].includes(c)) this.cmd(c, a, true); } },
  cond(ln) { const m = /^\?(!?)([a-z0-9_]+)\s+/.exec(ln); if (!m) return ln; const has = !!S().flags[m[2]]; if (m[1] ? has : !has) return null; return ln.slice(m[0].length); },
  async exec(ln) {
    if (ln && typeof ln === 'object') { if (ln.choice) { const ch = await this.choose(ln.choice); if (ch && ch.do) await this.run(ch.do); } return; }
    ln = this.cond(String(ln)); if (ln == null) return;
    if (ln[0] === '@') { const [c, ...a] = ln.slice(1).split(' '); return this.cmd(c, a); }
    if (ln[0] === ':') return this.say(null, null, ln.slice(1).trim());
    const m = /^([a-z0-9]+)(?:\.([a-z]+))?:\s?(.*)$/.exec(ln); if (m) return this.say(m[1], m[2] || null, m[3]);
  },
  async cmd(c, a, quiet) {
    const s = S();
    switch (c) {
      case 'bg': this.bg(a[0], +a[1]); break;
      case 'music': AU.music(a[0] === 'none' ? null : a[0]); break;
      case 'amb': AMB.set(a[0]); break;
      case 'fx': this.fxKind = a[0] || 'none'; this.parts = []; break;
      case 'tint': root.classList.toggle('sepia', a[0] === 'sepia'); break;
      case 'show': { const [id, ex] = a[0].split('.'); this.show(id, ex || 'normal', a[1]); await sleepMs(120); break; }
      case 'expr': this.expr(a[0], a[1]); break;
      case 'hide': if (a[0] === 'all') { this.hide('L'); this.hide('R'); } else this.hide(a[0]); await sleepMs(220); break;
      case 'morph': { const [id, ex] = a[0].split('.'); const sl = R.slot.R; sl.classList.add('morph'); await sleepMs(380); this.slots.R = null; this.show(id, ex || 'normal', 'R', true); sl.classList.remove('morph'); await sleepMs(500); break; }
      case 'wings': { const sd = this.slots.R; if (sd && sd.id === 'aureliaw') { R.slot.R.style.transition = 'opacity 1.4s,filter 1.4s'; R.slot.R.classList.add('morph'); await sleepMs(700); sd.id = 'aurelia'; this.draw('R', true); R.slot.R.classList.remove('morph'); await sleepMs(800); R.slot.R.style.transition = ''; } break; }
      case 'dim': { const sl = R.slot[a[0]]; if (sl) { sl.style.transition = 'opacity 1.6s,filter 1.6s'; sl.style.setProperty('--o', a[1] || '.7'); } await sleepMs(300); break; }
      case 'dissolve': await this.dissolve(a[0] || 'R'); break;
      case 'shake': if (setv('shake', 1)) { root.classList.remove('shk'); void root.offsetWidth; root.classList.add('shk'); } if (navigator.vibrate && +a[0] >= 3) try { navigator.vibrate(60); } catch (e) {} await sleepMs(120); break;
      case 'flash': R.flash.classList.remove('go'); void R.flash.offsetWidth; R.flash.classList.add('go'); await sleepMs(220); break;
      case 'fade': { const ms = +a[1] || 700; if (a[0] === 'out') R.box.classList.add('hide'); R.fade.style.transition = 'opacity ' + ms + 'ms'; R.fade.style.opacity = a[0] === 'out' ? 1 : 0; await sleepMs(ms); break; }
      case 'wait': await this.wait(+a[0] || 500); break;
      case 'sfx': SFX.play(a[0]); break;
      case 'cry': SFX.sob(); break;
      case 'title': { const [h, t2] = a.join(' ').split('|'); R.box.classList.add('hide'); R.card.innerHTML = `<div><small>${esc(h)}</small>${esc(t2 || '')}</div>`; R.card.classList.add('on'); await this.wait(2200, true); R.card.classList.remove('on'); await sleepMs(500); break; }
      case 'card': { R.box.classList.add('hide'); R.card.textContent = a.join(' '); R.card.classList.add('on'); await sleepMs(1400); await this.waitTap(4200); R.card.classList.remove('on'); await sleepMs(1300); break; }
      case 'rel': { const n = a[0], v = parseInt(a[1], 10) || 0; s.rel[n] = clamp((s.rel[n] || 0) + v, 0, 5); break; }
      case 'flag': s.flags[a[0]] = 1; break;
      case 'journal': STORY.unlock('jour', a[0], quiet); break;
      case 'lore': STORY.unlock('lore', a[0], quiet); break;
      case 'boss': STORY.unlock('boss', a[0], quiet); break;
      case 'meet': s.meet[a[0]] = 1; break;
      case 'ending': s.end = 1; break;
    }
  },
  bg(kind, i) {
    this.bgKind = kind || 'black'; this.bgI = i || 0; root.classList.toggle('gamebg', kind === 'game');
    if (kind === 'flash') root.classList.add('sepia');
    if (kind === 'stage' || kind === 'flash') this.bgB = STORY.bgOf(this.bgI);
  },
  drawBG(tm) {
    const c = BGX, W = R.bg.width, H = R.bg.height, k = this.bgKind;
    if (k === 'game') { c.clearRect(0, 0, W, H); return; }
    if (k === 'black') { c.fillStyle = '#000'; c.fillRect(0, 0, W, H); return; }
    if ((k === 'stage' || k === 'flash') && this.bgB) { try { drawBG(c, this.bgB, { x: tm * .02, y: 120 }, W, H, 300, tm * .06); drawRays(c, this.bgB, { x: tm * .02 }, W, H, tm * .06); } catch (e) { c.fillStyle = '#120a1a'; c.fillRect(0, 0, W, H); } return; }
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#05030f'); g.addColorStop(.6, k === 'temple' ? '#1a1440' : '#0e0c30'); g.addColorStop(1, k === 'temple' ? '#2a2050' : '#1c1a48'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 110; i++) { const x = (i * 97.3) % W, y = (i * 53.7) % (H * .75), tw = .5 + .5 * Math.sin(tm * .002 + i * 1.7); c.fillStyle = i % 7 ? `rgba(220,235,255,${.35 + tw * .6})` : `rgba(150,220,255,${tw})`; c.fillRect(x | 0, y | 0, i % 11 ? 1 : 2, i % 11 ? 1 : 2); }
    if (k === 'stars') { const sx = ((tm * .08) % (W * 3)) - W * .5; if (sx > 0 && sx < W) { c.fillStyle = 'rgba(255,255,255,.9)'; for (let j = 0; j < 14; j++) c.fillRect((sx - j * 2) | 0, (H * .2 + j) | 0, 1, 1); }
      c.globalAlpha = .18; c.fillStyle = '#6ae0c8'; for (let x = 0; x < W; x += 2) c.fillRect(x, (H * .32 + Math.sin(x * .03 + tm * .0006) * 10) | 0, 2, 6); c.globalAlpha = 1; c.fillStyle = '#060410'; c.fillRect(0, H * .84 | 0, W, H); return; }
    c.fillStyle = 'rgba(190,220,255,.12)'; c.beginPath(); c.arc(W * .5, H * .08, H * .5, 0, TAU); c.fill();
    c.fillStyle = '#0a0818'; for (const x of [.12, .3, .7, .88]) { const px = W * x | 0; c.fillRect(px - 6, H * .22 | 0, 12, H); c.fillRect(px - 9, H * .2 | 0, 18, 4); }
    c.fillStyle = '#141030'; c.fillRect(0, H * .82 | 0, W, H);
    c.fillStyle = `rgba(110,210,255,${.35 + .25 * Math.sin(tm * .003)})`; for (let i = 0; i < 9; i++) c.fillRect((W * .2 + i * W * .075) | 0, (H * .86) | 0, 3, 1);
  },
  frame(ts) {
    const tm = ts - this.t0; this.drawBG(tm);
    for (const k of ['L', 'R']) { const sd = this.slots[k]; if (!sd) continue; let ch = false;
      if (!sd.bl && tm > sd.ne) { sd.bl = 1; sd.be = tm + 130; ch = true; }
      else if (sd.bl && tm > sd.be) { sd.bl = 0; sd.ne = tm + 2200 + Math.random() * 2600; ch = true; }
      const talking = this.typing && this.speaking === k; const mo = talking ? [1, 2, 0][Math.floor(tm / 105) % 3] : 0; if (mo !== sd.mo) { sd.mo = mo; ch = true; }
      if (sd.swp) { const s2 = Math.floor(tm / sd.swp) % 2; if (s2 !== sd.sw) { sd.sw = s2; ch = true; } }
      if (ch) this.draw(k);
      if (sd.ex === 'cry' && tm > (sd.tt || 0)) { sd.tt = tm + 420; this.tear(k); } }
    this.fxStep(tm);
  },
  draw(k, force) { const sd = this.slots[k]; if (!sd) return; const cv = R.slot[k].firstChild, x = cv.getContext('2d'), f = frameOf(sd.id, sd.ex, sd.bl, sd.mo, sd.sw);
    if (cv.width !== f.width || cv.height !== f.height) { cv.width = f.width; cv.height = f.height; } x.imageSmoothingEnabled = false; x.clearRect(0, 0, cv.width, cv.height);
    const flip = k === 'R' && charOf(sd.id).paint !== 'dragon'; if (flip) { x.save(); x.translate(cv.width, 0); x.scale(-1, 1); x.drawImage(f, 0, 0); x.restore(); } else x.drawImage(f, 0, 0); },
  show(id, ex, side, instant) {
    const C = charOf(id); side = side || C.side || 'R'; const other = side === 'L' ? 'R' : 'L';
    if (this.slots[other] && this.slots[other].id === id) { this.hide(other); }
    const cur = this.slots[side]; const el = R.slot[side];
    if (cur && cur.id === id) { this.expr(id, ex); return side; }
    this.slots[side] = { id, ex: EXS[ex] ? ex : 'normal', bl: 0, mo: 0, sw: 0, nb: 0, ne: 0, swp: swayStyle(id) };
    this.slots[side].ne = (performance.now() - (this.t0 || 0)) + 1200 + Math.random() * 2000;
    el.className = 'vs ' + side + (C.look && C.look.glow ? ' glow' : ''); el.style.removeProperty('--o'); this.draw(side);
    if (instant) el.classList.add('in'); else requestAnimationFrame(() => el.classList.add('in'));
    S().meet[C.same || id] = 1; return side;
  },
  expr(id, ex) { for (const k of ['L', 'R']) { const sd = this.slots[k]; if (sd && sd.id === id && EXS[ex] && sd.ex !== ex) { sd.ex = ex; this.draw(k); const el = R.slot[k]; el.classList.remove('pop', 'shake'); void el.offsetWidth; el.classList.add(ex === 'angry' || ex === 'surprised' || ex === 'hurt' ? 'shake' : 'pop'); } } },
  hide(k) { if (!this.slots[k]) return; R.slot[k].classList.remove('in'); this.slots[k] = null; },
  async say(id, ex, text) {
    let side = null;
    if (id) { side = this.slots.L && this.slots.L.id === id ? 'L' : this.slots.R && this.slots.R.id === id ? 'R' : null; if (!side) side = this.show(id, ex || 'normal'); else if (ex) this.expr(id, ex); }
    for (const k of ['L', 'R']) R.slot[k].classList.toggle('dim', !!id && k !== side && !!this.slots[k]);
    if (!id) for (const k of ['L', 'R']) R.slot[k].classList.add('dim');
    const C = id ? charOf(id) : null;
    R.box.classList.toggle('nar', !id); R.box.classList.remove('hide'); R.nm.textContent = C ? C.name : ''; R.box.style.setProperty('--nc', C ? C.color : '#f2b63d'); R.nm.style.setProperty('--nc', C ? C.color : '#f2b63d');
    this.speaking = side; const nm = C ? C.name : '';
    this.log.push({ n: nm, t: text }); const L = S().log; L.push({ n: nm, t: text }); if (L.length > 150) L.splice(0, L.length - 150);
    await this.type(text, C);
    if (!this.active) return;
    R.nx.classList.add('on');
    await this.waitTap(this.auto ? 1100 + text.length * 45 : 0);
    R.nx.classList.remove('on'); this.speaking = null;
  },
  type(text, C) {
    return new Promise(res => {
      const spd = [24, 48, 96, 1e6][setv('tSpd', 1)] || 48; if (spd > 1e5 || this.skipping) { R.tx.textContent = text; this.typing = false; res(); return; } R.tx.textContent = ''; this.typing = true; let i = 0, acc = 0, last = performance.now(), vc = 0;
      const step = now => {
        if (!this.typing) return;
        acc += (now - last) * spd / 1000; last = now;
        while (acc >= 1 && i < text.length) { const ch = text[i++]; R.tx.textContent = text.slice(0, i); acc -= 1; if (/[.!?]/.test(ch) && text[i] !== '.' && text[i] !== '!' && text[i] !== '?') acc -= spd * .22; else if (ch === ',') acc -= spd * .1; if (C && /[A-Za-z0-9]/.test(ch) && (vc++ % 2 === 0)) SFX.blip(C.voice[0], C.voice[1]); }
        if (i >= text.length) { this.typing = false; R.tx.textContent = text; res(); return; }
        requestAnimationFrame(step);
      };
      this.finishType = () => { this.typing = false; R.tx.textContent = text; res(); };
      requestAnimationFrame(step);
    });
  },
  waitTap(autoMs) { return new Promise(res => { let t = 0; this.wantNext = () => { clearTimeout(t); this.wantNext = null; res(); }; if (autoMs) t = setTimeout(() => { if (this.wantNext) this.wantNext(); }, autoMs); }); },
  wait(ms, tappable) { return new Promise(res => { const t = setTimeout(() => { this.wantNext = null; res(); }, this.skipping ? 0 : ms); if (tappable) this.wantNext = () => { clearTimeout(t); this.wantNext = null; res(); }; }); },
  choose(list) {
    return new Promise(res => {
      R.chs.innerHTML = ''; R.nx.classList.remove('on');
      list.forEach((c, i) => { const b = document.createElement('button'); b.textContent = c.t; b.onclick = e => { e.stopPropagation(); R.chs.innerHTML = ''; this.log.push({ n: '>', t: c.t }); SFX.play('ui'); res(c); }; R.chs.appendChild(b); });
      setTimeout(() => { const f = R.chs.querySelector('button'); if (f && !UI.isTouch) f.focus(); }, 50);
    });
  },
  tap() {
    if (R.logv.classList.contains('on') || R.chs.childElementCount) return;
    if (this.typing && this.finishType) { this.finishType(); return; }
    if (this.wantNext) this.wantNext();
  },
  skip() { this.skipping = true; R.chs.innerHTML = ''; if (this.typing && this.finishType) this.finishType(); if (this.wantNext) this.wantNext(); R.card.classList.remove('on'); },
  showLog() { const ol = R.logv.querySelector('ol'); ol.innerHTML = this.log.map(l => `<li>${l.n ? `<b>${esc(l.n)}</b>` : ''}${esc(l.t)}</li>`).join(''); R.logv.classList.add('on'); ol.scrollTop = ol.scrollHeight; },
  /* particles */
  fxStep(tm) {
    const c = FXX, W = R.fx.width, H = R.fx.height; c.clearRect(0, 0, W, H); const q = SAVE.set.q, want = this.fxKind === 'none' ? 0 : [18, 40, 80][q] * (this.fxKind === 'rain' ? 2 : 1), P = this.parts;
    while (P.length < want) P.push(this.spawn(W, H, true)); if (P.length > want) P.length = want;
    for (const p of P) { p.x += p.vx; p.y += p.vy; p.l++; if (this.fxKind === 'light') p.vx = Math.sin((tm * .001) + p.ph) * .15;
      if (p.y < -4 || p.y > H + 4 || p.x < -10 || p.x > W + 10) Object.assign(p, this.spawn(W, H, false));
      const a = this.fxKind === 'light' ? .45 + .45 * Math.sin(tm * .004 + p.ph) : .8; c.globalAlpha = a; c.fillStyle = p.col;
      if (this.fxKind === 'rain') c.fillRect(p.x | 0, p.y | 0, 1, 4); else c.fillRect(p.x | 0, p.y | 0, p.s, p.s); }
    c.globalAlpha = 1;
    const T = this.tears || (this.tears = []); for (let i = T.length - 1; i >= 0; i--) { const d = T[i]; d.vy += .05; d.y += d.vy; d.l--; c.fillStyle = '#bff2ff'; c.fillRect(d.x | 0, d.y | 0, 1, 2); if (d.l <= 0) T.splice(i, 1); }
    const Ds = this.dis; for (let i = Ds.length - 1; i >= 0; i--) { const d = Ds[i]; if (d.dl > 0) { d.dl--; c.fillStyle = d.col; c.fillRect(d.x | 0, d.y | 0, 1, 1); continue; } d.x += d.vx + Math.sin(d.y * .08 + d.ph) * .25; d.y += d.vy; d.vy -= .004; d.l--; c.globalAlpha = Math.max(0, d.l / d.m); c.fillStyle = d.l > d.m * .6 ? d.col : (d.l % 9 < 4 ? '#ffffff' : '#9ae8ff'); c.fillRect(d.x | 0, d.y | 0, 1, 1); if (d.l <= 0) Ds.splice(i, 1); }
    c.globalAlpha = 1;
  },
  spawn(W, H, first) {
    const k = this.fxKind, r = Math.random;
    const base = { x: r() * W, y: first ? r() * H : (k === 'embers' || k === 'light' ? H + 2 : -2), l: 0, ph: r() * 9, s: r() < .25 ? 2 : 1 };
    switch (k) {
      case 'embers': return Object.assign(base, { vx: (r() - .3) * .3, vy: -.2 - r() * .4, col: r() < .5 ? '#ff9a3c' : '#ffd060' });
      case 'light': return Object.assign(base, { vx: 0, vy: -.08 - r() * .2, col: r() < .6 ? '#bff2ff' : '#ffffff' });
      case 'snow': return Object.assign(base, { vx: (r() - .5) * .3, vy: .15 + r() * .3, col: '#ffffff' });
      case 'rain': return Object.assign(base, { vx: -.6, vy: 2.6 + r() * 1.6, col: 'rgba(170,200,255,.8)' });
      case 'leaves': return Object.assign(base, { vx: -.2 - r() * .3, vy: .12 + r() * .2, col: r() < .5 ? '#8ad048' : '#c8e06a' });
      default: return Object.assign(base, { vx: (r() - .5) * .1, vy: (r() - .5) * .1, col: '#a898b8' });
    }
  },
  tear(k) { if (SAVE.set.q < 1) return; const el = R.slot[k], rc = el.getBoundingClientRect(), sd = this.slots[k]; if (!rc.width) return; const sc = rc.height / 56, ch = charOf(sd.id).look || {}, hy = ch.child ? 24 : 22, flip = k === 'R';
    for (const ex of [19, 29]) { const px = flip ? 48 - ex : ex, x = (rc.left + px * sc) / 3, y = (rc.top + (hy + 12) * sc) / 3; this.tears.push({ x, y, vy: .3, l: 40 }); } },
  async dissolve(k) {
    const sd = this.slots[k]; if (!sd) return; const el = R.slot[k], rc = el.getBoundingClientRect(), f = frameOf(sd.id, sd.ex, 0, 0, 0), d = f.getContext('2d').getImageData(0, 0, f.width, f.height).data, sc = rc.height / f.height, flip = k === 'R' && charOf(sd.id).paint !== 'dragon', step = SAVE.set.q === 2 ? 1 : 2;
    for (let y = 0; y < f.height; y += step) for (let x = 0; x < f.width; x += step) { const i = (y * f.width + x) * 4; if (d[i + 3] < 40) continue; const px = flip ? f.width - 1 - x : x; this.dis.push({ x: (rc.left + px * sc) / 3, y: (rc.top + y * sc) / 3, vx: (Math.random() - .5) * .25, vy: -.15 - Math.random() * .35, l: 140 + Math.random() * 120, m: 260, ph: Math.random() * 6, dl: Math.round((f.height - y) * 2.2 + Math.random() * 20), col: `rgb(${d[i]},${d[i + 1]},${d[i + 2]})` }); }
    SFX.sparkle(); el.style.transition = 'opacity 2.4s ease-in'; el.style.setProperty('--o', '0'); await sleepMs(900); this.slots[k] = null; await sleepMs(1500); el.classList.remove('in'); el.style.transition = '';
  }
};
root.addEventListener('pointerup', e => { if (e.target.closest('button')) return; e.preventDefault(); VN.tap(); });
root.addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (!b) return; e.stopPropagation(); const v = b.dataset.v;
  if (v === 'auto') { VN.auto = !VN.auto; SAVE.set.vnAuto = VN.auto ? 1 : 0; VN.labels(); if (VN.auto && !VN.typing && VN.wantNext) VN.wantNext(); }
  if (v === 'log') VN.showLog(); if (v === 'logx') R.logv.classList.remove('on'); if (v === 'skip') VN.skip(); });
addEventListener('keydown', e => { if (!VN.active) return; if (['Space', 'Enter', 'KeyJ', 'KeyK', 'NumpadEnter'].includes(e.code)) { e.preventDefault(); e.stopImmediatePropagation(); VN.tap(); } else if (e.code === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); VN.skip(); } else if (e.code === 'KeyA') { VN.auto = !VN.auto; VN.labels(); } }, true);
addEventListener('resize', () => { if (VN.active) VN.size(); });

/* ---------------- battle barks (non-blocking) ---------------- */
const BARK = {
  t: 0,
  show(id, text, ex) { const C = charOf(id), cv = bark.querySelector('canvas'), x = cv.getContext('2d'), f = frameOf(id, ex || 'angry', 0, 1, 0); cv.width = f.width; cv.height = f.height; x.clearRect(0, 0, cv.width, cv.height); x.drawImage(f, 0, 0);
    bark.style.setProperty('--bc', C.color); bark.querySelector('b').textContent = C.name; bark.querySelector('span').textContent = text; bark.classList.add('on'); clearTimeout(this.t); this.t = setTimeout(() => bark.classList.remove('on'), 3400);
    for (let i = 0; i < 4; i++) setTimeout(() => SFX.blip(C.voice[0], C.voice[1]), i * 70); }
};

/* =====================================================================
   GAME INTEGRATION
   ===================================================================== */
const BGC = {};
const STORY = {
  notes: [], final: D.triggers.final || {},
  bgOf(i) { if (G.lvl && G.lvl.i === i && G.lvl.bg) return G.lvl.bg; if (!BGC[i]) { try { BGC[i] = makeBG(i); } catch (e) { BGC[i] = null; } } return BGC[i]; },
  should(id) { return !!D.scenes[id] && (!S().seen[id] || setv('vnReplay', 0)); },
  unlock(kind, id, quiet) { const s = S(), M = { jour: D.journal, lore: D.lore, boss: D.bosses }[kind]; if (!id || !M || !M[id] || s[kind][id]) return; s[kind][id] = 1; if (!quiet) this.notes.push(M[id].t); },
  flushNotes() { const n = this.notes.splice(0); n.slice(0, 3).forEach((x, i) => setTimeout(() => UI.note('info', { t: tt('upd'), s: x, ic: 'scroll' }), i * 400)); },
  cut(id) {
    const host = NET.on && NET.role === 'host' && NET.peer;
    if (host) { this.guestDone = false; NET.send({ t: 'cut', id }); }
    return VN.play(id).then(async () => {
      if (host && !this.guestDone && G.lvl) { const prev = G.state; G.state = 'cut'; R.wt.textContent = tt('wait'); R.wt.classList.add('on');
        const t0 = Date.now(); while (!this.guestDone && Date.now() - t0 < 25000 && NET.peer) await sleepMs(200);
        R.wt.classList.remove('on'); if (G.state === 'cut') G.state = prev === 'cut' ? 'play' : prev; }
    });
  },
  bark(k, which, ex) { const B = (D.triggers.bark || {})[k]; const line = which && B ? B[which] : which; if (!line) return; const id = D.chars[k] ? k : (k === 'dravok' ? 'aureliad' : k === 'guardcaptain' ? 'captain' : null); if (!id) return;
    BARK.show(id, line, ex); if (NET.on && NET.role === 'host' && NET.peer) NET.send({ t: 'bark', id, line, ex }); },
  afterStep() {
    if (VN.active || G.state !== 'play') return; const L = G.lvl; if (!L) return;
    if (this.skipJingle && G.winT > 0 && G.winT < 205) G.winT = 205;
    if (!L._st) { L._st = 1; const id = D.triggers.stage[L.i]; if (id && this.should(id)) { this.cut(id); return; } }
    const b = G.boss; if (!b || b.gone) return; const k = b.type, s = b._s || (b._s = {}), r = b.hp / b.maxHp;
    if (!s.pre) { s.pre = 1; const id = (D.triggers.pre || {})[k]; if (id && this.should(id)) { this.cut(id).then(() => { if (BOSS_SONG[k] && G.boss === b) AU.music(BOSS_SONG[k]); }); return; } if (BOSS_SONG[k]) AU.music(BOSS_SONG[k]); }
    if (b.st === 'intro') return;
    if (k === 'dravok') return this.finalStep(b, s, r);
    if (!s.sb && b.st !== 'dead') { s.sb = 1; this.bark(k, 'start', 'angry'); }
    if (!s.mid && r < .5 && b.st !== 'dead') { s.mid = 1; this.bark(k, 'mid', 'hurt'); }
    if (!s.low && r < .22 && b.st !== 'dead') { s.low = 1; this.bark(k, 'low', 'sad'); }
    if (b.st === 'dead' && b.t >= 34 && !s.def) { s.def = 1; const id = (D.triggers.defeat || {})[k]; if (id && this.should(id)) this.cut(id); }
  },
  finalStep(b, s, r) {
    const F = this.final; if (!s.dmg0) s.dmg0 = b.dmg; b.dmg = s.dmg0 * (r > .66 ? .55 : r > .33 ? .8 : 1);
    if (!s.b90 && r < .9) { s.b90 = 1; this.bark('dravok', F.bark90, 'sad'); }
    else if (!s.b75 && r < .75) { s.b75 = 1; this.bark('dravok', F.bark75, 'sad'); }
    if (b.fly) return;
    if (!s.s60 && r < .6 && F.scene60) { s.s60 = 1; this.calm(b); this.cut(F.scene60); return; }
    if (!s.s35 && r < .35 && F.scene35) { s.s35 = 1; this.calm(b); this.cut(F.scene35); return; }
    if (s.pendT && !s.fallen) { s.fallen = 1; this.calm(b); this.finalActive = true; this.cut(F.transform).then(() => this.finale(b)); }
  },
  calm(b) { for (const sh of G.shots) if (sh.from === 'e') sh.life = 0; G.zones.length = 0; for (const p of G.players) p.inv = Math.max(p.inv, 90); b.gap = Math.max(b.gap || 0, 70); },
  finale(b) { b.alpha = 0; b.gone = true; G.shots = []; G.zones = []; this.skipJingle = true; AU.music(null); }
};
window.STORY = STORY;

/* render the frozen world behind cutscenes */
{ const r0 = window.render; window.render = function () { if (G.state === 'cut' && G.lvl) { G.state = 'pause'; try { r0(); } finally { G.state = 'cut'; } } else r0(); }; }
/* story hooks after every simulation step (host / solo only, guests do not simulate) */
{ const s0 = window.step; window.step = function () { s0(); try { STORY.afterStep(); } catch (e) { console.error('[STORY]', e); } }; }
/* final boss: never let the last hit kill her, hand over to the transformation scene */
if (typeof Dragon !== 'undefined') { const h0 = Dragon.prototype.hit; Dragon.prototype.hit = function (o) {
  if (this.st === 'dead' || this.st === 'intro' || !o) return h0.call(this, o);
  const s = this._s || (this._s = {}), floor = Math.ceil(this.maxHp * (STORY.final.transformAt || .15));
  if (s.fallen) return 0;
  if (this.hp - (o.dmg || 0) <= floor) { const d = Math.max(0, this.hp - floor); const r = h0.call(this, Object.assign({}, o, { dmg: d })); this.hp = Math.max(this.hp, floor); if (this.st === 'dead') { this.st = 'stun'; this.stun = 9999; } s.pendT = 1; return r || 1; }
  return h0.call(this, o); }; }
/* her stagger label */
{ const l0 = window.label; window.label = function (s, ...a) { if (s === 'DRAVOK IS DOWN!') s = LANG === 'id' ? 'AURELIA GOYAH!' : 'AURELIA STAGGERS!'; return l0.call(this, s, ...a); }; }
/* secret rooms reveal temple fragments */
{ const oc = window.openChest; window.openChest = function (c, p) { const sec = c && !c.open && c.secret !== undefined ? c.secret : null; const r = oc.apply(this, arguments); if (sec !== null) { STORY.unlock('lore', (D.triggers.secret || [])[sec]); STORY.flushNotes(); } return r; }; }
/* no "boss defeated" fanfare for her */
{ const n0 = UI.note; UI.note = function (k, o) { if (k === 'boss' && STORY.finalActive) return; return n0.call(this, k, o); }; }
/* co-op: scenes and barks travel with the existing message channel */
{ const rx0 = NET.rx; NET.rx = function (raw) { let m = null; try { m = JSON.parse(raw); } catch (e) {}
  if (m && m.t === 'cut') { if (this.role === 'guest') VN.play(m.id).then(() => NET.send({ t: 'cutdone' })); return; }
  if (m && m.t === 'cutdone') { STORY.guestDone = true; return; }
  if (m && m.t === 'bark') { if (this.role === 'guest' && D.chars[m.id]) BARK.show(m.id, m.line, m.ex); return; }
  return rx0.call(this, raw); }; }
/* the ending: the old victory panel waits until the story and credits are done */
{ const sh0 = UI.show; UI.show = function (n, a) {
  if (n === 'ending' && !STORY.endingDone) { const self = this; STORY.endingDone = true; UIE.className = 'off'; UIE.innerHTML = ''; self.cur = 'storyend'; self.endArg = a;
    VN.play(STORY.final.ending || 'ending').then(() => { STORY.finalActive = false; STORY.skipJingle = false; sh0.call(self, 'scredits', a); }); return; }
  if (n === 'title' || n === 'map') { STORY.endingDone = false; }
  return sh0.call(this, n, a); }; }

/* recolour the dragon art to Aurelia's silver-blue (works whether the bake already ran or not) */
function recolorCanvas(cv) {
  if (!cv || !cv.getContext || cv._au) return; cv._au = 1; const x = cv.getContext('2d'), im = x.getImageData(0, 0, cv.width, cv.height), d = im.data;
  for (let i = 0; i < d.length; i += 4) { if (d[i + 3] === 0) continue; let r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, dd = mx - mn; if (dd < .02) continue;
    const s = l > .5 ? dd / (2 - mx - mn) : dd / (mx + mn); let h = mx === r ? ((g - b) / dd + (g < b ? 6 : 0)) : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4; h *= 60;
    let nh, ns, nl;
    if ((h <= 58 || h >= 330) && s > .2) { const eye = h > 18 && h < 52 && s > .85 && l > .5 && l < .7 && r > .95; nh = eye ? 195 : 218; ns = eye ? .95 : Math.min(.5, s * .42); nl = eye ? .74 : Math.min(.96, l * .85 + .16); }
    else if (h > 240 && h < 330 && s < .35) { nh = 222; ns = .22; nl = Math.min(.95, l * .55 + .5); }
    else continue;
    const q = nl < .5 ? nl * (1 + ns) : nl + ns - nl * ns, p2 = 2 * nl - q, hk = nh / 360, f = t => { t < 0 && (t += 1); t > 1 && (t -= 1); return t < 1 / 6 ? p2 + (q - p2) * 6 * t : t < .5 ? q : t < 2 / 3 ? p2 + (q - p2) * (2 / 3 - t) * 6 : p2; };
    d[i] = f(hk + 1 / 3) * 255; d[i + 1] = f(hk) * 255; d[i + 2] = f(hk - 1 / 3) * 255; }
  x.putImageData(im, 0, 0);
}
function recolorDRG() { if (typeof DRG === 'undefined' || !DRG.head) return false; const seen = new Set(); const walk = o => { if (!o || typeof o !== 'object' || seen.has(o)) return; seen.add(o); if (o instanceof HTMLCanvasElement) { recolorCanvas(o); return; } for (const k in o) { if (k === '_w') continue; walk(o[k]); } };
  walk(DRG); try { DRG.glow = tint(lightSpr(7), '#7ad8ff'); } catch (e) {} return true; }
if (!recolorDRG()) { const bd = window.bakeDragon; window.bakeDragon = function () { const r = bd.apply(this, arguments); recolorDRG(); return r; }; }

/* =====================================================================
   MENUS: camp, story book, credits, settings
   ===================================================================== */
const hearts = n => '\u2665'.repeat(n) + '\u2661'.repeat(Math.max(0, 5 - n));
function npcNext(id) { const n = D.npcs[id], s = S(), i = s.talk[id] || 0, tk = n.talks[i]; if (!tk) return null; if (tk.end ? !s.end : (SAVE.prog || 1) < tk.prog) return null; return tk; }
Object.assign(UI.S, {
  camp() {
    const s = S(); let h = `<div class="panel wide">${hd('flame', tt('camp'))}<p class="hint">${tt('camph')}</p><ul class="sb-list">`; let any = false;
    for (const id in D.npcs) { const n = D.npcs[id], C = charOf(id), met = (SAVE.prog || 1) >= n.prog || s.meet[id];
      if (!met) { h += `<li class="lk"><span class="sb-port"></span><div class="tx"><b>???</b><small>${tt('unlock', { n: n.prog - 1 })}</small></div></li>`; continue; }
      any = true; const nx = npcNext(id), done = (s.talk[id] || 0) >= n.talks.length;
      h += `<li><img class="sb-port" src="${portraitURL2(id, nx ? 'smile' : 'normal')}" alt=""><div class="tx"><b>${esc(C.name)}${nx ? `<span class="sb-new">${tt('newt')}</span>` : ''}</b><small>${tt('rel')} <span class="sb-hearts">${hearts(s.rel[id] || 0)}</span></small><p>${esc(C.bio || '')}</p></div>${nx ? `<button class="pri" data-a="talk:${id}">${tt('talk')}</button>` : `<span class="tag dim">${done ? tt('allread') : '...'}</span>`}</li>`; }
    if (!any) h += `<li><div class="tx"><p>${tt('nobody')}</p></div></li>`;
    return h + `</ul><div class="row end"><button data-a="back">${t('back')}</button></div></div>`;
  },
  book() {
    const s = S(), tab = this.bookTab || 'jour', tabs = ['jour', 'chars', 'boss', 'lore', 'hist'];
    let h = `<div class="panel wide">${hd('scroll', tt('book'))}<div class="sb-tabs">${tabs.map(k => `<button class="seg ${k === tab ? 'on' : ''}" data-a="book:${k}">${tt(k)}</button>`).join('')}</div><ul class="sb-list">`, items = '';
    if (tab === 'jour') items = Object.entries(D.journal).filter(([k]) => s.jour[k]).sort((a, b) => a[1].ch - b[1].ch).map(([k, j]) => `<li><div class="tx"><small>${j.ch ? tt('ch', { n: Math.min(6, j.ch) }) : 'Prolog'}</small><b>${esc(j.t)}</b><p>${esc(j.x)}</p></div></li>`).join('');
    if (tab === 'chars') items = Object.entries(D.chars).filter(([k, c]) => s.meet[k] && c.bio && !c.same).map(([k, c]) => `<li><img class="sb-port" src="${portraitURL2(k, 'normal')}" alt=""><div class="tx"><b>${esc(c.name)}</b>${D.npcs[k] ? `<small>${tt('rel')} <span class="sb-hearts">${hearts(s.rel[k] || 0)}</span></small>` : ''}<p>${esc(c.bio)}</p>${k === 'aurelia' && s.end && D.lore.aurelia_past ? `<p><small>${tt('past')}</small><br>${esc(D.lore.aurelia_past.x)}</p><div class="row"><button data-a="replay:memory_aurelia">${tt('replaybtn')}</button></div>` : ''}</div></li>`).join('');
    if (tab === 'boss') items = Object.entries(D.bosses).filter(([k]) => s.boss[k]).map(([k, b]) => `<li><div class="tx"><b>${esc(b.t)}</b><p>${esc(b.x)}</p></div></li>`).join('');
    if (tab === 'lore') items = Object.entries(D.lore).filter(([k]) => s.lore[k]).map(([k, b]) => `<li><div class="tx"><b>${esc(b.t)}</b><p>${esc(b.x)}</p></div></li>`).join('');
    if (tab === 'hist') items = s.log.slice().reverse().map(l => `<li><div class="tx">${l.n ? `<b>${esc(l.n)}</b>` : ''}<p>${esc(l.t)}</p></div></li>`).join('');
    return h + (items || `<li><div class="tx"><p>${tt('none')}</p></div></li>`) + `</ul><div class="row end"><button data-a="back">${t('back')}</button></div></div>`;
  },
  scredits() {
    const cast = ['sam', 'sya', 'aurelia', 'elena', 'raven', 'luna', 'kael', 'grukk', 'arachne', 'ignis', 'glacius', 'malgrim'];
    return `<div class="panel wide"><div class="sb-cr"><div class="roll"><div class="logo"><div class="l1">SAM <em>&amp;</em> SYA</div><div class="l2">DRAGON SLAYER</div></div><p style="letter-spacing:.3em;color:#bfe8ff">THE LAST TEAR</p>
      <h3>${t('developer')}</h3><p class="big">${esc(typeof DEVN !== 'undefined' ? DEVN : 'SAM')}</p><h3>${t('createdby')}</h3><p class="big">SAM</p>
      <h3>CAST</h3>${cast.map(k => `<p>${esc(charOf(k).name)}</p>`).join('')}
      <h3>&nbsp;</h3><p style="color:#bfe8ff">${tt('ded')}</p><h3>&nbsp;</h3><p>AURELIA</p></div></div>
      <div class="row end"><button class="pri" data-a="scdone">${tt('cont')}</button></div></div>`;
  }
});
UI.P.scredits = function () { AU.music('sorrow'); };
UI.P.camp = function () { AU.music('camp'); };
{ const m0 = UI.S.map; UI.S.map = function () { const h = m0.apply(this, arguments); return h.replace('<div class="row">', `<div class="row"><button data-a="camp">${img('flame', 'bi')}${tt('camp')}</button><button data-a="book">${img('scroll', 'bi')}${tt('book')}</button>`); }; }
{ const se = UI.S.settings; UI.S.settings = function () { const h = se.apply(this, arguments), s = setv('tSpd', 1), ov = v => t(v ? 'on' : 'off');
  const sec = `<h3>${tt('sec')}</h3><div class="row"><span class="lb">${tt('spd')}</span>${[0, 1, 2, 3].map(i => `<button class="seg ${s === i ? 'on' : ''}" data-a="tspd:${i}">${tt('s' + i)}</button>`).join('')}</div>
    <div class="row"><button class="seg ${setv('vnAuto', 0) ? 'on' : ''}" data-a="vnauto">${tt('auto', { v: ov(setv('vnAuto', 0)) })}</button><button class="seg ${setv('vnReplay', 0) ? 'on' : ''}" data-a="vnreplay">${tt('replay', { v: ov(setv('vnReplay', 0)) })}</button></div>`;
  const key = `<h3>${t('touch')}</h3>`; return h.includes(key) ? h.replace(key, sec + key) : h; }; }
Object.assign(UIX, {
  camp() { this.go('camp'); },
  book(x) { this.bookTab = x || this.bookTab || 'jour'; if (this.cur === 'book') this.rerender(); else this.go('book'); },
  talk(id) { const tk = npcNext(id); if (!tk) return; const s = S(); VN.play(tk.scene).then(() => { s.talk[id] = (s.talk[id] || 0) + 1; saveGame(); STORY.flushNotes(); this.show('camp'); }); },
  replay(id) { VN.play(id).then(() => this.show('book')); },
  tspd(x) { SAVE.set.tSpd = +x; saveGame(); this.rerender(); },
  vnauto() { SAVE.set.vnAuto = setv('vnAuto', 0) ? 0 : 1; saveGame(); this.rerender(); },
  vnreplay() { SAVE.set.vnReplay = setv('vnReplay', 0) ? 0 : 1; saveGame(); this.rerender(); }
});
/* after the credits, show the game's original victory panel (the ending hook lets it through once) */
UIX.scdone = function () { STORY.endingDone = true; UI.show('ending', this.endArg); };
UI.P.map = function () { if (!G.lvl && AU.want === 'camp') AU.music('title'); };

window.DBG && Object.assign(window.DBG, { STORY, VN, BARK, STORY_S: S, frameOf });
console.log('[STORY] The Last Tear loaded:', Object.keys(D.scenes).length, 'scenes');
})();
