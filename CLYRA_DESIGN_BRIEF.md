# Clyra — Complete Design Brief

**For**: Lovable (or any design tool) to generate a polished, on-brand app design.

---

## 0. Brand Foundation

**Product**: Clyra — a consumer health app that turns confusing blood test results into friendly, plain-language insights. Users upload a lab PDF/photo, the app extracts biomarkers, maps them to body systems, and explains what they mean.

**Audience**: Adults (25–55) who aren't medical professionals. They want their labs demystified without being patronized.

**Brand personality**: Kawaii-friendly, warm, calming, playful but trustworthy. Not clinical. Not corporate. Think: Duolingo + Headspace + Apple Health.

**Mascot**: A smiling pink cartoon heart character with arms and legs (think of it as Clyra's companion). The mascot appears across empty states, loading screens, celebrations, and onboarding.

**Visual language**:
- **Soft pastel palette** — coral pink is primary, optional teal accent
- **Generous rounded corners** (16–28px)
- **Soft ambient shadows** (low opacity, large blur)
- **Inter for body, Poppins/Inter Display for headings**
- **Illustrations over icons** when emotion matters (onboarding, empty states)
- **Emoji used sparingly** for tone (✨ 💕 📈)

**Color palette**:
```
Primary (coral pink)   #E66E93    — CTAs, active states, highlights
Primary 10% tint       #E66E9315
Accent (teal)          #0D9488    — optional secondary emphasis
Foreground             #1A1D23    — main text
Muted foreground       #6B7280    — secondary text
Background             #FAFBFC    — app base
Surface (white)        #FFFFFF    — cards
Border                 #E8ECEF

Pastel pink bg         #FDF2F8    — hero section backgrounds
Pastel mint bg         #F0FDF4
Pastel blue bg         #EFF6FF
Pastel lavender bg     #FAF5FF

Status:
  Normal (green)       #059669
  Borderline (amber)   #D97706
  Attention (red)      #DC2626
  Low (coral)          #E879A2    — "a bit low" distinct from "high"

Score ring gradient    #E879A2 → #D4A0C0 → #C4B5D4    (rose → mauve → lavender)
```

**Motion personality** (Playful archetype):
- Signature easing: `cubic-bezier(0.175, 0.885, 0.32, 1.275)` — spring-bounce with 15% overshoot
- Durations: 120ms (micro), 300ms (cards), 500ms (modals), 900ms (theatrical reveals)
- Entrance pattern: scale 0.92→1 + fade + translateY +8px→0
- Always three motion layers: primary (hero), secondary (supporting), ambient (background life)

---

## 1. Splash / App Entry Point

**Route**: `/` (app/index.tsx)

**Purpose**: Shown briefly at launch while the store rehydrates & decides where to route the user (onboarding or main tabs).

**Content**: App icon, mascot Lottie, brand name "Clyra".

**Design notes**:
- Full-bleed pastel pink background
- Mascot heart Lottie centered (breathing animation)
- "Clyra" wordmark below in large rounded display font
- Fade to destination screen

---

## 2. Onboarding Flow

A 4-step guided introduction for first-time users. Each step is a full-screen slide with its own Lottie illustration, clean copy, and a single primary CTA.

### 2.1 Welcome (Step 1/4)

**Route**: `/onboarding`

**Purpose**: Introduce Clyra. Establish the mascot. Set expectations.

**Content**:
- Large Lottie mascot (heart character waving hello)
- Headline: "Meet Clyra" / "Tu nueva amiga de salud"
- Subhead: "Your friendly guide to understanding your blood tests"
- Primary CTA: "Let's start →" / "Empezar →"
- Secondary: "I already have an account" (text link)
- Skip / language toggle (🇺🇸 / 🇪🇸) in top right

**Design notes**:
- Full-bleed pink gradient background (very light)
- Mascot takes ~50% of screen height
- Large playful typography
- Single button, full-width at bottom

### 2.2 Profile (Step 2/4)

**Route**: `/onboarding/profile`

**Purpose**: Collect name, age, sex for personalization and reference ranges.

**Content**:
- Smaller mascot top-right (observing/encouraging pose)
- Headline: "Tell us about you" / "Cuéntanos de ti"
- Subhead: "So we can personalize your results"
- Text input: First name (large, rounded, floating label)
- Number input: Age
- Segmented toggle: Female / Male (with emoji icons 👩 👨 or minimalist SVG)
- Progress dots at top (2/4 filled)
- Primary CTA: "Next →" (disabled until required fields filled)
- Back arrow in top-left

**Design notes**:
- Input fields: 56px tall, rounded 16px, subtle border, pink focus state
- Sex toggle: pill-style with smooth slide animation between selections
- Progress dots at top show where the user is

### 2.3 Goals (Step 3/4)

**Route**: `/onboarding/goals`

**Purpose**: Let user pick health interests — used to tailor AI prompts & insights.

**Content**:
- Headline: "What matters to you?" / "¿Qué es importante para ti?"
- Subhead: "Pick as many as you like — we'll focus on these"
- Grid of 7 goal cards (2-column):
  1. 😊 **Mood & Energy** — "Feel better day to day"
  2. 🔥 **Metabolism** — "Weight, sugar, energy"
  3. 💪 **Performance** — "Fitness, recovery, sleep"
  4. ⚡ **Testosterone** — "Drive, strength, vitality" (if male)
  5. 🌸 **Female Hormones** — "Cycle, mood, hormones" (if female)
  6. ✨ **Longevity** — "Age gracefully, live longer"
  7. 🛡️ **Prevention** — "Stay healthy, catch issues early"
- Each card: emoji + title + subtitle, tap-to-select (multi-select)
- Selected state: pink border, pink tinted background, small checkmark
- Progress dots (3/4)
- Primary CTA: "Continue →" (enabled when 1+ selected)

**Design notes**:
- Cards: 120px tall, rounded 20px, white bg default, pink tint when selected
- Selection animation: scale 1→1.05→1 spring bounce, ~250ms
- At least one goal required

### 2.4 Auth (Step 4/4)

**Route**: `/onboarding/auth`

**Purpose**: Sign in or sign up — OR skip as guest.

**Content**:
- Smaller mascot
- Headline: "Save your progress" / "Guarda tu progreso"
- Subhead: "Create an account to sync across devices"
- Primary buttons (stacked):
  - 🍎 **Continue with Apple** (iOS only)
  - 🔍 **Continue with Google**
  - 📧 **Use email**
- Divider: "or"
- Ghost link: "Continue as guest" → skip to main app
- Small footer: "By continuing you agree to Terms & Privacy"

**Design notes**:
- Sign-in buttons: 52px tall, distinct icons, text aligned left
- Apple button = black bg, Google = white with colored G, email = pink primary
- Guest option is visible but de-emphasized (text link only)
- After auth/skip: → loading → tabs

### 2.5 Loading (Post-Onboarding)

**Route**: `/onboarding/loading`

**Purpose**: Transition screen while preparing the first-time dashboard.

**Content**:
- Centered Lottie mascot (breathing + blinking)
- Headline: "Setting things up..." / "Preparando todo..."
- Rotating factoids (1.5s each, fade transition):
  - "🩸 Blood tests can reveal over 200 health markers"
  - "💡 We use AI to explain your results in plain language"
  - "🔒 Your data stays private and encrypted"
  - "🫀 Small changes compound into big improvements"
- 3-second auto-advance to main tabs

**Design notes**:
- Centered layout, full-bleed soft gradient
- Factoid text: fade + slide-up 200ms

---

## 3. Main App — Tab Navigation

Tab bar at bottom with 5 tabs. Glassmorphic blur background (iOS) / opaque white (Android). 82px tall on iOS, 66px on Android.

**Active tab**: Coral pink icon + pink label. **Inactive**: Gray #9ba3af.
**Active state motion**: Icon micro-bounces scale 1→1.18→1, spring-back, 250ms.

Tabs (in order):
1. 💓 **HEALTH** (home dashboard)
2. 🎯 **ACTIONS** (gamification, missions, streaks)
3. 📈 **TRENDS** (progress over time)
4. 🧪 **TESTS** (upload + history)
5. ⚙️ **SETTINGS**

---

## 4. HEALTH Tab (Home Dashboard)

**Route**: `/(tabs)` — the main user home.

### 4.1 Home — Empty State (no exams yet)

**When**: `biomarkers.length === 0`

**Layout** (top to bottom):
1. **Hero Lottie** — Full-bleed top section, pastel blue sky + green hills background, mascot heart character standing next to a heartbeat monitor (animated)
2. **Curved content overlay** — white panel with top rounded corners overlapping the hero bottom
3. **Greeting block** — "Hi! I'm Clyra" (24px bold) + "Upload your first exam to get started ✨" (14px muted)
4. **"Your Body" section** — Body Map image + legend with all systems showing "No data" state (gray dots)
5. **Upload CTA** — big pink-tinted button: ⬆️ "Upload Results"

**Design notes**:
- Welcoming, inviting tone
- No dashboards/charts — instead visual encouragement
- Body map greyed out communicates "there's more to unlock"
- Mascot's pose should feel like a friendly greeter

### 4.2 Home — With Data

**When**: user has uploaded at least one exam.

**Priority**: The **Body Map is the hero** — users explore their body spatially, not via tables.

**Layout** (top to bottom):

1. **Hero Lottie** (same as empty state, persistent branding)
2. **Greeting**: "Hello, {name}" + "Here's your summary"
3. **Score Strip** (compact horizontal card):
   - **Left**: 96px circular gauge with gradient pink ring + animated count-up number, surrounded by 6 floating pink orbit particles (magic effect)
   - **Right**: "Looking great" headline + stats: "29 markers · 26 in range · ↗️ +3"
   - Background: pastel pink, soft pink shadow
4. **Body Map** (hero section):
   - Title "Your Biomarkers" + "Biomarkers mapped to your body"
   - Large humanoid body illustration with colored dots at organ locations (thyroid, heart, liver, kidneys, etc.)
   - Left/right side chips labeling each system (tap to filter)
   - Legend at bottom: green=Normal, amber=Borderline, red=Attention, gray=No data
   - Red/amber dots have a pulsing ring animation to draw attention
   - Entrance: dots pop in with spring bounce, 80ms staggered
5. **Needs Attention** section (only if there are out-of-range markers):
   - Title "Needs attention" + count subtitle ("3 markers out of range")
   - 2×2 grid of biomarker cards (max 4 cards):
     - Each card: emoji + friendly status pill ("Watch it" / "A little high" / "A bit low") + value in big colored font + friendly description
     - Card bg: white, rounded 18, subtle shadow
     - Cards cascade in with 60ms stagger
6. **Trends** section (only if 2+ exams):
   - Title "Trends" + "How your markers have changed"
   - 2×2 grid of mini sparkline charts: biomarker name, line graph (colored by status), Jun–Mar date labels
7. **All Markers** section (detail list):
   - Tab filter row (horizontal scroll): 📋 All, ❤️ Heart, 🫘 Liver, ⚡ Metabolic, etc. (Active tab has pink underline)
   - "N markers updated" banner with **Dismiss** button (only after new upload)
   - List of marker rows:
     - Each row: biomarker name (bold) + "NEW/UPD" pulsing pill (if recently updated) + Spanish secondary name + reference range + value in colored font + status pill + chevron
     - Color-coded left border (red for attention, amber for borderline, green for normal)
8. **Risk Dashboard** (3-card row):
   - Cardiovascular, Metabolic, Inflammation
   - Each: icon + label + level (Low/Moderate/High) + progress bar
9. **Share with Doctor** button (ghost style, bottom)

**Motion choreography**:
- Each section uses `AnimatedSection` wrapper — fades in + slides up 8px on mount
- Stagger delays: 0 → 200 → 275 → 350 → 400 → 450 → 500ms for each section
- Score gauge: count-up 0→N over 900ms, then settle bounce (scale 1→1.05→1)
- Body Map dots: 300ms base delay, then 80ms stagger per organ

---

## 5. ACTIONS Tab

**Route**: `/(tabs)/activity`

**Purpose**: Gamification — daily missions, streaks, priorities. Think Duolingo for health.

**Layout**:
1. **Header** with title "Your Actions" + XP bar (horizontal progress with sparkle emoji + level label "Level 3")
2. **Active Streak Card** — orange/coral gradient, flame icon, "🔥 4 week streak — keep it going!"
3. **Today's Priority** — single hero card (biggest out-of-range marker):
   - Biomarker name + "Here's what to focus on today"
   - 3-step action list: foods to eat, foods to avoid, lifestyle tip
   - CTA: "Mark as done" (+50 XP)
4. **Mini Missions** — horizontal scrollable cards:
   - "💧 Drink 2L water today" (+20 XP)
   - "🚶 Walk 8,000 steps" (+30 XP)
   - "🧘 5-minute meditation" (+15 XP)
   - Each: checkbox-style completion toggle
5. **Weekly Challenge** — big card with progress bar, e.g. "Log 3 meals this week — 2/3 complete"
6. **Empty state**: peaceful mascot sitting in meditation pose, "No missions yet — upload your first exam to unlock!"

**Design notes**:
- Gamified but not gimmicky — feels like a thoughtful coach
- XP animations: +20 XP floats up from tapped button with fade
- Streak flame: flickers subtly

---

## 6. TRENDS Tab

**Route**: `/(tabs)/progress`

**Purpose**: Show change over time — scores, biomarkers, achievements.

### 6.1 Trends — With Only 1 Exam (First Exam State)

**Layout**:
1. **"Your First Score" card**: colored circle with score number + date + "📈 Upload another exam to see trends" banner
2. **Progress section** — XP bar, achievements count, active weeks, level
3. **Milestones / Badges** (hexagonal grid) — currently unlocked badges + locked placeholders
4. **Health Plan** section — selected goals as pills, edit button

### 6.2 Trends — With 2+ Exams

**Layout**:
1. **Score History** graph:
   - Line chart showing score over time + projected future point (dashed line)
   - Date labels on X-axis
   - "📅 Next test recommended in 3 months" banner
2. **Celebration banner** (if score improved): "Score Improved! +4 points"
3. **Overall Score card**: big number + delta chip + breakdown chips (✓ 26 / ~ 2 / ⚠ 1 / 29 markers)
4. **Biomarker sparkline grid** (2×2):
   - Each: name, mini line chart (colored by status), dates, current value
5. **Improving** section — 🔼 green rows for markers that got better
6. **Needs Attention** section — 🔽 red/amber rows for markers that got worse
7. **Simulation card**: "If you improve 3 markers, your score could go from 88 → 94 (+6)" with dual rings
8. **Doctor Questions** (paged cards) — pre-written questions to ask your doctor, shareable
9. **Your Progress** — XP bar, stats, level
10. **Milestones / Badges** (expandable hex grid of 12 achievement badges)
11. **Health Plan** — editable goal pills

**Design notes**:
- Charts: minimal axis lines, soft dashed gridlines, colored data points
- Mini sparklines: 2-point trend lines, color matches biomarker status
- Hex badges: 72×72 with SVG polygon frame, inner PNG illustration, glow shadow for unlocked ones

---

## 7. TESTS Tab (Upload)

**Route**: `/(tabs)/upload`

Has 5 states: `list`, `choose`, `uploading`, `processing`, `done`.

### 7.1 Tests — List (default)

**Layout**:
1. **Title**: "My Tests"
2. **Test History** list (if any):
   - Each row: lab flask icon (amber if issues, green if all good), test label + date + "N markers", status: "N out of range" (amber) or "All in range ✓" (green), chevron
3. **Add Test** button (big pink, circular + icon): "+ Add Test"
4. **Health Coverage** section (if data): heatmap of body systems showing what's been tested
5. **Recommended Tests** section: list of suggested panels (e.g. "Thyroid Panel ✓ tested", "Vitamin D — not tested")
6. **Empty state**: document icon + "No tests yet — upload your first to begin"

### 7.2 Tests — Choose Method

Shown after tapping "Add Test".

**Layout**:
1. **Title**: "Add Test" + "How would you like to upload?"
2. Options (list rows):
   - 📸 **Take a Photo** — "Take a photo of your lab results"
   - 🖼️ **Choose from Gallery** — "Upload an image from your photos"
   - 📄 **Upload a PDF** — "Select a PDF file"
   - ⌨️ **Enter Manually** — "Coming soon" (disabled, "Soon" chip)
3. Cancel button at bottom

### 7.3 Tests — Uploading / Processing

**Layout** (centered, full-screen focal point):
1. Large pulsing Lottie animation (200×200) — heartbeat waveform with soft pink ring
2. **Step text** (animates between):
   - "📄 Reading your lab report..."
   - "🔍 Finding biomarkers..."
   - "✨ Analyzing values..."
   - "✅ Almost done..."
3. **Progress dots**: 4 dots, filled up to current step
4. Subtitle: "Please don't close the app"

**Design notes**:
- Minimal — ONE focal point (the Lottie), text + dots supporting
- No redundant spinner icons

### 7.4 Tests — Done (Success Celebration)

**Layout** (centered):
1. Large green circular checkmark icon (spring-pop entrance)
2. Headline: "Analysis Complete!" (slides up after icon)
3. Subhead: "We found {N} biomarkers in your report" (animated count-up on N)
4. Primary CTA: "View Results →" (slides up last)
5. If guest + first exam: secondary card inviting to create account

**Motion**: Choreographed sequence:
1. Checkmark spring-pop (400ms)
2. Title + count fade+slide-up (300ms)
3. CTA slides up with spring (300ms)

### 7.5 Test Detail Screen

**Route**: `/test/[id]`

**Purpose**: View the full biomarker list from a specific exam.

**Layout**:
1. Back button + title "Test from {date}"
2. Summary chips: "{N} markers · {M} in range · {K} need attention"
3. Filter: "All / Normal / Borderline / Out of range"
4. List of biomarker rows (same style as home markers)
5. Delete button (danger, at bottom with confirmation)

---

## 8. SETTINGS Tab

**Route**: `/(tabs)/settings`

**Layout** (sections separated by spacing):

### 8.1 Profile Section

- Avatar (mascot icon or initials circle, pink gradient)
- User name + "Free" or "Pro" chip
- Edit profile button

### 8.2 Subscription Section

- If free: "Upgrade to Pro" pink gradient card with sparkle icon, "Unlock all features ✨"
- If pro: "Pro Member" card with expiration date, "Manage subscription" link

### 8.3 Preferences

- Language: 🇺🇸 English / 🇪🇸 Español toggle
- Theme: Light / Dark / System (radio)
- Test reminder: 30 / 60 / 90 / 180 days (segmented)
- Units: Metric / Imperial

### 8.4 Goals (edit)

- Pills showing selected goals + "Edit" button → opens goals selection sheet

### 8.5 Data

- "Export my data" → PDF
- "Share with doctor" → generates PDF + share sheet
- "Delete all data" (danger, red text)

### 8.6 Account

- Sign out button (if authenticated)
- Delete account (danger)

### 8.7 Legal & Support

- Privacy Policy
- Terms of Service
- Contact Support
- Rate on App Store

### 8.8 Footer

- App version "v1.0.0 · Made with 💕"

**Design notes**:
- List rows: 56px tall, icon + label + trailing chevron/switch
- Section headers: small uppercase muted labels
- Destructive actions: red text, confirmation dialog

---

## 9. Biomarker Detail Screen

**Route**: `/biomarker/[name]`

**Purpose**: Deep dive into a single biomarker — what it is, why it matters, food suggestions.

**Layout**:
1. **Back button** (top-left) + share button (top-right)
2. **Hero card** (top):
   - Biomarker simple name ("Blood Sugar") + scientific name ("Glucose") + emoji
   - Big value in colored text + unit + status pill
   - Animated gauge/bar showing value on reference range
3. **Insight card**: "What this means for you" — plain-language explanation based on status
4. **What it measures** — paragraph description
5. **Why it matters** — paragraph
6. **Sparkline** (if multi-exam): trend over time
7. **Foods to eat** — pill-style tags with green tint ("🥬 leafy greens", "🥑 avocado", "🐟 salmon")
8. **Foods to avoid** — pill-style tags with red tint
9. **Ask your doctor** — pre-written question card (shareable)
10. **Related biomarkers** — horizontal scroll of linked markers

**Design notes**:
- Full-screen modal presentation (card push up from bottom)
- Top hero has pastel gradient background matching status color
- Reference range bar: gradient strip with marker for current value
- Generous vertical spacing — feels calm, educational

---

## 10. Subscription Screen

**Route**: `/subscription`

**Purpose**: Upsell to Pro subscription.

**Layout**:
1. Close (X) top-right
2. **Hero**: sparkle-animated mascot with crown / "Pro" badge
3. **Headline**: "Unlock Clyra Pro" + "Get the full experience"
4. **Feature list** (checkmarks):
   - ✅ Unlimited exams
   - ✅ AI-powered insights
   - ✅ Export PDF reports
   - ✅ Trend analysis
   - ✅ Share with doctor
   - ✅ Priority support
5. **Plan toggle**: Monthly / Annual (annual shows savings badge "Save 33%")
6. **Price card**: big price, "cancel anytime", "7-day free trial"
7. **Primary CTA**: "Start Free Trial" (full-width pink)
8. **Footer**: "Restore purchase" link + Terms/Privacy

**Design notes**:
- Celebratory vibe (this is a happy moment, not a guilt trip)
- Plan toggle: pill-style, smooth slide animation
- Price: very large, hero position
- Small print legal text at very bottom

---

## 11. Global Modal: Achievement Unlock

**Fires**: After upload when a new badge is earned — but ONLY shown when the user is on Home/Actions/Trends/Settings tab (NOT while on Tests tab's success screen, to avoid interrupting that flow).

**Layout**:
1. Dark backdrop (65% black overlay, fade in)
2. **Confetti Lottie** — full-screen overlay, 44 pink/teal/mint/amber pieces burst from center, 1.5s one-shot
3. **Hex badge** (center): white hexagonal frame with achievement PNG inside, flies in from below with spring bounce, glow pulse ring around it
4. **"✨ UNLOCKED"** small uppercase pink label
5. **Achievement name** (big white display font, "Health Journey Begins")
6. **Description** ("Upload your first blood test exam")
7. **"Tap to continue"** hint at bottom (+ "(N more)" if multiple queued)

**Motion sequence**:
- Backdrop fade in (200ms)
- Badge springs up + scales from 0 to 1 (parallel, 500ms)
- Title+desc fade+slide-up (300ms)
- Confetti plays once behind badge (1.5s)
- Glow pulse loops around badge while visible
- Tap to dismiss: badge shrinks + backdrop fades out (200ms)

---

## 12. Ambient / Continuous Animations

- **Heart mascot** (when idle): breathing (scale 1→1.04, 2s), floating (±5px translateY, 2.2s), occasional wiggle (±3° tilt every 5s)
- **Score ring particles**: 6–8 pink dots orbiting the gauge, different radii (8/14/20px offset from ring), different speeds (6–12s per orbit), opacity pulse 0.3→0.9 staggered
- **Body Map attention dots**: pulsing expanding rings (attention/borderline only)
- **NEW/UPDATED badges**: entrance spring pop + 2 pulse-glow cycles then settle
- **Tab icons**: focus scale bounce 1→1.18→1 (250ms spring)
- **Primary buttons**: press squash 0.96 → release 1.04 → settle 1

---

## 13. Key UX Principles

1. **Kawaii but credible** — cute mascot + pastel colors, but medical accuracy is never sacrificed.
2. **Plain language over jargon** — always include friendly translations ("Blood Sugar" instead of "Glucose", "Watch it" instead of "High").
3. **Body map as primary lens** — users explore their body, not a spreadsheet.
4. **Celebrate the right moments** — upload success, achievement unlock, score improvement — never feel gamified for its own sake.
5. **Empty states invite action** — never show "No data" without a clear next step.
6. **Motion reinforces hierarchy** — primary things get hero motion, secondary things support, ambient layer keeps it alive.
7. **Bilingual from the start** — every copy string has EN + ES variants, language toggle in settings.

---

## 14. Accessibility Notes

- Minimum touch target: 44×44pt
- Color contrast: WCAG AA (foreground text against background ≥ 4.5:1)
- Status colors always paired with icons or labels (not color alone)
- Reduce motion: respect iOS/Android system setting — all scale/spring animations should fade instead when Reduce Motion is on
- Screen reader labels on all interactive elements
- Dynamic Type support (font sizes scale with system setting)

---

## 15. Technical Stack Context (for Lovable reference)

- Built with React Native + Expo SDK 54
- Lottie animations for celebrations and mascot scenes
- SVG for ring gauges and custom charts
- Native Animated API for micro-interactions (springs, fades)
- react-native-svg for body map dots
- expo-router for navigation (file-based routing)

---

## Notes for Lovable

- **Prioritize the home screen with data** and **body map** — these get the most user time.
- Mascot should feel like a character, not just an image — pose variation across screens (waving, meditating, excited).
- Every screen should feel **warm** — ample whitespace, rounded corners, soft shadows.
- The app is about **understanding health**, not about being a database — design for curiosity and confidence, not information overload.
