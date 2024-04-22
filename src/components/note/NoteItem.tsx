import { View, Text, TouchableHighlight, TouchableOpacity } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import Colors from '@/constants/Colors'
import { useRouter } from 'expo-router'
import { NoteType } from '@/store/notes'
import * as Haptics from 'expo-haptics';

type Props = {
  index: number
  note: NoteType
  onShowOptions: (note: NoteType) => void
}
const NoteItem = ({ note, index, onShowOptions }:Props) => {
  const { navigate } = useRouter()
  const renderedIndex = (index+1) < 10 ? `0${index+1}` : index+1
  // in case note has more than 2 lines of content, truncate it,
  // if note is also too long, truncate it
  const multilineTruncate = note.content.split('\n').slice(0, 2).join('\n')
  const renderedContent = multilineTruncate.length > 50 ? `${multilineTruncate.slice(0, 50)}...` : multilineTruncate

  const handleShowNoteOptions = ()=>{
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onShowOptions && onShowOptions(note)
  }
  
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={()=>navigate(`/${note.id}`)}
      onLongPress={handleShowNoteOptions}>
      <View className='flex-row gap-4 py-5 h-32 border-t border-secondary/60 bg-primary'>
        <Text className='text-secondary/40 text-lg font-semibold'>{renderedIndex} /</Text>
        <View className='flex-1'>
          <Text numberOfLines={1} className='text-4xl text-secondary'>{!!note.title.trim() ? note.title : 'untitled note'}</Text>
          <Text className='text-xl text-secondary/50 truncate'>{renderedContent}</Text>
        </View>
        <Feather name="arrow-up-right" size={24} color={Colors.dark.secondary} />
      </View>
    </TouchableOpacity>
  )
}

export default NoteItem