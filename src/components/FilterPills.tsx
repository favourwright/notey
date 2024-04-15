import { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableHighlight,
  Pressable
} from 'react-native'
import { useNavigation } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';

type Props = {
  list: string[]
  selected?: string
  onChange: (filter: string) => void
  onAddBtnPress?: () => void
}

const FilterPills = ({list=[], selected, onChange, onAddBtnPress}:Props) => {
  const filterRef = useRef<FlatList>(null)
  const [activeFilter, setActiveFilter] = useState<string|null>(selected || null)
  const navigation = useNavigation()
  
  const handleSelection = ({item, index}: {item: string, index: number}) => {
    filterRef.current?.scrollToIndex({index, animated: true})
    onChange(item)
    setActiveFilter(item)
    navigation.setParams({ active_category: item  } as undefined);
  }
  useEffect(() => {
    setTimeout(() => {
      selected && filterRef.current?.scrollToIndex({index: list.indexOf(selected), animated: true})
    }, 1000)
  }, [])

  const isFirstItem = (index: number) => index === 0
  const isLastItem = (index: number) => index === list.length - 1

  return (
    <View className='flex-row-reverse items-center'>
      <Pressable
        onPress={!!onAddBtnPress && onAddBtnPress}
        className='mx-3 aspect-square items-center justify-center border-2 border-white rounded-full'>
        <Entypo name='plus' size={23} className='!text-white' />
      </Pressable>

      <FlatList
        ref={filterRef}
        horizontal
        data={list}
        renderItem={({ item, index }) => (
          <TouchableHighlight
            key={index}
            onPress={() => handleSelection({item, index})}
            className={`${activeFilter === item ?
              'bg-accent border-transparent' :
              'bg-transparent border-secondary'
            } ${isFirstItem(index) && 'ml-5'}
            rounded-full border`}>
            <Text
              className={`${activeFilter === item ?
                'text-primary' :
                'text-secondary'
              } text-2xl font-semibold p-3 px-5`}>
              #{item}
            </Text>
          </TouchableHighlight>
        )}
        ItemSeparatorComponent={()=><View className='w-5'></View>}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  )
}

export default FilterPills