import { FlatList } from 'react-native'
import React from 'react'
import NoteItem, { NoteItemType } from './NoteItem'

type Props = {
  notes: NoteItemType[]
}

const Notelist = ({ notes }:Props) => {
  return (
    <FlatList
      data={notes}
      scrollEnabled={false}
      renderItem={({ item, index }) => <NoteItem note={item} index={index} />}
    />
  )
}

export default Notelist