import { View, TouchableOpacity } from 'react-native'
import Feather from '@expo/vector-icons/Feather';
import Colors from '@/constants/Colors';

type Props = {
  noteStored: boolean,
  noteDirty: boolean,
  handleSaveNote: () => void,
  handleDeleteNote: () => void,
}
const HeaderRight = ({
  noteStored,
  noteDirty,
  handleSaveNote,
  handleDeleteNote,
}: Props) => {
  return (
    <View className='flex-row justify-end gap-6'>
      {
        <TouchableOpacity
          disabled={!noteDirty}
          activeOpacity={.8}
          onPress={handleSaveNote}
          className={!noteDirty ? 'opacity-30' : ''}
        >
          <Feather name="save" size={26} />
        </TouchableOpacity>
      }
      {
        <TouchableOpacity
          disabled={!noteStored}
          activeOpacity={.8}
          onPress={handleDeleteNote}
          className={!noteStored ? 'opacity-30' : ''}
        >
          <Feather name="trash-2" size={26} />
        </TouchableOpacity>
      }
    </View>
  )
}

export default HeaderRight