import "../global.css";
import { Stack } from 'expo-router/stack';
import Colors from "@/constants/Colors";
import AntDesign from '@expo/vector-icons/AntDesign';
import SplashScreen from "@/components/SplashScreen";
import { TouchableOpacity } from "react-native";
import { useRouter } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootSiblingParent } from 'react-native-root-siblings';
import { KeyboardProvider } from 'react-native-keyboard-controller';

export default function AppLayout() {
  const { navigate } = useRouter();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootSiblingParent>
        <KeyboardProvider
          enabled
          statusBarTranslucent
          navigationBarTranslucent
        >
          <SplashScreen>
            <Stack screenOptions={{}}>
              <Stack.Screen name="index" options={{
                headerStyle: { backgroundColor: Colors.dark.primary },
                // contentStyle: {
                //   borderTopColor: Colors.dark.primary,
                //   borderTopWidth: 1,
                // },
                title: null,
                headerRight: () => (
                  <TouchableOpacity activeOpacity={.8} onPress={() => navigate('/undefined')}>
                    <AntDesign name="pluscircle" size={24} color={Colors.dark.secondary} />
                  </TouchableOpacity>
                ),
              }} />
              <Stack.Screen name="[noteId]" options={{
                headerStyle: { backgroundColor: 'white' },
                headerTitleStyle: { color: 'black' },
                headerBackTitleVisible: false,
              }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="settings" options={{ headerShown: false }} />
            </Stack>
          </SplashScreen>
        </KeyboardProvider>
      </RootSiblingParent>
    </GestureHandlerRootView>
  );
}
