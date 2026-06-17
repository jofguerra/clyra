const fs = require('fs');
const lottie = JSON.parse(fs.readFileSync('assets/animations/heart-hero.json', 'utf-8'));

// Heart character is parented at ~[630, 680], anchor [352, 557], scale 75%
// Face elements use parent transform, positioned relative to heart anchor

// Winking right eye
const winkingEye = {
  ddd: 0, ind: 0, ty: 4, nm: "Winking Eye",
  parent: 2,
  ks: {
    a: {a: 0, k: [0, 0, 0]},
    p: {a: 0, k: [382, 395, 0]},
    s: {a: 0, k: [133, 133, 100]},
    r: {a: 0, k: 0},
    o: {a: 0, k: 100}
  },
  shapes: [{
    ty: "gr", nm: "Eye",
    it: [
      {
        ty: "el",
        p: {a: 0, k: [0, 0]},
        s: {
          a: 1,
          k: [
            {t: 0, s: [18, 20], i: {x: [0.42, 0.42], y: [1, 1]}, o: {x: [0.58, 0.58], y: [0, 0]}},
            {t: 55, s: [18, 20], i: {x: [0.42, 0.42], y: [1, 1]}, o: {x: [0.58, 0.58], y: [0, 0]}},
            {t: 60, s: [20, 3], i: {x: [0.42, 0.42], y: [1, 1]}, o: {x: [0.58, 0.58], y: [0, 0]}},
            {t: 66, s: [18, 20], i: {x: [0.42, 0.42], y: [1, 1]}, o: {x: [0.58, 0.58], y: [0, 0]}},
            {t: 90, s: [18, 20]}
          ]
        }
      },
      {ty: "fl", c: {a: 0, k: [0.18, 0.14, 0.18, 1]}, o: {a: 0, k: 100}, r: 1},
      {ty: "tr", p: {a: 0, k: [0, 0]}, a: {a: 0, k: [0, 0]}, s: {a: 0, k: [100, 100]}, r: {a: 0, k: 0}, o: {a: 0, k: 100}}
    ]
  }],
  ip: 0, op: 90, st: 0
};

// Left eye (normal, slight blink with wink)
const leftEye = {
  ddd: 0, ind: 0, ty: 4, nm: "Left Eye",
  parent: 2,
  ks: {
    a: {a: 0, k: [0, 0, 0]},
    p: {a: 0, k: [328, 395, 0]},
    s: {a: 0, k: [133, 133, 100]},
    r: {a: 0, k: 0},
    o: {a: 0, k: 100}
  },
  shapes: [{
    ty: "gr", nm: "Eye",
    it: [
      {
        ty: "el",
        p: {a: 0, k: [0, 0]},
        s: {a: 0, k: [18, 20]}
      },
      {ty: "fl", c: {a: 0, k: [0.18, 0.14, 0.18, 1]}, o: {a: 0, k: 100}, r: 1},
      {ty: "tr", p: {a: 0, k: [0, 0]}, a: {a: 0, k: [0, 0]}, s: {a: 0, k: [100, 100]}, r: {a: 0, k: 0}, o: {a: 0, k: 100}}
    ]
  }],
  ip: 0, op: 90, st: 0
};

// Animated smile
const smile = {
  ddd: 0, ind: 0, ty: 4, nm: "Smile",
  parent: 2,
  ks: {
    a: {a: 0, k: [0, 0, 0]},
    p: {a: 0, k: [355, 430, 0]},
    s: {a: 0, k: [133, 133, 100]},
    r: {a: 0, k: 0},
    o: {a: 0, k: 100}
  },
  shapes: [{
    ty: "gr", nm: "Smile Arc",
    it: [
      {
        ty: "sh",
        ks: {
          a: 1,
          k: [
            {
              t: 0,
              s: [{c: false, v: [[-14, -2], [0, 10], [14, -2]], i: [[0,0],[-7,0],[0,0]], o: [[0,0],[7,0],[0,0]]}],
              i: {x: 0.42, y: 1}, o: {x: 0.58, y: 0}
            },
            {
              t: 58,
              s: [{c: false, v: [[-18, -3], [0, 14], [18, -3]], i: [[0,0],[-9,0],[0,0]], o: [[0,0],[9,0],[0,0]]}],
              i: {x: 0.42, y: 1}, o: {x: 0.58, y: 0}
            },
            {
              t: 72,
              s: [{c: false, v: [[-14, -2], [0, 10], [14, -2]], i: [[0,0],[-7,0],[0,0]], o: [[0,0],[7,0],[0,0]]}]
            }
          ]
        }
      },
      {ty: "st", c: {a: 0, k: [0.18, 0.14, 0.18, 1]}, o: {a: 0, k: 100}, w: {a: 0, k: 3}, lc: 2, lj: 2},
      {ty: "tr", p: {a: 0, k: [0, 0]}, a: {a: 0, k: [0, 0]}, s: {a: 0, k: [100, 100]}, r: {a: 0, k: 0}, o: {a: 0, k: 100}}
    ]
  }],
  ip: 0, op: 90, st: 0
};

// Blush cheeks (appear during wink)
function makeBlush(name, px) {
  return {
    ddd: 0, ind: 0, ty: 4, nm: name,
    parent: 2,
    ks: {
      a: {a: 0, k: [0, 0, 0]},
      p: {a: 0, k: [px, 418, 0]},
      s: {a: 0, k: [133, 133, 100]},
      r: {a: 0, k: 0},
      o: {
        a: 1,
        k: [
          {t: 0, s: [0], i: {x: [0.42], y: [1]}, o: {x: [0.58], y: [0]}},
          {t: 55, s: [0], i: {x: [0.42], y: [1]}, o: {x: [0.58], y: [0]}},
          {t: 60, s: [50], i: {x: [0.42], y: [1]}, o: {x: [0.58], y: [0]}},
          {t: 75, s: [50], i: {x: [0.42], y: [1]}, o: {x: [0.58], y: [0]}},
          {t: 85, s: [0]}
        ]
      }
    },
    shapes: [{
      ty: "gr",
      it: [
        {ty: "el", p: {a: 0, k: [0, 0]}, s: {a: 0, k: [18, 12]}},
        {ty: "fl", c: {a: 0, k: [0.98, 0.5, 0.55, 1]}, o: {a: 0, k: 100}, r: 1},
        {ty: "tr", p: {a: 0, k: [0, 0]}, a: {a: 0, k: [0, 0]}, s: {a: 0, k: [100, 100]}, r: {a: 0, k: 0}, o: {a: 0, k: 100}}
      ]
    }],
    ip: 0, op: 90, st: 0
  };
}

// Insert face layers at front (rendered on top)
lottie.layers.unshift(smile, winkingEye, leftEye, makeBlush("Left Cheek", 310), makeBlush("Right Cheek", 400));

// Fix indices
lottie.layers.forEach((l, i) => { l.ind = i + 1; });

// Update parent refs — face layers need to parent to the Heart Character
const heartIdx = lottie.layers.findIndex(l => l.nm === "Heart Character");
const heartInd = lottie.layers[heartIdx].ind;
console.log("Heart at index", heartIdx, "ind", heartInd);

for (const l of lottie.layers) {
  if (l.parent === 2 && l.ind !== heartInd) {
    l.parent = heartInd;
  }
}
// Remove self-parent from heart
if (lottie.layers[heartIdx].parent === heartInd) {
  delete lottie.layers[heartIdx].parent;
}

fs.writeFileSync('assets/animations/heart-hero.json', JSON.stringify(lottie));
console.log("Done! Total layers:", lottie.layers.length);
