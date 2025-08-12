import { Text, View, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useState, useEffect } from "react";
import { api } from "@/lib/axios";
import { MaterialIcons } from "@expo/vector-icons";

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
}

export default function Application() {
    const [isLoading, setIsLoading] = useState(false);
    const [applications, setApplications] = useState<Application[]>([]);

    const getApplicationData = async () => {
        try {
            setIsLoading(true);
            const res = await api.get("/jobs/history");
            setApplications(res.data.data.data);
        } catch (error) {
            console.log(error)
            console.error("Failed to fetch applications:", error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getApplicationData();
    }, []);

    const getStatusColor = (status: string) => {
        switch(status.toLowerCase()) {
            case 'pending':
                return 'bg-orange-500';
            case 'accepted':
                return 'bg-green-500';
            case 'rejected':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" className="text-blue-600" />
                <Text className="mt-3 text-base text-gray-600">Loading applications...</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 px-4 py-4 bg-gray-50">
            <Text className="text-2xl font-bold mb-4 text-gray-800">My Applications</Text>
            {applications.map((item) => (
                <View key={item.id} className="bg-white rounded-lg shadow-md mb-4 p-4">
                    <View className="flex-row items-center mb-3">
                        <MaterialIcons name="work" size={24} className="text-blue-600" />
                        <Text className="text-lg font-bold ml-2 text-gray-800">
                            {item.job_post_categories.job_posts.title}
                        </Text>
                    </View>
                    
                    <View className="flex-row items-center mb-2">
                        <MaterialIcons name="business" size={20} className="text-gray-600" />
                        <Text className="ml-2 text-base text-gray-600">
                            {item.job_post_categories.job_posts.companies.name}
                        </Text>
                    </View>

                    <View className="flex-row items-center mb-2">
                        <MaterialIcons name="category" size={20} className="text-gray-600" />
                        <Text className="ml-2 text-base text-gray-600">
                            {item.job_post_categories.job_categories.name}
                        </Text>
                    </View>

                    <View className="flex-row items-center mb-2">
                        <MaterialIcons name="work" size={20} className="text-gray-600" />
                        <Text className="ml-2 text-base text-gray-600">
                            {item.job_post_categories.type}
                        </Text>
                    </View>

                    <View className={`self-start px-3 py-1.5 rounded-full mt-2 ${getStatusColor(item.status)}`}>
                        <Text className="text-white font-bold text-sm">
                            {item.status}
                        </Text>
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}