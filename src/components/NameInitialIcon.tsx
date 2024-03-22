import { View, Text } from 'react-native'

type Props = {
  initials: string
}
const NameIcon = ({initials}:Props) => {
  return (
    <View
      className='h-10 aspect-square rounded-full bg-accent/20
      items-center justify-center border-2 border-accent/20'>
      <Text className='text-accent text-3xl font-black'>{initials}</Text>
    </View>
  )
}

export default NameIcon