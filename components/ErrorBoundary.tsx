import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import Mascot from './Mascot';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackBody?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * App-level error boundary that catches unhandled JS errors and shows a
 * recovery screen instead of a white-screen crash.
 *
 * Wrap the root layout (or any subtree) with <ErrorBoundary>.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to console (and later to Sentry / crash reporting)
    console.error('[Clyra] Uncaught error:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const title = this.props.fallbackTitle ?? 'Oh no — my heart skipped a beat';
    const body =
      this.props.fallbackBody ??
      "Something went wrong on our end. Please try again. If the problem sticks around, restart the app.";

    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <Mascot pose="sad" size={140} animation="idle-breath" />

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>

          {__DEV__ && this.state.error && (
            <View style={styles.debugCard}>
              <Text style={styles.debugTitle}>Debug info</Text>
              <Text style={styles.debugText} selectable>
                {this.state.error.message}
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.retryBtn} onPress={this.handleRetry} activeOpacity={0.8}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: 32,
  },
  title: {
    fontFamily: Typography.families.display,
    fontSize: 22, fontWeight: '800', color: Colors.foreground,
    textAlign: 'center', marginBottom: 10, marginTop: 12,
  },
  body: {
    fontFamily: Typography.families.body,
    fontSize: 15, color: Colors.mutedForeground, lineHeight: 22,
    textAlign: 'center', marginBottom: 28,
  },
  debugCard: {
    width: '100%', backgroundColor: Colors.attention10,
    borderRadius: 12, padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: Colors.attention + '30',
  },
  debugTitle: {
    fontFamily: Typography.families.body,
    fontSize: 12, fontWeight: '700', color: Colors.attention,
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  debugText: {
    fontFamily: Typography.families.body,
    fontSize: 12, color: Colors.foreground, lineHeight: 18,
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32, paddingVertical: 14,
    borderRadius: 14,
  },
  retryText: {
    fontFamily: Typography.families.body,
    fontSize: 16, fontWeight: '700', color: '#fff',
  },
});
