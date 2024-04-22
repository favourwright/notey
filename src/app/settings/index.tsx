import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react'
import { Pressable, Text, View } from 'react-native'
import Feather from '@expo/vector-icons/Feather';
import Colors from '@/constants/Colors';
import { StatusBar } from 'expo-status-bar';

type Props = {

}
const index = ({}: Props) => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: Colors.dark.primary },
      headerLeft: () => (
        <Pressable
          onPress={()=>navigation.goBack()}
          className='flex-row items-center'>
          <Feather
            name="chevron-left" size={24} color="white"
            style={{opacity:0.6}}
          />
          <Text
            style={{fontFamily: 'CoveredByYourGrace_400Regular'}}
            className='text-2xl text-white'>
            Notes
          </Text>
        </Pressable>
      ),
      headerTitle: ()=>(
        <Text
          style={{fontFamily: 'CoveredByYourGrace_400Regular'}}
          className='text-white text-3xl text-center'>
          Settings
        </Text>
      ),
    });
  })

  return (
    <View className='flex-1'>
      <StatusBar style="light" />
      <Text>index</Text>
    </View>
  )
}

export default index