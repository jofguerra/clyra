import React, { forwardRef } from 'react';
import { View } from 'react-native';
import LottieView, { type LottieViewProps } from 'lottie-react-native';
import { setWasmUrl } from '@lottiefiles/dotlottie-react';

setWasmUrl('/dotlottie-player.wasm');

// Lottie's web implementation ignores React Native `style`. Size its wrapper
// explicitly, and make the canvas fill it on every screen (including modals).
export default forwardRef<LottieView, LottieViewProps>(function LottieAnimation({ style, ...props }, ref) {
  return (
    <View style={style}>
      <LottieView {...props} ref={ref} webStyle={{ width: '100%', height: '100%', ...props.webStyle }} />
    </View>
  );
});
