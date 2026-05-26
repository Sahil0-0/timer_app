import { useCallback } from 'react';
import { View } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { colors } from './src/theme/colors';
import ChronosSplashScreen from './src/screens/SplashScreen';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    'IntelOneMono-Regular': require('./assets/font/IntelOneMono-Regular.ttf'),
    'IntelOneMono-Medium': require('./assets/font/IntelOneMono-Medium.ttf'),
    'IntelOneMono-SemiBold': require('./assets/font/IntelOneMono-SemiBold.ttf'),
    'IntelOneMono-Bold': require('./assets/font/IntelOneMono-Bold.ttf'),
    'IntelOneMono-Light': require('./assets/font/IntelOneMono-Light.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background_black }}
      onLayout={onLayoutRootView}
    >
      <StatusBar style="light" />
      <ChronosSplashScreen />
    </View>
  );
}
