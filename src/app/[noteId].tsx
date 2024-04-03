import { View, Text, TouchableOpacity } from 'react-native'
import { useNavigation, useRoute } from "@react-navigation/native";
import { useLayoutEffect } from 'react';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import Colors from '@/constants/Colors';
import { StatusBar } from 'expo-status-bar';
import Seperator from '@/components/Seperator';

const NewNote = () => {
  const navigation = useNavigation()
  const { navigate } = useRouter()
  const params = useLocalSearchParams()
  
  useLayoutEffect(() => {
    navigation.setOptions({
      title: null,
      headerLeft: () => (
        <TouchableOpacity activeOpacity={.8} onPress={() => navigation.goBack()}>
          <Entypo name="chevron-thin-left" size={23} color={Colors.dark.background} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity activeOpacity={.8} onPress={() => navigate('/undefined')}>
          <Text className='text-2xl'>save</Text>
        </TouchableOpacity>
      ),
      headerShadowVisible: false,
    })
    // console.log(params.noteId)
  }, [navigation])

  return (
    <View className='flex-1 bg-white'>
      <StatusBar style='dark' />
      <Seperator className='mt-1' color='bg-gray-500' height='h-0.5' />
      <View>
        
      </View>
    </View>
  )
}

export default NewNote