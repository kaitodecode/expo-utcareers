import { Text, View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from "@/stores/auth";
import { router } from "expo-router";

export default function Profile() {
    const {logout} = useAuth()
    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    onPress: async() => {
                        await logout()
                        router.replace("/signin")
                    },
                    style: "destructive"
                }
            ]
        );
    };

    return (
        <ScrollView className="flex-1 bg-gray-50">
            {/* Header Section */}
            <View className="bg-gradient-to-br from-black via-gray-800 to-yellow-400 pt-12 pb-8 rounded-b-3xl">
                <View className="flex-row justify-end px-4 mb-4">
                    <TouchableOpacity 
                        onPress={handleLogout}
                        className="bg-red-500 px-4 py-2 rounded-full"
                    >
                        <Text className="text-white font-semibold">Logout</Text>
                    </TouchableOpacity>
                </View>
                <View className="items-center px-6">
                    {/* Profile Image */}
                    <View className="relative mb-4">
                        <View className="bg-white p-1 rounded-full shadow-lg">
                            <Ionicons
                                name="person-circle"
                                size={100}
                                color="#ffd401"
                            />
                        </View>
                        <TouchableOpacity className="absolute -bottom-1 -right-1 bg-yellow-400 p-2 rounded-full shadow-md">
                            <MaterialCommunityIcons name="camera" size={16} color="#000" />
                        </TouchableOpacity>
                    </View>
                    
                    {/* User Info */}
                    <Text className="text-white text-2xl font-bold mb-1">John Doe</Text>
                    <Text className="text-white/90 text-base mb-4">Senior Software Developer</Text>
                    
                    {/* Badge */}
                    <View className="bg-yellow-400 px-4 py-2 rounded-full">
                        <Text className="text-black font-semibold text-sm">Pro Member</Text>
                    </View>
                </View>
            </View>

            {/* Stats Section */}
            <View className="bg-white mx-5 -mt-6 rounded-2xl shadow-lg p-6">
                <View className="flex-row justify-around">
                    <View className="items-center flex-1">
                        <Text className="text-2xl font-bold text-black mb-1">150</Text>
                        <Text className="text-gray-600 text-sm">Applications</Text>
                    </View>
                    <View className="w-px bg-gray-200 mx-4" />
                    <View className="items-center flex-1">
                        <Text className="text-2xl font-bold text-black mb-1">45</Text>
                        <Text className="text-gray-600 text-sm">Interviews</Text>
                    </View>
                    <View className="w-px bg-gray-200 mx-4" />
                    <View className="items-center flex-1">
                        <Text className="text-2xl font-bold text-black mb-1">12</Text>
                        <Text className="text-gray-600 text-sm">Bookmarks</Text>
                    </View>
                </View>
            </View>

            {/* About Section */}
            <View className="bg-white mx-5 mt-5 rounded-2xl shadow-md p-6">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xl font-bold text-black">About Me</Text>
                    <TouchableOpacity className="bg-black p-2 rounded-lg">
                        <MaterialCommunityIcons name="pencil-outline" size={18} color="#ffd401" />
                    </TouchableOpacity>
                </View>
                <Text className="text-gray-700 text-base leading-6 mb-4">
                    Passionate senior software developer with 5+ years of experience in building scalable mobile and web applications. 
                    Expert in React Native, TypeScript, and Node.js.
                </Text>
                <View className="flex-row flex-wrap gap-2">
                    <View className="bg-yellow-400 px-3 py-1 rounded-full border border-black">
                        <Text className="text-black text-xs font-semibold">React Native</Text>
                    </View>
                    <View className="bg-yellow-400 px-3 py-1 rounded-full border border-black">
                        <Text className="text-black text-xs font-semibold">TypeScript</Text>
                    </View>
                    <View className="bg-yellow-400 px-3 py-1 rounded-full border border-black">
                        <Text className="text-black text-xs font-semibold">Node.js</Text>
                    </View>
                </View>
            </View>

            {/* Contact Section */}
            <View className="bg-white mx-5 mt-5 rounded-2xl shadow-md p-6">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xl font-bold text-black">Contact</Text>
                    <TouchableOpacity className="bg-black p-2 rounded-lg">
                        <MaterialCommunityIcons name="pencil-outline" size={18} color="#ffd401" />
                    </TouchableOpacity>
                </View>
                
                <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
                    <View className="bg-yellow-400 p-3 rounded-xl mr-4">
                        <Ionicons name="mail" size={20} color="#000" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-gray-500 text-xs">Email</Text>
                        <Text className="text-black font-semibold">john.doe@example.com</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#999" />
                </TouchableOpacity>
                
                <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
                    <View className="bg-yellow-400 p-3 rounded-xl mr-4">
                        <Ionicons name="call" size={20} color="#000" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-gray-500 text-xs">Phone</Text>
                        <Text className="text-black font-semibold">+1 234 567 890</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#999" />
                </TouchableOpacity>
                
                <TouchableOpacity className="flex-row items-center py-3">
                    <View className="bg-yellow-400 p-3 rounded-xl mr-4">
                        <Ionicons name="location" size={20} color="#000" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-gray-500 text-xs">Location</Text>
                        <Text className="text-black font-semibold">San Francisco, CA</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#999" />
                </TouchableOpacity>
            </View>

            {/* Actions Section */}
            <View className="mx-5 mt-5 mb-8">
                <View className="flex-row gap-4">
                    <TouchableOpacity className="flex-1 bg-yellow-400 flex-row items-center justify-center py-4 rounded-xl border-2 border-black">
                        <Ionicons name="download" size={18} color="#000" />
                        <Text className="text-black font-bold ml-2">Download CV</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-black flex-row items-center justify-center py-4 rounded-xl">
                        <Ionicons name="share-social" size={18} color="#ffd401" />
                        <Text className="text-yellow-400 font-bold ml-2">Share</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
