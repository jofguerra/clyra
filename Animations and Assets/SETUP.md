# Heart Monitor Lottie Animation - Setup Guide

## Files
- `heart-monitor.json` — Lottie animation (3-second loop, 30fps)
- `BG_1.svg`, `Screen.svg`, `Heart.svg`, `Front.svg` — Source SVG layers

## Animations included
- **Heart breathing** — subtle scale pulse + vertical bob
- **ECG traveling line** — waveform sweeps across the monitor
- **Shadow breathing** — synced with heart, subtle size/opacity change
- **Monitor sway** — very slight rotation
- **Bush sway** — gentle horizontal movement

---

## Step 1: Convert SVGs to PNGs

Create an `images/` folder next to `heart-monitor.json` and export each SVG as PNG:

| SVG file    | Export as            | Size (px)     |
|-------------|----------------------|---------------|
| BG_1.svg    | images/BG_1.png      | 1123 x 842    |
| Screen.svg  | images/Screen.png    | 390 x 452     |
| Heart.svg   | images/Heart.png     | 705 x 557     |
| Front.svg   | images/Front.png     | 1195 x 235    |

You can use any tool: Figma, Inkscape, or an online SVG-to-PNG converter.
Export at 2x for Retina if needed (then update `w`/`h` in the JSON assets).

## Step 2: Install in React Native + Expo

```bash
npx expo install lottie-react-native
```

## Step 3: Add to your project

Copy `heart-monitor.json` and the `images/` folder into your project (e.g., `assets/animations/`).

```
assets/
  animations/
    heart-monitor.json
    images/
      BG_1.png
      Screen.png
      Heart.png
      Front.png
```

## Step 4: Use in a component

```tsx
import LottieView from 'lottie-react-native';

export function HeartMonitor() {
  return (
    <LottieView
      source={require('../assets/animations/heart-monitor.json')}
      imageAssetsFolder="images"
      autoPlay
      loop
      style={{ width: 360, height: 270 }}
    />
  );
}
```

## Fine-tuning

If layer positions need adjustment, edit the `"p"` (position) values in `heart-monitor.json`:
- Layer "Heart Character" → `"p"` controls heart position
- Layer "Screen Monitor" → `"p"` controls monitor position
- Layer "Front Bushes" → `"p"` controls bush position

Positions are in pixels within the 1123x842 composition.
