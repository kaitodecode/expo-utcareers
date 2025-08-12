import { Stack } from "expo-router";

export default function JobLayout() {
    return (
        <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>

            <Stack.Screen name="index" options={{ title: 'Job List' }} />
            {/* <Stack.Screen name="create" options={{ title: 'Create Job' }} /> */}
        </Stack>
    )
}