// ═══════════════════════════════════════════════════════════════════════════
// Clyra — Rigged Heart Mascot HERO SCENE
// ───────────────────────────────────────────────────────────────────────────
// Composite scene: pastel mountain background + heartbeat monitor + rigged
// kawaii character + foreground bushes. Everything animates on a single 5s
// loop at 30fps.
//
// Canvas: 1124 × 842 (matches BG_1.png aspect so the background is pixel-
// perfect).
//
// Layer stack (top → bottom in Lottie):
//   1. Front.png           — foreground bushes
//   2. Brows               ┐
//   3. Eyes                │
//   4. Mouth               │
//   5. Arm L (waving)      │  rigged character
//   6. Arm R (resting)     │
//   7. Body                │
//   8. Leg L               │
//   9. Leg R               ┘
//  10. Heartbeat line (animated sweep inside monitor screen)
//  11. Screen (heartbeat monitor frame + stand)
//  12. BG_1.png            — background scene
//
// Motion (5s loop @ 30fps = 150 frames):
//   Primary   — Body breathes + floats + tilts
//   Secondary — Arms sway counter-phase (left waves up, right relaxes)
//   Ambient   — Eyes blink ×2, mouth does a talking/smiling pulse, heartbeat
//               line sweeps across monitor
// ═══════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

// ─── Config ──────────────────────────────────────────────────────────────
const FPS = 30;
const DURATION_FRAMES = 150;
const CANVAS_W = 1124;
const CANVAS_H = 842;

// ─── Part source files + pixel dimensions ───────────────────────────────
const HEART_DIR = 'Animations and Assets/Heart';
const PNGS_DIR  = 'Animations and Assets/PNGs';

const PARTS = {
  // Character
  body:   { dir: HEART_DIR, file: 'body.png',   w: 479,  h: 420 },
  arm1:   { dir: HEART_DIR, file: 'arm 1.png',  w: 215,  h: 252 },
  arm2:   { dir: HEART_DIR, file: 'arm 2.png',  w: 246,  h: 191 },
  leg1:   { dir: HEART_DIR, file: 'leg 1.png',  w: 131,  h: 181 },
  leg2:   { dir: HEART_DIR, file: 'leg 2.png',  w: 131,  h: 185 },
  eyes:   { dir: HEART_DIR, file: 'eyes.png',   w: 287,  h: 149 },
  brows:  { dir: HEART_DIR, file: 'brows.png',  w: 284,  h: 100 },
  mouth:  { dir: HEART_DIR, file: 'mouth.png',  w: 130,  h: 107 },
  // Scene
  bg:     { dir: PNGS_DIR,  file: 'BG_1.png',     w: 1124, h: 842 },
  screen: { dir: PNGS_DIR,  file: 'Screen.png',   w: 391,  h: 453 },
  line:   { dir: PNGS_DIR,  file: 'LineaCardio.png', w: 249, h: 121 },
  front:  { dir: PNGS_DIR,  file: 'Front.png',    w: 1126, h: 965 },
};

// ─── Rig — position/anchor for each element on 1124 × 842 canvas ────────
// NOTE on coordinates: the white content panel on the home screen overlaps
// the BOTTOM ~40dp of this hero. On a 1124×842 canvas that means roughly the
// bottom 115px (y > 727) will be hidden. So we keep everything above y=700.
//
// Character is centered horizontally, sitting in the upper-middle of canvas.
// Anchor points are calibrated so rotations feel natural:
//   • Body        — center of image (scale/rotation pivot)
//   • Arms        — at the "shoulder" where it attaches to body
//   • Legs        — at the "hip" (top-center)
//   • Face parts  — geometric center
//
// Character scaled 85% to fit better within the hero canvas. All parts
// share this scale so proportions stay consistent.
const CHAR_SCALE = [85, 85];

// Body anchor + the "reference" position everything else is measured from.
// Character lowered so its feet stand near the bottom of the hero area
// (where the white content panel curves up from).
const BODY_CX = 620;
const BODY_CY = 470;

const RIG = {
  // ── Character ────────────────────────────────────────────────────────
  body: {
    anchor:   [PARTS.body.w / 2, PARTS.body.h / 2],   // [239.5, 210]
    position: [BODY_CX, BODY_CY],
    scale:    CHAR_SCALE,
  },

  // LEFT ARM — raised & waving. Shoulder = wider end (bottom-right of img).
  // Scale X is NEGATIVE to horizontally flip the image — the original arm1
  // was drawn mirrored relative to the reference mascot, so we mirror it
  // back here.
  arm1: {
    anchor:   [185, 210],
    position: [BODY_CX - 90, BODY_CY - 30],      // upper-left lobe
    scale:    [-CHAR_SCALE[0], CHAR_SCALE[1]],   // flip horizontally
  },

  // RIGHT ARM — the image is drawn horizontally (shoulder left, hand right).
  // A base rotation of 65° tilts it into a diagonal "hanging down" pose.
  // Anchor at (30, 95) = the shoulder/rounded end, so rotation pivots there.
  arm2: {
    anchor:   [30, 95],
    position: [BODY_CX + 140, BODY_CY - 30],     // ≈ (760, 390) — right shoulder
    scale:    CHAR_SCALE,
  },

  // LEGS — hip anchor moved INTO the middle of the leg image (not top),
  // so leg's top half hides inside body. This fixes the "floating feet" look.
  // Anchor at y=60 means 60px of image is ABOVE the attach point — hidden
  // behind the body. The foot (J-curve at bottom-out) is fully visible.
  //
  // Legs close together, slightly toed-in.
  leg1: {
    anchor:   [PARTS.leg1.w / 2 + 10, 60],       // shift anchor right → foot splays LEFT
    position: [BODY_CX - 32, BODY_CY + 130],     // ≈ (588, 470) — hip inside body
    scale:    CHAR_SCALE,
  },
  leg2: {
    anchor:   [PARTS.leg2.w / 2 - 10, 60],       // shift anchor left → foot splays RIGHT
    position: [BODY_CX + 32, BODY_CY + 130],     // ≈ (652, 470)
    scale:    CHAR_SCALE,
  },

  // ── Face parts — centered on body, scaled with character
  eyes:  {
    anchor:   [PARTS.eyes.w / 2,  PARTS.eyes.h / 2],
    position: [BODY_CX, BODY_CY - 20],
    scale:    CHAR_SCALE,
  },
  brows: {
    anchor:   [PARTS.brows.w / 2, PARTS.brows.h / 2],
    position: [BODY_CX, BODY_CY - 70],
    scale:    CHAR_SCALE,
  },
  mouth: {
    anchor:   [PARTS.mouth.w / 2, PARTS.mouth.h / 2],
    position: [BODY_CX, BODY_CY + 45],
    scale:    CHAR_SCALE,
  },

  // ── Scene elements
  bg: {
    anchor:   [PARTS.bg.w / 2, PARTS.bg.h / 2],
    position: [CANVAS_W / 2, CANVAS_H / 2],
  },
  screen: {
    anchor:   [PARTS.screen.w / 2, PARTS.screen.h / 2],
    position: [210, 490],        // aligned with lowered character
    scale:    [80, 80],
  },
  line: {
    anchor:   [PARTS.line.w / 2, PARTS.line.h / 2],
    position: [210, 425],        // on the monitor's dark screen
  },
  front: {
    anchor:   [PARTS.front.w / 2, PARTS.front.h / 2],
    position: [CANVAS_W / 2, CANVAS_H / 2 + 100],
  },
};

// ─── Easings (Lottie bezier format) ─────────────────────────────────────
const EASE = {
  LINEAR:      { in: { x: [0],    y: [0]    }, out: { x: [1],     y: [1]    } },
  SINE_IO:     { in: { x: [0.45], y: [0.05] }, out: { x: [0.55],  y: [0.95] } },
  EASE_OUT:    { in: { x: [0.1],  y: [1]    }, out: { x: [0.2],   y: [0]    } },
  EASE_IN:     { in: { x: [1],    y: [1]    }, out: { x: [0.6],   y: [0]    } },
  EASE_IN_OUT: { in: { x: [0.42], y: [0]    }, out: { x: [0.58],  y: [1]    } },
};

// ─── Property builders ──────────────────────────────────────────────────
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

  const isKeyframeArray = Array.isArray(value)
    && value.length > 0
    && typeof value[0] === 'object' && value[0] !== null && !Array.isArray(value[0])
    && ('s' in value[0] || 't' in value[0]);

  if (!isKeyframeArray) return { a: 0, k: pad(value) };

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

function loadPng(dir, file) {
  const fp = path.join(__dirname, '..', dir, file);
  return fs.readFileSync(fp).toString('base64');
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATION KEYFRAMES — all loops seamless (value at f0 === value at f150)
// ═══════════════════════════════════════════════════════════════════════════

// ── Body: breathe + float + tilt ───────────────────────────────────────
// Scale keyframes multiply against CHAR_SCALE (85) — so we use 100 = 85%,
// 103 = ~87.5% of native for a gentle breathing pulse.
const BODY_SCALE = [
  { t: 0,   s: [CHAR_SCALE[0],       CHAR_SCALE[1]],       easing: EASE.SINE_IO },
  { t: 60,  s: [CHAR_SCALE[0] * 1.03, CHAR_SCALE[1] * 1.03], easing: EASE.SINE_IO },
  { t: 120, s: [CHAR_SCALE[0],       CHAR_SCALE[1]],       easing: EASE.SINE_IO },
  { t: 150, s: [CHAR_SCALE[0],       CHAR_SCALE[1]] },
];
const BODY_TILT = [
  { t: 0,   s: 0,    easing: EASE.SINE_IO },
  { t: 50,  s: -1.5, easing: EASE.SINE_IO },
  { t: 100, s: 1.5,  easing: EASE.SINE_IO },
  { t: 150, s: 0 },
];

// Y float helper — whole character rises ~8px then returns
function floatY(restPos, amp = 8) {
  return [
    { t: 0,   s: [restPos[0], restPos[1]],       easing: EASE.SINE_IO },
    { t: 75,  s: [restPos[0], restPos[1] - amp], easing: EASE.SINE_IO },
    { t: 150, s: [restPos[0], restPos[1]] },
  ];
}

// ── Arms: gentle counter-phase sway ────────────────────────────────────
// Arm1 (left) — raised waving. Base rotation -10° tilts the hand up-LEFT
// (not straight up). Sways between -10° and -5° for a gentle wave.
const ARM1_ROT = [
  { t: 0,   s: -10, easing: EASE.SINE_IO },
  { t: 75,  s: -5,  easing: EASE.SINE_IO },
  { t: 150, s: -10 },
];
// Arm2 (right) — 65° base rotation makes the horizontal arm hang diagonally
// down-right (natural "at-side" pose instead of horizontal T-pose).
// Sways between 65° and 70° for subtle motion.
const ARM2_ROT = [
  { t: 0,   s: 65, easing: EASE.SINE_IO },
  { t: 75,  s: 70, easing: EASE.SINE_IO },
  { t: 150, s: 65 },
];

// ── Legs: grounded (slight +1px counter-bob) ──────────────────────────
function legGrounded(restPos) {
  return [
    { t: 0,   s: [restPos[0], restPos[1]],     easing: EASE.SINE_IO },
    { t: 75,  s: [restPos[0], restPos[1] + 1], easing: EASE.SINE_IO },
    { t: 150, s: [restPos[0], restPos[1]] },
  ];
}

// ── Eyes: two blinks per loop (scale relative to CHAR_SCALE=85) ───────
const S = CHAR_SCALE[0];   // shorthand
const EYES_SCALE = [
  { t: 0,   s: [S,     S    ], easing: EASE.EASE_IN_OUT },
  { t: 48,  s: [S,     S    ], easing: EASE.EASE_IN },
  { t: 50,  s: [S,     S * 0.1], easing: EASE.EASE_OUT },
  { t: 53,  s: [S,     S    ], easing: EASE.EASE_IN_OUT },
  { t: 128, s: [S,     S    ], easing: EASE.EASE_IN },
  { t: 130, s: [S,     S * 0.1], easing: EASE.EASE_OUT },
  { t: 133, s: [S,     S    ], easing: EASE.EASE_IN_OUT },
  { t: 150, s: [S,     S    ] },
];

// ── Mouth: expressive talking/smiling pulse
const MOUTH_SCALE = [
  { t: 0,   s: [S,         S        ], easing: EASE.EASE_IN_OUT },
  { t: 20,  s: [S * 1.08,  S * 0.95 ], easing: EASE.EASE_IN_OUT },  // wide smile
  { t: 40,  s: [S * 0.95,  S * 1.05 ], easing: EASE.EASE_IN_OUT },  // tall grin
  { t: 60,  s: [S * 1.12,  S        ], easing: EASE.EASE_IN_OUT },  // big smile
  { t: 80,  s: [S * 0.98,  S * 0.95 ], easing: EASE.EASE_IN_OUT },
  { t: 100, s: [S * 1.06,  S * 1.03 ], easing: EASE.EASE_IN_OUT },
  { t: 120, s: [S,         S        ], easing: EASE.EASE_IN_OUT },
  { t: 150, s: [S,         S        ] },
];

// ── Brows: micro-raise in sync with big mouth expressions
const BROWS_Y_OFFSET = [
  { t: 0,   s: [RIG.brows.position[0], RIG.brows.position[1]],     easing: EASE.SINE_IO },
  { t: 20,  s: [RIG.brows.position[0], RIG.brows.position[1] - 3], easing: EASE.SINE_IO }, // raise
  { t: 60,  s: [RIG.brows.position[0], RIG.brows.position[1] - 4], easing: EASE.SINE_IO }, // raise more
  { t: 100, s: [RIG.brows.position[0], RIG.brows.position[1] - 1], easing: EASE.SINE_IO },
  { t: 150, s: [RIG.brows.position[0], RIG.brows.position[1]] },
];

// ── Heartbeat line: fade/sweep rhythmically (pulse with breathing)
const LINE_SCALE = [
  { t: 0,   s: [100, 100], easing: EASE.EASE_IN_OUT },
  { t: 30,  s: [108, 108], easing: EASE.EASE_OUT },  // quick pulse
  { t: 60,  s: [100, 100], easing: EASE.EASE_IN_OUT },
  { t: 90,  s: [108, 108], easing: EASE.EASE_OUT },  // second pulse
  { t: 120, s: [100, 100], easing: EASE.EASE_IN_OUT },
  { t: 150, s: [100, 100] },
];
const LINE_OPACITY = [
  { t: 0,   s: 100, easing: EASE.EASE_IN_OUT },
  { t: 30,  s: 60,  easing: EASE.EASE_IN_OUT },
  { t: 60,  s: 100, easing: EASE.EASE_IN_OUT },
  { t: 90,  s: 60,  easing: EASE.EASE_IN_OUT },
  { t: 120, s: 100, easing: EASE.EASE_IN_OUT },
  { t: 150, s: 100 },
];

// ═══════════════════════════════════════════════════════════════════════════
// ASSEMBLE
// ═══════════════════════════════════════════════════════════════════════════

const assets = [
  imageAsset('body',   PARTS.body.w,   PARTS.body.h,   loadPng(PARTS.body.dir, PARTS.body.file)),
  imageAsset('arm1',   PARTS.arm1.w,   PARTS.arm1.h,   loadPng(PARTS.arm1.dir, PARTS.arm1.file)),
  imageAsset('arm2',   PARTS.arm2.w,   PARTS.arm2.h,   loadPng(PARTS.arm2.dir, PARTS.arm2.file)),
  imageAsset('leg1',   PARTS.leg1.w,   PARTS.leg1.h,   loadPng(PARTS.leg1.dir, PARTS.leg1.file)),
  imageAsset('leg2',   PARTS.leg2.w,   PARTS.leg2.h,   loadPng(PARTS.leg2.dir, PARTS.leg2.file)),
  imageAsset('eyes',   PARTS.eyes.w,   PARTS.eyes.h,   loadPng(PARTS.eyes.dir, PARTS.eyes.file)),
  imageAsset('brows',  PARTS.brows.w,  PARTS.brows.h,  loadPng(PARTS.brows.dir, PARTS.brows.file)),
  imageAsset('mouth',  PARTS.mouth.w,  PARTS.mouth.h,  loadPng(PARTS.mouth.dir, PARTS.mouth.file)),
  imageAsset('bg',     PARTS.bg.w,     PARTS.bg.h,     loadPng(PARTS.bg.dir, PARTS.bg.file)),
  imageAsset('screen', PARTS.screen.w, PARTS.screen.h, loadPng(PARTS.screen.dir, PARTS.screen.file)),
  imageAsset('line',   PARTS.line.w,   PARTS.line.h,   loadPng(PARTS.line.dir, PARTS.line.file)),
  imageAsset('front',  PARTS.front.w,  PARTS.front.h,  loadPng(PARTS.front.dir, PARTS.front.file)),
];

// Layers — Lottie renders first layer on TOP
const layers = [
  // ── Foreground (in front of everything)
  imageLayer({
    name: 'Foreground', refId: 'front', ind: 1,
    transform: buildTransform({
      anchor: RIG.front.anchor,
      position: RIG.front.position,
    }),
  }),

  // ── Face parts (on top of body)
  imageLayer({
    name: 'Brows', refId: 'brows', ind: 2,
    transform: buildTransform({
      anchor: RIG.brows.anchor,
      position: BROWS_Y_OFFSET,
      scale: RIG.brows.scale,
    }),
  }),
  imageLayer({
    name: 'Eyes', refId: 'eyes', ind: 3,
    transform: buildTransform({
      anchor: RIG.eyes.anchor,
      position: floatY(RIG.eyes.position),
      scale: EYES_SCALE,
    }),
  }),
  imageLayer({
    name: 'Mouth', refId: 'mouth', ind: 4,
    transform: buildTransform({
      anchor: RIG.mouth.anchor,
      position: floatY(RIG.mouth.position),
      scale: MOUTH_SCALE,
    }),
  }),

  // ── Arms (on top of body so they appear in front)
  imageLayer({
    name: 'Arm L', refId: 'arm1', ind: 5,
    transform: buildTransform({
      anchor: RIG.arm1.anchor,
      position: floatY(RIG.arm1.position),
      rotation: ARM1_ROT,
      scale: RIG.arm1.scale,
    }),
  }),
  imageLayer({
    name: 'Arm R', refId: 'arm2', ind: 6,
    transform: buildTransform({
      anchor: RIG.arm2.anchor,
      position: floatY(RIG.arm2.position),
      rotation: ARM2_ROT,
      scale: RIG.arm2.scale,
    }),
  }),

  // ── Body
  imageLayer({
    name: 'Body', refId: 'body', ind: 7,
    transform: buildTransform({
      anchor: RIG.body.anchor,
      position: floatY(RIG.body.position),
      scale: BODY_SCALE,
      rotation: BODY_TILT,
    }),
  }),

  // ── Legs (behind body)
  imageLayer({
    name: 'Leg L', refId: 'leg1', ind: 8,
    transform: buildTransform({
      anchor: RIG.leg1.anchor,
      position: legGrounded(RIG.leg1.position),
      scale: RIG.leg1.scale,
    }),
  }),
  imageLayer({
    name: 'Leg R', refId: 'leg2', ind: 9,
    transform: buildTransform({
      anchor: RIG.leg2.anchor,
      position: legGrounded(RIG.leg2.position),
      scale: RIG.leg2.scale,
    }),
  }),

  // ── Heartbeat line (animated, behind character but in front of monitor frame)
  imageLayer({
    name: 'Heartbeat', refId: 'line', ind: 10,
    transform: buildTransform({
      anchor: RIG.line.anchor,
      position: RIG.line.position,
      scale: LINE_SCALE,
      opacity: LINE_OPACITY,
    }),
  }),

  // ── Monitor frame
  imageLayer({
    name: 'Screen', refId: 'screen', ind: 11,
    transform: buildTransform({
      anchor: RIG.screen.anchor,
      position: RIG.screen.position,
      scale: RIG.screen.scale,
    }),
  }),

  // ── Background (last = bottom)
  imageLayer({
    name: 'Background', refId: 'bg', ind: 12,
    transform: buildTransform({
      anchor: RIG.bg.anchor,
      position: RIG.bg.position,
    }),
  }),
];

const lottie = {
  v: '5.7.4', fr: FPS, ip: 0, op: DURATION_FRAMES,
  w: CANVAS_W, h: CANVAS_H,
  nm: 'Clyra Hero Scene',
  ddd: 0, assets, layers,
};

const outPath = path.join(__dirname, '..', 'assets', 'animations', 'heart-hero-scene.json');
fs.writeFileSync(outPath, JSON.stringify(lottie));
const sizeKB = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(`✓ Wrote ${outPath}`);
console.log(`  Canvas: ${CANVAS_W}×${CANVAS_H}`);
console.log(`  Duration: ${DURATION_FRAMES / FPS}s @ ${FPS}fps`);
console.log(`  Size: ${sizeKB} KB`);
console.log(`  Layers: ${layers.length}`);
console.log(`  Assets: ${assets.length}`);
