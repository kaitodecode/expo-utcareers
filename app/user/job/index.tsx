import { api } from "@/lib/axios";
import { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, View, TouchableOpacity, Image, Modal, Pressable, TextInput, Alert } from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface JobCategory {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
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
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    job_categories: JobCategory;
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
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

interface Job {
    id: string;
    title: string;
    thumbnail: string;
    company_id: string;
    status: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    companies: Company;
    job_post_categories: JobPostCategory[];
}

export default function JobRoute() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [allJobs, setAllJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [applyModalVisible, setApplyModalVisible] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState<JobPostCategory | null>(null);
    const [cvFile, setCvFile] = useState<any>(null);
    const [ktpImage, setKtpImage] = useState<any>(null);

    const fetchJobs = async (pageNum: number) => {
        try {
            const response = await api.get(`/jobs?page=${pageNum}&per_page=10`);
            const data = response.data;

            if (pageNum === 1) {
                setJobs(data.data.data);
                setAllJobs(data.data.data);
            } else {
                const newJobs = [...jobs, ...data.data.data];
                setJobs(newJobs);
                setAllJobs(newJobs);
            }

            setHasMore(data.data.meta.current_page < data.data.meta.last_page);
        } catch (error) {
            setError(error as Error);
        }
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setJobs(allJobs);
        } else {
            const filteredJobs = allJobs.filter(job =>
                job.title.toLowerCase().includes(query.toLowerCase()) ||
                job.companies?.name.toLowerCase().includes(query.toLowerCase()) ||
                job.companies?.location.toLowerCase().includes(query.toLowerCase()) ||
                job.job_post_categories.some(cat =>
                    cat.job_categories.name.toLowerCase().includes(query.toLowerCase())
                )
            );
            setJobs(filteredJobs);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        setPage(1);
        await fetchJobs(1);
        setRefreshing(false);
    };

    const loadMore = async () => {
        if (!hasMore || loading) return;

        setLoading(true);
        const nextPage = page + 1;
        setPage(nextPage);
        await fetchJobs(nextPage);
        setLoading(false);
    };

    const handleScroll = (event: any) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const isEndReached = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

        if (isEndReached && hasMore && !loading) {
            loadMore();
        }
    };

    useEffect(() => {
        fetchJobs(1);
        setLoading(false);
        setError(null);
    }, []);

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-6 px-6 border-b border-gray-100">
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-1">
                        <Text className="text-gray-900 text-2xl font-bold tracking-tight">Job Opportunities</Text>
                        <Text className="text-gray-600 text-sm mt-1 font-medium">Find your dream career</Text>
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
                            {searchQuery || 'Search jobs, companies, or skills...'}
                        </Text>
                    </View>
                </TouchableOpacity>
                
                {/* Stats */}
                <View className="flex-row justify-between mt-2">
                    <View className="bg-yellow-50 border border-yellow-200 px-4 py-3 rounded-xl flex-1 mr-2">
                        <Text className="text-yellow-600 text-lg font-bold">{jobs.length}</Text>
                        <Text className="text-gray-700 text-xs font-semibold">Available Jobs</Text>
                    </View>
                    <View className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl flex-1 ml-2">
                        <Text className="text-gray-800 text-lg font-bold">50+</Text>
                        <Text className="text-gray-700 text-xs font-semibold">Companies</Text>
                    </View>
                </View>
            </View>

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
                {error ? (
                    <View className="bg-red-50 border border-red-200 rounded-xl p-6 mx-2 mt-4">
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="alert-circle" size={24} color="#ef4444" />
                            <Text className="text-red-600 font-bold ml-2">Error Occurred</Text>
                        </View>
                        <Text className="text-red-600 text-sm font-medium">{error.message}</Text>
                        <TouchableOpacity 
                            className="bg-red-500 py-2.5 px-4 rounded-xl mt-3 self-start border-2 border-red-600 active:scale-95"
                            onPress={() => onRefresh()}
                        >
                            <Text className="text-white font-bold text-sm">Try Again</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {jobs.length === 0 && !loading ? (
                            <View className="bg-white rounded-xl p-8 mx-2 mt-4 items-center border border-gray-100">
                                <Ionicons name="briefcase-outline" size={64} color="#9ca3af" />
                                <Text className="text-gray-600 text-lg font-bold mt-4">No Jobs Available</Text>
                                <Text className="text-gray-500 text-sm text-center mt-2 font-medium">Check back later for new opportunities</Text>
                            </View>
                        ) : (
                            <View className="mt-4 pb-6">
                                {jobs.map((job, index) => (
                                    <TouchableOpacity 
                                        key={job.id}
                                        className="bg-white rounded-2xl shadow-md mb-4 mx-2 overflow-hidden border border-gray-100"
                                        activeOpacity={0.7}
                                    >
                                        {/* Job Card Header */}
                                        <View className="p-5">
                                            <View className="flex-row items-start justify-between mb-4">
                                                <View className="flex-row items-center flex-1">
                                                    <View className="bg-gray-100 p-3 rounded-xl mr-4">
                                                        {job.companies?.logo ? (
                                                            <Image 
                                                                source={{ uri: job.companies.logo }} 
                                                                className="w-8 h-8 rounded-lg"
                                                                resizeMode="contain"
                                                            />
                                                        ) : (
                                                            <Ionicons name="business" size={32} color="#6b7280" />
                                                        )}
                                                    </View>
                                                    <View className="flex-1">
                                                        <Text className="text-gray-900 text-lg font-bold mb-1 tracking-tight" numberOfLines={2}>
                                                            {job.title}
                                                        </Text>
                                                        <Text className="text-gray-600 text-sm font-semibold">
                                                            {job.companies?.name || 'Company Name'}
                                                        </Text>
                                                        <View className="flex-row items-center mt-1">
                                                            <Ionicons name="location-outline" size={16} color="#6b7280" />
                                                            <Text className="text-gray-500 text-sm ml-1" numberOfLines={1}>
                                                                {job.companies?.location}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                                <TouchableOpacity className="bg-gray-50 p-2 rounded-lg">
                                                    <Ionicons name="bookmark-outline" size={20} color="#6b7280" />
                                                </TouchableOpacity>
                                            </View>

                                            {/* Job Status Badge */}
                                            <View className="flex-row items-center justify-between mb-4">
                                                <View className={`px-3 py-1 rounded-full border ${
                                                    job.status === 'active' ? 'bg-green-50 border-green-200' : 
                                                    job.status === 'closed' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                                                }`}>
                                                    <Text className={`text-xs font-bold ${
                                                        job.status === 'active' ? 'text-green-700' : 
                                                        job.status === 'closed' ? 'text-red-700' : 'text-yellow-700'
                                                    }`}>
                                                        {job.status === 'active' ? '🟢 Active' : 
                                                         job.status === 'closed' ? '🔴 Closed' : '🟡 Pending'}
                                                    </Text>
                                                </View>
                                                <Text className="text-gray-500 text-xs font-semibold">#{String(index + 1).padStart(3, '0')}</Text>
                                            </View>

                                            {/* Job Categories */}
                                            <View className="mb-3">
                                                <Text className="text-gray-700 text-xs font-semibold mb-2">Job Categories:</Text>
                                                <View className="flex-row flex-wrap">
                                                    {job.job_post_categories.map((category, idx) => (
                                                        <View key={category.id} className="bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg mr-2 mb-1">
                                                            <Text className="text-blue-700 text-xs font-medium">{category.job_categories.name}</Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            </View>

                                            {/* Job Details */}
                                            <View className="flex-row items-center justify-between">
                                                <View className="flex-row items-center">
                                                    <Ionicons name="time-outline" size={16} color="#6b7280" />
                                                    <Text className="text-gray-500 text-xs ml-1 font-medium">
                                                        {job.job_post_categories.length > 0 ? job.job_post_categories[0].type.replace('_', ' ') : 'Full Time'}
                                                    </Text>
                                                    <View className="w-1 h-1 bg-gray-400 rounded-full mx-2" />
                                                    <Ionicons name="people-outline" size={16} color="#6b7280" />
                                                    <Text className="text-gray-500 text-xs ml-1 font-medium">
                                                        {job.job_post_categories.reduce((sum, cat) => sum + cat.required_count, 0)} positions
                                                    </Text>
                                                </View>
                                                <Text className="text-gray-400 text-xs font-medium">
                                                    {new Date(job.created_at).toLocaleDateString()}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Action Footer */}
                                        <View className="bg-gray-50 px-5 py-4 border-t border-gray-100">
                                            <View className="flex-row items-center justify-between">
                                                <TouchableOpacity className="bg-white border border-gray-200 px-4 py-2 rounded-xl active:scale-95">
                                                    <Text className="text-gray-700 text-sm font-bold">View Details</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity 
                                                    className="bg-yellow-400 px-6 py-2 rounded-xl border-2 border-yellow-500 active:scale-95"
                                                    onPress={() => {
                                                        setSelectedJob(job);
                                                        setModalVisible(true);
                                                    }}
                                                >
                                                    <Text className="text-black text-sm font-bold">Apply Now</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}

                                {/* Loading More */}
                                {loading && hasMore && (
                                    <View className="py-6 items-center">
                                        <ActivityIndicator size="large" color="#ffd401" />
                                        <Text className="text-gray-500 text-sm mt-2 font-medium">Loading more jobs...</Text>
                                    </View>
                                )}

                                {/* End of List */}
                                {!hasMore && jobs.length > 0 && (
                                    <View className="py-6 items-center">
                                        <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                                        <Text className="text-gray-600 text-sm mt-2 font-bold">You've reached the end!</Text>
                                        <Text className="text-gray-500 text-xs mt-1 font-medium">No more jobs to load</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </>
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
                            <Text className="text-gray-900 text-xl font-bold">Search Jobs</Text>
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
                                    className="flex-1 ml-3 text-gray-900 font-medium"
                                    placeholder="Search jobs, companies, or skills..."
                                    placeholderTextColor="#9ca3af"
                                    value={searchQuery}
                                    onChangeText={handleSearch}
                                    autoFocus={true}
                                />
                                {searchQuery.length > 0 && (
                                    <TouchableOpacity onPress={() => handleSearch('')}>
                                        <Ionicons name="close-circle" size={20} color="#6b7280" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        <TouchableOpacity
                            className="bg-yellow-400 py-4 rounded-xl border-2 border-yellow-500 active:scale-95"
                            onPress={() => setSearchModalVisible(false)}
                        >
                            <Text className="text-black font-bold text-center">Search</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Job Detail Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 bg-black/50">
                    <View className="flex-1 bg-white rounded-t-3xl mt-20">
                        {/* Modal Header */}
                        <View className="flex-row items-center justify-between p-6 border-b border-gray-100">
                            <Text className="text-gray-900 text-xl font-bold">Job Details</Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                className="bg-gray-100 p-2 rounded-full"
                            >
                                <Ionicons name="close" size={20} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
                            {selectedJob && (
                                <>
                                    {/* Company Header */}
                                    <View className="flex-row items-center mb-6">
                                        <View className="bg-gray-100 p-4 rounded-2xl mr-4">
                                            {selectedJob.companies?.logo ? (
                                                <Image
                                                    source={{ uri: selectedJob.companies.logo }}
                                                    className="w-12 h-12 rounded-xl"
                                                    resizeMode="contain"
                                                />
                                            ) : (
                                                <Ionicons name="business" size={48} color="#6b7280" />
                                            )}
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-900 text-xl font-bold mb-1">
                                                {selectedJob.title}
                                            </Text>
                                            <Text className="text-gray-600 text-base font-semibold mb-1">
                                                {selectedJob.companies?.name}
                                            </Text>
                                            <View className="flex-row items-center">
                                                <Ionicons name="location-outline" size={16} color="#6b7280" />
                                                <Text className="text-gray-500 text-sm ml-1" numberOfLines={2}>
                                                    {selectedJob.companies?.location}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Job Status */}
                                    <View className="mb-6">
                                        <View className={`px-4 py-2 rounded-xl border self-start ${
                                            selectedJob.status === 'active' ? 'bg-green-50 border-green-200' : 
                                            selectedJob.status === 'closed' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                                        }`}>
                                            <Text className={`text-sm font-bold ${
                                                selectedJob.status === 'active' ? 'text-green-700' : 
                                                selectedJob.status === 'closed' ? 'text-red-700' : 'text-yellow-700'
                                            }`}>
                                                {selectedJob.status === 'active' ? '🟢 Currently Hiring' : 
                                                 selectedJob.status === 'closed' ? '🔴 Position Closed' : '🟡 Under Review'}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Company Description */}
                                    <View className="mb-6">
                                        <Text className="text-gray-900 text-lg font-bold mb-3">About Company</Text>
                                        <Text className="text-gray-600 text-sm leading-6">
                                            {selectedJob.companies?.description}
                                        </Text>
                                    </View>

                                    {/* Contact Information */}
                                    <View className="mb-6">
                                        <Text className="text-gray-900 text-lg font-bold mb-3">Contact Information</Text>
                                        <View className="space-y-3">
                                            <View className="flex-row items-center">
                                                <Ionicons name="mail-outline" size={20} color="#6b7280" />
                                                <Text className="text-gray-600 text-sm ml-3">{selectedJob.companies?.email}</Text>
                                            </View>
                                            <View className="flex-row items-center">
                                                <Ionicons name="call-outline" size={20} color="#6b7280" />
                                                <Text className="text-gray-600 text-sm ml-3">{selectedJob.companies?.phone}</Text>
                                            </View>
                                            <View className="flex-row items-center">
                                                <Ionicons name="globe-outline" size={20} color="#6b7280" />
                                                <Text className="text-blue-600 text-sm ml-3">{selectedJob.companies?.website}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Job Categories Detail */}
                                    <View className="mb-6">
                                        <Text className="text-gray-900 text-lg font-bold mb-3">Available Positions</Text>
                                        {selectedJob.job_post_categories.map((category, index) => (
                                            <View key={category.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3">
                                                <View className="flex-row items-center justify-between mb-3">
                                                    <Text className="text-gray-900 text-base font-bold">
                                                        {category.job_categories.name}
                                                    </Text>
                                                    <View className="bg-blue-100 px-3 py-1 rounded-full">
                                                        <Text className="text-blue-700 text-xs font-bold">
                                                            {category.required_count} positions
                                                        </Text>
                                                    </View>
                                                </View>
                                                
                                                <View className="flex-row items-center mb-3">
                                                    <Ionicons name="time-outline" size={16} color="#6b7280" />
                                                    <Text className="text-gray-600 text-sm ml-2 capitalize">
                                                        {category.type.replace('_', ' ')}
                                                    </Text>
                                                </View>

                                                {/* Description */}
                                                {category.description && (
                                                    <View className="mb-3">
                                                        <Text className="text-gray-900 text-sm font-semibold mb-1">Job Description:</Text>
                                                        <Text className="text-gray-600 text-sm leading-5">
                                                            {category.description}
                                                        </Text>
                                                    </View>
                                                )}

                                                {/* Requirements */}
                                                {category.requirements && (
                                                    <View className="mb-3">
                                                        <Text className="text-gray-900 text-sm font-semibold mb-1">Requirements:</Text>
                                                        <Text className="text-gray-600 text-sm leading-5">
                                                            {category.requirements}
                                                        </Text>
                                                    </View>
                                                )}

                                                {/* Benefits */}
                                                {category.benefits && (
                                                    <View className="mb-3">
                                                        <Text className="text-gray-900 text-sm font-semibold mb-1">Benefits:</Text>
                                                        <Text className="text-gray-600 text-sm leading-5">
                                                            {category.benefits}
                                                        </Text>
                                                    </View>
                                                )}

                                                {/* Apply Button for this position */}
                                                <TouchableOpacity 
                                                    className="bg-yellow-400 py-2 px-4 rounded-lg border border-yellow-500 active:scale-95 mt-2"
                                                    onPress={() => {
                                                        setSelectedPosition(category);
                                                        setApplyModalVisible(true);
                                                    }}
                                                >
                                                    <Text className="text-black font-bold text-center text-sm">Apply for this Position</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>

                                    {/* Posted Date */}
                                    <View className="mb-6">
                                        <View className="flex-row items-center">
                                            <MaterialCommunityIcons name="clock-outline" size={20} color="#6b7280" />
                                            <Text className="text-gray-500 text-sm ml-2">
                                                Posted on {new Date(selectedJob.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </Text>
                                        </View>
                                    </View>
                                </>
                            )}
                        </ScrollView>

                        {/* Modal Footer */}
                        <View className="p-6 border-t border-gray-100">
                            <View className="flex-row space-x-3">
                                <TouchableOpacity 
                                    className="flex-1 bg-gray-100 py-4 rounded-xl border border-gray-200 active:scale-95"
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text className="text-gray-700 font-bold text-center">Close</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    className="flex-1 bg-yellow-400 py-4 rounded-xl border-2 border-yellow-500 active:scale-95"
                                    onPress={() => {
                                        if (selectedJob?.job_post_categories.length === 1) {
                                            setSelectedPosition(selectedJob.job_post_categories[0]);
                                            setApplyModalVisible(true);
                                        } else {
                                            Alert.alert('Select Position', 'Please select a specific position to apply for.');
                                        }
                                    }}
                                >
                                    <Text className="text-black font-bold text-center">Apply Now</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Application Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={applyModalVisible}
                onRequestClose={() => setApplyModalVisible(false)}
            >
                <View className="flex-1 bg-black/50">
                    <View className="flex-1 bg-white rounded-t-3xl mt-20">
                        {/* Modal Header */}
                        <View className="flex-row items-center justify-between p-6 border-b border-gray-100">
                            <Text className="text-gray-900 text-xl font-bold">Apply for Position</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setApplyModalVisible(false);
                                    setCvFile(null);
                                    setKtpImage(null);
                                }}
                                className="bg-gray-100 p-2 rounded-full"
                            >
                                <Ionicons name="close" size={20} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
                            {selectedPosition && (
                                <>
                                    {/* Position Info */}
                                    <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                                        <Text className="text-blue-900 text-lg font-bold mb-2">
                                            {selectedPosition.job_categories.name}
                                        </Text>
                                        <View className="flex-row items-center mb-2">
                                            <Ionicons name="time-outline" size={16} color="#1e40af" />
                                            <Text className="text-blue-700 text-sm ml-2 capitalize font-medium">
                                                {selectedPosition.type.replace('_', ' ')}
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <Ionicons name="people-outline" size={16} color="#1e40af" />
                                            <Text className="text-blue-700 text-sm ml-2 font-medium">
                                                {selectedPosition.required_count} positions available
                                            </Text>
                                        </View>
                                    </View>

                                    {/* CV Upload */}
                                    <View className="mb-6">
                                        <Text className="text-gray-900 text-lg font-bold mb-3">Upload CV/Resume</Text>
                                        <TouchableOpacity
                                            className={`border-2 border-dashed rounded-xl p-6 items-center ${
                                                cvFile ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                                            }`}
                                            onPress={async () => {
                                                try {
                                                    const result = await DocumentPicker.getDocumentAsync({
                                                        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                                                        copyToCacheDirectory: true,
                                                    });
                                                    
                                                    if (!result.canceled && result.assets[0]) {
                                                        setCvFile(result.assets[0]);
                                                    }
                                                } catch (error) {
                                                    Alert.alert('Error', 'Failed to pick document');
                                                }
                                            }}
                                        >
                                            {cvFile ? (
                                                <>
                                                    <Ionicons name="document-text" size={48} color="#10b981" />
                                                    <Text className="text-green-700 font-bold mt-2">CV Uploaded</Text>
                                                    <Text className="text-green-600 text-sm mt-1" numberOfLines={1}>
                                                        {cvFile.name}
                                                    </Text>
                                                    <Text className="text-green-500 text-xs mt-1">
                                                        {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                                                    </Text>
                                                </>
                                            ) : (
                                                <>
                                                    <Ionicons name="cloud-upload-outline" size={48} color="#6b7280" />
                                                    <Text className="text-gray-700 font-bold mt-2">Upload CV/Resume</Text>
                                                    <Text className="text-gray-500 text-sm mt-1 text-center">
                                                        PDF, DOC, or DOCX files only\nMax size: 10MB
                                                    </Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    </View>

                                    {/* KTP Upload */}
                                    <View className="mb-6">
                                        <Text className="text-gray-900 text-lg font-bold mb-3">Upload KTP (ID Card)</Text>
                                        <TouchableOpacity
                                            className={`border-2 border-dashed rounded-xl p-6 items-center ${
                                                ktpImage ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                                            }`}
                                            onPress={async () => {
                                                try {
                                                    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
                                                    
                                                    if (permissionResult.granted === false) {
                                                        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
                                                        return;
                                                    }

                                                    const result = await ImagePicker.launchImageLibraryAsync({
                                                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                                        allowsEditing: true,
                                                        aspect: [16, 10],
                                                        quality: 0.8,
                                                    });

                                                    if (!result.canceled && result.assets[0]) {
                                                        setKtpImage(result.assets[0]);
                                                    }
                                                } catch (error) {
                                                    Alert.alert('Error', 'Failed to pick image');
                                                }
                                            }}
                                        >
                                            {ktpImage ? (
                                                <>
                                                    <Image 
                                                        source={{ uri: ktpImage.uri }} 
                                                        className="w-32 h-20 rounded-lg mb-2"
                                                        resizeMode="cover"
                                                    />
                                                    <Text className="text-green-700 font-bold">KTP Uploaded</Text>
                                                    <Text className="text-green-500 text-xs mt-1">
                                                        {(ktpImage.fileSize / 1024 / 1024).toFixed(2)} MB
                                                    </Text>
                                                </>
                                            ) : (
                                                <>
                                                    <Ionicons name="camera-outline" size={48} color="#6b7280" />
                                                    <Text className="text-gray-700 font-bold mt-2">Upload KTP Image</Text>
                                                    <Text className="text-gray-500 text-sm mt-1 text-center">
                                                        JPG, PNG files only\nMax size: 5MB
                                                    </Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    </View>

                                    {/* Application Note */}
                                    <View className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                                        <View className="flex-row items-start">
                                            <Ionicons name="information-circle" size={20} color="#d97706" />
                                            <View className="flex-1 ml-3">
                                                <Text className="text-yellow-800 font-bold text-sm mb-1">Application Requirements</Text>
                                                <Text className="text-yellow-700 text-xs leading-4">
                                                    • CV/Resume must be in PDF, DOC, or DOCX format\n
                                                    • KTP image must be clear and readable\n
                                                    • All information will be verified during the selection process
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </>
                            )}
                        </ScrollView>

                        {/* Modal Footer */}
                        <View className="p-6 border-t border-gray-100">
                            <View className="flex-row space-x-3">
                                <TouchableOpacity 
                                    className="flex-1 bg-gray-100 py-4 rounded-xl border border-gray-200 active:scale-95"
                                    onPress={() => {
                                        setApplyModalVisible(false);
                                        setCvFile(null);
                                        setKtpImage(null);
                                    }}
                                >
                                    <Text className="text-gray-700 font-bold text-center">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    className={`flex-1 py-4 rounded-xl border-2 active:scale-95 ${
                                        cvFile && ktpImage 
                                            ? 'bg-green-500 border-green-600' 
                                            : 'bg-gray-300 border-gray-400'
                                    }`}
                                    disabled={!cvFile || !ktpImage}
                                    onPress={() => {
                                        if (cvFile && ktpImage) {
                                            Alert.alert(
                                                'Application Submitted',
                                                'Your application has been submitted successfully. We will contact you soon.',
                                                [
                                                    {
                                                        text: 'OK',
                                                        onPress: () => {
                                                            setApplyModalVisible(false);
                                                            setModalVisible(false);
                                                            setCvFile(null);
                                                            setKtpImage(null);
                                                        }
                                                    }
                                                ]
                                            );
                                        }
                                    }}
                                >
                                    <Text className={`font-bold text-center ${
                                        cvFile && ktpImage ? 'text-white' : 'text-gray-500'
                                    }`}>
                                        Submit Application
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}