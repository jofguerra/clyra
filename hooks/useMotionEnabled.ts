import { useEffect, useState } from 'react';
import { AccessibilityInfo, AppState } from 'react-native';
export function useMotionEnabled() {
  const [reduced, setReduced] = useState(true);
  const [active, setActive] = useState(AppState.currentState !== 'background');
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (alive) setReduced(value); }).catch(() => {});
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    const state = AppState.addEventListener('change', value => setActive(value === 'active'));
    return () => { alive = false; motion.remove(); state.remove(); };
  }, []);
  return !reduced && active;
}
