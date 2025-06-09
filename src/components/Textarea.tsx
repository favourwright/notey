import { View, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import { useHeaderHeight } from '@react-navigation/elements'
import { useRef, useEffect, useState } from 'react'
import { Keyboard } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface TextareaProps {
  value: string
  onChangeText: (value: string) => void
  contentInputRef?: React.RefObject<TextInput>
  screenWidth: number
}

const Textarea = ({ value, onChangeText, contentInputRef, screenWidth }: TextareaProps) => {
  const headerHeight = useHeaderHeight()
  const { bottom } = useSafeAreaInsets()
  const scrollViewRef = useRef(null)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const keyboardWillShow = Platform.OS === 'ios' 
      ? Keyboard.addListener('keyboardWillShow', (e) => {
          setKeyboardHeight(e.endCoordinates.height)
          // Add small delay to ensure layout is updated
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }, 50)
        })
      : Keyboard.addListener('keyboardDidShow', (e) => {
          setKeyboardHeight(e.endCoordinates.height)
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }, 50)
        })
    
    const keyboardWillHide = Platform.OS === 'ios'
      ? Keyboard.addListener('keyboardWillHide', () => setKeyboardHeight(0))
      : Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0))

    return () => {
      keyboardWillShow.remove()
      keyboardWillHide.remove()
    }
  }, [])

  return (
    <KeyboardAvoidingView
      enabled
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className='flex-1'
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight + 20 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        className='flex-1'
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: Platform.OS === 'android' 
            ? keyboardHeight + 20 
            : keyboardHeight + bottom,
        }}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        overScrollMode="never"
      >
        <TextInput
          scrollEnabled={false}
          ref={contentInputRef}
          value={value}
          onChangeText={onChangeText}
          className='text-2xl text-gray-600 mt-2 flex-1 px-5 w-full'
          style={{
            textAlignVertical: "top",
            width: screenWidth,
            flex: 1
          }}
          multiline
        />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default Textarea 