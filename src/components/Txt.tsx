import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
// Same as <Text>, but caps how much the phone's "font size" setting can enlarge the text so layouts stay tidy on every phone.
export function Text(props: TextProps) {
  return <RNText maxFontSizeMultiplier={1.12} {...props} />;
}
