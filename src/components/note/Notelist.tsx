import React from 'react'
import NoteItem from './NoteItem'
import { NoteType } from '@/store/notes'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import Seperator from '../Seperator'
import { FlatList } from 'react-native'

type Props = {
  notes: NoteType[]
  onShowOptions: (note: NoteType) => void
}

const Notelist = ({ notes, onShowOptions }:Props) => {
  return (
    <FlatList
      data={notes}
      scrollEnabled={false}
      keyExtractor={item => item.id}
      renderItem={({ item, index }) =>(
        <Animated.View
          entering={FadeInUp.delay(index*10)}
          exiting={FadeInDown}>
          <NoteItem onShowOptions={onShowOptions} note={item} index={index} />
        </Animated.View>
      )}
      ItemSeparatorComponent={()=><Seperator padding='px-0' color='bg-secondary/20' />}
    />
  )
}

export default Notelist