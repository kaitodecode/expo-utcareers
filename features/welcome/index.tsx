import { ImageBackground, Pressable, Text, View } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState } from "react";
import { router } from "expo-router";

export default function WelcomeScreen() {
  const [show, setShow] = useState(false);

  return (
    <ImageBackground className="min-h-screen" source={require("../../assets/images/login.jpg")}>
      {show && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/60">
          <Pressable
            onPress={() => setShow(false)}
            className="absolute right-6 top-12 z-20 bg-white/20 rounded-full p-2"
          >
            <Ionicons name="close" size={24} color="white" />
          </Pressable>
          
          <View className="bg-white h-fit pb-8 absolute inset-x-0 bottom-0 z-10 rounded-t-3xl px-6 shadow-2xl">
            {/* Handle bar */}
            <View className="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-3" />
            
            {/* Header */}
            <View className="items-center mt-6 mb-8">
              <Text className="text-3xl font-bold text-gray-800 mb-2">
                Welcome Back!
              </Text>
              <Text className="text-base text-gray-500 text-center leading-6 px-4">
                Ready to advance your career?
              </Text>
            </View>
            
            {/* Buttons */}
            <View className="gap-4">
              <Pressable onPress={()=> router.push("/signin")} className="bg-[#ffd401] py-4 rounded-xl items-center shadow-lg active:scale-95">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="log-in-outline" size={22} color="white" />
                  <Text className="text-white text-lg font-semibold">Sign In</Text>
                </View>
              </Pressable>
              
              <Pressable onPress={()=> router.push("/signup")} className="bg-transparent py-4 rounded-xl items-center border border-gray-200 active:bg-gray-50">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="person-add-outline" size={22} color="#6b7280" />
                  <Text className="text-gray-600 text-lg font-medium">Create Account</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      )}
      
      {/* Bottom gradient and CTA */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
        locations={[0, 0.7, 1]}
        className="w-full h-[45%] absolute bottom-0 justify-end pb-6"
      >
        <View className="px-8 pb-4">
          <Text className="text-white text-3xl font-bold mb-3 text-center">
            Your Career Journey Starts Here
          </Text>
          <Text className="text-white/80 text-center mb-6 text-base leading-6">
            Join thousands of professionals who found their dream job
          </Text>
          
          <Pressable
            onPress={() => setShow(true)}
            className="bg-[#ffd401] py-4 rounded-2xl items-center shadow-xl active:scale-95 mb-2"
          >
            <Text className="text-white text-xl font-bold">Get Started</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}