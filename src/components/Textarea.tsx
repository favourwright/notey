import { View, TextInput } from 'react-native'
import { useRef } from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface TextareaProps {
  value: string
  onChangeText: (value: string) => void
  contentInputRef?: React.RefObject<TextInput>
  screenWidth: number
  placeholder?: string
}

const Textarea = ({ value, onChangeText, contentInputRef, screenWidth, placeholder }: TextareaProps) => {
  const { bottom } = useSafeAreaInsets()
  const inputRef = useRef<TextInput>(null)

  return (
    <KeyboardAwareScrollView
      className='flex-1'
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: bottom + 20,
      }}
    >
      <TextInput
        ref={contentInputRef || inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        className='flex-1 text-2xl text-gray-600 mt-2 w-full'
        multiline
        textAlignVertical="top"
        autoFocus={false}
        blurOnSubmit={false}
        returnKeyType="default"
        scrollEnabled={false}
      />
    </KeyboardAwareScrollView>
  )
}

export default Textarea 