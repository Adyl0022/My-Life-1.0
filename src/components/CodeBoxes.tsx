import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, Animated, Easing } from 'react-native';
import { Text } from './Txt';
import { W } from './Ui';

const TEAL = '#8fe9e2';
// One box per character: for the 6-digit email code and for the activation code.
// A single hidden input sits on top, so typing, deleting and pasting all work like a normal field.
export function CodeBoxes({ value, onChange, length, kind = 'digits', group = 0, shake = '', autoFocus = true, mask = false }: { value: string; onChange: (v: string) => void; length: number; kind?: 'digits' | 'alnum'; group?: number; shake?: string; autoFocus?: boolean; mask?: boolean }) {
  const [f, setF] = useState(false);
  const blink = useRef(new Animated.Value(1)).current;
  const sh = useRef(new Animated.Value(0)).current;
  useEffect(() => { const a = Animated.loop(Animated.sequence([Animated.timing(blink, { toValue: 0, duration: 520, useNativeDriver: true }), Animated.timing(blink, { toValue: 1, duration: 520, useNativeDriver: true })])); a.start(); return () => a.stop(); }, []);
  useEffect(() => {
    if (!shake) return; sh.setValue(0);
    Animated.timing(sh, { toValue: 1, duration: 380, easing: Easing.linear, useNativeDriver: true }).start();
  }, [shake]);
  const clean = (t: string) => {
    if (kind === 'digits') return t.replace(/\D/g, '').slice(0, length);
    let r = t.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (r.startsWith('ML')) r = r.slice(2);
    return r.slice(0, length);
  };
  const cells = Array.from({ length }, (_, i) => i);
  const cur = Math.min(value.length, length - 1);
  return (
    <Animated.View style={{ marginBottom: 12, transform: [{ translateX: sh.interpolate({ inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1], outputRange: [0, -9, 9, -6, 6, 0] }) }] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {cells.map((i) => {
          const ch = value[i] || ''; const on = f && i === cur && value.length < length || (f && value.length === length && i === length - 1);
          return (
            <React.Fragment key={i}>
              {group && i > 0 && i % group === 0 ? <Text style={{ color: 'rgba(255,255,255,.45)', fontSize: 18, fontWeight: '800', width: 14, textAlign: 'center' }}>–</Text> : null}
              <View style={{ flex: 1, height: group ? 50 : 56, marginLeft: i > 0 && !(group && i % group === 0) ? (group ? 5 : 8) : 0, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: ch ? '#35347a' : on ? '#2c5a78' : '#2e2d6c', borderWidth: 1.3, borderColor: on ? TEAL : ch ? 'rgba(183,148,255,.55)' : 'rgba(255,255,255,.16)' }}>
                {ch ? <Text style={{ color: W, fontSize: group ? 19 : 24, fontWeight: '800' }}>{mask ? '•' : ch}</Text> : on ? <Animated.View style={{ width: 2, height: 24, borderRadius: 1, backgroundColor: TEAL, opacity: blink }} /> : null}
              </View>
            </React.Fragment>
          );
        })}
      </View>
      <TextInput
        value={value} onChangeText={(t) => onChange(clean(t))} onFocus={() => setF(true)} onBlur={() => setF(false)}
        autoFocus={autoFocus} keyboardType={kind === 'digits' ? 'number-pad' : 'default'} autoCapitalize="characters" autoCorrect={false} autoComplete={kind === 'digits' ? 'one-time-code' : 'off'} textContentType={kind === 'digits' ? 'oneTimeCode' : 'none'}
        importantForAutofill="no" underlineColorAndroid="transparent" caretHidden maxLength={length + 4} contextMenuHidden={false}
        style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, opacity: 0.01, color: 'transparent', backgroundColor: 'transparent', fontSize: 1 } as any}
      />
    </Animated.View>
  );
}
