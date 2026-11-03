import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
export default function Root() {
  return (<><StatusBar style="light" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a0f2c' }, animation: 'slide_from_right' }} /></>);
}
