import { router, Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useAuth } from "@/stores/auth";
import { useEffect } from "react";

export default function AdminLayout() {
  const { isAuthenticated, role, logout } = useAuth();
  
  useEffect(()=>{
    console.log(isAuthenticated, role)

    if(!isAuthenticated){
      router.replace('/signin')
    }

    if(role && role != 'admin'){
      (async () => {
        await logout()
      })();
      router.replace('/signin')
    }

  },[isAuthenticated, role])

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 90 : 60,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
          elevation: 8,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: '#ffd401',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="approve"
        options={{
          title: 'Approve',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}