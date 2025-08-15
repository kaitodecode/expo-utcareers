import { Stack } from "expo-router";
import "../global.css"
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import { Poppins_200ExtraLight, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, useFonts } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    // Alias untuk kemudahan penggunaan
    'regular': Poppins_400Regular,
    'medium': Poppins_500Medium,
    'semibold': Poppins_600SemiBold,
    'bold': Poppins_700Bold,
    'extralight': Poppins_200ExtraLight,
    // Nama asli tetap tersedia
    Poppins_200ExtraLight,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1" onLayout={onLayoutRootView}>
        <StatusBar barStyle={"light-content"} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen
            name="signin"
          />
          <Stack.Screen
            name="signup"
          />
          <Stack.Screen
            name="user"
          />
          <Stack.Screen
            name="admin"
          />
        </Stack>
      </SafeAreaView>
  );
}
