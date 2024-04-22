import React from 'react'
import NoteItem from './NoteItem'
import { NoteType } from '@/store/notes'
import Animated, { CurvedTransition, FadeInDown, FadeInUp } from 'react-native-reanimated'

type Props = {
  notes: NoteType[]
  onShowOptions: (note: NoteType) => void
}

const transition = CurvedTransition.createInstance()

const Notelist = ({ notes, onShowOptions }:Props) => {
  return (
    <Animated.FlatList
      data={notes}
      scrollEnabled={false}
      keyExtractor={item => item.id}
      itemLayoutAnimation={transition}
      renderItem={({ item, index }) =>(
        <Animated.View
          entering={FadeInUp.delay(index*10)}
          exiting={FadeInDown}>
          <NoteItem onShowOptions={onShowOptions} note={item} index={index} />
        </Animated.View>
      )}
    />
  )
}

export default Notelist