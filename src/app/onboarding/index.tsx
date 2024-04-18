import { View, Text } from 'react-native'
import React, { useCallback, useEffect } from 'react'
import { useRouter } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { clearAllCategories, getAllCategories, NoteCategoryType, saveCategory } from '@/store/categories'
import uuid from 'react-native-uuid';

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

const Onboarding = () => {
  const { navigate } = useRouter()

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

  return (
    <View className='flex-1 justify-center items-center'>
      <Text onPress={finishOnboarding}>onboarding</Text>
    </View>
  )
}

export default Onboarding