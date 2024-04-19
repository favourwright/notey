import { View, Text } from 'react-native'

type Props = {
  initials: string
}
const NameIcon = ({initials}:Props) => {
  return (
    <View
      className='h-10 aspect-square rounded-full bg-light-gray/20
      items-center justify-center border-2 border-light-gray/20'>
      <Text
        className='text-light-gray text-3xl font-black'
        style={{fontFamily: 'CoveredByYourGrace_400Regular'}}>
        {initials}
      </Text>
    </View>
  )
}

export default NameIcon