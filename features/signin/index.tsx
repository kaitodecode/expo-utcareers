import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, Image, ImageBackground, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useState } from "react";
import * as z from "zod";
import { api } from "@/lib/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/stores/auth";

const signinSchema = z.object({
  identifier: z.string().min(1, "Please enter your email or phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function SignInScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { setToken, setUser } = useAuth();

  const handleSignIn = async () => {
    try {
      setErrors({});
      setIsLoading(true);

      // Basic validation
      const validatedData = signinSchema.parse({ identifier, password });

      // Additional validation based on role
      if (isAdmin) {
        // Validate email format for admin
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(identifier)) {
          setErrors({ identifier: "Please enter a valid email address for admin login" });
          return;
        }
      } else {
        // Validate phone format for applicant
        const phoneRegex = /^[0-9]{10,}$/;
        if (!phoneRegex.test(identifier)) {
          setErrors({ identifier: "Please enter a valid phone number (minimum 10 digits)" });
          return;
        }
      }

      // Make API call
      const response = await api.post("/auth/login", {
        identifier: validatedData.identifier,
        password: validatedData.password,
        role: isAdmin ? 'admin' : 'applicant'
      });
      console.log(response.data);

      if (response.data.success) {
        // Store token
        AsyncStorage.setItem("token", response.data.data.token);
        AsyncStorage.setItem("user", JSON.stringify(response.data.data));
        AsyncStorage.setItem("role", response.data.data.role);

        setToken(response.data.data.token);
        setUser(response.data.data);

        Alert.alert("Success", "Sign in successful");
        // Navigate to home
        if (response.data.data.role === 'admin') {
          router.replace("/admin/approve");
        } else {
          router.replace("/user/job_list");
        }

      } else {
        Alert.alert("Error", response.data.message || "Sign in failed");
      }
    } catch (error: any) {

      if (error instanceof z.ZodError) {
        const fieldErrors: { identifier?: string; password?: string } = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof typeof fieldErrors] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        Alert.alert("Error", error.response?.data?.message || "Something went wrong");
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
      <View className="bg-white/95 backdrop-blur-sm absolute bottom-0 w-full h-[80%] rounded-t-3xl p-8 shadow-lg">
        <View>
          <View className="items-center mb-8">
            <MaterialCommunityIcons name="account-circle" size={80} color="#ffd401" />
            <Text className="text-3xl font-bold text-gray-800 mt-4">Welcome Back!</Text>
            <Text className="text-gray-600">Sign in to continue your journey</Text>
          </View>

          <View className="">
            {/* Role Selection */}
            <View className="mb-6">
              <Text className="text-gray-700 font-medium mb-3">Sign in as:</Text>
              <View className="flex-row justify-around">
                <TouchableOpacity 
                  className={`flex-row items-center px-4 py-2 rounded-lg border ${!isAdmin ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-300'}`}
                  onPress={() => setIsAdmin(false)}
                >
                  <View className={`w-4 h-4 rounded-full border-2 mr-2 ${!isAdmin ? 'border-blue-500 bg-blue-500' : 'border-gray-400'}`}>
                    {!isAdmin && <View className="w-2 h-2 bg-white rounded-full m-0.5" />}
                  </View>
                  <View className="flex-row items-center">
                    <FontAwesome5 name="user-tie" size={16} color={!isAdmin ? "#1d4ed8" : "#666"} />
                    <MaterialCommunityIcons name="briefcase-outline" size={16} color={!isAdmin ? "#1d4ed8" : "#666"} style={{marginLeft: 4}} />
                    <FontAwesome5 name="file-alt" size={14} color={!isAdmin ? "#1d4ed8" : "#666"} style={{marginLeft: 4}} />
                  </View>
                  <Text className={`ml-2 ${!isAdmin ? 'text-blue-700 font-medium' : 'text-gray-600'}`}>Pelamar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className={`flex-row items-center px-4 py-2 rounded-lg border ${isAdmin ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-300'}`}
                  onPress={() => setIsAdmin(true)}
                >
                  <View className={`w-4 h-4 rounded-full border-2 mr-2 ${isAdmin ? 'border-blue-500 bg-blue-500' : 'border-gray-400'}`}>
                    {isAdmin && <View className="w-2 h-2 bg-white rounded-full m-0.5" />}
                  </View>
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons name="shield-account" size={18} color={isAdmin ? "#1d4ed8" : "#666"} />
                    <MaterialCommunityIcons name="cog" size={16} color={isAdmin ? "#1d4ed8" : "#666"} style={{marginLeft: 4}} />
                    <MaterialCommunityIcons name="database" size={16} color={isAdmin ? "#1d4ed8" : "#666"} style={{marginLeft: 4}} />
                  </View>
                  <Text className={`ml-2 ${isAdmin ? 'text-blue-700 font-medium' : 'text-gray-600'}`}>Admin</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Dynamic Input Field */}
            <View>
              <Text className="text-gray-700 mb-2 font-medium">{isAdmin ? 'Email Address' : 'Phone Number'}</Text>
              <View className="flex-row items-center border-2 border-gray-200 rounded-xl p-3 bg-gray-50">
                {isAdmin ? (
                  <>
                    <MaterialCommunityIcons name="email" size={20} color="#666" className="mr-2" />
                    <TextInput 
                      placeholder="Enter your email address"
                      keyboardType="email-address"
                      className="flex-1 mx-2"
                      placeholderTextColor="#999"
                      value={identifier}
                      onChangeText={setIdentifier}
                      autoCapitalize="none"
                    />
                  </>
                ) : (
                  <>
                    <FontAwesome5 name="phone" size={20} color="#666" className="mr-2" />
                    <Text className="text-gray-600 mx-2 font-medium">+62</Text>
                    <TextInput 
                      placeholder="Enter your phone number"
                      keyboardType="phone-pad"
                      className="flex-1"
                      placeholderTextColor="#999"
                      value={identifier}
                      onChangeText={setIdentifier}
                    />
                  </>
                )}
              </View>
              {errors.identifier && (
                <Text className="text-red-500 text-sm mt-1 ml-1">{errors.identifier}</Text>
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


            <TouchableOpacity 
              className={`py-4 rounded-xl mt-6 shadow-sm ${isLoading ? 'bg-gray-400' : 'bg-[#ffd401]'}`}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              <View className="flex-row justify-center items-center">
                {isLoading ? (
                  <Text className="text-white text-center font-bold text-lg">Signing In...</Text>
                ) : (
                  <>
                    <Text className="text-[#1a1a1a] text-center font-bold text-lg mr-2">Sign In</Text>
                    <MaterialCommunityIcons name="login" size={20} color="#1a1a1a" />
                  </>
                )}
              </View>
            </TouchableOpacity>

            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-gray-600">Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text className="text-[#ffd401] font-bold">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}