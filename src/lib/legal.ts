export type Sec = { h: string; p: string };
export const WHATS_NEW: Sec[] = [
  { h: 'Version 1.0.0', p: 'The first release. Daily Planner, Islamic Hub, My Finance, My Record, Habit and Health, My Life Assistant, Search, Stats, Insights and Settings, all in one app. Protect it with an optional PIN or fingerprint lock, with your saved data encrypted on your phone. Reminders for prayer times, Planner events and daily zikir, with quiet hours from 12 am to 5 am.' },
  { h: 'Made to be calm', p: 'A glass look that changes with the time of day, and no ads.' },
];
export const PRIVACY: Sec[] = [
  { h: 'What we store', p: 'Only what you enter yourself: your name, notes, events, finance entries, records and habits. Stats about how long you use the app are kept on your device for 30 days.' },
  { h: 'Where it lives', p: 'Right now everything is stored only on your phone and encrypted there. Nothing is sent to a server. If account sync is added later, this policy will be updated first and sync will only start with your consent.' },
  { h: 'What we never do', p: 'We do not show ads, track you across other apps, sell your data or share it with anyone.' },
  { h: 'Location', p: 'Prayer times use your location only to work out the times. It is not saved or sent anywhere except to the prayer-time service to look up your zone.' },
  { h: 'App lock', p: 'If you turn on App lock, your PIN is stored only on your phone in scrambled (hashed) form. We cannot see it or reset it for you.' },
  { h: 'Your control', p: 'You can export everything at any time from Settings, or reset all your data. Removing the app from your phone removes its data.' },
  { h: 'Contact', p: 'Questions about privacy go to the developer, Adli Syahmi.' },
];
export const TERMS: Sec[] = [
  { h: 'Using My Life', p: 'My Life is a personal organiser for your own use. Keep your phone and your PIN private. You are responsible for what is done on your device.' },
  { h: 'Your content', p: 'Everything you add belongs to you. We only store and show it back to you.' },
  { h: 'Religious content', p: 'Quran text, zikir and prayer times are provided as a convenience. Prayer times follow JAKIM. Please confirm with your local authority where it matters.' },
  { h: 'Assistant', p: 'My Life Assistant answers from your own data and is not a financial, medical or religious adviser.' },
  { h: 'No warranty', p: 'The app is provided as is. Keep a backup using Export. We are not liable for loss of data.' },
  { h: 'Changes', p: 'These terms may change as the app grows. The latest version is always in Settings, under About.' },
];
export const LICENCES: Sec[] = [
  { h: 'Open-source software', p: 'My Life is built with React Native, Expo (including expo-router, expo-notifications, expo-location, SheetJS (xlsx), expo-secure-store, expo-local-authentication and expo-crypto), react-native-svg, react-native-reanimated, AsyncStorage, aes-js and noble-hashes. They are released under the MIT licence.' },
];

export const SUPPORT_EMAIL = 'adlisyahmi324@gmail.com';
export const PRIVACY_URL = 'https://adyl0022.github.io/My-Life-1.0/privacy.html';
export const HOWTO: Sec[] = [
  { h: '1. Start on Home', p: 'The Dashboard shows your day: next prayer, tasks, spending and habits. Use the bottom bar to move between Home, Stats, Insights and Settings.' },
  { h: '2. Plan your days', p: 'Planner holds your tasks and events. Add an event and choose when to be reminded.' },
  { h: '3. Islamic Hub', p: 'Prayer times, Quran, zikir, fasting log and more. Allow location once so prayer times are right for where you are.' },
  { h: '4. Money and motorcycle', p: 'My Finance tracks spending, income and commitments. My Record keeps mileage, service and fuel for your motorcycle.' },
  { h: '5. Habit and Health', p: 'Log steps, sleep, mood and water. Your streaks and score show up in Stats and Insights.' },
  { h: '6. Ask the Assistant', p: 'Type things like "I spent RM10 on lunch". It answers from your own data and can save entries for you after you confirm.' },
  { h: '7. Keep it safe', p: 'Turn on App lock in Settings, Security. Save a backup now and then from Settings, Export.' },
];
export const FAQ: Sec[] = [
  { h: 'Where is my data?', p: 'Only on your phone, encrypted. Nothing is sent to a server.' },
  { h: 'I changed phone. How do I move my data?', p: 'On the old phone, go to Settings, Export, choose Backup (JSON) and keep the file. Restoring from a file is coming soon.' },
  { h: 'I forgot my PIN.', p: 'On the lock screen tap Forgot PIN. You can use your fingerprint to set a new PIN, or erase the app data and start fresh.' },
  { h: 'Notifications do not ring.', p: 'Use Settings, General, Send a test notification. If nothing shows, allow notifications for My Life in your phone settings and turn off battery saving for the app.' },
  { h: 'Prayer times look wrong.', p: 'Open Islamic Hub and refresh your location. Times follow JAKIM. Please confirm with your local authority.' },
];
