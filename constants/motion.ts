// Clyra Brand Motion Identity
// Personality: Playful (kawaii health — bouncy, friendly, joyful)
// Use these tokens everywhere for consistency

import { Easing } from 'react-native';

export const Motion = {
  // ─── Duration palette (ms) ─────────────────────────────────────────────
  duration: {
    micro: 120,       // taps, toggles, tooltips
    quick: 200,       // hover states, small chips
    standard: 300,    // cards, sheets, transitions
    slow: 500,        // modals, dialogs, overlays
    theatrical: 900,  // score reveals, success celebrations
    ambient: 2000,    // breathing, floating, pulse loops
  },

  // ─── Easing curves ─────────────────────────────────────────────────────
  easing: {
    // Signature — use for 80% of entrances/pops
    // Spring-bounce with 15% overshoot (0.175, 0.885, 0.32, 1.275)
    signature: Easing.bezier(0.175, 0.885, 0.32, 1.275),

    // Gentle decelerate — cards, panels (MD3 emphasized)
    decelerate: Easing.bezier(0.05, 0.7, 0.1, 1),

    // Accelerate — exits, dismissals
    exit: Easing.bezier(0.3, 0, 1, 1),

    // Ambient — breathing loops, gentle motion
    ambient: Easing.bezier(0.4, 0, 0.2, 1),

    // Snappy — decisive, fast UI
    snappy: Easing.bezier(0.2, 0, 0, 1),
  },

  // ─── Stagger delays (ms) ───────────────────────────────────────────────
  stagger: {
    cards: 60,    // 2x2 biomarker highlight cards
    list: 40,     // marker rows, list items
    hero: 100,    // hero section elements (logo, title, CTA)
  },

  // ─── Common transforms ─────────────────────────────────────────────────
  // Use these as starting points for Animated.Value sequences
  transform: {
    entrance: {
      fromScale: 0.92,
      fromTranslateY: 8,
      fromOpacity: 0,
    },
    pop: {
      peakScale: 1.08,
    },
    press: {
      squashScale: 0.96,
      bounceScale: 1.04,
    },
  },

  // ─── Bezier tuples (for Animated.timing `easing` when you need raw values)
  bezier: {
    signature: [0.175, 0.885, 0.32, 1.275] as const,
    decelerate: [0.05, 0.7, 0.1, 1] as const,
    exit: [0.3, 0, 1, 1] as const,
    ambient: [0.4, 0, 0.2, 1] as const,
    snappy: [0.2, 0, 0, 1] as const,
  },
};

// ─── Helper: spring config for Animated.spring ──────────────────────────
// Gives a consistent "playful" feel across all springs in the app
export const SPRING_PLAYFUL = {
  damping: 12,
  mass: 0.8,
  stiffness: 180,
  useNativeDriver: true,
};

export const SPRING_GENTLE = {
  damping: 18,
  mass: 1,
  stiffness: 120,
  useNativeDriver: true,
};
