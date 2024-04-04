import { View, Text, TouchableOpacity, ScrollView, TextInput, Pressable } from 'react-native'
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { format } from "date-fns";
import { getNoteById, saveNote, deleteNote, type NoteType } from '@/store/notes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Seperator from '@/components/Seperator';
import Colors from '@/constants/Colors';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';
import uuid from 'react-native-uuid';

// Regular expressions
const quantityPattern = /[x|X|*](\d+)/;
const pricePattern = /([$#€¥£₽\₩N₦])(\d+)([,]?(\d+)?(\.\d+|\$\d+)?)*/; // Separated pattern for price
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

  const [note, setNote] = useState<NoteType>({
    id: '',
    title: '',
    content: '',
    categoryId: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  const [detectedTotalCost, setDetectedTotalCost] = useState(0)
  const [detectedCurrencySymbol, setDetectedCurrencySymbol] = useState('#')

  const contentInputRef = useRef<TextInput>(null)
  // set some guide default values
  useEffect(()=>{
    if(!hasNoteId) {
      setNote({
        id: uuid.v4() as string,
        title: 'Sample shopping List',
        content: sampleGroceryList.join('\n'),
        categoryId: 'grocery',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    // focus on content input if noteId is not available
    if(!hasNoteId) contentInputRef.current?.focus()
  },[])

  // fetch note details if noteId is available
  useEffect(() => {
    // get note details
    if (!hasNoteId) return
    (async () => {
      const note = await getNoteById(params.noteId as string || '')
      if (!note) return
      setNote(note)
    })()
  },[])

  useEffect(()=>{
    // Process the grocery list string
    const processedList = processGroceryList(note.content);
    const eachItemCost = processedList.map((item) => {
      return useNumberFromMixedString((item.price as string) || '') * item.quantity
    }).filter(Boolean)
    const totalCost = eachItemCost.reduce((a, b) => a + b, 0)
    setDetectedTotalCost(totalCost)
    // get currency symbol
    if (!note.content) return
    const currencySymbol = note.content.match(pricePattern)?.[0].charAt(0)
    setDetectedCurrencySymbol(currencySymbol || '#')
  }, [note.content])
  
  useLayoutEffect(() => {
    navigation.setOptions({
      title: null,
      headerLeft: () => (
        <TouchableOpacity activeOpacity={.8} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={26} color={Colors.dark.background} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity activeOpacity={.8} onPress={hasNoteId ? handleDeleteNote : handleSaveNote}>
          <Text className='text-2xl'>{!hasNoteId ? 'save' : 'delete'}</Text>
        </TouchableOpacity>
      ),
      headerShadowVisible: false,
    })
  }, [navigation, note.title, note.content])

  // handle saving / updating note
  const handleSaveNote = () => {
    saveNote({
      ...note,
      updatedAt: new Date()
    })
    navigation.goBack()
  }
  const handleDeleteNote = async () => {
    // delete note
    await deleteNote(params.noteId as string)
    navigation.goBack()
  }

  return (
    <View className='flex-1 bg-white'>
      <StatusBar style='dark' backgroundColor='white' />
      <Seperator className='mt-1' color='bg-gray-500' height='h-0.5' />
      
      <View className='h-full flex-1'>
        <View className='flex-row justify-between px-5 mt-4'>
          <Text className='text-gray-400'>
            {format(note.updatedAt, "dd / MM / yy")}
          </Text>
          <Text className='text-gray-400'>#grocery</Text>
        </View>
        <View className='flex-row justify-between items-center mt-2 px-5'>
          <TextInput
            value={note.title}
            onChangeText={(text) => setNote({...note, title: text})}
            className='text-3xl py-2 flex-1'
            placeholder='Untitled Note'
          />
          {!!detectedTotalCost && <View className='pl-2 flex-row items-center'>
            <Text className='text-3xl text-accent'>{detectedCurrencySymbol}</Text>
            <Text className='text-3xl'>
              {detectedTotalCost.toLocaleString()}
            </Text>
          </View>}
        </View>
        <TextInput
          ref={contentInputRef}
          value={note.content}
          onChangeText={(text) => setNote({...note, content: text})}
          className='text-2xl text-gray-600 mt-2 flex-1 px-5'
          style={{textAlignVertical: "top"}}
          multiline={true}
          numberOfLines={1}
        />
        <Pressable
          onPress={handleSaveNote}
          style={{elevation: 5}}
          className={`absolute bottom-10 right-5 flex-row self-end justify-center items-center gap-2
          bg-accent mt-2 px-5 py-3 rounded-full shadow-lg shadow-primary/20`}>
          {
          !hasNoteId ?
            <Entypo name="save" size={20} className='!text-black/70' /> :
            <Entypo name="edit" size={20} className='!text-black/70' />
          }
          <Text className='text-2xl text-black/70'>{!hasNoteId ? 'save' : 'update'}</Text>
        </Pressable>
      </View>
    </View>
  )
}

export default NewNote