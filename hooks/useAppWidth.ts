import { Platform, useWindowDimensions } from 'react-native';

export const WEB_APP_MAX_WIDTH = 520;

export function useAppWidth() {
  const { width } = useWindowDimensions();
  return Platform.OS === 'web' ? Math.min(width, WEB_APP_MAX_WIDTH) : width;
}
