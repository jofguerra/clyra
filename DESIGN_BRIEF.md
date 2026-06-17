# Clyra - Design Asset Requirements

## App Overview
Clyra is a health blood test tracking app. Users upload lab result PDFs/photos, the app extracts biomarkers with AI, and shows a health score (0-100), body system status, trends, and gamification (XP, badges, missions). Bilingual (EN/ES). iOS + Android.

---

## 1. MASCOT: "Clyra" the Heart

A cute, friendly heart character that acts as the user's health companion throughout the app. Think Duolingo's owl but for health.

**Reference**: See `Design Reference/src/assets/mascot-happy.png` in the project.

### Character Sheet (1 PNG per expression, transparent background, 512x512px)

| # | Expression/Pose | Where it's used | Description |
|---|----------------|-----------------|-------------|
| 1 | **Happy / Default** | Home screen greeting | Smiling, standing, small wave. The "base" pose. |
| 2 | **Clipboard / Reading** | Upload screen, processing | Holding clipboard or magnifying glass, looking focused. |
| 3 | **Celebrating** | Upload success, achievement unlocked | Arms up, confetti vibe, big smile, sparkles. |
| 4 | **Thinking / Curious** | Loading/processing states | Hand on chin, looking upward, thought bubble. |
| 5 | **Sad / Worried** | Error states, low scores | Small frown, sweat drop, concerned eyes. |
| 6 | **Doctor coat** | Health score detail, share with doctor | White coat + stethoscope (like the reference). |
| 7 | **Sleeping / ZZZ** | Empty states (no data yet) | Eyes closed, peaceful ZZZ - waiting to be activated. |
| 8 | **Flexing / Strong** | High score (80+), achievements | Showing muscle, confident pose. |
| 9 | **Pointing** | Onboarding, tips, recommendations | Pointing at something (next to text callouts). |
| 10 | **Waving / Welcome** | Onboarding welcome screen | Friendly wave, inviting pose. |

### Mascot Style Guide
- **Base color**: Soft coral pink (`#E879A2`) with lighter pink highlights
- **Eyes**: Simple dot eyes with subtle shine
- **Cheeks**: Soft pink circles (blush)
- **Limbs**: Small rounded hands and feet (no fingers needed)
- **Accessories**: Doctor headband mirror (optional), can hold props
- **Style**: Kawaii / cute illustration, clean vector, flat with subtle shadows

---

## 2. SCREEN ICONS

Flat, soft style matching the pastel palette. Needed at 40x40px and 80x80px, transparent bg.

### Category Icons (for body systems)
| # | Icon | Color | Description |
|---|------|-------|-------------|
| 1 | Heart / Cardiovascular | `#E879A2` coral pink | Anatomical heart or simple heart |
| 2 | Liver | `#C88B3A` warm brown | Liver organ shape |
| 3 | Metabolic / Lightning | `#D97706` amber | Lightning bolt or flame |
| 4 | Kidneys | `#0D9488` teal | Kidney bean shapes |
| 5 | Thyroid | `#7C3AED` purple | Butterfly/thyroid shape |
| 6 | Blood / Hematology | `#DC2626` red | Blood drop |
| 7 | Inflammation | `#F59E0B` orange | Shield or flame |
| 8 | Hormones | `#E879A2` pink | Chemistry flask or DNA |
| 9 | Vitamins & Minerals | `#059669` green | Pill capsule or leaf |

### Action Icons
| # | Icon | Description |
|---|------|-------------|
| 10 | Upload / Scan | Document with upward arrow |
| 11 | Camera | Camera icon |
| 12 | Gallery | Image/photo icon |
| 13 | PDF | Document with "PDF" badge |
| 14 | Manual Entry | Keyboard or pencil |
| 15 | Share | Share arrow |
| 16 | Trophy | Achievement trophy |
| 17 | Star / XP | Star or sparkle for XP |
| 18 | Calendar | Calendar for test reminders |
| 19 | Doctor | Stethoscope |
| 20 | Crown / Pro | Crown for premium |

### Status Icons (small, 24x24)
| # | Icon | Color | Description |
|---|------|-------|-------------|
| 21 | Normal | `#059669` green | Checkmark in circle |
| 22 | Borderline | `#D97706` amber | Exclamation in triangle |
| 23 | Alert | `#DC2626` red | X in circle |
| 24 | Trend Up | green | Upward arrow |
| 25 | Trend Down | red | Downward arrow |
| 26 | Trend Stable | gray | Horizontal dash |

---

## 3. EMPTY STATE ILLUSTRATIONS (~300x300px PNG, transparent bg)

Full illustrations combining the mascot with contextual elements.

| # | Screen | Description |
|---|--------|-------------|
| 1 | **Home (no data)** | Mascot sleeping on faded body silhouette. "Upload your first test!" |
| 2 | **Tests (no tests)** | Mascot looking at empty clipboard with question mark |
| 3 | **Trends (no history)** | Mascot pointing at empty/flat line chart |
| 4 | **Actions (no missions)** | Mascot holding unchecked checklist |
| 5 | **Chat (no data)** | Mascot with empty speech bubble, looking eager |

---

## 4. LOADING & STATE ILLUSTRATIONS (~200x200px PNG)

| # | State | Description |
|---|-------|-------------|
| 1 | **Analyzing PDF** | Mascot with magnifying glass over a document, sparkles |
| 2 | **Processing** | Mascot thinking, with gears or loading dots |
| 3 | **Success** | Mascot celebrating with confetti and green checkmark |
| 4 | **Error** | Mascot worried with red X, holding broken clipboard |
| 5 | **Syncing** | Mascot with cloud + sync arrows |

---

## 5. ONBOARDING ILLUSTRATIONS (~350x350px PNG)

| # | Screen | Description |
|---|--------|-------------|
| 1 | **Welcome** | Mascot waving with "Clyra" name and sparkles |
| 2 | **Upload step** | Mascot showing phone with PDF icon, arrow to results |
| 3 | **Score step** | Mascot next to health score gauge showing 85/100 |
| 4 | **Track step** | Mascot next to rising trend chart with calendar |
| 5 | **Ready** | Mascot in doctor outfit, thumbs up, "Let's go!" energy |

---

## 6. ACHIEVEMENT BADGES (hexagonal frames, 120x120px)

Each needs a **locked** (grayscale) and **unlocked** (full color + glow) state.

| # | Badge | Icon Inside | Color Theme |
|---|-------|------------|-------------|
| 1 | First Exam | Test tube | Teal |
| 2 | Trend Unlocked | Chart line | Blue |
| 3 | Three Checkups | "3" with stars | Gold |
| 4 | Elite Score | Crown | Gold |
| 5 | Heart Green | Heart + checkmark | Green |
| 6 | Kidneys Green | Kidney + checkmark | Green |
| 7 | Metabolic Reboot | Lightning bolt | Amber |
| 8 | Five Improved | "5" with arrows | Purple |
| 9 | Full Coverage | Body silhouette filled | Teal |
| 10 | Streak Master | Fire/flame | Orange |
| 11 | Pro Member | Crown + sparkles | Gold gradient |
| 12 | Health Explorer | Magnifying glass | Blue |

---

## 7. COLOR PALETTE

### Primary
- **Teal** (main brand): `#0D9488`
- **Coral Pink** (mascot/accent): `#E879A2`

### Pastels (card backgrounds)
| Name | Color | Background |
|------|-------|------------|
| Pink | `#F5D0E0` | `#FDF2F8` |
| Mint | `#D0F0E0` | `#F0FDF4` |
| Blue | `#D0E4F5` | `#EFF6FF` |
| Lavender | `#E0D0F5` | `#FAF5FF` |
| Peach | `#F5E0D0` | - |

### Status
- Normal: `#059669` green
- Borderline: `#D97706` amber
- Attention: `#DC2626` red

### Neutrals
- Background: `#FAFBFC`
- Card: `#FFFFFF`
- Text: `#1A1D23`
- Muted: `#6B7280`

---

## 8. DELIVERY FORMAT

- All PNGs at **2x and 3x** resolution (for iOS/Android retina)
- Transparent backgrounds on everything
- Organized in folders:
  ```
  /mascot/         mascot-happy.png, mascot-celebrating.png, etc.
  /icons/          icon-heart.png, icon-liver.png, etc.
  /empty-states/   empty-home.png, empty-tests.png, etc.
  /loading/        loading-analyzing.png, loading-success.png, etc.
  /onboarding/     onboarding-welcome.png, etc.
  /badges/         badge-first-exam.png, badge-first-exam-locked.png, etc.
  ```
- **Bonus**: SVG versions of icons (for Lottie conversion later)

---

## 9. TOTAL ASSET COUNT

| Category | Items | Variants | Total Files |
|----------|-------|----------|-------------|
| Mascot poses | 10 | 1 each | 10 |
| Category icons | 9 | 2 sizes | 18 |
| Action icons | 11 | 2 sizes | 22 |
| Status icons | 6 | 1 size | 6 |
| Empty states | 5 | 1 each | 5 |
| Loading states | 5 | 1 each | 5 |
| Onboarding | 5 | 1 each | 5 |
| Badges | 12 | 2 (locked+unlocked) | 24 |
| **TOTAL** | | | **~95 files** |

---

## 10. LOTTIE NOTES (for later phase)

These static PNGs will later be animated as Lottie JSON:
- Mascot idle breathing (subtle pulse)
- Mascot celebrating (confetti burst)
- Score gauge filling
- Loading dots pulse
- Badge unlock (glow + bounce)
- Onboarding transitions
