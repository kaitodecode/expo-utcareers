import { Text, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, Modal, TextInput, Image } from "react-native";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from "@/stores/auth";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { api } from "@/lib/axios";

interface Profile {
    id: string;
    photo: string | null;
    name: string;
    email: string;
    phone: string;
    address: string | null;
    description: string | null;
    role: string;
    applicants: number;
}
interface UpdateProfile {
    photo: string | null;
    name: string | null;
    address: string | null;
    description: string | null;
}

export default function Profile() {
    const { logout } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [updateProfile, setUpdateProfile] = useState<UpdateProfile>({
        photo: null,
        name: null,
        address: null,
        description: null,
    });

    const [refreshing, setRefreshing] = useState(false);
    const [modalEdit, setModalEdit] = useState(false);



    const getProfileData = async () => {
        try {
            setIsLoading(true);
            const res = await api.get("/auth/profile");
            setProfile({
                id: res.data.data.id,
                photo: res.data.data.photo,
                name: res.data.data.name,
                email: res.data.data.email,
                phone: res.data.data.phone,
                address: res.data.data.address,
                description: res.data.data.description,
                role: res.data.data.role,
                applicants: res.data.data._count.applicants,
            });

            console.log(res.data.data);

            setUpdateProfile({
                photo: res.data.data.photo,
                name: res.data.data.name,
                address: res.data.data.address,
                description: res.data.data.description,
            })

        } catch (error) {
            console.error("Failed to fetch profile:", error);
            Alert.alert("Error", "Failed to load profile. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await getProfileData();
        setRefreshing(false);
    };

    useEffect(() => {
        getProfileData();
    }, []);

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
                    onPress: async () => {
                        await logout()
                        router.replace("/signin")
                    },
                    style: "destructive"
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#ffd401" />
                <Text className="mt-3 text-base text-gray-600 font-medium">Loading profile...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-gray-50"
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor="#ffd401"
                />
            }
        >
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
                            {profile?.photo ? (
                                <Image
                                    source={{ uri: profile.photo }}
                                    className="w-[100px] h-[100px] rounded-full"
                                />
                            ) : (
                                <Ionicons
                                    name="person-circle"
                                    size={100}
                                    color="#ffd401"
                                />
                            )}
                        </View>
                        <TouchableOpacity
                            onPress={() => setModalEdit(true)}
                            className="absolute -bottom-1 -right-1 bg-yellow-400 p-2 rounded-full shadow-md">
                            <MaterialCommunityIcons name="camera" size={16} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {/* User Info */}
                    <Text className="text-black text-2xl font-bold mb-1">{profile?.name || "Loading..."}</Text>
                    <Text className="text-black/90 mb-4 capitalize">{profile?.role || "Loading..."}</Text>
                </View>
            </View>

            {/* Stats Section */}
            <View className="bg-white mx-5 -mt-6 rounded-2xl shadow-lg p-6">
                <View className="flex-row justify-around">
                    <View className="items-center flex-1">
                        <Text className="text-2xl font-bold text-black mb-1">{profile?.applicants || 0}</Text>
                        <Text className="text-gray-600 text-sm">Applications</Text>
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
                    {profile?.description || "No description available"}
                </Text>
            </View>

            {/* Contact Section */}
            <View className="bg-white mx-5 mt-5 rounded-2xl shadow-md p-6 mb-10">
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
                        <Text className="text-black font-semibold">{profile?.email || "Loading..."}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
                    <View className="bg-yellow-400 p-3 rounded-xl mr-4">
                        <Ionicons name="call" size={20} color="#000" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-gray-500 text-xs">Phone</Text>
                        <Text className="text-black font-semibold">{profile?.phone || "Loading..."}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center py-3">
                    <View className="bg-yellow-400 p-3 rounded-xl mr-4">
                        <Ionicons name="location" size={20} color="#000" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-gray-500 text-xs">Address</Text>
                        <Text className="text-black font-semibold">{profile?.address || "No address provided"}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#999" />
                </TouchableOpacity>
            </View>

            {/* Actions Section */}
            {/* <View className="mx-5 mt-5 mb-8">
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
            </View> */}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalEdit}
                onRequestClose={() => setModalEdit(false)}
            >
                <TouchableOpacity
                    onPress={() => setModalEdit(false)}
                    className="bg-black/50 h-full w-full absolute top-0 left-0"
                >
                </TouchableOpacity>


                <View className="bg-white h-[80vh] w-full absolute bottom-0 rounded-t-2xl">
                    <View className="flex flex-row justify-between border-b-2 p-2 items-center">
                        <Text>Testing</Text>
                        <TouchableOpacity
                            onPress={() => setModalEdit(false)}
                            className=" bg-white p-2 rounded-full shadow-lg z-50"
                        >
                            <Ionicons name="close" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <View className="p-4">
                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-1">Name</Text>
                            <TextInput
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                placeholder="Enter your name"
                                value={updateProfile?.name || ''}
                                onChangeText={(text) => setUpdateProfile(prev => ({ ...prev, name: text }))}
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-1">Address</Text>
                            <TextInput
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                placeholder="Enter your address"
                                value={updateProfile?.address || ''}
                                onChangeText={(text) => setUpdateProfile(prev => ({ ...prev, address: text }))}
                                multiline
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-1">Description</Text>
                            <TextInput
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                                placeholder="Tell us about yourself"
                                value={updateProfile?.description || ''}
                                onChangeText={(text) => setUpdateProfile(prev => ({ ...prev, description: text }))}
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-sm font-medium text-gray-700 mb-1">Profile Photo</Text>
                            <TouchableOpacity
                                className={`w-full border-2 border-dashed ${updateProfile.photo ? 'border-green-500 bg-green-50' : 'border-gray-300'} rounded-lg p-4 items-center`}
                                onPress={async () => {
                                    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

                                    if (permissionResult.granted === false) {
                                        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
                                        return;
                                    }

                                    const result = await ImagePicker.launchImageLibraryAsync({
                                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                        allowsEditing: true,
                                        aspect: [1, 1],
                                        quality: 0.8,
                                    });

                                    if (!result.canceled && result.assets[0]) {
                                        setUpdateProfile(prev => ({ ...prev, photo: result.assets[0].uri }));
                                    }
                                }}
                            >
                                {updateProfile.photo ? (
                                    <View className="w-full items-center">
                                        <Image
                                            source={{ uri: updateProfile.photo }}
                                            className="w-32 h-32 rounded-full mb-2"
                                        />
                                        <Ionicons
                                            name="checkmark-circle-outline"
                                            size={24}
                                            color="green"
                                        />
                                        <Text className="text-sm text-green-600 mt-2">
                                            Photo selected
                                        </Text>
                                    </View>
                                ) : (
                                    <View className="items-center">
                                        <Ionicons
                                            name="cloud-upload-outline"
                                            size={24}
                                            color="gray"
                                        />
                                        <Text className="text-sm text-gray-500 mt-2">
                                            Upload photo
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            className="bg-yellow-400 py-3 rounded-lg items-center mt-4"
                            onPress={async () => {
                                try {
                                    // Validate required fields
                                    if (!updateProfile.name) {
                                        Alert.alert("Error", "Name is required");
                                        return;
                                    }

                                    setIsLoading(true);

                                    // Create form data for profile update
                                    const formData = new FormData();

                                    // Add text fields
                                    formData.append('name', updateProfile.name);
                                    formData.append('address', updateProfile.address || '');
                                    formData.append('description', updateProfile.description || '');

                                    // Add photo if exists
                                    if (updateProfile.photo) {
                                        formData.append('photo', {
                                            uri: updateProfile.photo,
                                            type: 'image/jpeg',
                                            name: 'profile.jpg'
                                        } as any);
                                    }

                                    // Make API request with proper headers
                                    const response = await api.put(
                                        "/auth/profile",
                                        formData,
                                        {
                                            headers: {
                                                'Accept': 'application/json',
                                                'Content-Type': 'multipart/form-data',
                                            },
                                        }
                                    );

                                    // Refresh profile data
                                    await getProfileData();

                                    // Handle success
                                    Alert.alert("Success", "Profile updated successfully");
                                    setModalEdit(false);

                                } catch (error: any) {
                                    // Handle errors
                                    console.error("Profile update error:", error);

                                    const errorMessage = error.response?.data?.message
                                        || error.response?.data?.photo?.[0]
                                        || error.response?.data?.name?.[0]
                                        || (error.response?.status === 413 ? "Image file is too large"
                                            : error.response?.status === 422 ? "Invalid input data"
                                                : error.message)
                                        || "Failed to update profile. Please try again later.";

                                    Alert.alert("Error", errorMessage);
                                } finally {
                                    setIsLoading(false);
                                }
                            }}
                        >
                            <Text className="font-semibold text-black">
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </Modal>


        </ScrollView>
    );
}
