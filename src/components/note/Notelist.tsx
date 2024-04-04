import { FlatList } from 'react-native'
import React from 'react'
import NoteItem from './NoteItem'
import { NoteType } from '@/store/notes'

type Props = {
  notes: NoteType[]
}

const Notelist = ({ notes }:Props) => {
  return (
    <FlatList
      data={notes}
      scrollEnabled={false}
      keyExtractor={item => item.id}
      renderItem={({ item, index }) => <NoteItem note={item} index={index} />}
    />
  )
}

export default Notelist