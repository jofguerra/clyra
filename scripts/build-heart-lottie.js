#!/usr/bin/env node
/**
 * Builds the heart-hero Lottie JSON with separated PNG parts and individual animations.
 */

const fs = require('fs');
const path = require('path');

const PNG_DIR = path.join(__dirname, '..', 'Animations and Assets', 'PNGs');
const OUT = path.join(__dirname, '..', 'assets', 'animations', 'heart-hero.json');

// ── Helpers ──────────────────────────────────────────────────────────────────

function loadPng(name) {
  const buf = fs.readFileSync(path.join(PNG_DIR, name));
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  const b64 = `data:image/png;base64,${buf.toString('base64')}`;
  return { w, h, b64 };
}

function makeAsset(id, name) {
  const { w, h, b64 } = loadPng(name);
  return { id, w, h, u: '', p: b64, e: 1 };
}

// ── Keyframe builder ─────────────────────────────────────────────────────────
// Lottie keyframes: { t, s, i:{x,y}, o:{x,y} }  — last keyframe has no i/o

function kf(t, s) {
  return {
    t,
    s,
    i: { x: [0.42, 0.42, 0.42], y: [1, 1, 1] },
    o: { x: [0.58, 0.58, 0.58], y: [0, 0, 0] },
  };
}

function lastKf(t, s) {
  return { t, s };
}

// Static prop
function staticProp(val) {
  return { a: 0, k: val };
}

// Animated prop
function animProp(keyframes) {
  return { a: 1, k: keyframes };
}

// ── Composition settings ─────────────────────────────────────────────────────
const COMP_W = 1123;
const COMP_H = 842;
const FPS = 30;
const FRAMES = 150; // 5 sec loop

// ── Build Assets ─────────────────────────────────────────────────────────────
const assets = [
  makeAsset('img_bg', 'BG_1.png'),
  makeAsset('img_screen', 'Screen.png'),
  makeAsset('img_front', 'Front.png'),
  makeAsset('img_cuerpo', 'Cuerpo.png'),
  makeAsset('img_ojo', 'Ojo.png'),
  makeAsset('img_ceja1', 'Ceja1.png'),
  makeAsset('img_ceja2', 'Ceja2.png'),
  makeAsset('img_boca', 'Boca.png'),
  makeAsset('img_brazo1', 'Brazo1.png'),
  makeAsset('img_brazo2', 'Brazo2.png'),
  makeAsset('img_pie1', 'Pie1.png'),
  makeAsset('img_pie2', 'Pie2.png'),
  makeAsset('img_lineacardio', 'LineaCardio.png'),
];

// ── Heart positioning constants ──────────────────────────────────────────────
const HCX = 610;   // heart center X in comp
const HCY = 490;   // heart center Y in comp
const BS = 68;      // body scale %

// Face positions (relative to comp)
const EYE_L_X = HCX - 40;
const EYE_L_Y = HCY - 75;
const EYE_R_X = HCX + 30;
const EYE_R_Y = HCY - 73;
const CEJA_L_X = EYE_L_X;
const CEJA_L_Y = EYE_L_Y - 18;
const CEJA_R_X = EYE_R_X;
const CEJA_R_Y = EYE_R_Y - 18;
const MOUTH_X = HCX - 3;
const MOUTH_Y = HCY - 30;

// Limbs
const ARM_L_X = HCX - 160;
const ARM_L_Y = HCY + 30;
const ARM_R_X = HCX + 155;
const ARM_R_Y = HCY + 5;
const FOOT_L_X = HCX - 25;
const FOOT_L_Y = HCY + 150;
const FOOT_R_X = HCX + 15;
const FOOT_R_Y = HCY + 150;

// ── Build layers (array order = front-to-back in render) ─────────────────────
let ind = 0;
const layers = [];

// 0. Front Bushes — static overlay
layers.push({
  ddd: 0, ind: ind++, ty: 2, nm: 'Front Bushes', refId: 'img_front', sr: 1,
  ks: {
    o: staticProp(100),
    r: staticProp(0),
    p: staticProp([561, 745, 0]),
    a: staticProp([563, 235, 0]),
    s: staticProp([94, 94, 100]),
  },
  ao: 0, ip: 0, op: FRAMES, st: 0, bm: 0,
});

// 1. Left Eye — blinks at ~1.5s and ~4s
layers.push({
  ddd: 0, ind: ind++, ty: 2, nm: 'Left Eye', refId: 'img_ojo', sr: 1,
  ks: {
    o: staticProp(100),
    r: staticProp(0),
    p: staticProp([EYE_L_X, EYE_L_Y, 0]),
    a: staticProp([10, 10, 0]),
    s: animProp([
      kf(0, [100, 100, 100]),
      kf(43, [100, 100, 100]),
      kf(45, [100, 10, 100]),
      kf(47, [100, 100, 100]),
      kf(118, [100, 100, 100]),
      kf(120, [100, 10, 100]),
      kf(122, [100, 100, 100]),
      lastKf(150, [100, 100, 100]),
    ]),
  },
  ao: 0, ip: 0, op: FRAMES, st: 0, bm: 0,
});

// 2. Right Eye — blinks + winks at ~2.8s
layers.push({
  ddd: 0, ind: ind++, ty: 2, nm: 'Right Eye', refId: 'img_ojo', sr: 1,
  ks: {
    o: staticProp(100),
    r: staticProp(0),
    p: staticProp([EYE_R_X, EYE_R_Y, 0]),
    a: staticProp([10, 10, 0]),
    s: animProp([
      kf(0, [100, 100, 100]),
      kf(43, [100, 100, 100]),
      kf(45, [100, 10, 100]),
      kf(47, [100, 100, 100]),
      kf(83, [100, 100, 100]),
      kf(85, [100, 10, 100]),
      kf(90, [100, 100, 100]),
      kf(118, [100, 100, 100]),
      kf(120, [100, 10, 100]),
      kf(122, [100, 100, 100]),
      lastKf(150, [100, 100, 100]),
    ]),
  },
  ao: 0, ip: 0, op: FRAMES, st: 0, bm: 0,
});

// 3. Left Eyebrow — subtle raise during wink
layers.push({
  ddd: 0, ind: ind++, ty: 2, nm: 'Left Eyebrow', refId: 'img_ceja1', sr: 1,
  ks: {
    o: staticProp(100),
    r: staticProp(0),
    p: animProp([
      kf(0, [CEJA_L_X, CEJA_L_Y, 0]),
      kf(83, [CEJA_L_X, CEJA_L_Y, 0]),
      kf(86, [CEJA_L_X, CEJA_L_Y - 3, 0]),
      kf(92, [CEJA_L_X, CEJA_L_Y, 0]),
      lastKf(150, [CEJA_L_X, CEJA_L_Y, 0]),
    ]),
    a: staticProp([32, 17, 0]),
    s: staticProp([BS, BS, 100]),
  },
  ao: 0, ip: 0, op: FRAMES, st: 0, bm: 0,
});

// 4. Right Eyebrow — raises more during wink
layers.push({
  ddd: 0, ind: ind++, ty: 2, nm: 'Right Eyebrow', refId: 'img_ceja2', sr: 1,
  ks: {
    o: staticProp(100),
    r: staticProp(0),
    p: animProp([
      kf(0, [CEJA_R_X, CEJA_R_Y, 0]),
      kf(83, [CEJA_R_X, CEJA_R_Y, 0]),
      kf(86, [CEJA_R_X, CEJA_R_Y - 5, 0]),
      kf(92, [CEJA_R_X, CEJA_R_Y, 0]),
      lastKf(150, [CEJA_R_X, CEJA_R_Y, 0]),
    ]),
    a: staticProp([33, 16, 0]),
    s: staticProp([BS, BS, 100]),
  },
  ao: 0, ip: 0, op: FRAMES, st: 0, bm: 0,
});

// 5. Mouth — smile widens during wink
layers.push({
  ddd: 0, ind: ind++, ty: 2, nm: 'Mouth', refId: 'img_boca', sr: 1,
  ks: {
    o: staticProp(100),
    r: staticProp(0),
    p: staticProp([MOUTH_X, MOUTH_Y, 0]),
    a: staticProp([28, 16, 0]),
    s: animProp([
      kf(0, [100, 100, 100]),
      kf(83, [100, 100, 100]),
      kf(87, [118, 110, 100]),
      kf(95, [100, 100, 100]),
      lastKf(150, [100, 100, 100]),
    ]),
  },
  ao: 0, ip: 0, op: FRAMES, st: 0, bm: 0,
});

// 6. Right Arm (Brazo2 — hip side) — subtle idle sway
layers.push({
  ddd: 0, ind: ind++, ty: 2, nm: 'Right Arm', refId: 'img_brazo2', sr: 1,
  ks: {
    o: staticProp(100),
    r: animProp([
      kf(0, [0]),
      kf(45, [-3]),
      kf(90, [0]),
      kf(135, [-2]),
      lastKf(150, [0]),
    ]),
    p: staticProp([ARM_R_X, ARM_R_Y, 0]),
    a: staticProp([70, 30, 0]),
    s: staticProp([BS, BS, 100]),
  },
  ao: 0, ip: 0, op: FRAMES, st: 0, bm: 0,
});

// 7. Heart Body — breathing + rocking
layers.push({
  ddd: 0, ind: ind++, ty: 2, nm: 'Heart Body', refId: 'img_cuerpo', sr: 1,
  ks: {
    o: staticProp(100),
    r: animProp([
      kf(0, [-1.5]),
      kf(37, [0]),
      kf(75, [1.5]),
      kf(112, [0]),
      lastKf(150, [-1.5]),
    ]),
    p: staticProp([HCX, HCY, 0]),
    a: staticProp([258, 218, 0]),  // center of 516x437
    s: animProp([
      kf(0, [BS, BS, 100]),
      kf(45, [BS + 5, BS + 5, 100]),
      kf(90, [BS, BS, 100]),
      kf(135, [BS + 5, BS + 5, 100]),
      lastKf(150, [BS, BS, 100]),
    ]),
  },
  ao: 0, ip: 0, op: FRAMES, st: 0, bm: 0,
});

// 8. Left Arm (Brazo1 — monitor side) — big friendly wave
layers.push({
  ddd: 0, ind: ind++, ty: 2, nm: 'Left Arm', refId: 'img_brazo1', sr: 1,
  ks: {
    o: staticProp(100),
    r: animProp([
      kf(0, [0]),
      kf(12, [18]),
      kf(24, [-10]),
      kf(36, [18]),
      kf(48, [-10]),
      kf(60, [15]),
      kf(72, [-8]),
      kf(84, [12]),
      kf(100, [-5]),
      kf(130, [3]),
      lastKf(150, [0]),
    ]),
    p: staticProp([ARM_L_X, ARM_L_Y, 0]),
    a: staticProp([187, 18, 0]),  // pivot at shoulder (right side of image)
    s: staticProp([BS, BS, 100]),
  },
  ao: 0, ip: 0, op: FRAMES, st: 0, bm: 0,
});

// 9. Left Foot (Pie2)
layers.push({
  ddd: 0, ind: ind++, ty: 2, nm: 'Left Foot', refId: 'img_pie2', sr: 1,
  ks: {
    o: staticProp(100),
    r: animProp([
      kf(0, [0]),
      kf(75, [2]),
      lastKf(150, [0]),
    ]),
    p: staticProp([FOOT_L_X, FOOT_L_Y, 0]),
    a: staticProp([78, 0, 0]),
    s: staticProp([BS, BS, 100]),
  },
  ao: 0, ip: 0, op: FRAMES, st: 0, bm: 0,
});

// 10. Right Foot (Pie1)
layers.push({
  ddd: 0, ind: ind++, ty: 2, nm: 'Right Foot', refId: 'img_pie1', sr: 1,
  ks: {
    o: staticProp(100),
    r: animProp([
      kf(0, [0]),
      kf(75, [-2]),
      lastKf(150, [0]),
    ]),
    p: staticProp([FOOT_R_X, FOOT_R_Y, 0]),
    a: staticProp([52, 0, 0]),
    s: staticProp([BS, BS, 100]),
  },
  ao: 0, ip: 0, op: FRAMES, st: 0, bm: 0,
});

// 11. Shadow — ellipse under the heart
layers.push({
  ddd: 0, ind: ind++, ty: 4, nm: 'Shadow', sr: 1,
  ks: {
    o: staticProp(15),
    r: staticProp(0),
    p: staticProp([HCX, FOOT_L_Y + 95, 0]),
    a: staticProp([0, 0, 0]),
    s: animProp([
      kf(0, [100, 100, 100]),
      kf(45, [103, 103, 100]),
      kf(90, [100, 100, 100]),
      kf(135, [103, 103, 100]),
      lastKf(150, [100, 100, 100]),
    ]),
  },
  ao: 0,
  shapes: [
    {
      ty: 'gr',
      it: [
        { ty: 'el', d: 1, s: { a: 0, k: [250, 30] }, p: { a: 0, k: [0, 0] }, nm: 'Ellipse' },
        { ty: 'fl', c: { a: 0, k: [0, 0, 0, 1] }, o: { a: 0, k: 100 }, r: 1, bm: 0, nm: 'Fill' },
        { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 }, nm: 'Transform' },
      ],
      nm: 'Shadow Group',
      np: 2,
      cix: 2,
      bm: 0,
    },
  ],
  ip: 0, op: FRAMES, st: 0, bm: 0,
});

// 12. ECG Line — slides inside the dark screen area
layers.push({
  ddd: 0, ind: ind++, ty: 2, nm: 'ECG Line', refId: 'img_lineacardio', sr: 1,
  ks: {
    o: staticProp(85),
    r: staticProp(0),
    p: animProp([
      kf(0, [310, 470, 0]),
      kf(74, [350, 470, 0]),
      kf(75, [310, 470, 0]),
      lastKf(150, [350, 470, 0]),
    ]),
    a: staticProp([124, 60, 0]),
    s: staticProp([30, 30, 100]),
  },
  ao: 0, ip: 0, op: FRAMES, st: 0, bm: 0,
});

// 13. Screen Monitor — static
layers.push({
  ddd: 0, ind: ind++, ty: 2, nm: 'Screen Monitor', refId: 'img_screen', sr: 1,
  ks: {
    o: staticProp(100),
    r: staticProp(0),
    p: staticProp([330, 500, 0]),
    a: staticProp([195, 226, 0]),
    s: staticProp([60, 60, 100]),
  },
  ao: 0, ip: 0, op: FRAMES, st: 0, bm: 0,
});

// 14. Background — static
layers.push({
  ddd: 0, ind: ind++, ty: 2, nm: 'Background', refId: 'img_bg', sr: 1,
  ks: {
    o: staticProp(100),
    r: staticProp(0),
    p: staticProp([561, 421, 0]),
    a: staticProp([562, 421, 0]),
    s: staticProp([100, 100, 100]),
  },
  ao: 0, ip: 0, op: FRAMES, st: 0, bm: 0,
});

// ── Assemble & write ─────────────────────────────────────────────────────────
const lottie = {
  v: '5.7.4',
  fr: FPS,
  ip: 0,
  op: FRAMES,
  w: COMP_W,
  h: COMP_H,
  nm: 'Heart Hero',
  ddd: 0,
  assets,
  layers,
};

fs.writeFileSync(OUT, JSON.stringify(lottie));
const sizeMB = (fs.statSync(OUT).size / 1024 / 1024).toFixed(2);
console.log(`✓ Written ${OUT}`);
console.log(`  ${assets.length} assets, ${layers.length} layers, ${FRAMES} frames @ ${FPS}fps`);
console.log(`  File size: ${sizeMB} MB`);
