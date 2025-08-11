import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, Image, ImageBackground, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import * as z from "zod";
import { api } from "@/lib/axios";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15, "Phone number must be less than 15 digits").regex(/^[0-9]+$/, "Phone number must contain only numbers"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
});

export default function SignUpScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{name?: string; phone?: string; email?: string; password?: string; confirmPassword?: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    try {
      setErrors({});
      setIsLoading(true);
      
      // Check password confirmation first
      if (password !== confirmPassword) {
        setErrors({ confirmPassword: "Passwords do not match" });
        return;
      }
      
      const validatedData = signupSchema.parse({ name, phone, email, password });
      
      // Simulate API call (only send original fields, not confirmPassword)
      const response = await api.post("/auth/register", {
        name: validatedData.name,
        phone: validatedData.phone,
        email: validatedData.email,
        password: validatedData.password,
      })


      if (response.status == 200 || response.status == 201) {
        Alert.alert("Success", "Sign up successful");
        router.push("/signin");
      } else {
        Alert.alert("Error", "Sign up failed");
      }

    } catch (error: any) {

      if (error instanceof z.ZodError) {
        const fieldErrors: {name?: string; phone?: string; email?: string; password?: string; confirmPassword?: string} = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof typeof fieldErrors] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="relative min-h-screen w-full">
      <ImageBackground 
        className="absolute inset-0 w-full h-full"
        source={require("../../assets/images/login.jpg")}
        blurRadius={3}
      />
      <TouchableOpacity 
        className="absolute top-12 left-4 z-10 bg-white/30 p-2 rounded-full backdrop-blur-sm"
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <ScrollView className="bg-white/95 backdrop-blur-sm absolute bottom-0 w-full h-[80%] rounded-t-3xl p-8 shadow-lg">
        <View className="pb-20">
          <View className="items-center mb-8">
            <MaterialCommunityIcons name="account-plus" size={80} color="#ffd401" />
            <Text className="text-3xl font-bold text-gray-800 mt-4">Create Account</Text>
            <Text className="text-gray-600">Sign up to start your journey</Text>
          </View>

          <View className="">
            <View>
              <Text className="text-gray-700 mb-2 font-medium">Full Name</Text>
              <View className="flex-row items-center border-2 border-gray-200 rounded-xl p-3 bg-gray-50">
                <FontAwesome5 name="user" size={20} color="#666" className="mr-2" />
                <TextInput 
                  placeholder="Enter your full name"
                  className="flex-1"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                />
              </View>
              {errors.name && (
                <Text className="text-red-500 text-sm mt-1 ml-1">{errors.name}</Text>
              )}
            </View>

            <View className="mt-3">
              <Text className="text-gray-700 mb-2 font-medium">Phone Number</Text>
              <View className="flex-row items-center border-2 border-gray-200 rounded-xl p-3 bg-gray-50">
                <FontAwesome5 name="phone" size={20} color="#666" className="mr-2" />
                <Text className="text-gray-600 mx-2 font-medium">+62</Text>
                <TextInput 
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  className="flex-1"
                  placeholderTextColor="#999"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
              {errors.phone && (
                <Text className="text-red-500 text-sm mt-1 ml-1">{errors.phone}</Text>
              )}
            </View>

            <View className="mt-3">
              <Text className="text-gray-700 mb-2 font-medium">Email</Text>
              <View className="flex-row items-center border-2 border-gray-200 rounded-xl p-3 bg-gray-50">
                <MaterialCommunityIcons name="email" size={20} color="#666" className="mr-2" />
                <TextInput 
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  className="flex-1"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>
              {errors.email && (
                <Text className="text-red-500 text-sm mt-1 ml-1">{errors.email}</Text>
              )}
            </View>

            <View className="mt-3">
              <Text className="text-gray-700 mb-2 font-medium">Password</Text>
              <View className="flex-row items-center border-2 border-gray-200 rounded-xl p-3 bg-gray-50">
                <MaterialCommunityIcons name="lock" size={20} color="#666" />
                <TextInput 
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  className="flex-1 mx-2"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={24} 
                    color="gray" 
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className="text-red-500 text-sm mt-1 ml-1">{errors.password}</Text>
              )}
            </View>

            <View className="mt-3">
              <Text className="text-gray-700 mb-2 font-medium">Confirm Password</Text>
              <View className="flex-row items-center border-2 border-gray-200 rounded-xl p-3 bg-gray-50">
                <MaterialCommunityIcons name="lock-check" size={20} color="#666" />
                <TextInput 
                  placeholder="Confirm your password"
                  secureTextEntry={!showConfirmPassword}
                  className="flex-1 mx-2"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons 
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                    size={24} 
                    color="gray" 
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text className="text-red-500 text-sm mt-1 ml-1">{errors.confirmPassword}</Text>
              )}
            </View>

            <TouchableOpacity 
              className={`py-4 rounded-xl mt-6 shadow-sm ${isLoading ? 'bg-gray-400' : 'bg-[#ffd401]'}`}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <View className="flex-row justify-center items-center">
                {isLoading ? (
                  <Text className="text-white text-center font-bold text-lg">Creating Account...</Text>
                ) : (
                  <>
                    <Text className="text-[#1a1a1a] text-center font-bold text-lg mr-2">Sign Up</Text>
                    <MaterialCommunityIcons name="account-plus" size={20} color="#1a1a1a" />
                  </>
                )}
              </View>
            </TouchableOpacity>

            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-gray-600">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/')}>
                <Text className="text-[#ffd401] font-bold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}