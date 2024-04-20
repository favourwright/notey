import { Pressable, View, Text, useWindowDimensions } from 'react-native'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Octicons from '@expo/vector-icons/Octicons';
import Animated, { interpolateColor, SharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { SpringConfig } from 'react-native-reanimated/lib/typescript/reanimated2/animation/springUtils';

type Props = {
  slidesCount: number
  currentIndex: SharedValue<number>
  onPrev: (first:boolean)=>void
  onNext: (finished:boolean)=>void
  x: SharedValue<number>
}

const ActionBtns = ({slidesCount,currentIndex,onPrev,onNext,x}: Props) => {
  const { width:WIDTH } = useWindowDimensions()

  const animatedColor = useAnimatedStyle(()=>{
    const backgroundColor = interpolateColor(
      x.value,
      [0, WIDTH, WIDTH*2],
      ['#131313', '#FE6902']
    )
    return { backgroundColor }
  })
  const animatedLeftBtnStyle = useAnimatedStyle(()=>{
    return {
      transform: [{
        translateX: currentIndex.value===0 ?
          withSpring(-100) : withSpring(0)
      }]
    }
  })
  const animatedRightBtnStyle = useAnimatedStyle(()=>{
    return {
      width: currentIndex.value===slidesCount-1 ?
        withSpring(130, { duration: 1500, damping: 20, velocity:500 } as SpringConfig) :
        withSpring(80, { duration: 2000 } as SpringConfig)
    }
  })
  const animatedArrowStyle = useAnimatedStyle(()=>{
    return {
      opacity: currentIndex.value===slidesCount-1 ?
        withSpring(0) :
        withSpring(1),
      transform: [{
        translateX: currentIndex.value===slidesCount-1 ?
          withSpring(50) :
          withSpring(0)
      }]
    }
  })
  const animatedTextStyle = useAnimatedStyle(()=>{
    return {
      opacity: currentIndex.value===slidesCount-1 ?
        withSpring(1) :
        withSpring(0),
      transform: [{
        translateX: currentIndex.value===slidesCount-1 ?
          withSpring(0) :
          withSpring(50)
      }]
    }
  })

  return (
    <View className='flex-row justify-between'>
      <Pressable onPress={()=>onPrev(currentIndex.value===0)}>
        <Animated.View
          style={animatedLeftBtnStyle}
          className='h-16 w-20 bg-primary/10 rounded-xl items-center justify-center'>
          <FontAwesome6 name="arrow-left-long" size={24} color="black" />
        </Animated.View>
      </Pressable>

      <Pressable
        onPress={()=>onNext(currentIndex.value===slidesCount-1)}
        className='overflow-hidden'>
        <Animated.View
          style={[animatedColor, animatedRightBtnStyle]}
          className='gap-2 h-16 w-20 rounded-xl items-center justify-center'>
          <Animated.View style={animatedArrowStyle}>
            <FontAwesome6 name="arrow-right-long" size={24} color="white" />
          </Animated.View>

          <Animated.View
            style={animatedTextStyle}
            className='flex-row absolute gap-2'>
            <Text className='text-black font-bold text-2xl'>Finish</Text>
            <Octicons name="check" size={26} color="black" />
          </Animated.View>
        </Animated.View>
      </Pressable>
    </View>
  )
}

export default ActionBtns