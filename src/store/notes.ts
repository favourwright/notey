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