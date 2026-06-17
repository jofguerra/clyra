// ═══════════════════════════════════════════════════════════════════════════
// Clyra — Hero Scene BACKGROUND (no character)
// ───────────────────────────────────────────────────────────────────────────
// Everything except the character: mountains + monitor + heartbeat line + bushes.
// The pre-assembled whole_heart.png mascot is overlayed on top in RN via the
// HeartMascot component, which handles its own breathing/float/tap motion.
//
// Why this split:
//   • Scene: repeatable, predictable layout (no rig guessing)
//   • Character: perfectly rendered PNG (no position errors), RN-animated
//     so it feels alive and responds to taps
// ═══════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const FPS = 30;
const DURATION_FRAMES = 150;   // 5s loop
const CANVAS_W = 1124;
const CANVAS_H = 842;

const PNGS_DIR = 'Animations and Assets/PNGs';

const PARTS = {
  bg:     { file: 'BG_1.png',      w: 1124, h: 842 },
  screen: { file: 'Screen.png',    w: 391,  h: 453 },
  line:   { file: 'LineaCardio.png', w: 249, h: 121 },
  front:  { file: 'Front.png',     w: 1126, h: 965 },
};

// Monitor on the LEFT side of hero — leaves room for the overlaid mascot
const RIG = {
  bg: {
    anchor:   [PARTS.bg.w / 2, PARTS.bg.h / 2],
    position: [CANVAS_W / 2, CANVAS_H / 2],
  },
  screen: {
    anchor:   [PARTS.screen.w / 2, PARTS.screen.h / 2],
    position: [210, 480],
    scale:    [80, 80],
  },
  line: {
    anchor:   [PARTS.line.w / 2, PARTS.line.h / 2],
    position: [210, 415],
  },
  front: {
    anchor:   [PARTS.front.w / 2, PARTS.front.h / 2],
    position: [CANVAS_W / 2, CANVAS_H / 2 + 100],
  },
};

const EASE = {
  LINEAR:      { in: { x: [0],    y: [0]    }, out: { x: [1],    y: [1]    } },
  SINE_IO:     { in: { x: [0.45], y: [0.05] }, out: { x: [0.55], y: [0.95] } },
  EASE_OUT:    { in: { x: [0.1],  y: [1]    }, out: { x: [0.2],  y: [0]    } },
  EASE_IN:     { in: { x: [1],    y: [1]    }, out: { x: [0.6],  y: [0]    } },
  EASE_IN_OUT: { in: { x: [0.42], y: [0]    }, out: { x: [0.58], y: [1]    } },
};

// ─── Property helpers ───────────────────────────────────────────────────
function numProp(value) {
  if (typeof value === 'number') return { a: 0, k: value };
  if (!Array.isArray(value) || value.length === 0) return { a: 0, k: value };
  if (typeof value[0] !== 'object' || value[0] === null) return { a: 0, k: value[0] };
  return {
    a: 1,
    k: value.map((kf, i, arr) => {
      const next = arr[i + 1];
      if (!next) return { t: kf.t, s: [kf.s] };
      return {
        t: kf.t,
        s: [kf.s],
        o: kf.easing?.out ?? EASE.SINE_IO.out,
        i: kf.easing?.in ?? EASE.SINE_IO.in,
      };
    }),
  };
}

function vecProp(value, dimensions = 3) {
  const pad = (v) => {
    if (Array.isArray(v)) return dimensions === 3 ? [...v, 0] : v;
    return dimensions === 3 ? [v, v, 0] : [v, v];
  };
  const isKfArray = Array.isArray(value) && value.length > 0 && typeof value[0] === 'object'
    && value[0] !== null && !Array.isArray(value[0]) && ('s' in value[0] || 't' in value[0]);
  if (!isKfArray) return { a: 0, k: pad(value) };
  return {
    a: 1,
    k: value.map((kf, i, arr) => {
      const next = arr[i + 1];
      const val = Array.isArray(kf.s)
        ? (dimensions === 3 ? [...kf.s, 0] : kf.s)
        : pad(kf.s);
      if (!next) return { t: kf.t, s: val };
      const easing = kf.easing ?? EASE.SINE_IO;
      return {
        t: kf.t,
        s: val,
        o: { x: [easing.out.x[0], easing.out.x[0]], y: [easing.out.y[0], easing.out.y[0]] },
        i: { x: [easing.in.x[0], easing.in.x[0]],   y: [easing.in.y[0], easing.in.y[0]] },
      };
    }),
  };
}

function buildTransform({ anchor, position, scale = [100, 100], rotation = 0, opacity = 100 }) {
  return {
    o: numProp(opacity),
    r: numProp(rotation),
    p: vecProp(position, 3),
    a: vecProp(anchor, 3),
    s: vecProp(scale, 3),
  };
}

function imageLayer({ name, refId, ind, transform }) {
  return {
    ddd: 0, ind, ty: 2, nm: name, refId, sr: 1, ks: transform,
    ao: 0, shapes: [], ip: 0, op: DURATION_FRAMES, st: 0, bm: 0,
  };
}

function imageAsset(id, w, h, base64) {
  return { id, w, h, u: '', p: `data:image/png;base64,${base64}`, e: 1 };
}

function loadPng(file) {
  return fs.readFileSync(path.join(__dirname, '..', PNGS_DIR, file)).toString('base64');
}

// ═══════════════════════════════════════════════════════════════════════════
// Animations (scene only — no character)
// ═══════════════════════════════════════════════════════════════════════════

// Heartbeat line pulses twice per loop (rhythmic beat)
const LINE_SCALE = [
  { t: 0,   s: [100, 100], easing: EASE.EASE_IN_OUT },
  { t: 30,  s: [112, 112], easing: EASE.EASE_OUT },
  { t: 60,  s: [100, 100], easing: EASE.EASE_IN_OUT },
  { t: 90,  s: [112, 112], easing: EASE.EASE_OUT },
  { t: 120, s: [100, 100], easing: EASE.EASE_IN_OUT },
  { t: 150, s: [100, 100] },
];
const LINE_OPACITY = [
  { t: 0,   s: 100, easing: EASE.EASE_IN_OUT },
  { t: 30,  s: 55,  easing: EASE.EASE_IN_OUT },
  { t: 60,  s: 100, easing: EASE.EASE_IN_OUT },
  { t: 90,  s: 55,  easing: EASE.EASE_IN_OUT },
  { t: 120, s: 100, easing: EASE.EASE_IN_OUT },
  { t: 150, s: 100 },
];

// ═══════════════════════════════════════════════════════════════════════════
// Assemble
// ═══════════════════════════════════════════════════════════════════════════

const assets = [
  imageAsset('bg',     PARTS.bg.w,     PARTS.bg.h,     loadPng(PARTS.bg.file)),
  imageAsset('screen', PARTS.screen.w, PARTS.screen.h, loadPng(PARTS.screen.file)),
  imageAsset('line',   PARTS.line.w,   PARTS.line.h,   loadPng(PARTS.line.file)),
  imageAsset('front',  PARTS.front.w,  PARTS.front.h,  loadPng(PARTS.front.file)),
];

// Layer order: first = topmost rendered
const layers = [
  // Foreground bushes on top
  imageLayer({
    name: 'Foreground', refId: 'front', ind: 1,
    transform: buildTransform({ anchor: RIG.front.anchor, position: RIG.front.position }),
  }),
  // Heartbeat line — animated, on top of monitor frame
  imageLayer({
    name: 'Heartbeat', refId: 'line', ind: 2,
    transform: buildTransform({
      anchor: RIG.line.anchor,
      position: RIG.line.position,
      scale: LINE_SCALE,
      opacity: LINE_OPACITY,
    }),
  }),
  // Monitor frame
  imageLayer({
    name: 'Screen', refId: 'screen', ind: 3,
    transform: buildTransform({
      anchor: RIG.screen.anchor,
      position: RIG.screen.position,
      scale: RIG.screen.scale,
    }),
  }),
  // Background (last = bottom)
  imageLayer({
    name: 'Background', refId: 'bg', ind: 4,
    transform: buildTransform({ anchor: RIG.bg.anchor, position: RIG.bg.position }),
  }),
];

const lottie = {
  v: '5.7.4', fr: FPS, ip: 0, op: DURATION_FRAMES,
  w: CANVAS_W, h: CANVAS_H,
  nm: 'Clyra Hero Scene (no character)',
  ddd: 0, assets, layers,
};

const outPath = path.join(__dirname, '..', 'assets', 'animations', 'hero-scene-bg.json');
fs.writeFileSync(outPath, JSON.stringify(lottie));
const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(`✓ Wrote ${outPath}`);
console.log(`  Canvas: ${CANVAS_W}×${CANVAS_H}`);
console.log(`  Duration: ${DURATION_FRAMES / FPS}s @ ${FPS}fps`);
console.log(`  Size: ${sizeKB} KB`);
console.log(`  Layers: ${layers.length}`);
