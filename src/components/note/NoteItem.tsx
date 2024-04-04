import { View, Text, TouchableHighlight, TouchableOpacity } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import Colors from '@/constants/Colors'
import { useRouter } from 'expo-router'
import { NoteType } from '@/store/notes'

type Props = {
  index: number
  note: NoteType
}
const NoteItem = ({ note, index }:Props) => {
  const { navigate } = useRouter()
  const renderedIndex = (index+1) < 10 ? `0${index+1}` : index+1
  // in case note has more than 2 lines of content, truncate it,
  // if note is also too long, truncate it
  const multilineTruncate = note.content.split('\n').slice(0, 2).join('\n')
  const renderedContent = multilineTruncate.length > 50 ? `${multilineTruncate.slice(0, 50)}...` : multilineTruncate

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={()=>navigate(`/${note.id}`)}>
      <View className='flex-row gap-4 py-5 h-32 border-t border-secondary/60'>
        <Text className='text-secondary/40 text-lg font-semibold'>{renderedIndex} /</Text>
        <View className='flex-grow'>
          <Text className='text-4xl text-secondary truncate'>{note.title}</Text>
          <Text className='text-xl text-secondary/50 truncate'>{renderedContent}</Text>
        </View>
        <Feather name="arrow-up-right" size={24} color={Colors.dark.text} />
      </View>
    </TouchableOpacity>
  )
}

export default NoteItem