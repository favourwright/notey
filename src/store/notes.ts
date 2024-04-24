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