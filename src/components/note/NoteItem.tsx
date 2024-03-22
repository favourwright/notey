import { View, Text, TouchableHighlight } from 'react-native'
import React from 'react'

export type NoteItemType = {
  id: number
  title: string
  content: string
  createdAt: Date
}
type Props = {
  index: number
  note: NoteItemType
}
const NoteItem = ({ note }:Props) => {
  return (
    <TouchableHighlight className='p-5 border-t border-secondary/80'>
      <Text className='text-2xl text-secondary'>{note.content}</Text>
    </TouchableHighlight>
  )
}

export default NoteItem