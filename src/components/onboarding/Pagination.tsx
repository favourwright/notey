import { useWindowDimensions, View } from "react-native"
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated"

type Props = {
  count: number
  x: SharedValue<number>
  className?:string
}

const Pagination = ({count,x,className}: Props) => {
  return (
    <View className={`flex-row justify-center gap-3 mt-6 ${className}`}>
      {Array.from({length: count}).map((_,i)=>(
        <Dot key={i} index={i} x={x} />
      ))}
    </View>
  )
}

const Dot = ({index,x}: {index:number,x:SharedValue<number>}) => {
  const { width:WIDTH } = useWindowDimensions()
  const animatedDotStyle = useAnimatedStyle(()=>{
    const opacity = interpolate(
      x.value,
      [(index-1)*WIDTH, index*WIDTH, (index+1)*WIDTH],
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    )
    const widthAnim = interpolate(
      x.value,
      [(index-1)*WIDTH, index*WIDTH, (index+1)*WIDTH],
      [10, 30, 10],
      Extrapolation.CLAMP
    )
    return { opacity, width: widthAnim }
  })

  return (
    <Animated.View
      style={animatedDotStyle}
      className='h-2.5 w-2.5 rounded-full bg-primary'
    />
  )
}

export default Pagination