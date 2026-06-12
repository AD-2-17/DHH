// ─── DHH ARCHIVE — main controller ─────────────────────────────────
import { SphereGallery } from "./sphere.js";
import { ARTISTS } from "./albums.js";
import { REAL_ALBUMS } from "./albums-data.js";
import { storyFor } from "./stories.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ── scrub config — frames dropped in by the Higgsfield pipeline ──
   Each section stays hidden unless frames/<name>/frame_0001.jpg loads. */
const SCRUB_SECTIONS = [
  { section: "#scrub-orbit",  name: "orbit",  frameCount: 179 },
  { section: "#scrub-reveal", name: "reveal", frameCount: 179 },
];
const framePath = (name, i) => `frames/${name}/frame_${String(i).padStart(4, "0")}.jpg`;

/* ── preloader ──────────────────────────────────────────────────── */
const loaderPct = $("#loader-pct"), loaderFill = $("#loader-fill");
let progressShown = 0;
function setLoad(p) {
  progressShown = Math.max(progressShown, Math.round(p * 100));
  loaderPct.textContent = progressShown;
  loaderFill.style.width = progressShown + "%";
}

/* ── lenis smooth scroll ────────────────────────────────────────── */
const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });

/* ── populate content ───────────────────────────────────────────── */
function buildContent() {
  const names = ARTISTS.map((a) => a.name).join(" ✦ ") + " ✦ ";
  $("#marquee-track").textContent = (names + names).repeat(2);

  $("#artist-grid").innerHTML = ARTISTS.map(
    (a, i) => `
    <article class="artist-card" data-reveal style="transition-delay:${(i % 4) * 70}ms">
      <span class="num mono">${String(i + 1).padStart(2, "0")} / ${a.city}</span>
      <h3>${a.name}</h3>
      <span class="city mono">ACTIVE SINCE ${a.since}</span>
      <p>${a.note}</p>
    </article>`
  ).join("");

  const moments = [
    [2014, "Naezy records 'Aafat' on an iPad — the spark", "ORIGIN"],
    [2017, "Prabh Deep's Class-Sikh puts Azadi Records on the map", "LABEL ERA"],
    [2018, "Seedhe Maut drop Bayaan — Delhi's new standard", "ALBUM"],
    [2019, "Gully Boy takes the gully to the multiplex", "MAINSTREAM"],
    [2020, "Lockdown bedrooms become studios — output explodes", "DIY WAVE"],
    [2021, "KR$NA vs Emiway: beef becomes a national event", "CULTURE"],
    [2022, "MC Stan's Insaan streams past every pop record", "TAKEOVER"],
    [2023, "Seedhe Maut's Lunch Break — 18 tracks, zero skips", "ALBUM"],
    [2024, "Hanumankind's Big Dawgs cracks the Billboard Hot 100", "GLOBAL"],
    [2026, "The sphere keeps growing — you're inside it now", "NOW"],
  ];
  $("#timeline-rows").innerHTML = moments.map(
    ([yr, what, tag]) => `
    <div class="t-row" data-reveal>
      <span class="yr">${yr}</span>
      <span class="what">${what}</span>
      <span class="tag mono">${tag}</span>
    </div>`
  ).join("");

  // live stats from the real catalog
  const artists = new Set(REAL_ALBUMS.map((a) => a.artist.split(/[,&]| feat\.| & /)[0].trim()));
  const stats = $$("#stats .stat b");
  if (stats[0]) stats[0].dataset.count = REAL_ALBUMS.length;
  if (stats[1]) stats[1].dataset.count = artists.size;
}

/* ── reveal on scroll ───────────────────────────────────────────── */
function bindReveals() {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.target.classList.toggle("in", e.isIntersecting)),
    { threshold: 0.18 }
  );
  $$("[data-reveal]").forEach((el) => io.observe(el));
}

/* ── stat counters ──────────────────────────────────────────────── */
function bindCounters() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting || e.target.dataset.done) return;
      e.target.dataset.done = 1;
      const end = +e.target.dataset.count, t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / 1400);
        e.target.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  $$("[data-count]").forEach((el) => io.observe(el));
}

/* ── copy-line windows (progress-faded overlay text) ────────────── */
function updateCopyLines(stage, progress) {
  $$(".copy-line", stage).forEach((line) => {
    const [a, b] = line.dataset.win.split(",").map(Number);
    const fadeZone = (b - a) * 0.28;
    let o = 0;
    if (progress > a && progress < b) {
      o = Math.min((progress - a) / fadeZone, (b - progress) / fadeZone, 1);
    }
    line.style.opacity = o.toFixed(3);
    line.style.transform = `translateY(${(1 - o) * 30}px)`;
  });
}

/* ── section progress helper ────────────────────────────────────── */
function sectionProgress(section) {
  const r = section.getBoundingClientRect();
  return Math.max(0, Math.min(1, -r.top / (r.height - innerHeight)));
}

/* ── canvas frame-scrub engine ──────────────────────────────────── */
const scrubs = [];
async function initScrubs() {
  for (const cfg of SCRUB_SECTIONS) {
    const section = $(cfg.section);
    if (!section) continue;
    const ok = await new Promise((res) => {
      const img = new Image();
      img.onload = () => res(true);
      img.onerror = () => res(false);
      img.src = framePath(cfg.name, 1);
    });
    if (!ok) continue;

    section.hidden = false;
    const canvas = $(".scrub-canvas", section);
    const ctx = canvas.getContext("2d");
    const frames = [];
    for (let i = 1; i <= cfg.frameCount; i++) {
      const img = new Image();
      img.src = framePath(cfg.name, i);
      frames.push(img);
    }
    const state = { section, canvas, ctx, frames, last: -1 };
    const draw = (idx) => {
      const img = frames[idx];
      if (!img || !img.complete || !img.naturalWidth) return;
      const dpr = Math.min(devicePixelRatio, 2);
      if (canvas.width !== innerWidth * dpr) {
        canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
      }
      const cw = canvas.width, ch = canvas.height;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s, h = img.naturalHeight * s;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      state.last = idx;
    };
    frames[0].decode?.().then(() => draw(0)).catch(() => {});
    state.draw = draw;
    scrubs.push(state);
  }
}

/* ── header clock ───────────────────────────────────────────────── */
function startClocks() {
  const fmtIN = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
  const fmtLocal = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "LOCAL";
    $("#local-city").textContent = tz.split("/").pop().replace(/_/g, " ").toUpperCase();
  } catch {}
  const tick = () => {
    const now = new Date();
    $("#clock-in").textContent = fmtIN.format(now);
    $("#clock-local").textContent = fmtLocal.format(now);
  };
  tick(); setInterval(tick, 20_000);
}

/* ── ambient sound (synthesised — no asset) ─────────────────────── */
let audio = null;
function toggleSound(btn) {
  if (!audio) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 220; lp.connect(master);
    [55, 55.7, 110.3].forEach((f, i) => {
      const o = ctx.createOscillator(); o.type = i === 2 ? "triangle" : "sawtooth"; o.frequency.value = f;
      const g = ctx.createGain(); g.gain.value = i === 2 ? 0.05 : 0.085;
      o.connect(g); g.connect(lp); o.start();
    });
    const len = ctx.sampleRate * 2, buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() > 0.9985 ? (Math.random() * 2 - 1) * 0.6 : 0;
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    const cg = ctx.createGain(); cg.gain.value = 0.25;
    src.connect(cg); cg.connect(master); src.start();
    audio = { ctx, master, on: false };
  }
  audio.on = !audio.on;
  audio.ctx.resume();
  audio.master.gain.linearRampToValueAtTime(audio.on ? 0.5 : 0, audio.ctx.currentTime + 0.8);
  btn.textContent = audio.on ? "SOUND [ON]" : "SOUND [OFF]";
}

/* ── album overlay (real art + 30s preview) ─────────────────────── */
const preview = new Audio();
preview.preload = "none";

function openAlbum(album) {
  const ov = $("#album-overlay");
  $("#overlay-art").src = album.cover;
  $("#ov-title").textContent = album.title;
  $("#ov-artist").textContent = album.artist;
  const tracks = album.tracks > 1 ? `${album.tracks} tracks · ` : "";
  $("#ov-desc").textContent = storyFor(album);
  $("#ov-tags").textContent = tracks + [album.year, album.kind, album.genre].filter(Boolean).join(" · ");

  // play preview
  const playBtn = $("#ov-play"), eq = $("#ov-eq"), trackLabel = $("#ov-track");
  preview.pause();
  preview.onended = null;
  playBtn.hidden = !album.preview;
  trackLabel.textContent = "";
  eq.classList.add("paused");
  playBtn.textContent = "▶ PLAY PREVIEW";
  if (album.preview) {
    playBtn.onclick = () => {
      if (preview.paused || preview.src !== album.preview) {
        preview.src = album.preview;
        preview.play();
        playBtn.textContent = "❚❚ PAUSE";
        eq.classList.remove("paused");
        trackLabel.textContent = album.track ? `NOW PLAYING — ${album.track.toUpperCase()}` : "";
      } else {
        preview.pause();
        playBtn.textContent = "▶ PLAY PREVIEW";
        eq.classList.add("paused");
      }
    };
    preview.onended = () => {
      playBtn.textContent = "▶ PLAY PREVIEW";
      eq.classList.add("paused");
    };
  }

  // streaming links
  const apple = $("#ov-apple");
  apple.hidden = !album.link;
  if (album.link) apple.href = album.link;
  $("#ov-spotify").href = `https://open.spotify.com/search/${encodeURIComponent(album.artist + " " + album.title)}`;

  ov.hidden = false;
  requestAnimationFrame(() => ov.classList.add("on"));
  lenis.stop();
}

function closeAlbum() {
  const ov = $("#album-overlay");
  preview.pause();
  ov.classList.remove("on");
  setTimeout(() => (ov.hidden = true), 400);
  lenis.start();
}

/* ── boot ───────────────────────────────────────────────────────── */
buildContent();
startClocks();
setLoad(0.05);

let gallery = null;
const heroSection = $("#hero");
const heroStage = $(".stage", heroSection);

async function boot() {
  try { await document.fonts.load("800 40px 'Archivo Black'"); } catch {}
  setLoad(0.12);

  gallery = new SphereGallery($("#sphere"), {
    onSelect: openAlbum,
    onProgress: (p) => setLoad(0.12 + p * 0.83),
  });
  window.gallery = gallery; // debug handle
  await gallery.build();
  await initScrubs();
  setLoad(1);

  setTimeout(() => $("#loader").classList.add("done"), 350);

  $("#sound-toggle").addEventListener("click", (e) => toggleSound(e.currentTarget));
  $("#overlay-close").addEventListener("click", closeAlbum);
  $("#album-overlay").addEventListener("click", (e) => { if (e.target.id === "album-overlay") closeAlbum(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeAlbum(); });

  $$('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const t = $(a.getAttribute("href"));
      if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: 0, duration: 1.6 }); }
    })
  );

  bindReveals();
  bindCounters();

  const loop = (time) => {
    lenis.raf(time);
    const t = time * 0.001;

    const hp = sectionProgress(heroSection);
    gallery.setScroll(hp);
    updateCopyLines(heroStage, hp);
    if (heroSection.getBoundingClientRect().bottom > 0) gallery.update(t);

    for (const s of scrubs) {
      const r = s.section.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) continue;
      const p = sectionProgress(s.section);
      const idx = Math.min(s.frames.length - 1, Math.floor(p * (s.frames.length - 1)));
      if (idx !== s.last) s.draw(idx);
      updateCopyLines(s.section, p);
    }

    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

boot();
