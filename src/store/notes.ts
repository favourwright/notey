import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import Toast from 'react-native-root-toast';
import { STORE_KEY as CAT_STORE_KEY, getCategoryById, getAllCategories, type NoteCategoryType, getCatStoreData, type CatStoreType } from './categories';
import Colors from '@/constants/Colors';

const STORE_KEY = '@notes-app-x/notes'
export const AUTO_SAVE_STATE_KEY = '@notes-app-x/autosave'
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

// Export data structure
export type ExportDataType = {
  notes: NoteType[],
  categories: NoteCategoryType[],
  categoryStore?: CatStoreType,
  version: string
}

// All notes live under one storage key, so every write reads the list, changes
// it and writes it back. Running writes one at a time stops them overwriting
// each other, and lets reads wait for any write that's still in progress.
let writeQueue: Promise<unknown> = Promise.resolve()
const enqueueWrite = <T>(task: () => Promise<T>): Promise<T> => {
  const run = writeQueue.then(task)
  writeQueue = run.catch(() => {})
  return run
}

// Throws if storage can't be read, so a failed read can never be mistaken for
// an empty list and then written back over the user's notes.
const readAllNotes = async () => {
  const value = await AsyncStorage.getItem(STORE_KEY);
  if (value === null) return []
  const notes = JSON.parse(value) as NoteType[]
  // prefill category details
  const categories = await getAllCategories()
  return notes.map(note => ({
    ...note,
    category: categories?.length ? categories.find(cat => cat.id === note.categoryId) : null,
  }))
}

export const saveNote = (payload:NoteType) => enqueueWrite(async () => {
  try {
    const previousNotes = await readAllNotes()
    // check if note already exists
    const excludExistingNote = previousNotes.filter(note => note.id !== payload.id)
    const newNotes = [payload, ...excludExistingNote]
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify(newNotes))
    return true
  } catch (e) {
    console.log({SaveNoteError: e})
    return false
  }
});

export const getAllNotes = async () => {
  try {
    await writeQueue
    return await readAllNotes()
  } catch (e) {
    console.log({GetAllNotesError: e})
  }
  return []
}

export const getNoteById = async (noteId:string) => {
  try {
    await writeQueue
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

export const setAutoSave = async (autoSaveEnabled:boolean) => {
  try {
    await AsyncStorage.setItem(AUTO_SAVE_STATE_KEY, JSON.stringify({autoSaveEnabled}))
  } catch (e) {
    console.log({SetAutoSaveError: e})
  }
}

export const getAutoSave = async () => {
  try {
    const value = await AsyncStorage.getItem(AUTO_SAVE_STATE_KEY);
    if (value === null) return true
    return JSON.parse(value).autoSaveEnabled
  } catch (e) {
    console.log({GetAutoSaveError: e})
  }
}

export const clearAllNotes = async () => {
  try {
    await AsyncStorage.removeItem(STORE_KEY);
  } catch (e) {
    console.log({ClearAllNotesError: e})
  }
}

export const deleteNote = (noteId:string) => enqueueWrite(async () => {
  try {
    const previousNotes = await readAllNotes()
    const newNotes = previousNotes.filter(note => note.id !== noteId)
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify(newNotes))
  } catch (e) {
    console.log({DeleteNoteError: e})
  }
})

// sample grocery list
export const sampleTemplate: string[] = [
  "Note: few symbols like the ones below can be used to represent currency (for price tracking).",
  "The first symbol found in the list will be used as the currency symbol above.",
  "",
  "Meat 🍖 - ₦3,000",
  "- Vegetables 🥦 - #500",
  "● Cucumber 🥒 - $1,000",
  "Beans X4 - N400",
  "Eggs 🥚 ×2 ₦3,600",
  "Garri ₦1000",
  "- Onions 🧅 - ₦900",
]

// Regular expressions
export const quantityPattern = /[x|X|×|*](\d+)/;
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

// EXPORT FUNCTIONALITY
export const exportData = async (): Promise<string | null> => {
  try {
    // Get all notes and categories
    const notes = await getAllNotes();
    const categories = await getAllCategories();
    const catStoreData = await getCatStoreData();
    
    // Create export data structure
    const exportData: ExportDataType = {
      notes: notes || [],
      categories: categories || [],
      categoryStore: catStoreData,
      version: '1.0.0' // Version your export format for future compatibility
    };
    
    // Convert to JSON string
    const jsonData = JSON.stringify(exportData, null, 2);
    
    // Create a temporary file
    const fileUri = `${FileSystem.cacheDirectory}notes-app-export-${Date.now()}.json`;
    await FileSystem.writeAsStringAsync(fileUri, jsonData);
    
    // Share the file
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Notes',
        UTI: 'public.json'
      });
      return fileUri;
    } else {
      console.log('Sharing is not available on this device');
      return null;
    }
  } catch (error) {
    console.error('Export error:', error);
    return null;
  }
};

// IMPORT FUNCTIONALITY
export const importData = async (): Promise<boolean> => {
  try {
    // Pick a document
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true
    });
    
    if (result.canceled) {
      return false;
    }
    
    // Read the file content
    const fileUri = result.assets[0].uri;
    const fileContent = await FileSystem.readAsStringAsync(fileUri);
    
    // Parse and validate the data
    const importedData = JSON.parse(fileContent) as ExportDataType & { categoryStore?: CatStoreType };
    
    if (!importedData.notes || !importedData.categories || !importedData.version) {
      throw new Error('Invalid import file format');
    }
    
    // Import categories using the category store structure
    if (importedData.categoryStore) {
      await AsyncStorage.setItem(CAT_STORE_KEY, JSON.stringify(importedData.categoryStore));
    } else {
      // Fallback for older exports that might not have categoryStore
      const catStoreData: CatStoreType = {
        categories: importedData.categories,
        activeCategory: importedData.categories.find(cat => cat.isDefault) || importedData.categories[0] || null
      };
      await AsyncStorage.setItem(CAT_STORE_KEY, JSON.stringify(catStoreData));
    }
    
    // Import notes
    const notesWithoutCategories = importedData.notes.map(note => {
      const { category, ...noteWithoutCategory } = note;
      return noteWithoutCategory;
    });
    
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify(notesWithoutCategories));
    
    return true;
  } catch (error) {
    console.error('Import error:', error);
    return false;
  }
};

// Helper to show toast messages for export/import operations
export const showOperationToast = (message: string, success: boolean = true) => {
  Toast.show(message, {
    duration: Toast.durations.SHORT,
    backgroundColor: success ? Colors.dark.accent : '#F28B82',
    shadow: false,
    textColor: 'black',
    containerStyle: {
      borderRadius: 14,
      padding: 10,
    }
  });
};

export const seedNotes = [
  // {
  //   "title": "Brain Dump",
  //   "content": "Jot down anything and everything swirling in your head. Ideas, worries, grocery list - get it all out!"
  // },
  // {
  //   "title": "Meeting Minutes - April 24",
  //   "content": "Capture key points, action items, and next steps from your meeting today."
  // },
  // {
  //   "title": "Book Ideas",
  //   "content": "Spark a new story! Write down plot twists, character sketches, or intriguing settings."
  // },
  // {
  //   "title": "Travel Itinerary - [Destination]",
  //   "content": "Plan your dream trip! List must-see sights, research restaurants, and jot down transportation details."
  // },
  // {
  //   "title": "Movie Night Picks",
  //   "content": "Feeling indecisive? Create a list of movies you or friends want to watch."
  // },
  // {
  //   "title": "DIY Project: [Project Name]",
  //   "content": "Unleash your inner crafter! Outline steps, materials needed, and inspiration sources."
  // },
  // {
  //   "title": "Fitness Goals",
  //   "content": "Set your sights on a healthier you! Write down goals, track progress, and celebrate milestones."
  // },
  // {
  //   "title": "Gratitude List",
  //   "content": "Take a moment to appreciate the good things! List things you're grateful for, big or small."
  // },
  // {
  //   "title": "Birthday Ideas - [Name]",
  //   "content": "Plan a memorable celebration! Brainstorm party themes, gift ideas, or fun activities."
  // },
  // {
  //   "title": "Language Learning - [Language]",
  //   "content": "Boost your vocabulary! Jot down new words you learn, create practice sentences, or track your progress."
  // },
  // {
  //   "title": "Song Lyrics (Unfinished)",
  //   "content": "Unleash your inner musician! Pen down lyrics, melodic ideas, or a theme for your next song."
  // },
  // {
  //   "title": "Quote of the Day",
  //   "content": "Find inspiration! Write down a quote that resonated with you and why it matters."
  // },
  // {
  //   "title": "Restaurant Reviews",
  //   "content": "Become a food critic! Rate restaurants you've visited, noting food quality, service, and ambiance."
  // },
  // {
  //   "title": "Gift Ideas - [Occasion]",
  //   "content": "Never be caught empty-handed again! Compile gift ideas for upcoming birthdays, holidays, or special occasions."
  // },
  {
    "title": "Tech Wishlist",
    "content": "Fuel your gadget lust! List the latest tech gadgets you're eyeing and research their features."
  },
  {
    "title": "Life Hacks",
    "content": "Simplify your life! Track down and record helpful tips and tricks you encounter."
  },
  {
    "title": "Funny Anecdote",
    "content": "Capture those laugh-out-loud moments! Write down a funny story to share later or simply relive the hilarity."
  },
  {
    "title": "Website Design Ideas",
    "content": "Brainstorm a website's layout! Sketch ideas, color schemes, and user interface elements."
  },
  {
    "title": "Random Dreams",
    "content": "Decode your subconscious! Write down interesting or strange dreams you have and analyze their potential meaning."
  },
  {
    "title": "Monday's grocery list",
    "content": sampleTemplate.join("\n")
  }
]