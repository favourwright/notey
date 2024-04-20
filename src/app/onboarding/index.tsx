import { View, Text, TextInput, Switch, Pressable, FlatList, ViewToken } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { clearAllCategories, getAllCategories, NoteCategoryType, saveCategory } from '@/store/categories'
import uuid from 'react-native-uuid';
import { SlideType } from '@/store/onboarding'
import Animated, { useAnimatedRef, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import Slide from '@/components/onboarding/Slide'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Octicons from '@expo/vector-icons/Octicons';
import Pagination from '@/components/onboarding/Pagination'

// add some defaults
const defaultCategories:NoteCategoryType[] = [
  {
    id: uuid.v4() as string,
    name: 'grocery',
    isDefault: true,
  },
  {
    id: uuid.v4() as string,
    name: 'articles',
    isDefault: true,
  },
  {
    id: uuid.v4() as string,
    name: 'personal',
    isDefault: true,
  },
]

// onboarding slides
const slides: SlideType[] = [
  {
    id: '1',
    animation: require('@/assets/lottie/girl.json'),
    title: '8.93+ million apps yet we got to meet!',
    description: 'This is a simple note taking app that allows you to create, edit and delete notes.',
    Component: ()=> {
      return (
        <View className='mt-10'>
          <View className='gap-2'>
            <Text className='text-2xl text-gray-800'>Whats should we call you in these streets?</Text>
            <TextInput
              autoFocus
              placeholder='Favour'
              maxLength={16}
              autoComplete='username'
              className='self-start border-4 border-primary/80 min-w-40 bg-primary/70 text-white
              rounded-xl p-2 px-3 text-3xl font-bold placeholder:text-white/40'
            />
          </View>
        </View>
      )
    }
  },
  {
    id: '2',
    animation: require('@/assets/lottie/astro.json'),
    title: 'Your imagination; your only limit',
    description: 'You can create categories to help you organize your notes.',
    Component: ()=> {
      const [withTemplate, setWithTemplate] = useState(true)

      return (
        <View className='mt-10'>
          <View className='gap-3'>
            <View className='flex-row flex-wrap gap-2'>
              <View><Text className='text-3xl'>🔐</Text></View>
              <View className='flex-1'>
                <Text className='text-2xl text-gray-800 font-medium'>Complete Privacy</Text>
                <Text className='text-lg text-gray-500 leading-tight'>Your notes are totally private to you and your device</Text>
              </View>
            </View>
            <View className='flex-row flex-wrap gap-2 items-start'>
              <View><Text className='text-3xl'>📒</Text></View>
              <View className='flex-1'>
                <Text className='text-2xl text-gray-800 font-medium'>New notes</Text>
                <Text className='text-lg text-gray-500 leading-tight'>Always create new notes with instructional template? (updateable later)</Text>
              </View>
              <Switch
                value={withTemplate}
                onValueChange={setWithTemplate}
                thumbColor='white'
                trackColor={{true: '#000'}}
              />
            </View>
          </View>
        </View>
      )
    }
  },
]

const Onboarding = () => {
  const { navigate } = useRouter()
  const { top, bottom } = useSafeAreaInsets()
  const flatlistRef = useAnimatedRef<FlatList<SlideType>>()
  const flatlistIndex = useSharedValue(0)
  const appName = process.env.EXPO_PUBLIC_APP_NAME

  // if this is the first time this app is being opened, it means
  // the app has no default categories, so we'll check and create some
  const setDefaultCategories = useCallback(async () => {
    const cats = await getAllCategories()
    if(cats?.length) return
    await saveCategory(defaultCategories[0])
    await saveCategory(defaultCategories[1])
    await saveCategory(defaultCategories[2])
  }, []);
  useEffect(()=>{
    clearAllCategories() // remove when done
    setDefaultCategories()
  },[])
  
  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem('@notes-app-x/onboardingViewed', 'true');
      navigate('/')
    } catch (e) {
      console.log({'error': e});
    }
  }

  const handleNext = useCallback((index:number) => {
    if(index === slides.length - 1) {
      console.log('finished onboarding')
      finishOnboarding()
    }
  },[])

  const x = useSharedValue(0)
  const onScroll = useAnimatedScrollHandler({
    onScroll: ({contentOffset}) => {
      x.value = contentOffset.x
    }
  })
  const onViewableItemsChanged = ({viewableItems}:{viewableItems:ViewToken[]}) => {
    if(viewableItems[0].index !== null) {
      flatlistIndex.value = viewableItems[0].index
    }
  }

  return (
    <View className='flex-1 items-center relative'>
      <StatusBar style='light' backgroundColor='white' />
      <Text
        style={{top,fontFamily: 'CoveredByYourGrace_400Regular'}}
        className='text-3xl text-white absolute z-10 font-bold'>
        {appName}
      </Text>
      <Animated.FlatList
        ref={flatlistRef}
        data={slides}
        keyExtractor={item => item.id}
        renderItem={({item,index}) => <Slide
          slide={item}
          index={index}
          x={x}
        />}
        onScroll={onScroll}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          minimumViewTime: 300,
          viewAreaCoveragePercentThreshold: 10
        }}
      />

      <View style={{paddingBottom:bottom}} className='self-stretch px-5 pt-3'>
        <View className='flex-row justify-between'>
          <Pressable
            disabled
            className='p-4 px-7 bg-primary/10 rounded-xl'>
            <FontAwesome6 name="arrow-left-long" size={24} color="black" />
          </Pressable>

          <Pressable
            onPress={finishOnboarding}
            className='flex-row gap-2 p-4 px-7 bg-accent rounded-xl items-center'>
            {/* <FontAwesome6 name="arrow-right-long" size={24} color="white" /> */}
            <Text className='text-black font-bold text-xl'>Finish</Text>
            <Octicons name="check" size={24} color="black" />
          </Pressable>
        </View>

        <Pagination count={slides.length} x={x} />
      </View>
    </View>
  )
}

export default Onboarding