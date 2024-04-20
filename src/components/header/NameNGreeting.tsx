import { useEffect, useState } from 'react'
import { View, Text } from 'react-native'
import NameInitialIcon from '@/components/NameInitialIcon';

const getGreeting = () => {
  const now = new Date();
  // Extract the current hour
  const hours = now.getHours();

  let greeting:string;
  if (hours < 12) {
    greeting = 'morning';
  } else if (hours >= 12 && hours < 17) {
    greeting = 'afternoon';
  } else {
    greeting = 'evening';
  }
  return greeting;
}

type Props = {
  name: string
}

const NameNGreeting = ({name}:Props) => {
  const [greeting, setGreeting] = useState<string|undefined>(undefined) // TODO: Implement time-based greeting
  const initial = (name||'').split(' ')[0].charAt(0).toUpperCase()

  useEffect(() => {
    setGreeting(getGreeting())
  },[])
  
  return (
    <View className='flex-row items-center gap-3'>
      <NameInitialIcon initials={initial} />

      <View className='flex-row gap-1'>
        <Text
          style={{fontFamily: 'CoveredByYourGrace_400Regular'}}
          className='text-secondary/50 text-2xl'>
          {greeting},
        </Text>
        <Text
          style={{fontFamily: 'CoveredByYourGrace_400Regular'}}
          className='text-secondary text-2xl'>
          {name}
        </Text>
      </View>
    </View>
  )
}

export default NameNGreeting