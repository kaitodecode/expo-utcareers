import SignInScreen from "@/features/signin";
import { useAuth } from "@/stores/auth";
import { router } from "expo-router";
import { useEffect } from "react";

export default function SignInROute() {
  const { isAuthenticated, user } = useAuth()
  useEffect(() => {
    if (isAuthenticated) {
      if (user.role === 'admin') {
        router.replace('/admin/approve')
      } else if (user.role === 'pelamar') {
        router.replace('/user/job')
      }
    }
  }, [])
  return <SignInScreen />
}