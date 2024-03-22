import { View, Text } from 'react-native'
import { useNavigation, useRoute } from "@react-navigation/native";
import { useLayoutEffect } from 'react';

const NewNote = () => {
  const navigation = useNavigation()
  
  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'New note',
    })
  }, [navigation])

  return (
    <View>
      <Text>new</Text>
    </View>
  )
}

export default NewNote