import React from 'react';
import { Text as RNText, TextProps, StyleSheet, useWindowDimensions } from 'react-native';
// Same as <Text>, but:
// 1) caps how much the phone's "font size" setting can enlarge the text, and
// 2) shrinks text a little on narrow screens, so layouts stay tidy on every phone.
export function Text(props: TextProps) {
  const { width } = useWindowDimensions();
  const k = width < 380 ? Math.max(0.86, width / 380) : 1;
  let style = props.style;
  if (k < 1 && style) {
    const f: any = StyleSheet.flatten(style);
    if (f && typeof f.fontSize === 'number') style = [style, { fontSize: Math.round(f.fontSize * k * 10) / 10, ...(typeof f.lineHeight === 'number' ? { lineHeight: Math.round(f.lineHeight * k * 10) / 10 } : {}) }];
  }
  return <RNText maxFontSizeMultiplier={1.12} {...props} style={style} />;
}
