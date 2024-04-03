import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useLayoutEffect, useState } from 'react';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import Colors from '@/constants/Colors';
import { StatusBar } from 'expo-status-bar';
import Seperator from '@/components/Seperator';

// Regular expressions
const quantityPattern = /[x|X|*](\d+)/;
const pricePattern = /(\$|\#)\d+\.\d+|\$\d+/; // Separated pattern for price
const itemRegex = /(○|-)? (.+) - \$([0-9]+(\.[0-9]+)?)?/g;

// Function to process the grocery list string
const processGroceryList = (groceryListString:string) => {
  // Split the string into a list by newlines
  const groceryList = groceryListString.split("\n");

  // Process each item to extract data
  return groceryList.map((item) => {
    const itemName = item.replace(itemRegex, "$1"); // Extract item name
    const quantityMatch = item.match(quantityPattern);
    const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
    const numbers = item.match(pricePattern) || [0]; // Match only price pattern
    return { itemName, quantity, price: numbers[0] };
  });
};

export const useNumberFromMixedString = (string: string)=> {
  return Number(string.replace(/[^0-9.-]+/g, ''))
}

const NewNote = () => {
  const navigation = useNavigation()
  const { navigate } = useRouter()
  const params = useLocalSearchParams()

  const hasNoteId = params.noteId !== 'undefined'

  const [title, setTitle] = useState('Shopping List')
  const [content, setContent] = useState(`
    ○  Milk - $4.50
    ○  Eggs x12 - $3.00
    ○  Bread x2 - $2.00
    ○  Butter - $1.50
    ○  Cheese x2 - $5.00

    ---

    Milk - $4.50
    Eggs x12 - $3.00
    Bread x2 - $2.00
    Butter - $1.50
    Cheese x2 - $5.00

    ---

    - Milk - $4.50
    - Eggs x12 - $3.00
    - Bread x2 - $2.00
    - Butter - $1.50
    - Cheese x2 - $5.00
  `)
  const [detectedTotalCost, setDetectedTotalCost] = useState(0)
  const [detectedCurrencySymbol, setDetectedCurrencySymbol] = useState('#')

  useEffect(()=>{
    // Process the grocery list string
    const processedList = processGroceryList(content);
    const eachItemCost = processedList.map((item) => {
      return useNumberFromMixedString((item.price as string) || '') * item.quantity
    }).filter(Boolean)
    const totalCost = eachItemCost.reduce((a, b) => a + b, 0)
    setDetectedTotalCost(totalCost)
    // get currency symbol
    const currencySymbol = content.match(pricePattern)?.[0].charAt(0)
    setDetectedCurrencySymbol(currencySymbol || '#')
  }, [content])
  
  useLayoutEffect(() => {
    navigation.setOptions({
      title: null,
      headerLeft: () => (
        <TouchableOpacity activeOpacity={.8} onPress={() => navigation.goBack()}>
          <Entypo name="chevron-thin-left" size={23} color={Colors.dark.background} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity activeOpacity={.8} onPress={() => navigate('/undefined')}>
          <Text className='text-2xl'>{!hasNoteId ? 'save' : 'update'}</Text>
        </TouchableOpacity>
      ),
      headerShadowVisible: false,
    })
  }, [navigation])

  return (
    <View className='flex-1 bg-white'>
      <StatusBar style='dark' />
      <Seperator className='mt-1' color='bg-gray-500' height='h-0.5' />
      
      <View className='h-full flex-1'>
        <View className='flex-row justify-between px-5 mt-4'>
          <Text className='text-gray-400'>18 / 11 / 22</Text>
          <Text className='text-gray-400'>#work</Text>
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
              {detectedTotalCost.toFixed(2)}
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