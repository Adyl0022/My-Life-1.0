import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { NavigationBar } from 'expo-navigation-bar';
import { Platform } from 'react-native';
export default function Root() {
  return (<><StatusBar style="light" />{Platform.OS === 'android' ? <NavigationBar hidden style="light" /> : null}<Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a0f2c' }, animation: 'slide_from_right' }} /></>);
}
