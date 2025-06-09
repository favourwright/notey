import { KeyboardAvoidingView, ScrollView, TextInput, View, useWindowDimensions } from 'react-native'
import { useHeaderHeight } from '@react-navigation/elements'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { RefObject } from 'react'

type Props = {
  content: string
  onContentChange: (value: string) => void
  contentInputRef: RefObject<TextInput>
  placeholder?: string
}

const Textarea = ({ content, onContentChange, contentInputRef, placeholder }: Props) => {
  const { bottom } = useSafeAreaInsets()
  const { width: screenWidth } = useWindowDimensions()
  const headerHeight = useHeaderHeight()

  return (
    <KeyboardAvoidingView
      enabled 
      behavior='padding'
      className='flex-1'
      keyboardVerticalOffset={headerHeight+20}
    >
      <TextInput
        ref={contentInputRef}
        value={content}
        onChangeText={onContentChange}
        placeholder={placeholder}
        className='text-2xl text-gray-600 mt-2 flex-1 px-5 w-full'
        style={{
          textAlignVertical: "top",
          paddingBottom: bottom,
          width: screenWidth,
        }}
        multiline
      />
    </KeyboardAvoidingView>
  )
}

export default Textarea 