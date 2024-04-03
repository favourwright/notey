import { View } from 'react-native'

type Props = {
  className?: string
  padding?: string
  color?: string
  height?: string
}
const Seperator = ({
  padding='px-5',
  color='bg-gray-200',
  className,
  height='h-px',
}:Props) => {
  return (
    <View className={`w-full ${padding} ${className}`}>
      <View className={`w-full ${height} ${color}`} />
    </View>
  )
}

export default Seperator