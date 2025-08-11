import { ImageBackground, Pressable, Text, View } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

export default function App() {
  return (
    <ImageBackground className="min-h-screen" source={require("../assets/images/login.jpg")}>
      <LinearGradient
        colors={['transparent', 'rgba(255,255,255,0.9)', 'rgba(255,255,255,1)']}
        locations={[0, 0.6, 1]}
        className="w-full h-[40%] absolute bottom-0"
      >
        <Pressable
          onPressIn={() => {
            // Add active pressed state styles
          }}
          onPressOut={() => {
            // Remove active pressed state styles  
          }}
          className="absolute bottom-10 left-10 right-10 bg-[#ffd401] border-r-8 border-b-8 border-yellow-500 p-6 rounded-2xl shadow-2xl items-center active:border-r-4 active:border-b-4">
          <Text style={{fontFamily: "bold"}} className="text-white text-2xl font-bold">Get Started</Text>
        </Pressable>
      </LinearGradient>
    </ImageBackground>
  );
}