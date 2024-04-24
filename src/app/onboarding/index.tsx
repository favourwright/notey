import { View, Text, TextInput, Switch, FlatList, ViewToken } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { clearAllCategories, getAllCategories, NoteCategoryType, saveCategory } from '@/store/categories'
import uuid from 'react-native-uuid';
import { setOnboardingSeen, SlideType, setUsername as setUsernameToStore, getUsername, clearOnboardingRecords, setStartNewNotesWithTemplate, shouldStartNewNotesWithTemplate } from '@/store/onboarding'
import Animated, { useAnimatedRef, useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import Slide from '@/components/onboarding/Slide'
import { StatusBar } from 'expo-status-bar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Pagination from '@/components/onboarding/Pagination'
import ActionBtns from '@/components/onboarding/ActionBtns'
import { debounce } from '@/constants/debounce'
import Toast from 'react-native-root-toast'
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { clearAllNotes, NoteType, saveNote, seedNotes } from '@/store/notes'

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
const setUsernameWithDebounced = debounce(setUsernameToStore, 500)
const slides: SlideType[] = [
  {
    id: '1',
    animation: require('@/assets/lottie/girl.json'),
    title: '8.93+ million apps yet we got to meet!',
    description: 'This is a simple note taking app that allows you to create, edit and delete notes.',
    Component: ()=> {
      const [username, setUsername] = useState('')
      // re-fill username onmount
      useEffect(()=>{
        (async ()=>{
          const username = await getUsername()
          if(username) setUsername(username)
        })()
      },[])

      // clearOnboardingRecords()
      const handleTextChange = (text:string) => {
        if(text.trim()==='') {
          setUsername(null)
          setUsernameWithDebounced(null)
          return
        }
        setUsername(text.trim())
        setUsernameWithDebounced(text)
      }
      return (
        <View className='mt-10'>
          <View className='gap-2'>
            <Text className='text-2xl text-gray-800'>Whats should we call you in these streets?</Text>
            <TextInput
              placeholder='name'
              maxLength={20}
              value={username}
              onChangeText={handleTextChange}
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
      // re-fill choice
      useEffect(()=>{
        (async ()=>{
          const val = await shouldStartNewNotesWithTemplate()
          setWithTemplate(val)
        })()
      },[])

      return (
        <View className='mt-10'>
          <View className='gap-3'>
            <View className='flex-row flex-wrap gap-2'>
              <View><Ionicons name="lock-closed" size={28} color="black" /></View>
              <View className='flex-1'>
                <Text className='text-2xl text-gray-800 font-medium'>Complete Privacy</Text>
                <Text className='text-lg text-gray-500 leading-tight'>Your notes are totally private to you and your device</Text>
              </View>
            </View>
            <View className='flex-row flex-wrap gap-2 items-start'>
              <View><MaterialCommunityIcons name="note-plus" size={28} color="black" /></View>
              <View className='flex-1'>
                <Text className='text-2xl text-gray-800 font-medium'>New notes</Text>
                <Text className='text-lg text-gray-500 leading-tight'>Always create new notes with instructional template? (updateable later)</Text>
              </View>
              <Switch
                value={withTemplate}
                onValueChange={(val)=>{
                  setWithTemplate(val);
                  setStartNewNotesWithTemplate(val)
                }}
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
  const { replace } = useRouter()
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

  const handlePrev = useCallback((first:boolean) => {
    if(first) return
    flatlistRef.current?.scrollToIndex({
      index: flatlistIndex.value - 1,
      animated: true
    })
  },[])
  const handleNext = useCallback(async (finished:boolean) => {
    const username = await getUsername()
    if(!username) {
      flatlistRef.current?.scrollToIndex({
        index: 0,
        animated: true
      })

      Toast.show('Tell us your name na. haba!', {
        duration: Toast.durations.SHORT,
        backgroundColor: '#C9C9C9',
        shadow: false,
        textColor: 'black',
        containerStyle: {
          borderRadius: 14,
          padding: 10,
        }
      });
      return
    }

    if(finished) {
      await setOnboardingSeen()
      replace('/')
      return
    }

    flatlistRef.current?.scrollToIndex({
      index: flatlistIndex.value + 1,
      animated: true
    })
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

  // seed some notes
  async function processItems(items:{title:string,content:string}[], asyncFunction:Function) {
    for (const item of items) {
      await asyncFunction(item);
    }
  }
  async function seedFn(item:{title:string,content:string}) {
    const seedNote:NoteType = {
      id: uuid.v4() as string,
      title: item.title,
      content: item.content,
      categoryId: '',
      createdAt: new Date,
      updatedAt: new Date,
    }
    await saveNote(seedNote)
  }
  useEffect(()=>{
    (async ()=>{
      await clearAllNotes()
      processItems(seedNotes, seedFn);
    })()
  }, [])

  return (
    <View className='flex-1 items-center relative'>
      <StatusBar style="light" />
      <Text
        className='text-3xl text-white absolute z-10 font-semibold'
        style={{top, fontFamily: 'CoveredByYourGrace_400Regular'}}>
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

      <View style={{paddingBottom:bottom}} className='self-stretch px-5 pt-2'>
        <ActionBtns
          slidesCount={slides.length}
          currentIndex={flatlistIndex}
          x={x}
          onPrev={handlePrev}
          onNext={handleNext}
        />
        <Pagination count={slides.length} x={x} className='mb-1' />
      </View>
    </View>
  )
}

export default Onboarding