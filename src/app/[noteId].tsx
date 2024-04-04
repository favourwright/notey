import { View, Text, TouchableOpacity, ScrollView, TextInput, Pressable } from 'react-native'
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { format } from "date-fns";
import { getNoteById, saveNote, type NoteType } from '@/store/notes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Seperator from '@/components/Seperator';
import Colors from '@/constants/Colors';
import Feather from '@expo/vector-icons/Feather';
import uuid from 'react-native-uuid';

// Regular expressions
const quantityPattern = /[x|X|*](\d+)/;
const pricePattern = /(\$|\#|N)(\d+)[,]?(\d+)?(\.\d+|\$\d+)?/; // Separated pattern for price
const itemRegex = /(○|-)? (.+) - \$([0-9]+(\.[0-9]+)?)?/g;

// Function to process the grocery list string
const processGroceryList = (groceryListString:string) => {
  // Split the string into a list by newlines
  const groceryList = groceryListString?.split("\n");

  // Process each item to extract data
  return (groceryList || []).map((item) => {
    const itemName = item.replace(itemRegex, "$1"); // Extract item name
    const quantityMatch = item.match(quantityPattern);
    const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
    const numbers = item.match(pricePattern) || [0]; // Match only price pattern
    return { itemName, quantity, price: numbers[0] };
  });
};

// used to extract number from mixed string
export const useNumberFromMixedString = (string: string)=> {
  return Number(string.replace(/[^0-9.-]+/g, ''))
}

const sampleGroceryList = [
  "Meat 🍖 - #3,000",
  "- Vegetables 🥦 - #500",
  "● Cucumber 🥒 - $1,000",
  "Beans x4 - #400",
  "Eggs 🥚 #3,600",
  "Garri #1000",
  "- Onions 🧅 - #900",
]

const NewNote = () => {
  const navigation = useNavigation()
  const params = useLocalSearchParams()
  const hasNoteId = params.noteId !== 'undefined'
  const { bottom } = useSafeAreaInsets()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [detectedTotalCost, setDetectedTotalCost] = useState(0)
  const [detectedCurrencySymbol, setDetectedCurrencySymbol] = useState('#')

  // set some guide default values
  useEffect(()=>{
    if(hasNoteId) return
    setTitle('Sample shopping List')
    setContent(sampleGroceryList.join('\n'))
  },[])

  // fetch note details if noteId is available
  useEffect(() => {
    // get note details
    if (!hasNoteId) return
    (async () => {
      const note = await getNoteById(params.noteId as string || '')
      if (!note) return
      setTitle(note.title)
      setContent(note.content)
    })()
  },[])

  useEffect(()=>{
    // Process the grocery list string
    const processedList = processGroceryList(content);
    const eachItemCost = processedList.map((item) => {
      return useNumberFromMixedString((item.price as string) || '') * item.quantity
    }).filter(Boolean)
    const totalCost = eachItemCost.reduce((a, b) => a + b, 0)
    setDetectedTotalCost(totalCost)
    // get currency symbol
    if (!content) return
    const currencySymbol = content.match(pricePattern)?.[0].charAt(0)
    setDetectedCurrencySymbol(currencySymbol || '#')
  }, [content])
  
  useLayoutEffect(() => {
    navigation.setOptions({
      title: null,
      headerLeft: () => (
        <TouchableOpacity activeOpacity={.8} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={26} color={Colors.dark.background} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity activeOpacity={.8} onPress={handleSaveNote}>
          <Text className='text-2xl'>{!hasNoteId ? 'save' : 'update'}</Text>
        </TouchableOpacity>
      ),
      headerShadowVisible: false,
    })
  }, [navigation, title, content])

  // handle saving / updating note
  const handleSaveNote = () => {
    let note:NoteType = {
      id: (hasNoteId ? params.noteId : uuid.v4()) as string,
      title,
      content,
      categoryId: 'grocery', // should be an id from the category store
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    saveNote(note)
    navigation.goBack()
  }

  return (
    <View className='flex-1 bg-white'>
      <StatusBar style='dark' backgroundColor='white' />
      <Seperator className='mt-1' color='bg-gray-500' height='h-0.5' />
      
      <View className='h-full flex-1'>
        <View className='flex-row justify-between px-5 mt-4'>
          <Text className='text-gray-400'>
            {format(new Date(), "dd / MM / yy")}
          </Text>
          <Text className='text-gray-400'>#grocery</Text>
        </View>
        <View className='flex-row justify-between items-center mt-2 px-5'>
          <TextInput
            value={title}
            onChangeText={setTitle}
            className='text-3xl py-2 flex-1'
            placeholder='Untitled Note'
            // selectionColor={Colors.dark.text}
          />
          {!!detectedTotalCost && <View className='pl-2 flex-row items-center'>
            <Text className='text-3xl text-accent'>{detectedCurrencySymbol}</Text>
            <Text className='text-3xl'>
              {detectedTotalCost.toLocaleString()}
            </Text>
          </View>}
        </View>
        <TextInput
          value={content}
          onChangeText={setContent}
          className='text-2xl text-gray-600 mt-2 flex-1 px-5'
          style={{textAlignVertical: "top"}}
          multiline={true}
          autoFocus={true}
          numberOfLines={1}
          // selectionColor={Colors.dark.text}
        />
      </View>
    </View>
  )
}

export default NewNote