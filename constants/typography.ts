import { Platform } from 'react-native';

// Fallback to system fonts until we load custom ones, but following spec sizes
export const Typography = {
    families: {
        // using system fonts for React Native by default if we haven't loaded them, 
        // but typically we would use 'DMSans-Bold' etc. once loaded.
        display: Platform.OS === 'ios' ? 'System' : 'sans-serif',
        body: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    },
    sizes: {
        xs: 10,
        sm: 12,
        base: 14,
        md: 16,
        lg: 20,
        xl: 24,
        display: 32,
        huge: 48,
    },
    weights: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    }
};
