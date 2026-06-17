// ═══════════════════════════════════════════════════════════════════════════
// Reconstruct heart-hero-scene.json from Creator state + local PNG assets
// ───────────────────────────────────────────────────────────────────────────
// The Creator scene data (positions, keyframes, rotations) was exported via
// the MCP bridge and pasted below. PNG assets are read from local disk and
// base64-encoded at build time.
// ═══════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

// ─── Creator state (extracted via MCP) ──────────────────────────────────
// Map asset dimensions → local PNG path
// Creator's asset IDs are random strings; we identify them by w×h.
const DIM_TO_FILE = {
  '284x100':  'Animations and Assets/Heart/brows.png',
  '287x149':  'Animations and Assets/Heart/eyes.png',
  '130x107':  'Animations and Assets/Heart/mouth.png',
  '246x191':  'Animations and Assets/Heart/arm 2.png',
  '479x420':  'Animations and Assets/Heart/body.png',
  '131x181':  'Animations and Assets/Heart/leg 1.png',
  '131x185':  'Animations and Assets/Heart/leg 2.png',
  '249x121':  'Animations and Assets/PNGs/LineaCardio.png',
  '215x252':  'Animations and Assets/Heart/arm 1.png',
  '391x453':  'Animations and Assets/PNGs/Screen.png',
  '1124x842': 'Animations and Assets/PNGs/BG_1.png',
  '1126x965': 'Animations and Assets/PNGs/Front.png',
};

// Scene layers from the user's edited Creator scene. Each layer has:
//   refId, dims, pos (static or keyframes), scale, rot, opacity
const CREATOR_STATE = {
  width: 1124, height: 842, duration: 5, fps: 30,
  layers: [
    // ─── FACE: static position (body doesn't move), keep blinks + mouth pulse
    {
      name: 'Brows', dimKey: '284x100',
      pos: { static: { x: 620, y: 400 } },
      scale: { static: { x: 85, y: 85 } }, rot: { static: 0 }, opacity: { static: 100 },
    },
    {
      name: 'Eyes', dimKey: '287x149',
      pos: { static: { x: 620, y: 450 } },
      // Blinks preserved — personality detail
      scale: { keyframes: [
        { frame:0,   value:{x:85,y:85},   easing:'easeInOut' },
        { frame:48,  value:{x:85,y:85},   easing:'easeIn' },
        { frame:50,  value:{x:85,y:8.5},  easing:'easeOut' },
        { frame:53,  value:{x:85,y:85},   easing:'easeInOut' },
        { frame:128, value:{x:85,y:85},   easing:'easeIn' },
        { frame:130, value:{x:85,y:8.5},  easing:'easeOut' },
        { frame:133, value:{x:85,y:85},   easing:'easeInOut' },
        { frame:150, value:{x:85,y:85} },
      ]},
      rot: { static: 0 }, opacity: { static: 100 },
    },
    {
      name: 'Mouth', dimKey: '130x107',
      pos: { static: { x: 620, y: 515 } },
      // Gentle smile pulse preserved
      scale: { keyframes: [
        { frame:0,   value:{x:85,  y:85},   easing:'easeInOut' },
        { frame:20,  value:{x:91.8,y:80.75},easing:'easeInOut' },
        { frame:40,  value:{x:80.75,y:89.25}, easing:'easeInOut' },
        { frame:60,  value:{x:95.2,y:85},   easing:'easeInOut' },
        { frame:80,  value:{x:83.3,y:80.75},easing:'easeInOut' },
        { frame:100, value:{x:90.1,y:87.55},easing:'easeInOut' },
        { frame:120, value:{x:85,  y:85},   easing:'easeInOut' },
        { frame:150, value:{x:85,  y:85} },
      ]},
      rot: { static: 0 }, opacity: { static: 100 },
    },
    // ─── ARM R: very subtle wave (65° base → 70° at midpoint → 65°), 5° swing
    {
      name: 'Arm R', dimKey: '246x191',
      pos: { static: { x: 760, y: 440 } },
      scale: { static: { x: 85, y: 85 } },
      rot: { keyframes: [
        { frame:0,   value: 65, easing:'sine' },
        { frame:75,  value: 70, easing:'sine' },
        { frame:150, value: 65 },
      ]},
      opacity: { static: 100 },
    },
    // ─── BODY: completely static — no breathing, no float, no tilt
    {
      name: 'Body', dimKey: '479x420',
      pos: { static: { x: 620, y: 470 } },
      scale: { static: { x: 85, y: 85 } },
      rot: { static: 0 },
      opacity: { static: 100 },
    },
    // ─── LEGS: completely static (body doesn't move, legs don't either)
    {
      name: 'Leg L', dimKey: '131x181',
      pos: { static: { x: 588, y: 600 } },
      scale: { static: { x: 85, y: 85 } }, rot: { static: 0 }, opacity: { static: 100 },
    },
    {
      name: 'Leg R', dimKey: '131x185',
      pos: { static: { x: 652, y: 600 } },
      scale: { static: { x: 85, y: 85 } }, rot: { static: 0 }, opacity: { static: 100 },
    },
    {
      name: 'Heartbeat', dimKey: '249x121',
      pos: { static: { x: 345.65, y: 471.29 } },
      scale: { keyframes: [
        { frame:0,   value:{x:82.43,y:83.12}, easing:'easeInOut' },
        { frame:30,  value:{x:108,y:108},     easing:'easeOut' },
        { frame:60,  value:{x:100,y:100},     easing:'easeInOut' },
        { frame:90,  value:{x:108,y:108},     easing:'easeOut' },
        { frame:120, value:{x:100,y:100},     easing:'easeInOut' },
        { frame:150, value:{x:100,y:100} },
      ]},
      rot: { static:0 },
      opacity: { keyframes: [
        { frame:0,   value:100, easing:'easeInOut' },
        { frame:30,  value:60,  easing:'easeInOut' },
        { frame:60,  value:100, easing:'easeInOut' },
        { frame:90,  value:60,  easing:'easeInOut' },
        { frame:120, value:100, easing:'easeInOut' },
        { frame:150, value:100 },
      ]},
    },
    // ─── ARM L (waving): subtle wave (-10° base → -5° midpoint → -10°), 5° swing
    {
      name: 'Arm L', dimKey: '215x252',
      pos: { static: { x: 530, y: 440 } },
      scale: { static: { x: -85, y: 85 } },
      rot: { keyframes: [
        { frame:0,   value: -10, easing:'sine' },
        { frame:75,  value: -5,  easing:'sine' },
        { frame:150, value: -10 },
      ]},
      opacity: { static: 100 },
    },
    {
      name: 'Screen', dimKey: '391x453',
      pos: { static: { x: 345.65, y: 557.10 } },
      scale: { static:{x:80,y:80} }, rot: { static:0 }, opacity: { static:100 },
    },
    {
      name: 'Background', dimKey: '1124x842',
      pos: { static: { x: 562, y: 421 } },
      scale: { static:{x:100,y:100} }, rot: { static:0 }, opacity: { static:100 },
    },
    {
      name: 'Foreground', dimKey: '1126x965',
      pos: { static: { x: 561, y: 345.97 } },
      scale: { static:{x:100,y:100} }, rot: { static:0 }, opacity: { static:100 },
    },
  ],
};

// ─── Easing presets (Lottie bezier format) ──────────────────────────────
const EASING_MAP = {
  sine:       { in: { x: [0.45], y: [0.05] }, out: { x: [0.55], y: [0.95] } },
  easeInOut:  { in: { x: [0.42], y: [0]    }, out: { x: [0.58], y: [1]    } },
  easeIn:     { in: { x: [1],    y: [1]    }, out: { x: [0.6],  y: [0]    } },
  easeOut:    { in: { x: [0.1],  y: [1]    }, out: { x: [0.2],  y: [0]    } },
  linear:     { in: { x: [0],    y: [0]    }, out: { x: [1],    y: [1]    } },
};

// ─── Property builders ──────────────────────────────────────────────────
function numProp(spec) {
  if (spec.static !== undefined) return { a: 0, k: spec.static };
  return {
    a: 1,
    k: spec.keyframes.map((kf, i, arr) => {
      const next = arr[i + 1];
      if (!next) return { t: kf.frame, s: [kf.value] };
      const e = EASING_MAP[kf.easing] || EASING_MAP.sine;
      return { t: kf.frame, s: [kf.value], o: e.out, i: e.in };
    }),
  };
}

function vecProp(spec, dims = 3) {
  const pad = (v) => dims === 3 ? [v.x, v.y, 0] : [v.x, v.y];
  if (spec.static !== undefined) return { a: 0, k: pad(spec.static) };
  return {
    a: 1,
    k: spec.keyframes.map((kf, i, arr) => {
      const next = arr[i + 1];
      const val = pad(kf.value);
      if (!next) return { t: kf.frame, s: val };
      const e = EASING_MAP[kf.easing] || EASING_MAP.sine;
      return {
        t: kf.frame,
        s: val,
        o: { x: [e.out.x[0], e.out.x[0]], y: [e.out.y[0], e.out.y[0]] },
        i: { x: [e.in.x[0],  e.in.x[0]],  y: [e.in.y[0],  e.in.y[0]] },
      };
    }),
  };
}

// ─── Build assets (base64-encode PNGs from disk) ─────────────────────────
const assets = [];
const dimKeyToAssetId = {};
let assetCounter = 0;

for (const [dimKey, filePath] of Object.entries(DIM_TO_FILE)) {
  const full = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(full)) {
    console.error('Missing file:', full);
    process.exit(1);
  }
  const [w, h] = dimKey.split('x').map(Number);
  const data = fs.readFileSync(full).toString('base64');
  const id = `img_${assetCounter++}`;
  assets.push({ id, w, h, u: '', p: `data:image/png;base64,${data}`, e: 1 });
  dimKeyToAssetId[dimKey] = id;
}

// ─── Build layers ────────────────────────────────────────────────────────
const layers = CREATOR_STATE.layers.map((l, i) => ({
  ddd: 0,
  ind: i + 1,
  ty: 2, // image layer
  nm: l.name,
  refId: dimKeyToAssetId[l.dimKey],
  sr: 1,
  ks: {
    o: numProp(l.opacity),
    r: numProp(l.rot),
    p: vecProp(l.pos, 3),
    a: { a: 0, k: [l.anchor?.x ?? 0, l.anchor?.y ?? 0, 0] },
    s: vecProp(l.scale, 3),
  },
  ao: 0,
  shapes: [],
  ip: 0,
  op: 150,
  st: 0,
  bm: 0,
}));

// ─── Add anchor (geometric center of each image) for proper pivoting ───
// In Creator, layers use anchor = center-of-image by default. Match that here.
layers.forEach((layer) => {
  const refAsset = assets.find(a => a.id === layer.refId);
  if (refAsset) {
    layer.ks.a = { a: 0, k: [refAsset.w / 2, refAsset.h / 2, 0] };
  }
});

// ─── Write Lottie ────────────────────────────────────────────────────────
const lottie = {
  v: '5.7.4',
  fr: CREATOR_STATE.fps,
  ip: 0,
  op: 150,
  w: CREATOR_STATE.width,
  h: CREATOR_STATE.height,
  nm: 'Clyra Hero (Creator edited)',
  ddd: 0,
  assets,
  layers,
};

const outPath = path.join(__dirname, '..', 'assets', 'animations', 'heart-hero-scene.json');
fs.writeFileSync(outPath, JSON.stringify(lottie));

const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(`✓ Wrote ${outPath}`);
console.log(`  Canvas: ${CREATOR_STATE.width}×${CREATOR_STATE.height}`);
console.log(`  Duration: ${CREATOR_STATE.duration}s @ ${CREATOR_STATE.fps}fps`);
console.log(`  Size: ${sizeKB} KB`);
console.log(`  Layers: ${layers.length}, Assets: ${assets.length}`);
