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
import { type NoteCategoryType } from '@/store/categories';

type Props = {
  list: NoteCategoryType[]
  selected?: NoteCategoryType
  onChange: (filter: NoteCategoryType) => void
  onAddBtnPress?: () => void
}

const FilterPills = ({list=[], selected, onChange, onAddBtnPress}:Props) => {
  const filterRef = useRef<FlatList>(null)
  const [activeFilter, setActiveFilter] = useState<NoteCategoryType|null>(selected || null)
  const navigation = useNavigation()
  
  const handleSelection = ({item, index}: {item: NoteCategoryType, index: number}) => {
    // check if the item is already selected
    // if it is, deselect it
    if(activeFilter?.id === item.id) {
      setActiveFilter(null)
      onChange(null)
      navigation.setParams({ active_category: null  } as undefined);
      return
    }

    onChange(item)
    setActiveFilter(item)
    navigation.setParams({ active_category: item  } as undefined);
  }
  useEffect(() => {
    if(!selected || !list.length || !filterRef?.current) return
    setActiveFilter(selected)
    const index = list.findIndex(item => item.id === selected.id)
    setTimeout(() => {
      if(index >= 0) filterRef?.current.scrollToIndex({
        index,
        animated: true
      })
    },10)
  }, [selected, list, filterRef?.current])

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
        keyExtractor={item => item.id}
        onScrollToIndexFailed={()=>{}}
        renderItem={({ item, index }) => (
          <TouchableHighlight
            key={index}
            onPress={() => handleSelection({item, index})}
            className={`${activeFilter?.id === item.id ?
              'bg-accent border-transparent' :
              'bg-transparent border-secondary'
            } ${isFirstItem(index) && 'ml-5'}
            rounded-full border`}>
            <Text
              className={`${activeFilter?.id === item.id ?
                'text-primary' :
                'text-secondary'
              } text-2xl font-semibold p-3 px-5`}>
              #{item.name}
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