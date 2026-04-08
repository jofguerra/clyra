# Zyva App — Design Brief for Designer

## What is Zyva?
A health tracking app that analyzes blood test PDFs using AI, shows biomarkers on an interactive body map, calculates health scores, tracks trends over time, and gamifies the health improvement journey with XP, levels, achievements, and missions. Bilingual (English / Spanish).

---

## Tech Stack (What the designer needs to know)
- **Platform**: React Native + Expo (iOS + Android)
- **Icons**: We use [Lucide Icons](https://lucide.dev/icons/) — any icon from this library can be used. Designer can reference icons by name.
- **Fonts**: System fonts (San Francisco on iOS, Roboto on Android). Two weights used: regular body text and bold display headings.
- **Colors**: Defined below. Designer can propose a new palette but should keep the same semantic structure.

---

## Current Color System

| Token | Hex | Usage |
|-------|-----|-------|
| **primary** | #0058BE | Main brand blue — buttons, links, active states |
| **background** | #F6FAFE | App background |
| **surface** | #FFFFFF | Card backgrounds |
| **surfaceLow** | #F0F4F8 | Inactive chips, secondary backgrounds |
| **foreground** | #171C1F | Primary text |
| **mutedForeground** | #424754 | Secondary/subtitle text |
| **outline** | #72787E | Tertiary text, borders |
| **optimal** (green) | #006947 | Normal/healthy markers, improvements |
| **borderline** (yellow) | #CA8A04 | Borderline/warning markers |
| **attention** (red) | #BA1A1A | Out-of-range markers, errors, alerts |
| **gold** | #D4A017 | Achievements, elite level |
| **purple** | #7C3AED | XP system, gamification accents |

Each status color has a 10% opacity variant for backgrounds (e.g., optimal10, attention10).

---

## Screens Overview (11 screens + 1 major component)

### ONBOARDING FLOW (4 screens)

#### Screen 1: Welcome
- App logo/icon (large, centered)
- Main headline + subtitle
- 4 trust badges in a row (icons: Shield, Lock, Sparkles, BookOpen)
- 2 buttons at bottom: "Get Started" (primary) + "View Demo" (outline)

#### Screen 2: Profile Setup
- Back button header
- 3 form fields:
  - Name (text input)
  - Age (numeric input)
  - Sex (2 toggle buttons: Male / Female)
- "Continue" button (disabled until all filled)

#### Screen 3: Goals Selection
- Back button header
- Title + subtitle
- 7 goal cards in a 2-column grid, each with:
  - Emoji icon (top-left)
  - Checkmark badge (top-right, when selected)
  - Goal label (bottom)
  - Selected state: blue tint background + blue border
- Footer button: "Continue" or "Skip for now"

**Goals**: Mood, Metabolism, Performance, Testosterone, Female Hormones, Longevity, Preventive Health

#### Screen 4: Create Account
- Back button header
- Headline + subtitle
- Email input + Password input
- "Create Account" button (primary)
- "Already have account? Sign in" link

---

### MAIN APP (4 tabs + 2 detail screens)

#### Screen 5: Home Dashboard (Tab 1 — "Health")
The most complex screen. Scrollable, with these sections in order:

1. **Coach Greeting** — "Hello, {name}" + 2-3 contextual coach messages (colored bullets)
2. **Hero Score Card** — Large circular gauge (0-100) + level badge + trend indicator + bio age + 2 small CTAs
3. **XP Progress Bar** — Thin purple bar showing XP level progress
4. **Your Priorities** (up to 3 cards) — Each shows: emoji icon, title, subtitle, impact badge ("+5 points"), chevron
5. **Improvement Simulation** — "If you improve X, score goes from 77 → 82" with current/projected comparison
6. **Your Missions** (up to 2 cards) — Each shows: emoji icon, mission name, description, progress bar, XP reward badge
7. **Your Progress** (2x2 grid) — 4 stat boxes: markers improved, systems in green, coverage %, active weeks
8. **Body Map** — Interactive body silhouette with colored dots per body system (see Component section)
9. **Coverage Map** — 8 body systems with horizontal progress bars showing coverage %
10. **All Markers** — Horizontal filter chips (by system) + list of marker rows (name, value, status chip, chevron)
11. **Risk Dashboard** — 3 risk cards side by side (Cardiovascular, Metabolic, Inflammation) each with icon, level, bar
12. **Achievements** — Horizontal scrolling row of badge icons (unlocked = gold glow, locked = dimmed with lock)
13. **Critical Alert Banner** — Red banner at bottom if urgent markers exist

**Empty state** (no data): Body map + "Upload your results" CTA button

#### Screen 6: Trends (Tab 2 — "Trends")

**With 2+ exams:**
1. Score History Graph — Line chart with dots, dashed projected line, date labels
2. Celebration Banner — Green banner if score improved
3. Current Score Card — Large number + mini ring gauge + trend delta
4. Improving Markers — Green rows with arrow-up icon, marker name, status change
5. Declining Markers — Red rows with arrow-down icon
6. Improvement Simulation — Dual ring comparison (current → projected)
7. Doctor Questions — Cards with quoted questions, marker chip, share button
8. Action Cards — Per marker: foods to eat (green), foods to avoid (red), exercise (blue)
9. Test History — Rows with score badge, date, marker count, "Latest" tag

**With 1 exam (gamified unlock state):**
1. Score Graph (single point + projection)
2. Current Score Card
3. **3 Unlock Cards** — Each with icon + "Unlock trends/bio age/insights" + lock icon
4. **XP Incentive** — Purple banner "+100 XP for uploading second exam"
5. **Upload CTA** — Blue button "Upload new exam"
6. Improvement Simulation
7. Doctor Questions + Action Cards

**Empty state:** Icon + "No data yet" + subtitle

#### Screen 7: Tests / Upload (Tab 3 — "Tests")

**Default view:**
1. "Add Test" button (prominent, blue, top)
2. Upload history list (if tests exist) — score badge + info + chevron per test
3. Recommended Tests section — grouped by body system, each with icon + test name + description

**Upload method picker:**
3 options (only PDF active, Photo and Manual show "Coming soon"):
- PDF: Upload icon + title + description + chevron
- Photo: Camera icon (grayed) + "Coming soon" chip
- Manual: Keyboard icon (grayed) + "Coming soon" chip

**Processing states:** Loading spinner + status text
**Done state:** Green checkmark + "Analysis complete" + marker count + 2 buttons

#### Screen 8: AI Chat (hidden tab, accessed via buttons)
1. Message list — AI bubbles (left, white, Bot avatar) + User bubbles (right, blue, User avatar)
2. Quick question chips — Horizontal scroll of pre-made questions
3. Text input bar — Input field + Send button (blue circle)
4. Disclaimer text — "Not medical advice"

#### Screen 9: Settings (Tab 4)
1. Profile card — Avatar circle (initial letter) + name + exam count
2. **Gamification Stats** — XP bar + 3-column stats (achievements, streak weeks, level name)
3. Language toggle — 2 buttons with flag emojis (English / Spanish)
4. Health Goals — Wrap grid of goal chips (same as onboarding, toggleable)
5. Privacy controls — 3 setting rows with toggles/badges (visibility, encryption, notifications)
6. Data management — Export button + Delete button (red, destructive)
7. Disclaimer footer

#### Screen 10: Biomarker Detail (navigated from marker rows)
1. Back button
2. **Range Bar** — Gradient bar (red→yellow→green→yellow→red) with marker position bubble
3. Zone labels below bar (Low / Normal / Borderline / High with reference values)
4. Status message — Colored explanation text
5. **Aging Velocity Card** — Warning or celebration about consistent trend (if 3+ tests)
6. Trend badge — Arrow icon + delta value
7. **Timeline** — Vertical timeline of all test results with dots, dates, values
8. Retest reminder banner (if overdue)
9. **AI Insight Card** — Sparkles icon + personalized insight text + regenerate link
10. Foods to eat / avoid / exercise / sleep recommendations

#### Screen 11: Test Detail (navigated from history)
1. Header with back + title + edit/save button
2. Score card — Date + filename + large score bubble
3. Edit mode banner (when editing)
4. Out of Range section — Colored biomarker rows (editable values in edit mode)
5. In Range section — Green biomarker rows
6. Delete button (red, bottom)

---

### KEY COMPONENT: Body Map

An interactive body silhouette with 8 system hotspots:

| System | Emoji | Position |
|--------|-------|----------|
| Thyroid | 🦋 | Neck area |
| Blood & Immune | 🩸 | Left chest |
| Cardiovascular | ❤️ | Center chest |
| Vitamins & Minerals | ✨ | Right chest |
| Liver | 🟤 | Right abdomen |
| Metabolic | ⚡ | Center abdomen |
| Kidneys | 🫘 | Lower right |
| Hormones | 💊 | Lower center |

Each hotspot is a colored dot (green/yellow/red/gray) with pulsing animation for non-normal. When tapped, shows that system's biomarker pills below the body.

---

## What I Need From the Designer

### 1. Screenshots You'll Provide
You mentioned you'll provide screenshots of the current app. For me to implement redesigned screens, I need:

- **Full-screen mockups** for each of the 11 screens (PNG or Figma link)
- **Both states** where applicable: empty state + data state
- **Both languages** don't need separate designs — just design in one language and I'll handle translations

### 2. Asset Format Requirements

| Asset Type | Format | Notes |
|------------|--------|-------|
| **App icon** | PNG 1024x1024 | For App Store / Play Store |
| **Body map background** | PNG or SVG | Current is 484x970px PNG |
| **Splash screen** | PNG 1284x2778 (iPhone) | Or provide to Expo's spec |
| **Custom illustrations** | SVG preferred, PNG @3x ok | For empty states, onboarding |
| **Color palette** | Hex codes | Keep semantic structure (primary, optimal, borderline, attention, etc.) |

### 3. Icons
We use **Lucide Icons** (free, open source). The designer can:
- Browse all available icons at https://lucide.dev/icons/
- Reference any icon by name (e.g., "Heart", "TrendingUp", "Shield")
- If a custom icon is needed that doesn't exist in Lucide, provide it as **SVG, single color, 24x24 viewBox**

### 4. What I Can Implement Easily
- Any color changes (just give me hex codes)
- Any font changes (give me the font name, I'll install it)
- Any layout rearrangement (just show me the new order)
- Animations (describe timing and easing)
- New sections or cards (just show me the design)
- Gradient backgrounds
- Shadows and elevation changes
- Border radius changes
- Any Lucide icon swap

### 5. What Takes More Effort (but still doable)
- Custom SVG illustrations (need the SVG file)
- Custom chart/graph styles (need clear spec of what data to show)
- Complex animations (Lottie JSON files preferred, or describe in detail)
- New navigation patterns (new tabs, modals, etc.)

### 6. Deliverable Format (Ideal)
**Best**: Figma file with:
- One frame per screen
- Components for reusable elements (cards, buttons, badges)
- Color styles matching our token names
- Auto-layout so I can see spacing values
- Export-ready assets marked

**Also fine**:
- High-res PNG/PDF mockups with a separate spec doc listing:
  - Colors (hex)
  - Spacing (in px or dp)
  - Font sizes and weights
  - Border radius values
  - Any assets as separate files

---

## Screen 12: Subscription / Paywall (NEW)

This screen appears as a **modal or full-screen overlay** when a free user tries to access a premium feature, OR from a "Go Pro" button in Settings.

### Free vs Pro Feature Split

| Feature | Free | Pro |
|---------|------|-----|
| Upload exams (PDF) | 1 exam only | Unlimited |
| Health score | Yes | Yes |
| Body map | Yes | Yes |
| Biomarker detail | Basic (value + status) | Full (AI insight, foods, exercise, trend) |
| AI Chat | 3 messages/day | Unlimited |
| Trends & comparisons | Locked | Full access |
| Biological age | Locked | Full access |
| Risk dashboard | Locked | Full access |
| Improvement simulation | Locked | Full access |
| Doctor questions | Locked | Full access |
| Achievements & XP | Basic | Full gamification |
| Priority recommendations | Locked | Full access |
| Export data | Locked | Full access |

### Screen Layout (Top to Bottom)

1. **Close Button** (top-right)
   - X icon (24px), tappable to dismiss
   - Only shows when accessed from Settings (not from hard paywall)

2. **Hero Illustration** (centered, ~200px tall)
   - Custom illustration showing health/wellness concept
   - Could be: person with glowing body map, health metrics floating around them
   - **Asset needed from designer**: SVG or PNG @3x

3. **Headline**
   - EN: "Unlock Your Full Health Picture"
   - ES: "Desbloquea Tu Salud Completa"
   - Font: Display, 28px, Bold(800), centered

4. **Subtitle**
   - EN: "Get unlimited AI analysis, trends, and personalized health coaching"
   - ES: "Obtén análisis ilimitado con IA, tendencias y coaching personalizado"
   - Font: Body, 15px, mutedForeground, centered, line-height 22

5. **Feature List** (4-5 rows, gap 14)
   - Each row: Checkmark icon (green, 20px) + feature text (14px, foreground)
   - Features to highlight:
     1. "Unlimited exam uploads & AI analysis"
     2. "Trend tracking & biological age"
     3. "Personalized AI health coach"
     4. "Risk scores & improvement simulation"
     5. "Priority recommendations & action plans"

6. **Plan Cards** (2 options side by side, or stacked)

   **Monthly Plan:**
   - Border: 1px outline
   - Label: "Monthly" (14px, bold)
   - Price: "$4.99/mo" (24px, bold, foreground)
   - Sublabel: "Billed monthly" (12px, muted)

   **Annual Plan (recommended):**
   - Border: 2px primary blue (highlighted)
   - "BEST VALUE" badge (top-right, primary background, white text, small)
   - Label: "Annual" (14px, bold)
   - Price: "$29.99/yr" (24px, bold, primary)
   - Sublabel: "$2.49/mo — Save 50%" (12px, primary)

7. **Subscribe Button** (full width)
   - "Start Free Trial" or "Subscribe Now"
   - Primary blue, large, bold white text
   - If trial: "Try 7 days free, then $X/month"

8. **Terms Row** (centered, small text)
   - "Restore Purchases" link (tappable)
   - "Terms of Service" + "Privacy Policy" links
   - Font: 11px, muted, underlined

9. **Money-back Guarantee** (optional trust element)
   - Shield icon + "Cancel anytime, no questions asked"
   - Font: 12px, muted

### Paywall Trigger Points (where this screen appears)
- Tapping a locked feature (trends, risk dashboard, AI insight, etc.)
- Trying to upload a 2nd exam on free plan
- Tapping "Go Pro" button in Settings
- After 3rd AI chat message of the day
- Tapping export in Settings

### Mini Paywall (Inline Banner)
Also needed: a **small inline banner** that appears inside screens near locked features:
- Height: ~60px
- Layout: Row — Lock icon + "Unlock with Zyva Pro" text + "Go Pro" small button
- Background: primary10 or gold10
- Border radius: 12px
- Used inside: Home (near locked sections), Trends, Biomarker Detail

---

## Quick Reference: Current Screen Count

| Category | Screens | Status |
|----------|---------|--------|
| Onboarding | 4 | Welcome, Profile, Goals, Auth |
| Main Tabs | 4 | Home, Trends, Upload, Settings |
| Hidden Tab | 1 | AI Chat |
| Detail Screens | 2 | Biomarker Detail, Test Detail |
| Subscription | 1 | Paywall / Pro upgrade |
| **Total** | **12** | |

---

## Current Gamification Elements to Design

| Element | Where Used | Description |
|---------|------------|-------------|
| Score Gauge | Home, Trends | Circular 0-100 gauge |
| Level Badge | Home | Score level name + progress bar (5 levels: Attention → Elite) |
| XP Bar | Home, Settings | Purple progress bar with level number |
| Priority Cards | Home | Actionable health cards with impact badges |
| Mission Cards | Home | Quest cards with progress bar + XP reward |
| Achievement Badges | Home | 12 badges, unlocked (gold glow) vs locked (dimmed) |
| Coverage Map | Home | 8 systems with % bars |
| Progress Grid | Home | 2x2 stat boxes |
| Improvement Sim | Home, Trends | Current → Projected score comparison |
| Unlock Cards | Trends | "Upload 2nd exam to unlock X" with lock icons |
| Risk Cards | Home | 3 side-by-side risk level cards |
| Celebration Banner | Trends | "Your score improved!" |
| Paywall Modal | Multiple | Full-screen Pro upgrade with plan cards |
| Inline Pro Banner | Home, Trends, Detail | Small "Unlock with Pro" inline CTA |
| Pro Badge | Settings | Small badge next to username if subscribed |
