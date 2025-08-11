import { Tabs } from "expo-router";

export default function UserLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: 'User' }} />
    </Tabs>
  );
}