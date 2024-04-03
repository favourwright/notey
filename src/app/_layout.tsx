import "../global.css";
import { Stack } from 'expo-router/stack';
import Colors from "@/constants/Colors";
import AntDesign from '@expo/vector-icons/AntDesign';
import { TouchableOpacity } from "react-native";
import { useRouter } from 'expo-router';

export default function AppLayout() {
  const { navigate } = useRouter();

  return (
    <Stack screenOptions={{}}>
      <Stack.Screen name="index" options={{
        headerStyle: { backgroundColor: Colors.dark.background },
        // contentStyle: {
        //   borderTopColor: Colors.dark.text,
        //   borderTopWidth: 1,
        // },
        headerRight: () => (
          <TouchableOpacity activeOpacity={.8} onPress={() => navigate('/undefined')}>
            <AntDesign name="pluscircle" size={24} color={Colors.dark.text} />
          </TouchableOpacity>
        ),
      }} />
      <Stack.Screen name="[noteId]" options={{
        headerStyle: { backgroundColor: 'white' },
        headerTitleStyle: { color: 'black' },
        headerBackTitleVisible: false,
      }} />
    </Stack>
  );
}
