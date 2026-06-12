// ─── INSIDE-THE-SPHERE ALBUM GALLERY ───────────────────────────────
// Camera sits at the centre of a hollow sphere; real album covers
// line the inner wall. Scroll rotates the sphere, drag adds manual
// rotation with flick inertia, hover lifts a tile, click opens the
// album overlay.

import * as THREE from "three";
import { REAL_ALBUMS } from "./albums-data.js";

const TILE_PX = 320;          // texture resolution per cover
const CAPTION = 70;           // caption strip height in texture px
const SPHERE_R = 16;          // sphere radius
const ROWS = 8;               // latitude bands
const COLS = 24;              // tiles per band (equator)
const TILE_SCALE = 3.6;       // tile world size (bigger + denser = tighter wall)

const PALETTES = [
  ["#1a120a", "#c8922a"], ["#0d0d12", "#7a1f1f"], ["#10100e", "#3d4a3a"],
  ["#0a0e14", "#1f4e7a"], ["#120a14", "#5a2a7a"], ["#101418", "#cc3a2a"],
  ["#14100a", "#e8a020"], ["#0a0a10", "#2a3a8a"], ["#120e0a", "#a05a1a"],
];

// caption + art composited into one texture (art on top, label below)
function composeTile(album, img) {
  const c = document.createElement("canvas");
  c.width = TILE_PX;
  c.height = TILE_PX + CAPTION;
  const g = c.getContext("2d");

  if (img) {
    g.drawImage(img, 0, 0, TILE_PX, TILE_PX);
  } else {
    // fallback: palette block with typography
    const [bg, ac] = PALETTES[(album.title.length + album.year) % PALETTES.length];
    const grad = g.createLinearGradient(0, 0, TILE_PX, TILE_PX);
    grad.addColorStop(0, bg); grad.addColorStop(1, ac);
    g.fillStyle = grad;
    g.fillRect(0, 0, TILE_PX, TILE_PX);
    g.fillStyle = "rgba(255,255,255,0.92)";
    g.font = `800 ${TILE_PX * 0.09}px 'Archivo Black', sans-serif`;
    g.textAlign = "left";
    const t = album.title.length > 16 ? album.title.slice(0, 15) + "…" : album.title;
    g.fillText(t, TILE_PX * 0.07, TILE_PX * 0.82);
    g.font = `500 ${TILE_PX * 0.055}px 'Space Grotesk', sans-serif`;
    g.fillText(album.artist, TILE_PX * 0.07, TILE_PX * 0.9);
  }

  // caption strip (transparent background)
  const artist = album.artist.length > 26 ? album.artist.slice(0, 25) + "…" : album.artist;
  const title = album.title.length > 30 ? album.title.slice(0, 29) + "…" : album.title;
  g.fillStyle = "rgba(255,255,255,0.92)";
  g.font = `600 ${TILE_PX * 0.052}px 'Space Grotesk', sans-serif`;
  g.textAlign = "left";
  g.fillText(title.toUpperCase(), 2, TILE_PX + CAPTION * 0.42);
  g.fillStyle = "rgba(255,255,255,0.45)";
  g.font = `500 ${TILE_PX * 0.042}px 'Space Grotesk', sans-serif`;
  g.fillText(`${artist.toUpperCase()}  ·  ${album.year}  ·  ${album.kind}`, 2, TILE_PX + CAPTION * 0.78);
  return c;
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// ── gallery class ──────────────────────────────────────────────────
export class SphereGallery {
  constructor(canvas, { onSelect, onProgress } = {}) {
    this.canvas = canvas;
    this.onSelect = onSelect;
    this.onProgress = onProgress;
    this.scrollRot = 0;
    this.dragRot = { x: 0, y: 0 };
    this.targetDrag = { x: 0, y: 0 };
    this.flick = { x: 0, y: 0 };          // inertia velocity
    this.zoom = 0;
    this.hovered = null;
    this.pointer = new THREE.Vector2(-10, -10);
    this.raycaster = new THREE.Raycaster();

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x060608, SPHERE_R * 0.55, SPHERE_R * 1.55);
    this.camera = new THREE.PerspectiveCamera(72, 1, 0.1, 100);
    this.camera.position.set(0, 0, 0.01);

    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.tiles = [];

    this._buildDust();
    this._bindPointer();
    this.resize();
    addEventListener("resize", () => this.resize());
  }

  // load all real covers, then tile the sphere
  async build() {
    const imgs = [];
    let done = 0;
    await Promise.all(
      REAL_ALBUMS.map(async (a, i) => {
        imgs[i] = await loadImage(a.cover);
        done++;
        this.onProgress?.(done / REAL_ALBUMS.length);
      })
    );

    const geo = new THREE.PlaneGeometry(1, (TILE_PX + CAPTION) / TILE_PX);
    let idx = 0;
    for (let row = 0; row < ROWS; row++) {
      const lat = (-0.5 + row / (ROWS - 1)) * 2.1;
      const cols = Math.max(6, Math.round(COLS * Math.cos(lat)));
      for (let col = 0; col < cols; col++) {
        const albumIdx = idx % REAL_ALBUMS.length;
        const album = REAL_ALBUMS[albumIdx];
        idx++;
        const tex = new THREE.CanvasTexture(composeTile(album, imgs[albumIdx]));
        tex.anisotropy = 4;
        tex.colorSpace = THREE.SRGBColorSpace;
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, fog: true });
        const mesh = new THREE.Mesh(geo, mat);

        const lon = (col / cols) * Math.PI * 2 + (row % 2 ? Math.PI / cols : 0);
        mesh.position.set(
          SPHERE_R * Math.cos(lat) * Math.sin(lon),
          SPHERE_R * Math.sin(lat),
          SPHERE_R * Math.cos(lat) * Math.cos(lon)
        );
        mesh.lookAt(0, 0, 0);
        mesh.scale.setScalar(TILE_SCALE);
        mesh.userData = { album, img: imgs[albumIdx], baseScale: TILE_SCALE };
        this.group.add(mesh);
        this.tiles.push(mesh);
      }
    }
  }

  _buildDust() {
    const N = 500, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(3 + Math.random() * (SPHERE_R - 5));
      pos.set([v.x, v.y, v.z], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    this.dust = new THREE.Points(g, new THREE.PointsMaterial({ color: 0x8888aa, size: 0.035, transparent: true, opacity: 0.5 }));
    this.scene.add(this.dust);
  }

  _bindPointer() {
    const el = this.canvas;
    let down = false, px = 0, py = 0, moved = 0, lastDx = 0, lastDy = 0;

    el.addEventListener("pointerdown", (e) => {
      down = true; moved = 0; px = e.clientX; py = e.clientY;
      lastDx = lastDy = 0;
      this.flick.x = this.flick.y = 0;
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener("pointermove", (e) => {
      this.pointer.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
      if (!down) return;
      const dx = e.clientX - px, dy = e.clientY - py;
      moved += Math.abs(dx) + Math.abs(dy);
      this.targetDrag.y += dx * 0.0035;
      this.targetDrag.x += dy * 0.0025;
      lastDx = dx; lastDy = dy;
      px = e.clientX; py = e.clientY;
    });
    el.addEventListener("pointerup", (e) => {
      down = false;
      // flick inertia from last move delta
      this.flick.y = lastDx * 0.0045;
      this.flick.x = lastDy * 0.0032;
      if (moved < 8 && this.onSelect) {
        // raycast at the release point — works for taps with no prior hover
        const tile = this.pick(e.clientX, e.clientY);
        if (tile) this.onSelect(tile.userData.album, tile.userData.img);
      }
    });
    el.addEventListener("pointercancel", () => { down = false; });
  }

  pick(clientX, clientY) {
    const p = new THREE.Vector2((clientX / innerWidth) * 2 - 1, -(clientY / innerHeight) * 2 + 1);
    this.raycaster.setFromCamera(p, this.camera);
    const hit = this.raycaster.intersectObjects(this.tiles, false)[0];
    return hit ? hit.object : null;
  }

  setScroll(progress) {
    this.scrollRot = progress * Math.PI * 2.3;
    this.zoom = progress;
  }

  resize() {
    this.renderer.setSize(innerWidth, innerHeight, false);
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
  }

  update(t) {
    // flick momentum decays into drag target
    this.targetDrag.x += this.flick.x;
    this.targetDrag.y += this.flick.y;
    this.flick.x *= 0.95;
    this.flick.y *= 0.95;

    this.dragRot.x += (this.targetDrag.x - this.dragRot.x) * 0.06;
    this.dragRot.y += (this.targetDrag.y - this.dragRot.y) * 0.06;

    this.group.rotation.y = this.scrollRot + this.dragRot.y + t * 0.012;
    this.group.rotation.x = Math.sin(this.scrollRot * 0.6) * 0.16 + this.dragRot.x;
    this.dust.rotation.y = -t * 0.008;

    const fov = 72 - this.zoom * 22;
    if (Math.abs(this.camera.fov - fov) > 0.01) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.raycaster.intersectObjects(this.tiles, false)[0];
    const next = hit ? hit.object : null;
    if (next !== this.hovered) {
      this.hovered = next;
      this.canvas.style.cursor = next ? "pointer" : "grab";
      const tip = document.getElementById("tile-tip");
      if (tip) {
        if (next) {
          const a = next.userData.album;
          tip.innerHTML = `<strong>${a.artist}</strong><span>${a.title} — ${a.year}</span>`;
          tip.classList.add("on");
        } else tip.classList.remove("on");
      }
    }
    for (const m of this.tiles) {
      const target = m === this.hovered ? m.userData.baseScale * 1.1 : m.userData.baseScale;
      m.scale.setScalar(m.scale.x + (target - m.scale.x) * 0.12);
    }

    this.renderer.render(this.scene, this.camera);
  }
}
