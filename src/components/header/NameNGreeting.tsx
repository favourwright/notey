import { useState } from 'react'
import { View, Text } from 'react-native'
import NameInitialIcon from '@/components/NameInitialIcon';

type Props = {
  name: string
}

const NameNGreeting = ({name}:Props) => {
  const [greeting, setGreeting] = useState('morning') // TODO: Implement time-based greeting
  const initial = name.split(' ')[0].charAt(0).toUpperCase()
  
  return (
    <View className='flex-row items-center gap-3'>
      <NameInitialIcon initials={initial} />

      <View className='flex-row gap-1'>
        <Text className='text-secondary/50 text-xl'>{greeting},</Text>
        <Text className='text-secondary text-xl'>{name}</Text>
      </View>
    </View>
  )
}

export default NameNGreeting