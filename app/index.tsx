import WelcomeScreen from "@/features/welcome";
import { useAuth } from "@/stores/auth";
import { router } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function Index() {
  const {isAuthenticated, user} = useAuth()
  useEffect(()=>{
    if(isAuthenticated){
      if(user.role === 'admin'){
        router.replace('/admin/approve')
      } else if(user.role === 'pelamar'){
        router.replace('/user/job')
      }
    }
  },[])
  return <WelcomeScreen/>
}