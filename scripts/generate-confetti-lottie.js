// ═══════════════════════════════════════════════════════════════════════════
// Generate Clyra confetti burst Lottie JSON
// Produces a valid Lottie file compatible with lottie-react-native
//
// Output: assets/animations/confetti-burst.json
//
// Same visual design as the LottieFiles Creator version:
//  - 28 main pieces in two rings (inner + outer)
//  - 16 sparkle dots
//  - Center white flash
//  - 1.5s @ 30fps (45 frames)
// ═══════════════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');

const FPS = 30;
const DURATION_FRAMES = 45;
const W = 400;
const H = 400;
const CENTER = { x: 200, y: 200 };

// ─── Clyra palette — colors normalized to 0..1 for Lottie ──────────────────
const PALETTE = [
  [13 / 255,  148 / 255, 136 / 255],   // teal
  [244 / 255, 114 / 255, 182 / 255],   // pink
  [110 / 255, 231 / 255, 183 / 255],   // mint
  [147 / 255, 197 / 255, 253 / 255],   // sky
  [252 / 255, 211 / 255, 77 / 255],    // amber
  [251 / 255, 113 / 255, 133 / 255],   // coral
  [196 / 255, 181 / 255, 253 / 255],   // lavender
];

// Deterministic pseudo-random (same algorithm as in Creator script)
function rand(seed) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// ─── Lottie easing helpers ──────────────────────────────────────────────────
// Lottie encodes easings as inTangent/outTangent bezier control points.
// For a cubic-bezier(x1, y1, x2, y2):
//   outTangent (from keyframe A) = { x: x1, y: y1 }
//   inTangent  (of keyframe B)   = { x: 1-x2, y: 1-y2 }  (mirrored)
const EASE = {
  LINEAR:        { in: { x: [0],     y: [0] },     out: { x: [1],     y: [1] } },
  EASE_OUT:      { in: { x: [0.1],   y: [1] },     out: { x: [0.2],   y: [0] } },
  EASE_IN:       { in: { x: [1],     y: [1] },     out: { x: [0.6],   y: [0] } },
  EASE_OUT_BACK: { in: { x: [0.32],  y: [1.275] }, out: { x: [0.175], y: [0.885] } },
};

// ─── Shape helpers ──────────────────────────────────────────────────────────

// Build a shape "item" for a group (ellipse, rectangle, or star)
function makeShapeItem(kind, sizeMul) {
  if (kind === 'ellipse') {
    return {
      ty: 'el',
      d: 1,
      p: { a: 0, k: [0, 0] },
      s: { a: 0, k: [9 * sizeMul, 9 * sizeMul] },
      nm: 'Ellipse',
    };
  }
  if (kind === 'rect') {
    return {
      ty: 'rc',
      d: 1,
      p: { a: 0, k: [0, 0] },
      s: { a: 0, k: [5 * sizeMul, 13 * sizeMul] },
      r: { a: 0, k: 2 },
      nm: 'Rectangle',
    };
  }
  if (kind === 'tallrect') {
    return {
      ty: 'rc',
      d: 1,
      p: { a: 0, k: [0, 0] },
      s: { a: 0, k: [3 * sizeMul, 15 * sizeMul] },
      r: { a: 0, k: 1.5 },
      nm: 'TallRect',
    };
  }
  if (kind === 'star') {
    return {
      ty: 'sr',
      sy: 1, // 1 = star, 2 = polygon
      d: 1,
      p: { a: 0, k: [0, 0] },
      pt: { a: 0, k: 5 },
      r: { a: 0, k: 0 },
      ir: { a: 0, k: 2.5 * sizeMul },
      or: { a: 0, k: 6 * sizeMul },
      is: { a: 0, k: 0 },
      os: { a: 0, k: 0 },
      nm: 'Star',
    };
  }
  throw new Error('Unknown shape kind: ' + kind);
}

// Fill for a shape
function makeFill(rgb) {
  return {
    ty: 'fl',
    c: { a: 0, k: [rgb[0], rgb[1], rgb[2], 1] },
    o: { a: 0, k: 100 },
    r: 1,
    nm: 'Fill',
  };
}

// Transform for a group — handles position, scale, rotation, opacity
function makeTransform(pos, scale, rot, opacity) {
  return {
    ty: 'tr',
    p: toProp2d(pos),
    a: { a: 0, k: [0, 0] },
    s: toProp2d(scale),
    r: toProp(rot),
    o: toProp(opacity),
    sk: { a: 0, k: 0 },
    sa: { a: 0, k: 0 },
    nm: 'Transform',
  };
}

// ─── Animatable property helpers ────────────────────────────────────────────
// Can accept either a static value or array of {t, s, easing} keyframes

function toProp(valueOrKeyframes) {
  if (!Array.isArray(valueOrKeyframes)) {
    return { a: 0, k: valueOrKeyframes };
  }
  return {
    a: 1,
    k: valueOrKeyframes.map((kf, i, arr) => {
      const next = arr[i + 1];
      const node = {
        t: kf.t,
        s: [kf.s],
        o: kf.easing?.out || EASE.LINEAR.out,
        i: kf.easing?.in || EASE.LINEAR.in,
      };
      if (!next) {
        // Final keyframe has no tangent out
        delete node.o;
        delete node.i;
      }
      return node;
    }),
  };
}

function toProp2d(valueOrKeyframes) {
  if (!Array.isArray(valueOrKeyframes)) {
    return { a: 0, k: [valueOrKeyframes.x, valueOrKeyframes.y] };
  }
  return {
    a: 1,
    k: valueOrKeyframes.map((kf, i, arr) => {
      const next = arr[i + 1];
      const node = {
        t: kf.t,
        s: [kf.s.x, kf.s.y],
        o: kf.easing?.out
          ? { x: [kf.easing.out.x[0], kf.easing.out.x[0]], y: [kf.easing.out.y[0], kf.easing.out.y[0]] }
          : { x: [0, 0], y: [0, 0] },
        i: kf.easing?.in
          ? { x: [kf.easing.in.x[0], kf.easing.in.x[0]], y: [kf.easing.in.y[0], kf.easing.in.y[0]] }
          : { x: [1, 1], y: [1, 1] },
      };
      if (!next) {
        delete node.o;
        delete node.i;
      }
      return node;
    }),
  };
}

// ─── Build a single confetti piece as a group ───────────────────────────────
function makePiece(opts) {
  const {
    kind, color, sizeMul,
    startPos, endPos,
    popFrame, flightEnd, fadeStart, fadeEnd,
    rotationEnd,
  } = opts;

  return {
    ty: 'gr',
    it: [
      makeShapeItem(kind, sizeMul),
      makeFill(color),
      makeTransform(
        // Position: center → outward (ease-out)
        [
          { t: 0,         s: startPos, easing: EASE.EASE_OUT },
          { t: flightEnd, s: endPos,   easing: EASE.EASE_OUT },
        ],
        // Scale: 0 → pop(120) → settle(100) → hold
        [
          { t: 0,             s: { x: 0,   y: 0   }, easing: EASE.EASE_OUT_BACK },
          { t: popFrame,      s: { x: 120, y: 120 }, easing: EASE.EASE_OUT      },
          { t: popFrame + 4,  s: { x: 100, y: 100 }, easing: EASE.LINEAR        },
          { t: flightEnd,     s: { x: 100, y: 100 }, easing: EASE.LINEAR        },
        ],
        // Rotation: 0 → full spin (linear)
        [
          { t: 0,         s: 0,           easing: EASE.LINEAR },
          { t: flightEnd, s: rotationEnd, easing: EASE.LINEAR },
        ],
        // Opacity: fade in by popFrame, hold, fade out fadeStart→fadeEnd
        [
          { t: 0,          s: 0,   easing: EASE.EASE_OUT },
          { t: popFrame,   s: 100, easing: EASE.LINEAR   },
          { t: fadeStart,  s: 100, easing: EASE.EASE_IN  },
          { t: fadeEnd,    s: 0,   easing: EASE.EASE_IN  },
        ],
      ),
    ],
    nm: 'Piece',
  };
}

// ─── Build all the confetti pieces (top layer) ──────────────────────────────
function buildMainConfetti() {
  const shapes = [];
  const MAIN_COUNT = 28;

  for (let i = 0; i < MAIN_COUNT; i++) {
    const isOuter  = i % 2 === 0;
    const jitter   = (rand(i) - 0.5) * 0.4;
    const angle    = (i / MAIN_COUNT) * Math.PI * 2 + jitter;
    const distance = isOuter ? (170 + rand(i * 7) * 30) : (90 + rand(i * 7) * 40);
    const endX     = CENTER.x + Math.cos(angle) * distance;
    const endY     = CENTER.y + Math.sin(angle) * distance;
    const color    = PALETTE[i % PALETTE.length];
    const shapeKind = ['rect', 'ellipse', 'star', 'tallrect'][i % 4];
    const spinDir  = rand(i * 11) > 0.5 ? 1 : -1;
    const totalRot = spinDir * (360 + rand(i * 13) * 540);
    const sizeMul  = 0.8 + rand(i * 17) * 0.5;

    shapes.push(
      makePiece({
        kind: shapeKind,
        color, sizeMul,
        startPos: CENTER,
        endPos: { x: endX, y: endY },
        popFrame: isOuter ? 6 : 4,
        flightEnd: isOuter ? 42 : 38,
        fadeStart: isOuter ? 36 : 30,
        fadeEnd: isOuter ? 45 : 40,
        rotationEnd: totalRot,
      })
    );
  }

  return shapes;
}

// ─── Build sparkle dots (middle layer) ──────────────────────────────────────
function buildSparkles() {
  const shapes = [];
  const SPARKLE_COUNT = 16;

  for (let i = 0; i < SPARKLE_COUNT; i++) {
    const angle    = (i / SPARKLE_COUNT) * Math.PI * 2 + rand(i + 100) * 0.5;
    const distance = 50 + rand(i * 5 + 200) * 100;
    const endX     = CENTER.x + Math.cos(angle) * distance;
    const endY     = CENTER.y + Math.sin(angle) * distance;
    const color    = PALETTE[(i + 3) % PALETTE.length];

    shapes.push({
      ty: 'gr',
      it: [
        {
          ty: 'el',
          d: 1,
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [4, 4] },
          nm: 'Dot',
        },
        makeFill(color),
        makeTransform(
          [
            { t: 0,  s: CENTER,             easing: EASE.EASE_OUT },
            { t: 30, s: { x: endX, y: endY }, easing: EASE.EASE_OUT },
          ],
          [
            { t: 0,  s: { x: 0,   y: 0   }, easing: EASE.EASE_OUT_BACK },
            { t: 4,  s: { x: 140, y: 140 }, easing: EASE.EASE_OUT      },
            { t: 30, s: { x: 100, y: 100 }, easing: EASE.LINEAR        },
          ],
          0, // no rotation
          [
            { t: 0,  s: 0,   easing: EASE.EASE_OUT },
            { t: 3,  s: 100, easing: EASE.LINEAR   },
            { t: 25, s: 100, easing: EASE.EASE_IN  },
            { t: 35, s: 0,   easing: EASE.EASE_IN  },
          ],
        ),
      ],
      nm: 'Sparkle',
    });
  }

  return shapes;
}

// ─── Build center flash (bottom layer) ──────────────────────────────────────
function buildFlash() {
  return [
    {
      ty: 'gr',
      it: [
        {
          ty: 'el',
          d: 1,
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [90, 90] },
          nm: 'FlashCircle',
        },
        makeFill([1, 1, 1]), // white
        makeTransform(
          CENTER,
          [
            { t: 0, s: { x: 0,   y: 0   }, easing: EASE.EASE_OUT },
            { t: 5, s: { x: 220, y: 220 }, easing: EASE.EASE_OUT },
          ],
          0,
          [
            { t: 0, s: 85, easing: EASE.LINEAR  },
            { t: 2, s: 85, easing: EASE.EASE_IN },
            { t: 9, s: 0,  easing: EASE.EASE_IN },
          ],
        ),
      ],
      nm: 'Flash',
    },
  ];
}

// ─── Build a shape layer ────────────────────────────────────────────────────
function buildLayer(name, ind, shapes) {
  return {
    ddd: 0,
    ind,
    ty: 4, // Shape layer
    nm: name,
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [0, 0, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    shapes,
    ip: 0,
    op: DURATION_FRAMES,
    st: 0,
    bm: 0,
  };
}

// ─── Assemble the final Lottie ──────────────────────────────────────────────
const lottie = {
  v: '5.7.4',
  fr: FPS,
  ip: 0,
  op: DURATION_FRAMES,
  w: W,
  h: H,
  nm: 'Clyra Confetti Burst',
  ddd: 0,
  assets: [],
  // Layers: index 1 = top. Order = foreground first.
  layers: [
    buildLayer('Confetti', 1, buildMainConfetti()),
    buildLayer('Sparkles', 2, buildSparkles()),
    buildLayer('Flash',    3, buildFlash()),
  ],
};

// ─── Write file ─────────────────────────────────────────────────────────────
const outPath = path.join(__dirname, '..', 'assets', 'animations', 'confetti-burst.json');
fs.writeFileSync(outPath, JSON.stringify(lottie));
console.log('✓ Wrote', outPath);
console.log('  Size:', fs.statSync(outPath).size, 'bytes');
console.log('  Main pieces:', lottie.layers[0].shapes.length);
console.log('  Sparkles:', lottie.layers[1].shapes.length);
console.log('  Duration:', DURATION_FRAMES / FPS, 's');
