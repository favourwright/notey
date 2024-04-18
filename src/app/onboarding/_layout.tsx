import { Stack } from 'expo-router/stack';

export default function AppLayout() {
  return (
    <Stack screenOptions={{}}>
      <Stack.Screen name="index" options={{
        headerShown: false
      }} />
    </Stack>
  );
}
