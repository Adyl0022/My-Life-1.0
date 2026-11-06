import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

// Height of the on-screen keyboard (0 when closed), so screens can make room for it.
export function useKb() {
  const [h, setH] = useState(0);
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const ios = Platform.OS === 'ios';
    const a = Keyboard.addListener(ios ? 'keyboardWillShow' : 'keyboardDidShow', (e: any) => setH(e?.endCoordinates?.height || 0));
    const b = Keyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', () => setH(0));
    return () => { a.remove(); b.remove(); };
  }, []);
  return h;
}

// Keeps the text box you are typing in above the keyboard inside a ScrollView.
// Use: const { kb, ref, onScroll, reveal } = useReveal(); then <ScrollView ref={ref} onScroll={onScroll} scrollEventThrottle={16}
// contentContainerStyle={{ paddingBottom: kb + 70 }}> and call reveal() from each input's onFocus.
import { useRef } from 'react';
import { Dimensions, TextInput } from 'react-native';
export function useReveal() {
  const kb = useKb(); const ref = useRef<any>(null); const y = useRef(0); const kbRef = useRef(0); kbRef.current = kb;
  const onScroll = (e: any) => { y.current = e.nativeEvent.contentOffset.y; };
  const reveal = () => {
    [120, 380].forEach((ms) => setTimeout(() => {
      try {
        const f: any = (TextInput as any).State && (TextInput as any).State.currentlyFocusedInput && (TextInput as any).State.currentlyFocusedInput();
        if (!f || !f.measureInWindow || !kbRef.current) return;
        f.measureInWindow((_x: number, fy: number, _w: number, fh: number) => {
          const limit = Dimensions.get('window').height - kbRef.current - 24; const over = fy + fh - limit;
          if (over > 0 && ref.current && ref.current.scrollTo) ref.current.scrollTo({ y: y.current + over, animated: true });
        });
      } catch (e) {}
    }, ms));
  };
  return { kb, ref, onScroll, reveal };
}
