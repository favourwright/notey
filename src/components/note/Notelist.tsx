import { FlatList } from 'react-native'
import React from 'react'
import NoteItem from './NoteItem'
import { NoteType } from '@/store/notes'

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
      renderItem={({ item, index }) => <NoteItem onShowOptions={onShowOptions} note={item} index={index} />}
    />
  )
}

export default Notelist