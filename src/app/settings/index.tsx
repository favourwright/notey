import { Link, useNavigation, useRouter } from 'expo-router';
import { useEffect, useLayoutEffect, useState } from 'react'
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather';
import Colors from '@/constants/Colors';
import { StatusBar } from 'expo-status-bar';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { clearOnboardingRecords, getUsername } from '@/store/onboarding';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Entypo from '@expo/vector-icons/Entypo';
import { clearAllNotes } from '@/store/notes';
import { clearAllCategories } from '@/store/categories';
import EditUsernameModal from '@/components/EditUsernameModal';
import ExportImportModal from '@/components/ImportExportModal';
import { setAutoSave, getAutoSave } from '@/store/notes';
import * as Haptics from 'expo-haptics';

type Props = {

}
const index = ({ }: Props) => {
  const navigation = useNavigation();
  const { bottom } = useSafeAreaInsets()
  const router = useRouter()
  const usernameModal = useState(false)
  const exportImportModal = useState(false)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: Colors.dark.primary },
      headerLeft: () => (
        <Pressable
          onPress={() => navigation.goBack()}
          className='flex-row items-center'>
          <Feather
            name="chevron-left" size={24} color="white"
            style={{ opacity: 0.5 }}
          />
          <Text
            style={{ fontFamily: 'CoveredByYourGrace_400Regular' }}
            className='text-xl text-white/80'>
            Notes
          </Text>
        </Pressable>
      ),
      headerTitle: () => (
        <Text
          style={{ fontFamily: 'CoveredByYourGrace_400Regular' }}
          className='text-white/80 text-3xl text-center'>
          Settings
        </Text>
      ),
    });
  })

  const [username, setUsername] = useState('')
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      setUsername(await getUsername())
    });
  
    return unsubscribe; // Cleanup function
  }, [navigation.isFocused]); // Dependency array

  const clearAllData = async () => {
    await clearAllNotes()
    await clearAllCategories()
    await clearOnboardingRecords()
    await setAutoSave(false)
    router.replace('/onboarding')
  }

  const handleClearData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    Alert.alert('Sure you want to clear all your data?', null, [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {text: 'OK', onPress: async () => {
        clearAllData()
      }},
    ]);
  }

  const [autoSaveNotes, setAutoSaveNotes] = useState(true)
  const handleAutoSave = async (value:boolean) => {
    await setAutoSave(value)
    setAutoSaveNotes(value)
  }
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      setAutoSaveNotes(await getAutoSave())
    });
  
    return unsubscribe;
  }, [navigation.isFocused]);

  return (
    <View className='flex-1 bg-primary'>
      <StatusBar style="light" />
      <View className='items-center py-10 bg-primary'>
        <RotatingInitial initial={(username || '').charAt(0)} />
        <Text
          style={{fontFamily: 'CoveredByYourGrace_400Regular'}}
          className='text-secondary/80 text-4xl font-semibold mt-3'>
          {username}
        </Text>
      </View>

      <View style={{paddingBottom:bottom}} className='flex-1 pt-5'>
        <View className='flex-1 justify-between px-5 pb-10'>
          <View className='flex-1 gap-4'>
            <Pressable
              onPress={()=>usernameModal[1](true)}
              className='p-5 py-3 bg-primary rounded-2xl border border-secondary/10
              flex-row justify-between'>
              <Text className='text-secondary/80 text-xl'>{username}</Text>
              <Feather
                name="edit-3" size={24}
                color={Colors.dark.secondary}
                className='opacity-70'
              />
            </Pressable>

            <Pressable
              onPress={()=>exportImportModal[1](true)}
              className='p-5 py-3 bg-primary rounded-2xl border border-secondary/10 flex-row items-center justify-between'>
              <Text className='text-xl text-secondary/80'>Import / export data</Text>
              <Feather name="file" size={24}
                color={Colors.dark.secondary}
                className='opacity-70'
              />
            </Pressable>

            <View className='p-5 py-3 bg-primary rounded-2xl border border-secondary/10 flex-row items-center justify-between'>
              <View className='flex flex-row items-center gap-3'>
                <Feather name="save" size={24}
                  color={Colors.dark.secondary}
                  className='opacity-70'
                />
                <Text className='text-xl text-secondary/80'>Auto-save notes</Text>
              </View>

              <Switch
                value={autoSaveNotes}
                onValueChange={handleAutoSave}
                thumbColor='white'
                trackColor={{true: Colors.dark.accent, false: Colors.dark['light-gray']}}
                ios_backgroundColor={Colors.dark['light-gray']}
              />
            </View>
          </View>

          <Pressable
            onPress={handleClearData}
            className='p-5 py-3 bg-red-300/5 rounded-2xl border border-secondary/10
            flex-row justify-between'>
            <Text className='text-red-300 text-xl'>clear all data</Text>
            <Feather
              name="trash-2" size={24}
              className='opacity-70 !text-red-300'
            />
          </Pressable>
        </View>

        <View className='flex-row justify-center items-center gap-1 mb-3'>
          <Text className='text-secondary/30'>with</Text>
          <Entypo name="heart" size={16} className='!text-secondary/30' />
          <Text className='text-secondary/30'>by</Text>
          <Link
            suppressHighlighting
            className="text-center text-secondary/30"
            href="https://github.com/favourwright">
            @favourwright
          </Link>
        </View>
      </View>

      <EditUsernameModal isOpen={usernameModal} onSave={setUsername} />
      <ExportImportModal
        isOpen={exportImportModal}
        // onExport={exportData}
        // onImport={importData}
      />
    </View>
  )
}

export default index

const duration = 50000;
const easing = Easing.linear
const RotatingInitial = ({ initial }: { initial: string }) => {
  const sv = useSharedValue(0);

  useEffect(() => {
    sv.value = withRepeat(withTiming(1, { duration, easing }), -1);
  }, []);

  const rotationAnimContainerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${sv.value * 360}deg` }],
  }));
  const rotationAnimTextStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `-${sv.value * 360}deg` }],
  }));
  
  return (
    <View>
      <View className='h-40 w-40 relative justify-center items-center'>
        <Animated.View
          style={[rotationAnimTextStyle, StyleSheet.absoluteFill]}
          className='bg-white/5 rounded-[40px]'>
        </Animated.View>
        <Animated.View
          style={[rotationAnimContainerStyle, StyleSheet.absoluteFill]}
          className='bg-primary rounded-[32px] m-2'>
        </Animated.View>
        <Animated.Text
          className='font-semibold text-[60px] text-secondary'
          style={[{fontFamily: 'CoveredByYourGrace_400Regular'}]}>
          {initial}
        </Animated.Text>
      </View>
    </View>
  )
}