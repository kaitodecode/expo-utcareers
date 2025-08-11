import { Tabs } from "expo-router";

export default function AdminLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'Admin' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />

    </Tabs>
  );
}