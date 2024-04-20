import AsyncStorage from '@react-native-async-storage/async-storage';

const STORE_KEY = '@notes-app-x/categories'
export type NoteCategoryType = {
  id: string,
  name: string,
  isDefault?:boolean
}
export enum CategoryActionModes {
  EDIT = 'edit',
  SELECT = 'select'
}
export const saveCategory = async (payload:NoteCategoryType) => {
  try {
    const previousCategories = await getAllCategories()
    const newCategories = previousCategories?.length ? [payload, ...previousCategories] : [payload]
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify(newCategories))
  } catch (e) {
    console.log({SaveCategoryError: e})
  }
};

export const getAllCategories = async () => {
  try {
    const value = await AsyncStorage.getItem(STORE_KEY);
    if (value === null) return []
    const cats = JSON.parse(value) as NoteCategoryType[]
    // fix attempt on a one-time error were there was duplicate categories
    return Array.from(new Set(cats.map(cat => cat.id))).map(id => cats.find(cat => cat.id === id))
  } catch (e) {
    console.log({GetAllCategoriesError: e})
  }
}

export const getCategoryById = async (categoryId:string) => {
  try {
    const value = await AsyncStorage.getItem(STORE_KEY);
    if (value === null) return null
    const categories = JSON.parse(value) as NoteCategoryType[]
    return categories.find(category => category.id === categoryId)
  } catch (e) {
    console.log({GetCategoryByIdError: e})
  }
}

export const deleteCategory = async (categoryId:string) => {
  try {
    const previousCategories = await getAllCategories()
    const newCategories = previousCategories.filter(category => category.id !== categoryId)
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify(newCategories))
  } catch (e) {
    console.log({DeleteCategoryError: e})
  }
}

export const clearAllCategories = async () => {
  try {
    await AsyncStorage.removeItem(STORE_KEY)
  } catch (e) {
    console.log({ClearAllCategoriesError: e})
  }
}