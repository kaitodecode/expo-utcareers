import { Text, View, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Image, Animated, Modal, TextInput } from "react-native";
import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/axios";
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
interface Company {
    id: string;
    name: string;
    email: string;
    phone: string;
    website: string;
    logo: string;
    location: string;
    description: string;
}
interface JobPost {
    id: string;
    title: string;
    thumbnail: string;
    status: string;
    companies: Company;
}
interface JobCategory {
    id: string;
    name: string;
}
interface JobPostCategory {
    id: string;
    type: string;
    required_count: number;
    job_categories: JobCategory;
    job_posts: JobPost;
}
interface Application {
    id: string;
    status: string;
    cv: string;
    national_identity_card: string;
    job_post_categories: JobPostCategory;
}
interface ApplicationResponse {
    current_page: number;
    data: Application[];
    total: number;
    last_page: number;
}
export default function Application() {
    const [isLoading, setIsLoading] = useState(false);
    const [applications, setApplications] = useState<Application[]>([]);
    const [allApplications, setAllApplications] = useState<Application[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [searchQuery, setSearchQuery] = useState('');
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [headerHeight, setHeaderHeight] = useState(0);
    const [scrollY, setScrollY] = useState(0);

    const handleScroll = (event: any) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        setScrollY(currentScrollY);
    };
    const getApplicationData = async (page = 1, shouldAppend = false) => {
        try {
            if (page === 1) setIsLoading(true);
            const res = await api.get(`/jobs/history?page=${page}`);
            const responseData = res.data.data;
            setLastPage(responseData.last_page);

            if (shouldAppend) {
                const newApplications = [...applications, ...responseData.data];
                setApplications(newApplications);
                setAllApplications(newApplications);
            } else {
                setApplications(responseData.data);
                setAllApplications(responseData.data);
            }
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }).start();
        } catch (error) {
            console.error("Failed to fetch applications:", error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }
    const loadMore = async () => {
        if (isLoadingMore || currentPage >= lastPage) return;

        setIsLoadingMore(true);
        setCurrentPage(prev => prev + 1);
        await getApplicationData(currentPage + 1, true);
    };
    const onRefresh = async () => {
        setRefreshing(true);
        setCurrentPage(1);
        await getApplicationData(1);
        setRefreshing(false);
    };
    useEffect(() => {
        getApplicationData();
    }, []);
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-amber-400';
            case 'accepted':
                return 'bg-emerald-500';
            case 'rejected':
                return 'bg-rose-500';
            default:
                return 'bg-slate-500';
        }
    };
    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'hourglass-half';
            case 'accepted':
                return 'check-circle';
            case 'rejected':
                return 'times-circle';
            default:
                return 'question-circle';
        }
    };
    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setApplications(allApplications);
        } else {
            const filteredApplications = allApplications.filter(app =>
                app.job_post_categories.job_posts.title.toLowerCase().includes(query.toLowerCase()) ||
                app.job_post_categories.job_posts.companies.name.toLowerCase().includes(query.toLowerCase()) ||
                app.job_post_categories.job_categories.name.toLowerCase().includes(query.toLowerCase()) ||
                app.status.toLowerCase().includes(query.toLowerCase())
            );
            setApplications(filteredApplications);
        }
    };
    const renderHeader = () => (
        <View className="bg-white pt-12 pb-6 px-6 border-b border-gray-100">
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1">
                    <Text className="text-gray-900 text-2xl font-bold tracking-tight">My Applications</Text>
                    <Text className="text-gray-600 text-sm mt-1 font-medium">Track your job applications</Text>
                </View>
                <TouchableOpacity
                    className="bg-yellow-400 p-4 rounded-2xl shadow-lg border-2 border-yellow-500 active:scale-95"
                    onPress={() => setSearchModalVisible(true)}
                >
                    <Ionicons name="search" size={22} color="#000" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <TouchableOpacity
                className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-200"
                onPress={() => setSearchModalVisible(true)}
            >
                <View className="flex-row items-center">
                    <Ionicons name="search-outline" size={20} color="#6b7280" />
                    <Text className="text-gray-500 ml-3 font-medium">
                        {searchQuery || 'Search applications by title, company or status...'}
                    </Text>
                </View>
            </TouchableOpacity>

            {/* Stats Section */}
            <View className="flex-row justify-between mt-4">
                <View className="bg-yellow-50 border border-yellow-200 px-4 py-3 rounded-xl flex-1 mr-2">
                    <Text className="text-yellow-600 text-lg font-bold">{applications.length}</Text>
                    <Text className="text-gray-700 text-xs font-semibold">Total Applications</Text>
                </View>
                <View className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl flex-1 ml-2">
                    <Text className="text-gray-800 text-lg font-bold">
                        {applications.filter(app => app.status.toLowerCase() === 'pending').length}
                    </Text>
                    <Text className="text-gray-700 text-xs font-semibold">Pending</Text>
                </View>
            </View>
            <View className="flex-row justify-between mt-2">
                <View className="bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl flex-1 mr-2">
                    <Text className="text-emerald-600 text-lg font-bold">
                        {applications.filter(app => app.status.toLowerCase() === 'accepted').length}
                    </Text>
                    <Text className="text-gray-700 text-xs font-semibold">Accepted</Text>
                </View>
                <View className="bg-rose-50 border border-rose-200 px-4 py-3 rounded-xl flex-1 ml-2">
                    <Text className="text-rose-600 text-lg font-bold">
                        {applications.filter(app => app.status.toLowerCase() === 'rejected').length}
                    </Text>
                    <Text className="text-gray-700 text-xs font-semibold">Rejected</Text>
                </View>
            </View>
        </View>
    );
    const renderApplicationCard = (item: Application) => (
        <View className="bg-white rounded-2xl shadow-md p-6 mb-4 mx-2 border border-gray-100">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-black">Application Details</Text>
                <View className={`flex-row items-center px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
                    <FontAwesome5
                        name={getStatusIcon(item.status)}
                        size={12}
                        color={item.status.toLowerCase() === 'pending' ? '#000' : '#fff'}
                    />
                    <Text className={`ml-1 font-bold text-xs ${item.status.toLowerCase() === 'pending' ? 'text-black' : 'text-white'}`}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>
            <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
                <View className="bg-yellow-400 p-3 rounded-xl mr-4">
                    <MaterialCommunityIcons name="briefcase-outline" size={20} color="#000" />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-500 text-xs">Job Title</Text>
                    <Text className="text-black font-semibold">{item.job_post_categories.job_posts.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
                <View className="bg-yellow-400 p-3 rounded-xl mr-4">
                    <Ionicons name="business-outline" size={20} color="#000" />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-500 text-xs">Company</Text>
                    <Text className="text-black font-semibold">{item.job_post_categories.job_posts.companies.name}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
                <View className="bg-yellow-400 p-3 rounded-xl mr-4">
                    <MaterialCommunityIcons name="tag-outline" size={20} color="#000" />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-500 text-xs">Category</Text>
                    <Text className="text-black font-semibold">{item.job_post_categories.job_categories.name}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center py-3">
                <View className="bg-yellow-400 p-3 rounded-xl mr-4">
                    <MaterialCommunityIcons name="clock-outline" size={20} color="#000" />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-500 text-xs">Employment Type</Text>
                    <Text className="text-black font-semibold">{item.job_post_categories.type}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>
        </View>
    );

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#ffd401" />
                <Text className="mt-3 text-base text-gray-600 font-medium animate-pulse">Loading your applications...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1">
            {renderHeader()}
            <ScrollView 
                className="flex-1 px-4 -mt-4"
                onScroll={handleScroll}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#ffd401"
                    />
                }
                showsVerticalScrollIndicator={false}
            >

                {applications.length === 0 && !isLoading ? (
                    <View className="bg-white rounded-xl p-8 mx-2 mt-4 items-center border border-gray-100">
                        <Ionicons name="document-text-outline" size={64} color="#9ca3af" />
                        <Text className="text-gray-600 text-lg font-bold mt-4">No Applications Yet</Text>
                        <Text className="text-gray-500 text-sm text-center mt-2 font-medium">You haven't applied to any jobs yet</Text>
                    </View>
                ) : (
                    <View className="mt-4 pb-6">
                        {applications.map((item, index) => (
                            <Animated.View key={item.id} style={{ opacity: fadeAnim }}>
                                {renderApplicationCard(item)}
                            </Animated.View>
                        ))}

                        {/* Loading More */}
                        {isLoadingMore && (
                            <View className="py-6 items-center">
                                <ActivityIndicator size="large" color="#ffd401" />
                                <Text className="text-gray-500 text-sm mt-2 font-medium">Loading more applications...</Text>
                            </View>
                        )}

                        {/* Load More Button */}
                        {currentPage < lastPage && !isLoadingMore && (
                            <TouchableOpacity
                                onPress={loadMore}
                                className="bg-yellow-400 py-3 rounded-xl mt-5 mx-2 border-2 border-yellow-500 active:scale-95"
                            >
                                <Text className="text-center text-black font-bold">Load More Applications</Text>
                            </TouchableOpacity>
                        )}

                        {/* End of List */}
                        {currentPage >= lastPage && applications.length > 0 && (
                            <View className="py-6 items-center">
                                <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                                <Text className="text-gray-600 text-sm mt-2 font-bold">You've reached the end!</Text>
                                <Text className="text-gray-500 text-xs mt-1 font-medium">No more applications to load</Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Search Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={searchModalVisible}
                onRequestClose={() => setSearchModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-gray-900 text-xl font-bold">Search Applications</Text>
                            <TouchableOpacity
                                onPress={() => setSearchModalVisible(false)}
                                className="bg-gray-100 p-2 rounded-full"
                            >
                                <Ionicons name="close" size={20} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <View className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-200">
                            <View className="flex-row items-center">
                                <Ionicons name="search-outline" size={20} color="#6b7280" />
                                <TextInput
                                    className="flex-1 ml-3 text-gray-700 font-medium"
                                    placeholder="Search applications, companies, or status..."
                                    value={searchQuery}
                                    onChangeText={handleSearch}
                                    autoFocus
                                />
                                {searchQuery ? (
                                    <TouchableOpacity onPress={() => handleSearch('')}>
                                        <Ionicons name="close-circle" size={20} color="#6b7280" />
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                        </View>

                        <View className="flex-row mb-4">
                            <TouchableOpacity
                                className="bg-yellow-50 border border-yellow-200 rounded-xl py-2 px-4 mr-2"
                                onPress={() => handleSearch('pending')}
                            >
                                <Text className="text-yellow-700 font-medium">Pending</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="bg-green-50 border border-green-200 rounded-xl py-2 px-4 mr-2"
                                onPress={() => handleSearch('accepted')}
                            >
                                <Text className="text-green-700 font-medium">Accepted</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="bg-red-50 border border-red-200 rounded-xl py-2 px-4"
                                onPress={() => handleSearch('rejected')}
                            >
                                <Text className="text-red-700 font-medium">Rejected</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            className="bg-yellow-400 py-3 rounded-xl border-2 border-yellow-500 active:scale-95"
                            onPress={() => setSearchModalVisible(false)}
                        >
                            <Text className="text-center text-black font-bold">Apply Filter</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
