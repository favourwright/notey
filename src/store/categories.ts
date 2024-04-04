import AsyncStorage from '@react-native-async-storage/async-storage';

const STORE_KEY = '@notes-app-x/categories'
export type NoteCategoryType = {
  id: string,
  name: string,
}
export const saveCategory = async (payload:NoteCategoryType) => {
  try {
    const previousCategories = await getAllCategories()
    const newCategories = [...previousCategories, payload]
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify(newCategories))
  } catch (e) {
    console.log({SaveCategoryError: e})
  }
};

export const getAllCategories = async () => {
  try {
    const value = await AsyncStorage.getItem(STORE_KEY);
    if (value !== null) return []
    return JSON.parse(value) as NoteCategoryType[]
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