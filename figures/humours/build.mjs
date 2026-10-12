// Avicenna, Canon I.1.3–4 — the four humours as a just balance: a bench model.
//
//   node figures/humours/build.mjs          → figures/humours/out/index.html (light)
//   node figures/humours/build.mjs --dark   → figures/humours/out/dark.html
//
// The Canon (Adomeh's English, ~/AncientMedicine/04-avicenna-canon/01-canon-book-1):
//  · eng-103: the physician's "balanced" is "derived not from equilibrium, which is
//    weighing out in equal parts, but from justice in distribution", each part given
//    "the share that is due to it"; an unbalanced temperament inclines "either in one
//    of the two contrarieties … or in both" — nine temperaments in all.
//  · eng-104: four genera of humour, "blood, which is the best of them", phlegm,
//    yellow bile, black bile; "blood is hot and moist in nature".
// So the table is level when each jar holds its *due* share, not equal amounts: each
// jar stands at a distance inversely proportional to its share, the heaviest nearest
// the pivot. The Canon ranks the humours but gives no numbers: the shares here are
// illustrative, and only their order (blood the most) is the text's.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";
import * as G from "../kit/lathe.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "out");
const theme = process.argv.includes("--dark") ? "dark" : "light";
const kitScript = () => readFileSync(join(HERE, "..", "kit", "iso-kit.mjs"), "utf8").replace(/^export /gm, "");

// ── Truth ─────────────────────────────────────────────────────────────────────
// x: hot (+) / cold (−); y: moist (+) / dry (−)
const S2 = Math.SQRT1_2;
const HUMOURS = [
  { id: "black", name: "black bile", q: "cold and dry", dir: [-S2, -S2], share: 0.15 },
  { id: "yellow", name: "yellow bile", q: "hot and dry", dir: [S2, -S2], share: 0.2 },
  { id: "phlegm", name: "phlegm", q: "cold and moist", dir: [-S2, S2], share: 0.25 },
  { id: "blood", name: "blood", q: "hot and moist", dir: [S2, S2], share: 0.4 },
];
const LEVER = 9; // share × distance is the same for every jar: the table balances
for (const h of HUMOURS) {
  h.dist = LEVER / h.share;
  h.at = [-h.dir[0] * h.dist, -h.dir[1] * h.dist]; // half a turn round, so blood stands behind the pivot
  h.h = 13 + h.share * 52; // a jar sized to its due share
}

// ── World ─────────────────────────────────────────────────────────────────────
const WIDTH = 640, HEIGHT = 440;
const PLATE = { x: -62, y: -62, w: 124, d: 124, r: 9 };
const PLATE_H = 10, FOOT_H = 5;
const HALF = 54; // the tilting table
const TOP = 56, THICK = 3.2;
const JAR_R = 8.5;
const TRAY = 9.5;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), ...HUMOURS.map((h) => [h.at[0], h.at[1], TOP + h.h + 3]), [-HALF, -HALF, TOP + 6], [HALF, HALF, TOP]],
  WIDTH,
  HEIGHT,
  { pad: 30, azimuth: 45 },
);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const byDepth = (list, of = (p) => p) => [...list].sort((a, b) => k.depthOf([...of(a).slice(0, 2), 0], P) - k.depthOf([...of(b).slice(0, 2), 0], P));

function base() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 18))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid", inner: L(k.sideSeam(PLATE, -PLATE_H / 2, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  const label = { x: 20, y: 44, w: 30, d: 12, r: 1.2 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 4), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(label, 1.6), 0.8, P, 4), { tone: "faint" }));
  out.push(k.faceTextSvg(k.topMatrix([label.x + 4, label.y + 6], 0.8, P, "x"), "Canon I", { size: 3, tone: "mid" }));
  out.push(L(k.lineOnTop([label.x + 4, label.y + 9.2], [label.x + 18, label.y + 9.2], 0.8, P), { tone: "lo", free: true }));
  return out.join("");
}

// four stops under the table's corners: how far it may tip
const STOPS = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => [sx * (HALF - 9), sy * (HALF - 9)]);
const STOP_TOP = TOP - THICK - 5.5;
function stop([x, y]) {
  return [
    S(k.cylinder(x, y, 4.6, 0, 1.8, P, 20), { tone: "lo" }),
    S(k.cylinder(x, y, 2.2, 1.8, STOP_TOP - 1.8 - 1.6, P, 16), { tone: "mid", crease: "none" }),
    S(k.cylinder(x, y, 3, STOP_TOP - 1.6, 1.6, P, 18), { tone: "lo" }),
  ].join("");
}

function pivot() {
  const out = [];
  out.push(S(k.cylinder(0, 0, 11, 0, 3, P, 40, 0.6), { tone: "mid" }));
  out.push(D(G.dotsOf(G.frameAlong([0, 0, 0], [0, 0, 1]), 3, 8.4, 6, P, { all: true }), { size: 0.45 }));
  out.push(S(k.cylinder(0, 0, 5, 3, TOP - THICK - 9, P, 28), { tone: "mid", crease: "none" }));
  out.push(L([18, 34].map((z) => k.sideArc(0, 0, 5, z, P, 20)).join(""), { tone: "faint" }));
  out.push(S(k.cylinder(0, 0, 6.4, TOP - THICK - 9, 2.4, P, 28), { tone: "mid" }));
  out.push(S(G.sphereOf([0, 0, TOP - THICK - 3.3], 3.3, P), { tone: "hi" }));
  return out.join("");
}

// An albarello, the apothecary's jar: waisted, glazed, a lid, and a sight-slot in front.
function jarProfile(H, r) {
  return [[0, 0], [0, r - 1.2], [1.2, r], [H * 0.2, r, 1], [H * 0.5, r - 1.5, 1], [H * 0.8, r, 1], [H - 1.6, r - 0.4], [H - 1.6, r - 2.2], [H, r - 2.2], [H, 0]];
}
const FACE = Math.PI / 4; // the jar's sight-slot faces the viewer (azimuth 45°)
const radiusAt = (profile, s) => {
  const side = profile.slice(1, -1);
  for (let i = 0; i < side.length - 1; i++) {
    const [s0, r0] = side[i], [s1, r1] = side[i + 1];
    if (s >= s0 && s <= s1 && s1 > s0) return r0 + ((r1 - r0) * (s - s0)) / (s1 - s0);
  }
  return side[side.length - 1][1];
};
function slot(h, z0, z1, widen = 0) {
  const prof = jarProfile(h.h, JAR_R);
  const pts = [];
  const half = 0.34 + widen;
  for (let i = 0; i <= 6; i++) {
    const a = FACE - half + (2 * half * i) / 6, z = z0;
    const r = radiusAt(prof, z) + 0.05;
    pts.push([h.at[0] + Math.cos(a) * r, h.at[1] + Math.sin(a) * r, TOP + z]);
  }
  for (let i = 6; i >= 0; i--) {
    const a = FACE - half + (2 * half * i) / 6, z = z1;
    const r = radiusAt(prof, z) + 0.05;
    pts.push([h.at[0] + Math.cos(a) * r, h.at[1] + Math.sin(a) * r, TOP + z]);
  }
  return "M" + pts.map((p) => at(p).map((n) => n.toFixed(1)).join(" ")).join("L") + "Z";
}
function jar(h) {
  const out = [];
  const F = G.frameAlong([h.at[0], h.at[1], TOP], [0, 0, 1]);
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: h.at[0] - JAR_R, y: h.at[1] - JAR_R, w: JAR_R * 2, d: JAR_R * 2, r: JAR_R }, TOP, 0.5, P)}" style="filter:blur(3px)"/>`);
  const prof = jarProfile(h.h, JAR_R);
  out.push(S(G.solidOf(prof, F, P), { tone: "hi", crease: "lo", inner: L([G.arcOf(F, 3, radiusAt(prof, 3), P), G.arcOf(F, h.h - 4, radiusAt(prof, h.h - 4), P)].join(""), { tone: "faint" }) }));
  out.push(`<path class="hm-slot" d="${slot(h, 4.5, h.h - 6.5)}"/>`);
  out.push(`<path class="hm-fluid hm-${h.id}" data-fluid="${h.id}" d=""/>`);
  out.push(`<path class="hm-slot-edge" d="${slot(h, 4.5, h.h - 6.5)}"/>`);
  out.push(S(G.disc(h.h, h.h + 1.6, JAR_R - 1.4, F, P), { tone: "hi", crease: "lo" }));
  out.push(S(G.sphereOf([h.at[0], h.at[1], TOP + h.h + 2.6], 1.6, P), { tone: "mid" }));
  return out.join("");
}

// fluid paths for each level 0..1, precomputed so the page only picks one per frame
const FLUID_STEPS = 48;
const fluids = Object.fromEntries(HUMOURS.map((h) => [h.id, Array.from({ length: FLUID_STEPS + 1 }, (_, i) => {
  const z1 = 4.5 + (h.h - 11) * (i / FLUID_STEPS);
  return i === 0 ? "" : slot(h, 4.5, z1, -0.04);
})]));

// ── Live ──────────────────────────────────────────────────────────────────────
const C = { HUMOURS: HUMOURS.map(({ id, name, q, dir, at: p, h }) => ({ id, name, q, dir, at: p, h })), HALF, TOP, THICK, TRAY, FLUID_STEPS, fluids, TV: [Math.cos(FACE), Math.sin(FACE)] };
const live = String.raw`
const P = __P__;
const C = __C__;
const pt = (p) => iso(p, P).map((n) => n.toFixed(1)).join(" ");
const poly = (list) => "M" + list.map(pt).join("L") + "Z";
const stage = document.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const tableEl = svg.querySelector('[data-part="table"]');
const trayEl = svg.querySelector('[data-part="tray"]');
const jarEls = Object.fromEntries(C.HUMOURS.map((h) => [h.id, svg.querySelector('[data-jar="' + h.id + '"]')]));
const fluidEls = Object.fromEntries(C.HUMOURS.map((h) => [h.id, svg.querySelector('[data-fluid="' + h.id + '"]')]));
const readout = document.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");

// excess of each humour over its due share (0 = due); the tour visits balance and each humour
const TOUR = [{}, { blood: 0.85 }, {}, { yellow: 0.85 }, {}, { black: 0.85 }, {}, { phlegm: 0.85 }, { blood: 0.7, yellow: 0.7 }, {}];
let excess = { blood: 0, phlegm: 0, yellow: 0, black: 0 }, target = { ...excess }, touring = !still.matches, clock = 0;
let tilt = [0, 0], rate = [0, 0], ball = [0, 0], visible = false, frame = 0, last = 0, idleTimer = 0;

const lean = () => {
  let x = 0, y = 0;
  for (const h of C.HUMOURS) { x += excess[h.id] * h.dir[0]; y += excess[h.id] * h.dir[1]; }
  return [x, y];
};
const zAt = (x, y) => C.TOP - (tilt[0] * x + tilt[1] * y);

function temperament([x, y]) {
  const t = 0.22;
  const hx = x > t ? "hot" : x < -t ? "cold" : "", my = y > t ? "moist" : y < -t ? "dry" : "";
  if (!hx && !my) return "balanced: each its due share";
  const which = C.HUMOURS.filter((h) => excess[h.id] > 0.2).map((h) => h.name);
  return [hx, my].filter(Boolean).join(" and ") + (which.length ? " · " + which.join(" + ") + " in excess" : "");
}

function drawTable() {
  const H = C.HALF, T = C.THICK;
  const corners = [[-H, -H], [H, -H], [H, H], [-H, H]];
  const top = corners.map(([x, y]) => [x, y, zAt(x, y)]);
  const bot = top.map(([x, y, z]) => [x, y, z - T]);
  let out = "";
  // the two sides that face the viewer (+x and +y), then the top
  out += '<path class="iso-fill" d="' + poly([...top, ...bot]) + '"/>';
  out += '<path class="iso-shade" data-shade="1" d="' + poly([top[1], top[2], bot[2], bot[1]]) + '"/>';
  out += '<path class="iso-shade" data-shade="2" d="' + poly([top[2], top[3], bot[3], bot[2]]) + '"/>';
  out += '<path class="iso-top" d="' + poly(top) + '"/>';
  out += '<path class="iso-line iso-edge" data-tone="mid" d="' + poly([top[0], top[1], bot[1], bot[2], bot[3], top[3]]) + '"/>';
  out += '<path class="iso-line" data-tone="faint" d="M' + pt(top[1]) + "L" + pt(top[2]) + "L" + pt(top[3]) + '"/>';
  // an inlaid border and the two axes, hot–cold and moist–dry, engraved corner to corner
  const I = H - 5;
  out += '<path class="iso-line" data-tone="lo" d="' + poly([[-I, -I, zAt(-I, -I)], [I, -I, zAt(I, -I)], [I, I, zAt(I, I)], [-I, I, zAt(-I, I)]]) + '"/>';
  const axis = (a, b) => "M" + pt([a[0], a[1], zAt(a[0], a[1])]) + "L" + pt([b[0], b[1], zAt(b[0], b[1])]);
  out += '<path class="iso-line" data-tone="faint" d="' + axis([-I, -I], [-C.TRAY - 1, -C.TRAY - 1]) + axis([C.TRAY + 1, C.TRAY + 1], [I, I]) + axis([I, -I], [C.TRAY + 1, -C.TRAY - 1]) + axis([-C.TRAY - 1, C.TRAY + 1], [-I, I]) + '"/>';
  const screws = [[-H + 4, -H + 4], [H - 4, -H + 4], [H - 4, H - 4], [-H + 4, H - 4]].map(([x, y]) => iso([x, y, zAt(x, y)], P));
  out += screws.map(([x, y]) => '<circle class="hm-dot" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r=".55"/>').join("");
  tableEl.innerHTML = out;
}

// the tray of the nine temperaments, and the ball that rolls to the low side
function drawTray() {
  const R = C.TRAY;
  const ring = (r) => poly([[-r, -r, zAt(-r, -r)], [r, -r, zAt(r, -r)], [r, r, zAt(r, r)], [-r, r, zAt(-r, r)]]);
  let out = '<path class="hm-tray" d="' + ring(R) + '"/><path class="iso-line" data-tone="mid" d="' + ring(R) + '"/>';
  let grid = "";
  for (const v of [-R / 3, R / 3]) {
    grid += "M" + pt([v, -R, zAt(v, -R)]) + "L" + pt([v, R, zAt(v, R)]);
    grid += "M" + pt([-R, v, zAt(-R, v)]) + "L" + pt([R, v, zAt(R, v)]);
  }
  out += '<path class="iso-line" data-tone="lo" d="' + grid + '"/>';
  const [bx, by] = ball;
  const [sx, sy] = iso([bx, by, zAt(bx, by) + 1.9], P);
  out += '<circle class="hm-ball" cx="' + sx.toFixed(1) + '" cy="' + sy.toFixed(1) + '" r="2.3"/>';
  out += '<circle class="hm-ball-hi" cx="' + (sx - 0.7).toFixed(1) + '" cy="' + (sy - 0.8).toFixed(1) + '" r=".7"/>';
  trayEl.innerHTML = out;
}

function draw() {
  drawTable();
  for (const h of C.HUMOURS) {
    const dz = zAt(h.at[0], h.at[1]) - C.TOP;
    jarEls[h.id].setAttribute("transform", translateAlong(P, [0, 0, dz]));
    const level = Math.max(0, Math.min(1, 0.5 * (1 + excess[h.id])));
    fluidEls[h.id].setAttribute("d", C.fluids[h.id][Math.round(level * C.FLUID_STEPS)]);
  }
  drawTray();
  const text = temperament(lean());
  if (readout.textContent !== text) readout.textContent = text;
  stage.setAttribute("aria-valuetext", text);
}

function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (touring) { clock += dt; target = { blood: 0, phlegm: 0, yellow: 0, black: 0, ...TOUR[Math.floor(clock / 2.6) % TOUR.length] }; }
  for (const id in excess) excess[id] += (target[id] - excess[id]) * (1 - Math.exp(-dt / 0.55));
  // the table is a damped pendulum about the pivot; its lean follows the torque of the excess
  const [lx, ly] = lean(), want = [-lx * 0.08, -ly * 0.08];
  for (let s = 0; s < 4; s++) for (let i = 0; i < 2; i++) { rate[i] += ((want[i] - tilt[i]) * 160 - rate[i] * 16) * dt / 4; tilt[i] += rate[i] * dt / 4; }
  const lim = 0.1; tilt = tilt.map((t) => Math.max(-lim, Math.min(lim, t)));
  const R = C.TRAY / 3, goal = [-lx, -ly].map((v) => Math.max(-1, Math.min(1, v / 0.42)) * R);
  ball = ball.map((b, i) => b + (goal[i] - b) * (1 - Math.exp(-dt / 0.35)));
  draw();
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible && !still.matches) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (next) => { touring = false; target = next; clearTimeout(idleTimer); idleTimer = setTimeout(() => { touring = !still.matches; clock = 0; run(); }, 4000); run(); };
new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
// pointer: the jar nearest the pointer swells past its due share
stage.addEventListener("pointermove", (event) => {
  const box = svg.getBoundingClientRect(), scale = box.width / svg.viewBox.baseVal.width;
  const next = {};
  for (const h of C.HUMOURS) {
    const [jx, jy] = iso([h.at[0], h.at[1], C.TOP + h.h / 2], P);
    const d = Math.hypot(event.clientX - (box.left + jx * scale), event.clientY - (box.top + jy * scale)) / box.width;
    next[h.id] = Math.max(0, Math.min(0.9, (0.3 - d) * 4));
  }
  steer(next);
});
const KEYS = { b: "blood", p: "phlegm", y: "yellow", k: "black" };
stage.addEventListener("keydown", (event) => {
  const id = KEYS[event.key];
  if (event.key === "0" || event.key === "Escape") { event.preventDefault(); steer({ blood: 0, phlegm: 0, yellow: 0, black: 0 }); return; }
  if (!id) return;
  event.preventDefault();
  const next = { blood: 0, phlegm: 0, yellow: 0, black: 0 }; next[id] = 0.85; steer(next);
  if (still.matches) { excess = next; draw(); }
});
draw();
`;

const jarSvg = (h) => `<g data-jar="${h.id}">${jar(h)}</g>`;
const behind = (h) => k.depthOf([h.at[0], h.at[1], 0], P) < k.depthOf([0, 0, 0], P);
const jarsBack = byDepth(HUMOURS.filter(behind), (h) => h.at).map(jarSvg).join("");
const jarsFront = byDepth(HUMOURS.filter((h) => !behind(h)), (h) => h.at).map(jarSvg).join("");
const stopsBack = STOPS.filter(([x, y]) => x + y < 0).map(stop).join("");
const stopsFront = STOPS.filter(([x, y]) => x + y >= 0).map(stop).join("");

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "Avicenna's account of temperament as a bench model: a square table tilting on a pivot carries four apothecary jars, blood, phlegm, yellow bile and black bile, each at a distance inversely proportional to its due share, so the table is level when every humour holds its due share rather than equal amounts. When one humour exceeds its share the table tips toward it, and a ball in a central tray engraved with a three-by-three grid rolls into the cell of one of the nine temperaments.",
  body: [base(), pivot(), `<g data-part="table"></g>`, jarsBack, `<g data-part="tray"></g>`, jarsFront],
});

const THEME_CSS = `
.iso[data-theme="light"]{
  --anatomy-page:#f1e9d8;--anatomy-card:#faf7f2;--anatomy-text:#5c4a38;--anatomy-strong:#1a1612;--anatomy-muted:#8b7355;
  --anatomy-paper:#faf7f2;--anatomy-face:#fdfbf6;--anatomy-top:#fdfbf6;
  --anatomy-shade-0:#e3d9c5;--anatomy-shade-1:#ebe2d1;--anatomy-shade-2:#f1eadc;--anatomy-shade-3:#f6f1e7;
  --anatomy-lit-top:#fffdf8;--anatomy-lit-shade:#efe6d4;
  --anatomy-hi:#2a2018;--anatomy-mid:#8b7355;--anatomy-lo:#c2b196;--anatomy-faint:#e0d6c3;--anatomy-lit:#1a1612;
  --anatomy-halo:#6b5443;--anatomy-halo-opacity:.3;--anatomy-dot:#3d3529;
  --hm-blood:#8b2f2f;--hm-phlegm:#d8d3bf;--hm-yellow:#c99a2e;--hm-black:#2f2a24;--hm-slot:#e9e0cd;
}
.iso[data-theme="dark"]{
  --anatomy-page:#1f1710;--anatomy-card:#231a12;--anatomy-text:#b9a88f;--anatomy-strong:#f2ebdc;--anatomy-muted:#8b7355;
  --anatomy-paper:#1f1710;--anatomy-face:#2a2018;--anatomy-top:#2b2219;
  --anatomy-shade-0:#1a130c;--anatomy-shade-1:#1e160f;--anatomy-shade-2:#221911;--anatomy-shade-3:#271d14;
  --anatomy-lit-top:#3a2c1f;--anatomy-lit-shade:#2e2318;
  --anatomy-hi:#e9dcc0;--anatomy-mid:#8b7355;--anatomy-lo:#54442f;--anatomy-faint:#35291d;--anatomy-lit:#f2ebdc;
  --anatomy-halo:#000;--anatomy-halo-opacity:.85;--anatomy-dot:#f2ebdc;
  --hm-blood:#a8423c;--hm-phlegm:#b9b29a;--hm-yellow:#cfa03a;--hm-black:#0a0705;--hm-slot:#4a3a2a;
}
.hm-slot{fill:var(--hm-slot);stroke:none}
.hm-slot-edge{fill:none;stroke:var(--anatomy-lo);stroke-width:.6px}
.hm-fluid{stroke:none}
.hm-blood{fill:var(--hm-blood)}.hm-phlegm{fill:var(--hm-phlegm)}.hm-yellow{fill:var(--hm-yellow)}.hm-black{fill:var(--hm-black)}
.hm-tray{fill:var(--anatomy-shade-1)}
.hm-ball{fill:var(--anatomy-lit);stroke:none}
.hm-ball-hi{fill:var(--anatomy-paper);opacity:.55}
.hm-dot{fill:var(--anatomy-dot);opacity:.32}
.iso-page{margin:24px auto 32px}
`;

const body = k.plateHtml({
  fig: "Canon I.1.3",
  title: "The just balance",
  hint: "Hover a jar · keys b p y k, 0",
  readout: "",
  keys: [
    { mark: "lit", label: "The ball: it rolls into the temperament the body inclines to" },
    { mark: "red", label: "Blood, hot and moist: 'the best of them', the largest share" },
    { mark: "raised", label: "Phlegm (cold, moist), yellow bile (hot, dry), black bile (cold, dry)" },
  ],
  caption:
    "Avicenna: the physician's 'balanced' is 'derived not from equilibrium, which is weighing out in equal parts, but from justice in distribution', each part given the share due to it. So the jars are not equal: each stands as far from the pivot as its share is small, and the table is level only when every humour holds its due share. When one exceeds it the table tips that way, toward heat or cold, moisture or dryness, or both, and the ball rolls into one of the nine temperaments: balanced, four simple, four compound. The Canon ranks the humours (blood the most) but gives no numbers; the shares drawn here are illustrative.",
  body: `<div class="iso-stage" tabindex="0" role="application" aria-label="The just balance: move the pointer to make one humour exceed its share; keys b, p, y and k do the same, 0 restores balance">${svg}</div>`,
});

mkdirSync(OUT, { recursive: true });
const liveCode = live.replace("__P__", JSON.stringify(P)).replace("__C__", JSON.stringify(C));
const file = theme === "dark" ? "dark.html" : "index.html";
const page = k.pageHtml({ title: "The just balance — Avicenna, Canon I", theme, body, script: kitScript() + liveCode }).replace("</style>", THEME_CSS + "</style>");
writeFileSync(join(OUT, file), page);
console.log("wrote figures/humours/out/" + file, (page.length / 1024).toFixed(0) + " KB");
