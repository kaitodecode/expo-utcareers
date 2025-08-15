import { Stack } from "expo-router";
import "../global.css"
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert, StatusBar } from "react-native";
import { Poppins_200ExtraLight, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold, useFonts } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import '../firebaseConfig'; // Initialize Firebase

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  useEffect(() => {
    requestPermission();
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('Pesan Baru', JSON.stringify(remoteMessage));
    });
    return unsubscribe;
  }, []);

  async function requestPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
    }
  }

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
    <SafeAreaView style={{ flex: 1 }} onLayout={onLayoutRootView}>
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
