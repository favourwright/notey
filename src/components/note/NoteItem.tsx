import { memo, useEffect, useMemo } from 'react'
import { View, Text, Pressable, LayoutChangeEvent } from 'react-native'
import Feather from '@expo/vector-icons/Feather'
import Colors from '@/constants/Colors'
import { useRouter } from 'expo-router'
import { NoteType } from '@/store/notes'
import * as Haptics from 'expo-haptics';
import Animated, { SharedValue, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'

export const NOTE_REMOVE_DURATION = 220

type Props = {
  index: number
  note: NoteType
  onShowOptions: (note: NoteType) => void
  // set while the note is being deleted: the row fades and collapses,
  // which slides the rows below it up
  isRemoving: boolean
  // shared by all rows so they fade as one when the filter changes
  listFade: SharedValue<number>
}
const NoteItem = ({ note, index, onShowOptions, isRemoving, listFade }:Props) => {
  const { navigate } = useRouter()
  const renderedIndex = (index+1) < 10 ? `0${index+1}` : index+1
  // in case note has more than 2 lines of content, truncate it,
  // if note is also too long, truncate it
  const renderedContent = useMemo(() => {
    const multilineTruncate = note.content.split('\n').slice(0, 2).join('\n')
    return multilineTruncate.length > 50 ? `${multilineTruncate.slice(0, 50)}...` : multilineTruncate
  }, [note.content])

  const handleShowNoteOptions = ()=>{
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onShowOptions && onShowOptions(note)
  }

  const pressedSharedVal = useSharedValue(false)
  const animatedBtnOnpressStyle = useAnimatedStyle(()=>{
    return {
      opacity: pressedSharedVal.value ?
        withSpring(.7) :
        withSpring(1),
      transform: [{
        scale: pressedSharedVal.value ?
          withSpring(.95) :
          withSpring(1)
      }]
    }
  })

  const rowHeight = useSharedValue(0)
  const removeProgress = useSharedValue(1)
  useEffect(() => {
    if (isRemoving) removeProgress.value = withTiming(0, { duration: NOTE_REMOVE_DURATION })
  }, [isRemoving])
  const rowStyle = useAnimatedStyle(() => {
    const opacity = listFade.value * removeProgress.value
    // the height is only set once removal starts, otherwise the row sizes itself
    return removeProgress.value < 1
      ? { opacity, height: rowHeight.value * removeProgress.value }
      : { opacity }
  })
  const handleRowLayout = (e: LayoutChangeEvent) => {
    if (!isRemoving) rowHeight.value = e.nativeEvent.layout.height
  }

  return (
    <Animated.View style={rowStyle} onLayout={handleRowLayout} className='overflow-hidden'>
      <Pressable
        onPress={()=>navigate(`/${note.id}`)}
        onLongPress={handleShowNoteOptions}
        onPressIn={()=>{ pressedSharedVal.value = true }}
        onPressOut={()=>{ pressedSharedVal.value = false }}>
        <Animated.View
          style={animatedBtnOnpressStyle}
          className='flex-row gap-4 py-5 h-32 bg-primary'>
          <Text className='text-secondary/40 text-lg font-semibold'>{renderedIndex} /</Text>
          <View className='flex-1'>
            <Text numberOfLines={1} className='text-4xl text-secondary'>{!!note.title.trim() ? note.title : 'untitled note'}</Text>
            <Text className='text-xl text-secondary/50 truncate'>{renderedContent}</Text>
          </View>
          <Feather name="arrow-up-right" size={24} color={Colors.dark.secondary} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  )
}

// The home screen reloads notes as new objects each time it's focused, so
// compare only what the row actually shows.
export default memo(NoteItem, (prev, next) => (
  prev.note.id === next.note.id &&
  prev.note.title === next.note.title &&
  prev.note.content === next.note.content &&
  prev.index === next.index &&
  prev.isRemoving === next.isRemoving &&
  prev.onShowOptions === next.onShowOptions &&
  prev.listFade === next.listFade
))
