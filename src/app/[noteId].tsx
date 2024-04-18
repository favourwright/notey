import { View, Text, TouchableOpacity, ScrollView, TextInput, Pressable, Alert } from 'react-native'
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
import ManageCategories from '@/components/ManageCategories';
import Toast from 'react-native-root-toast';
import * as Clipboard from 'expo-clipboard';
import { CategoryActionModes, getAllCategories, NoteCategoryType } from '@/store/categories';

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
  const [storedNoteId, setStoredNoteId] = useState<string|undefined>(undefined)
  const { bottom } = useSafeAreaInsets()

  const [note, setNote] = useState<NoteType>({
    id: '',
    title: '',
    content: '',
    categoryId: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  const [selectedCategory, setSelectedcategory] = useState<NoteCategoryType|null>(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  // used to track changes / dirtines of note
  const [savedNoteState, setSavedNoteState] = useState<Partial<NoteType>>({
    title: '',
    content: '',
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
      setSavedNoteState({
        title: 'Sample shopping List',
        content: sampleGroceryList.join('\n'),
      })
      isDirty.current = true;

      (async ()=>{
        // for categories
        const cats = await getAllCategories()
        if(cats.length) setSelectedcategory(cats[0])
      })()

      // focus on content input if noteId is not available
      setTimeout(()=>contentInputRef.current?.focus())
    }
  },[])

  // fetch note details if noteId is available
  useEffect(() => {
    // get note details
    if (!hasNoteId) return
    (async () => {
      const note = await getNoteById(params.noteId as string || '')
      if (!note) return
      setNote(note)
      setSavedNoteState({
        title: note.title,
        content: note.content,
      })
      setStoredNoteId(note.id)
      setSelectedcategory(note.category)
    })()
  },[])

  // used to process sum calculations
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
        <View className='w-28 flex-row justify-end'>
          <TouchableOpacity
            activeOpacity={.8}
            onPress={
              ()=>hasNoteId || storedNoteId ?
                handleDeleteNote(storedNoteId!) :
                handleSaveNote()
            }>
            <Text className='text-2xl'>{!hasNoteId && !storedNoteId  ? 'save' : 'delete'}</Text>
          </TouchableOpacity>
        </View>
      ),
      headerShadowVisible: false,
    })
  }, [navigation, note.title, note.content, storedNoteId])

  const isDirty = useRef<boolean>()
  const checkIfDirty = ({oldValue, newValue}:{oldValue:string,newValue:string}) => {
    return oldValue !== newValue
  }

  const handleInputChange = ({field,value}:{field:'title'|'content',value:string}) => {
    isDirty.current = false
    if(field==='title') setNote({...note, title: value})
    if(field==='content') setNote({...note, content: value})

    // check dirtiness
    isDirty.current = checkIfDirty({
      oldValue: field==='title' ? savedNoteState.title : savedNoteState.content,
      newValue: value
    })
  }

  // handle saving / updating note
  const handleSaveNote = () => {
    saveNote({
      ...note,
      updatedAt: new Date()
    })
    setSavedNoteState({
      title: note.title,
      content: note.content,
    })
    isDirty.current = false
    setStoredNoteId(note.id)
  }
  const handleDeleteNote = async (id:string) => {
    Alert.alert('Confirm note delete', null, [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {text: 'OK', onPress: async () => {
        // delete note
        await deleteNote(id)
        navigation.goBack()
      }},
    ]);
  }
  const handleCategoryUpdate = (cat:NoteCategoryType)=>{
    setSelectedcategory(cat);
    setNote({...note, categoryId: cat.id})
    isDirty.current = true
  }

  const handleCopyTotalCost = async () =>{
    await Clipboard.setStringAsync(detectedTotalCost.toLocaleString());
    
    Toast.show('Cost Copied', {
      duration: Toast.durations.SHORT,
      backgroundColor: '#C9C9C9',
      shadow: false,
      textColor: 'black',
      containerStyle: {
        borderRadius: 14,
        padding: 10,
      }
    });
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
          <Text
            onPress={()=>setIsCategoryModalOpen(true)}
            className='text-gray-400'>
            #{selectedCategory?.name || 'grocery'}
          </Text>
        </View>
        <View className='flex-row justify-between items-center mt-2 px-5'>
          <TextInput
            value={note.title}
            onChangeText={(value) => handleInputChange({field:'title', value})}
            className='text-3xl py-2 flex-1'
            placeholder='untitled Note'
          />
          {!!detectedTotalCost && <Pressable
            onPress={handleCopyTotalCost}
            className='pl-2 flex-row items-center'>
            <Text className='text-3xl text-accent'>{detectedCurrencySymbol}</Text>
            <Text className='text-3xl'>
              {detectedTotalCost.toLocaleString()}
            </Text>
          </Pressable>}
        </View>
        <TextInput
          ref={contentInputRef}
          value={note.content}
          onChangeText={(value) => handleInputChange({field:'content', value})}
          className='text-2xl text-gray-600 mt-2 flex-1 px-5'
          style={{textAlignVertical: "top"}}
          multiline={true}
          numberOfLines={1}
        />
        {isDirty.current && <Pressable
          onPress={handleSaveNote}
          style={{elevation: 5}}
          className={`absolute bottom-10 right-5 flex-row self-end justify-center items-center gap-2
          bg-accent mt-2 px-5 py-3 rounded-full shadow-lg shadow-primary/20`}>
          <Entypo name="save" size={20} className='!text-black/70' />
          <Text className='text-2xl text-black/70'>
            {!hasNoteId && !storedNoteId ? 'save' : 'update'}
          </Text>
        </Pressable>}
      </View>
      <ManageCategories
        mode={CategoryActionModes.SELECT}
        onCategorySelect={handleCategoryUpdate}
        activeCategory={selectedCategory}
        isOpen={[isCategoryModalOpen, setIsCategoryModalOpen]}
      />
    </View>
  )
}

export default NewNote