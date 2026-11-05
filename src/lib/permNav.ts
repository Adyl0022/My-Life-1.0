import { Platform } from 'react-native';
import { NavigationBar } from 'expo-navigation-bar';

// The app hides the Android navigation bar. Phone permission pop-ups can be cut off at the bottom while it is hidden,
// so show the bar for the moment a permission is asked, then hide it again.
export async function withNavBar<T>(fn: () => Promise<T>): Promise<T> {
  if (Platform.OS !== 'android') return fn();
  try { NavigationBar.setHidden(false); } catch (e) { /* ignore */ }
  await new Promise((r) => setTimeout(r, 350));
  try { return await fn(); } finally { try { NavigationBar.setHidden(true); } catch (e) { /* ignore */ } }
}
