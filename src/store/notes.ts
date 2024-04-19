import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCategoryById, type NoteCategoryType } from './categories';

const STORE_KEY = '@notes-app-x/notes'
export type NoteType = {
  id: string,
  title: string,
  content: string,
  categoryId: string,
  category?: NoteCategoryType,
  createdAt: Date,
  updatedAt: Date,
  // consider a sorting key
}

// sample grocery list
export const sampleTemplate: string[] = [
  "Meat 🍖 - ₦3,000",
  "- Vegetables 🥦 - ₦500",
  "● Cucumber 🥒 - ₦1,000",
  "Beans x4 - ₦400",
  "Eggs 🥚 ₦3,600",
  "Garri ₦1000",
  "- Onions 🧅 - ₦900",
]

export const saveNote = async (payload:NoteType) => {
  try {
    const previousNotes = await getAllNotes()
    // check if note already exists
    const excludExistingNote = previousNotes.filter(note => note.id !== payload.id)
    const newNotes = [payload, ...excludExistingNote]
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify(newNotes))
  } catch (e) {
    console.log({SaveNoteError: e})
  }
};

export const getAllNotes = async () => {
  try {
    const value = await AsyncStorage.getItem(STORE_KEY);
    if (value === null) return []
    const notes = JSON.parse(value) as NoteType[]
    // prefill category details
    const categories = await Promise.all(notes.map(note => getCategoryById(note.categoryId)))
    return notes.map((note, index) => ({...note, category: categories[index]}))
  } catch (e) {
    console.log({GetAllNotesError: e})
  }
}

export const getNoteById = async (noteId:string) => {
  try {
    const value = await AsyncStorage.getItem(STORE_KEY);
    if (value === null) return null
    const notes = JSON.parse(value) as NoteType[]
    const note = notes.find(note => note.id === noteId)
    // prefill category details
    const category = await getCategoryById(note?.categoryId || '')
    return {...note, category}
  } catch (e) {
    console.log({GetNoteByIdError: e})
  }
}

export const clearAllNotes = async () => {
  try {
    await AsyncStorage.removeItem(STORE_KEY);
  } catch (e) {
    console.log({ClearAllNotesError: e})
  }
}

export const deleteNote = async (noteId:string) => {
  try {
    const previousNotes = await getAllNotes()
    const newNotes = previousNotes.filter(note => note.id !== noteId)
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify(newNotes))
  } catch (e) {
    console.log({DeleteNoteError: e})
  }
}

// Regular expressions
export const quantityPattern = /[x|X|*](\d+)/;
export const pricePattern = /([$#€¥£₽\₩N₦])(\d+)([,]?(\d+)?(\.\d+|\$\d+)?)*/; // Separated pattern for price
export const itemRegex = /(○|-)? (.+) - \$([0-9]+(\.[0-9]+)?)?/g;

// Function to process the grocery list string
export const priceAndQuantityExtractor = (groceryListString:string) => {
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

export const processNoteContent = (content:string) => {
  // Process the grocery list string
  const data = {
    totalCost: 0,
    currencySymbol: '#',
  }
  const processedList = priceAndQuantityExtractor(content);
  const eachItemCost = processedList.map((item) => {
    return useNumberFromMixedString((item.price as string) || '') * item.quantity
  }).filter(Boolean)
  const totalCost = eachItemCost.reduce((a, b) => a + b, 0)
  data.totalCost = totalCost
  // get currency symbol
  if (!content) return data
  const currencySymbol = content.match(pricePattern)?.[0].charAt(0)
  data.currencySymbol = currencySymbol
  return data
}