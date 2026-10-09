import { Alert, Platform, type AlertButton } from 'react-native';

// React Native's Alert is a no-op on web. Preserve confirmations in both runtimes.
export function showAlert(title: string, message?: string, buttons?: AlertButton[]) {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }
  const text = [title, message].filter(Boolean).join('\n\n');
  if (buttons && buttons.length > 1) {
    const confirm = buttons.find(button => button.style === 'destructive')
      ?? buttons.find(button => button.style !== 'cancel');
    const selected = window.confirm(text) ? confirm : buttons.find(button => button.style === 'cancel');
    selected?.onPress?.();
  } else {
    window.alert(text);
    buttons?.[0]?.onPress?.();
  }
}
