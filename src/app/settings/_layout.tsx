import { Stack } from 'expo-router/stack';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{
        headerBackVisible:false,
        title: null,
        headerTitleAlign: 'center',
      }} />
    </Stack>
  );
}
