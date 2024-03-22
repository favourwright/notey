import "../global.css";
import { Stack } from 'expo-router/stack';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="new" options={{
        headerStyle: { backgroundColor: 'white' },
        headerTitleStyle: { color: 'black' },
        headerBackTitleVisible: false,
      }} />
    </Stack>
  );
}
