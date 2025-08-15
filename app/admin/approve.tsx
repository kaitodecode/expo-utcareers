import { Text, View, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Image, Modal, TextInput, Alert } from "react-native";
import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/axios";
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "@/stores/auth";
import { router } from "expo-router";

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    photo: string | null;
}

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
    company_id: string;
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
    job_category_id: string;
    job_post_id: string;
    type: string;
    required_count: number;
    description: string | null;
    requirements: string | null;
    benefits: string | null;
    job_categories: JobCategory;
    job_posts: JobPost;
}

interface Applicant {
    id: string;
    user_id: string;
    job_post_category_id: string;
    status: string;
    cv: string;
    national_identity_card: string;
    created_at: string;
    updated_at: string;
    users: User;
    job_post_categories: JobPostCategory;
}

interface ApplicantResponse {
    current_page: number;
    data: Applicant[];
    total: number;
    last_page: number;
}

export default function Approve() {
    const { isAuthenticated, token, logout } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [allApplicants, setAllApplicants] = useState<Applicant[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [companies, setCompanies] = useState<Company[]>([]);

    const getApplicantData = async (page = 1, shouldAppend = false) => {
        try {
            // Check authentication before making API call
            if (!isAuthenticated || !token) {
                console.log('User not authenticated, redirecting to signin');
                await logout();
                router.replace('/signin');
                return;
            }

            if (page === 1) setIsLoading(true);
            let url = `/jobs/history/applicants?page=${page}`;
            
            // Add filters if selected
            const params = new URLSearchParams();
            if (selectedCompany) params.append('company_id', selectedCompany);
            if (selectedStatus) params.append('status', selectedStatus);
            
            if (params.toString()) {
                url += `&${params.toString()}`;
            }
            
            const res = await api.get(url);
            const responseData = res.data.data;
            setLastPage(responseData.last_page);

            if (shouldAppend) {
                const newApplicants = [...applicants, ...responseData.data];
                setApplicants(newApplicants);
                setAllApplicants(newApplicants);
            } else {
                setApplicants(responseData.data);
                setAllApplicants(responseData.data);
            }
        } catch (error: any) {
            console.error("Failed to fetch applicants:", error);
            
            // Handle 401 Unauthorized errors
            if (error.response?.status === 401) {
                Alert.alert(
                    'Session Expired',
                    'Your session has expired. Please sign in again.',
                    [
                        {
                            text: 'OK',
                            onPress: async () => {
                                await logout();
                                router.replace('/signin');
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Error', 'Failed to fetch applicants. Please try again.');
            }
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    const getCompanies = async () => {
        try {
            // Check authentication before making API call
            if (!isAuthenticated || !token) {
                console.log('User not authenticated, redirecting to signin');
                await logout();
                router.replace('/signin');
                return;
            }

            const res = await api.get('/jobs/companies');
            setCompanies(res.data.data || []);
        } catch (error: any) {
            console.error("Failed to fetch companies:", error);
            
            // Handle 401 Unauthorized errors
            if (error.response?.status === 401) {
                Alert.alert(
                    'Session Expired',
                    'Your session has expired. Please sign in again.',
                    [
                        {
                            text: 'OK',
                            onPress: async () => {
                                await logout();
                                router.replace('/signin');
                            }
                        }
                    ]
                );
            }
        }
    };

    const loadMore = async () => {
        if (isLoadingMore || currentPage >= lastPage) return;

        setIsLoadingMore(true);
        setCurrentPage(prev => prev + 1);
        await getApplicantData(currentPage + 1, true);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        setCurrentPage(1);
        await getApplicantData(1);
        setRefreshing(false);
    };

const handleStatusUpdate = async (applicantId: string, newStatus: string) => {
    try {
        // Check authentication before making API call
        if (!isAuthenticated || !token) {
            console.log('User not authenticated, redirecting to signin');
            await logout();
            router.replace('/signin');
            return;
        }

        const response = await api.post(`/jobs/${applicantId}/approval`, {
            status: newStatus
        });
        
        console.log('Status update response:', response.data);
        
        // Update local state
        const updatedApplicants = applicants.map(app => 
            app.id === applicantId ? { ...app, status: newStatus } : app
        );
        setApplicants(updatedApplicants);
        setAllApplicants(updatedApplicants);
        
        Alert.alert('Success', `Application ${newStatus} successfully`);
    } catch (error: any) {
        console.error('Status update error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        
        // Handle 401 Unauthorized errors
        if (error.response?.status === 401) {
            Alert.alert(
                'Session Expired',
                'Your session has expired. Please sign in again.',
                [
                    {
                        text: 'OK',
                        onPress: async () => {
                            await logout();
                            router.replace('/signin');
                        }
                    }
                ]
            );
        } else {
            const errorMessage = error.response?.data?.message || 'Failed to update application status';
            Alert.alert('Error', errorMessage);
        }
    }
};

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setApplicants(allApplicants);
        } else {
            const filteredApplicants = allApplicants.filter(app =>
                app.users.name.toLowerCase().includes(query.toLowerCase()) ||
                app.users.email.toLowerCase().includes(query.toLowerCase()) ||
                app.job_post_categories.job_posts.title.toLowerCase().includes(query.toLowerCase()) ||
                app.job_post_categories.job_posts.companies.name.toLowerCase().includes(query.toLowerCase()) ||
                app.job_post_categories.job_categories.name.toLowerCase().includes(query.toLowerCase()) ||
                app.status.toLowerCase().includes(query.toLowerCase())
            );
            setApplicants(filteredApplicants);
        }
    };

    const applyFilters = () => {
        setCurrentPage(1);
        getApplicantData(1);
        setFilterModalVisible(false);
    };

    const clearFilters = () => {
        setSelectedCompany('');
        setSelectedStatus('');
        setCurrentPage(1);
        getApplicantData(1);
        setFilterModalVisible(false);
    };

    useEffect(() => {
        // Only load data if user is authenticated
        if (isAuthenticated && token) {
            getApplicantData();
            getCompanies();
        }
    }, [isAuthenticated, token]);

    // Add effect to handle filter changes
    useEffect(() => {
        if (isAuthenticated && token) {
            setCurrentPage(1);
            getApplicantData(1);
        }
    }, [selectedCompany, selectedStatus]);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-amber-400';
            case 'selection':
                return 'bg-blue-500';
            case 'interview':
                return 'bg-purple-500';
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
            case 'selection':
                return 'user-check';
            case 'interview':
                return 'comments';
            case 'accepted':
                return 'check-circle';
            case 'rejected':
                return 'times-circle';
            default:
                return 'question-circle';
        }
    };

    const renderHeader = () => (
        <View className="bg-white pt-12 pb-6 px-6 border-b border-gray-100">
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-1">
                    <Text className="text-gray-900 text-2xl font-bold tracking-tight">Job Applicants</Text>
                    <Text className="text-gray-600 text-sm mt-1 font-medium">Manage and review applications</Text>
                </View>
                <View className="flex-row">
                    <TouchableOpacity
                        className="bg-blue-500 p-4 rounded-2xl shadow-lg border-2 border-blue-600 active:scale-95 mr-2"
                        onPress={() => setFilterModalVisible(true)}
                    >
                        <Ionicons name="filter" size={22} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="bg-yellow-400 p-4 rounded-2xl shadow-lg border-2 border-yellow-500 active:scale-95"
                        onPress={() => setSearchModalVisible(true)}
                    >
                        <Ionicons name="search" size={22} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Bar */}
            <TouchableOpacity
                className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-200"
                onPress={() => setSearchModalVisible(true)}
            >
                <View className="flex-row items-center">
                    <Ionicons name="search-outline" size={20} color="#6b7280" />
                    <Text className="text-gray-500 ml-3 font-medium">
                        {searchQuery || 'Search applicants by name, email, job title...'}
                    </Text>
                </View>
            </TouchableOpacity>

            {/* Stats Section */}
            <View className="flex-row justify-between mt-4">
                <View className="bg-yellow-50 border border-yellow-200 px-4 py-3 rounded-xl flex-1 mr-2">
                    <Text className="text-yellow-600 text-lg font-bold">{applicants.length}</Text>
                    <Text className="text-gray-700 text-xs font-semibold">Total</Text>
                </View>
                <View className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-xl flex-1 ml-2">
                    <Text className="text-blue-600 text-lg font-bold">
                        {applicants.filter(app => app.status.toLowerCase() === 'selection').length}
                    </Text>
                    <Text className="text-gray-700 text-xs font-semibold">Selection</Text>
                </View>
            </View>
            <View className="flex-row justify-between mt-2">
                <View className="bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl flex-1 mr-2">
                    <Text className="text-emerald-600 text-lg font-bold">
                        {applicants.filter(app => app.status.toLowerCase() === 'accepted').length}
                    </Text>
                    <Text className="text-gray-700 text-xs font-semibold">Accepted</Text>
                </View>
                <View className="bg-rose-50 border border-rose-200 px-4 py-3 rounded-xl flex-1 ml-2">
                    <Text className="text-rose-600 text-lg font-bold">
                        {applicants.filter(app => app.status.toLowerCase() === 'rejected').length}
                    </Text>
                    <Text className="text-gray-700 text-xs font-semibold">Rejected</Text>
                </View>
            </View>
        </View>
    );

    const renderApplicantCard = (item: Applicant) => (
        <View className="bg-white rounded-2xl shadow-md p-6 mb-4 mx-2 border border-gray-100">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-black">Application Review</Text>
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

            {/* Applicant Info */}
            <View className="flex-row items-center py-3 border-b border-gray-100">
                <View className="bg-yellow-400 p-3 rounded-xl mr-4">
                    <MaterialCommunityIcons name="account-outline" size={20} color="#000" />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-500 text-xs">Applicant</Text>
                    <Text className="text-black font-semibold">{item.users.name}</Text>
                    <Text className="text-gray-400 text-xs">{item.users.email}</Text>
                </View>
            </View>

            {/* Job Info */}
            <View className="flex-row items-center py-3 border-b border-gray-100">
                <View className="bg-yellow-400 p-3 rounded-xl mr-4">
                    <MaterialCommunityIcons name="briefcase-outline" size={20} color="#000" />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-500 text-xs">Job Position</Text>
                    <Text className="text-black font-semibold">{item.job_post_categories.job_posts.title}</Text>
                    <Text className="text-gray-400 text-xs">{item.job_post_categories.job_categories.name}</Text>
                </View>
            </View>

            {/* Company Info */}
            <View className="flex-row items-center py-3 border-b border-gray-100">
                <View className="bg-yellow-400 p-3 rounded-xl mr-4">
                    <Ionicons name="business-outline" size={20} color="#000" />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-500 text-xs">Company</Text>
                    <Text className="text-black font-semibold">{item.job_post_categories.job_posts.companies.name}</Text>
                    <Text className="text-gray-400 text-xs">{item.job_post_categories.job_posts.companies.location}</Text>
                </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row justify-between mt-4">
                <TouchableOpacity
                    className="bg-emerald-500 px-4 py-2 rounded-xl flex-1 mr-2 border-2 border-emerald-600 active:scale-95"
                    onPress={() => handleStatusUpdate(item.id, 'accepted')}
                >
                    <Text className="text-white font-bold text-center">Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="bg-rose-500 px-4 py-2 rounded-xl flex-1 ml-2 border-2 border-rose-600 active:scale-95"
                    onPress={() => handleStatusUpdate(item.id, 'rejected')}
                >
                    <Text className="text-white font-bold text-center">Reject</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#ffd401" />
                <Text className="mt-3 text-base text-gray-600 font-medium animate-pulse">Loading applicants...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1">
            {renderHeader()}
            <ScrollView 
                className="flex-1 px-4 -mt-4"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#ffd401"
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {applicants.length === 0 && !isLoading ? (
                    <View className="bg-white rounded-xl p-8 mx-2 mt-4 items-center border border-gray-100">
                        <Ionicons name="people-outline" size={64} color="#9ca3af" />
                        <Text className="text-gray-600 text-lg font-bold mt-4">No Applicants Found</Text>
                        <Text className="text-gray-500 text-sm text-center mt-2 font-medium">No applications match your current filters</Text>
                    </View>
                ) : (
                    <View className="mt-4 pb-6">
                        {applicants.map((item) => (
                            <View key={item.id}>
                                {renderApplicantCard(item)}
                            </View>
                        ))}

                        {/* Loading More */}
                        {isLoadingMore && (
                            <View className="py-6 items-center">
                                <ActivityIndicator size="large" color="#ffd401" />
                                <Text className="text-gray-500 text-sm mt-2 font-medium">Loading more applicants...</Text>
                            </View>
                        )}

                        {/* Load More Button */}
                        {currentPage < lastPage && !isLoadingMore && (
                            <TouchableOpacity
                                onPress={loadMore}
                                className="bg-yellow-400 py-3 rounded-xl mt-5 mx-2 border-2 border-yellow-500 active:scale-95"
                            >
                                <Text className="text-center text-black font-bold">Load More Applicants</Text>
                            </TouchableOpacity>
                        )}

                        {/* End of List */}
                        {currentPage >= lastPage && applicants.length > 0 && (
                            <View className="py-6 items-center">
                                <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                                <Text className="text-gray-600 text-sm mt-2 font-bold">You've reached the end!</Text>
                                <Text className="text-gray-500 text-xs mt-1 font-medium">No more applicants to load</Text>
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
                            <Text className="text-gray-900 text-xl font-bold">Search Applicants</Text>
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
                                    placeholder="Search by name, email, job title, company..."
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

                        <TouchableOpacity
                            className="bg-yellow-400 py-3 rounded-xl border-2 border-yellow-500 active:scale-95"
                            onPress={() => setSearchModalVisible(false)}
                        >
                            <Text className="text-center text-black font-bold">Apply Search</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Filter Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={filterModalVisible}
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-gray-900 text-xl font-bold">Filter Applicants</Text>
                            <TouchableOpacity
                                onPress={() => setFilterModalVisible(false)}
                                className="bg-gray-100 p-2 rounded-full"
                            >
                                <Ionicons name="close" size={20} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Company Filter */}
                        <View className="mb-4">
                            <Text className="text-gray-700 font-bold mb-2">Filter by Company</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                                <TouchableOpacity
                                    className={`px-4 py-2 rounded-xl mr-2 border-2 ${
                                        selectedCompany === '' ? 'bg-yellow-400 border-yellow-500' : 'bg-gray-100 border-gray-200'
                                    }`}
                                    onPress={() => setSelectedCompany('')}
                                >
                                    <Text className={`font-medium ${
                                        selectedCompany === '' ? 'text-black' : 'text-gray-600'
                                    }`}>All Companies</Text>
                                </TouchableOpacity>
                                {companies.map((company) => (
                                    <TouchableOpacity
                                        key={company.id}
                                        className={`px-4 py-2 rounded-xl mr-2 border-2 ${
                                            selectedCompany === company.id ? 'bg-yellow-400 border-yellow-500' : 'bg-gray-100 border-gray-200'
                                        }`}
                                        onPress={() => setSelectedCompany(company.id)}
                                    >
                                        <Text className={`font-medium ${
                                            selectedCompany === company.id ? 'text-black' : 'text-gray-600'
                                        }`} numberOfLines={1}>{company.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Status Filter */}
                        <View className="mb-6">
                            <Text className="text-gray-700 font-bold mb-2">Filter by Status</Text>
                            <View className="flex-row flex-wrap">
                                {['', 'pending', 'selection', 'interview', 'accepted', 'rejected'].map((status) => (
                                    <TouchableOpacity
                                        key={status}
                                        className={`px-4 py-2 rounded-xl mr-2 mb-2 border-2 ${
                                            selectedStatus === status ? 'bg-yellow-400 border-yellow-500' : 'bg-gray-100 border-gray-200'
                                        }`}
                                        onPress={() => setSelectedStatus(status)}
                                    >
                                        <Text className={`font-medium ${
                                            selectedStatus === status ? 'text-black' : 'text-gray-600'
                                        }`}>{status === '' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View className="flex-row">
                            <TouchableOpacity
                                className="bg-gray-500 py-3 rounded-xl flex-1 mr-2 border-2 border-gray-600 active:scale-95"
                                onPress={clearFilters}
                            >
                                <Text className="text-center text-white font-bold">Clear Filters</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="bg-yellow-400 py-3 rounded-xl flex-1 ml-2 border-2 border-yellow-500 active:scale-95"
                                onPress={applyFilters}
                            >
                                <Text className="text-center text-black font-bold">Apply Filters</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}