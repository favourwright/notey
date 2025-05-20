import { ScrollView, Text, useWindowDimensions, View } from 'react-native'
import { SlideType } from '@/store/onboarding'
import LottieView from 'lottie-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated'

type Props = {
  slide: SlideType
  index: number
  x: SharedValue<number>
  onNext: () => void
  onPrev: () => void
}

const Slide = ({
  slide,
  index,
  x,
  onNext,
  onPrev
}: Props) => {
  const { width:WIDTH } = useWindowDimensions()
  const { top } = useSafeAreaInsets()

  const lottieAnimationStyle = useAnimatedStyle(()=>{
    const translateYAnim = interpolate(
      x.value,
      [(index-1)*WIDTH, index*WIDTH, (index+1)*WIDTH],
      [300, 0, 300],
      Extrapolation.CLAMP
    )
    // const scaleAnim = interpolate(
    //   x.value,
    //   [(index-1)*WIDTH, index*WIDTH, (index+1)*WIDTH],
    //   [2, 1, 2],
    //   Extrapolation.CLAMP
    // )
    return { transform: [{ translateY: translateYAnim }] }
  })

  return (
    <View
      style={{width:WIDTH}}
      className='flex-1 justify-between'>
      <View
        className='bg-primary items-center justify-center flex-1 overflow-hidden'
        style={{paddingTop:top,width:WIDTH}}>
        <Animated.View style={lottieAnimationStyle}>
          <LottieView
            autoPlay
            loop
            source={slide.animation}
            style={{ width: WIDTH*0.8, height: WIDTH*0.8 }}
            resizeMode='contain'
          />
        </Animated.View>
      </View>

      <ScrollView className='flex-1'>
        <View className='px-6 py-6'>
          <Text
            className='text-[46px] text-left font-semibold text-gray-800 leading-none'
            style={{fontFamily: 'CoveredByYourGrace_400Regular'}}>
            {slide.title}
          </Text>
          {slide?.Component && <slide.Component onNext={onNext} onPrev={onPrev} />}
        </View>
      </ScrollView>
    </View>
  )
}

export default Slide