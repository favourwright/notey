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
export type CatStoreType = {
  categories: NoteCategoryType[],
  activeCategory: NoteCategoryType,
}

export const saveCategory = async (payload:NoteCategoryType) => {
  try {
    const previousCategories = await getAllCategories()
    const newCategories = previousCategories?.length ? [payload, ...previousCategories] : [payload]
    const storeData:CatStoreType = {
      categories: newCategories,
      activeCategory: payload
    }
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify(storeData))
  } catch (e) {
    console.log({SaveCategoryError: e})
  }
};

export const getCatStoreData = async ():Promise<CatStoreType> => {
  try {
    const value = await AsyncStorage.getItem(STORE_KEY);
    if (value === null) return {
      categories: [],
      activeCategory: null
    }
    return JSON.parse(value) as CatStoreType
  } catch (e) {
    console.log({GetCatStoreDataError: e})
  }
}

export const getAllCategories = async () => {
  try {
    const store = await getCatStoreData()
    // fix attempt on a one-time error were there was duplicate categories
    return Array.from(new Set(store.categories
      .map(cat => cat.id)))
      .map(id => store.categories.find(cat => cat.id === id))
  } catch (e) {
    console.log({GetAllCategoriesError: e})
  }
}

export const getCategoryById = async (categoryId:string) => {
  try {
    const cats = await getAllCategories();
    if (!cats.length) return null
    return cats.find(category => category.id === categoryId)
  } catch (e) {
    console.log({GetCategoryByIdError: e})
  }
}

export const getActiveCategory = async () => {
  try {
    const store = await getCatStoreData()
    return store.activeCategory
  } catch (e) {
    console.log({GetActiveCategoryError: e})
  }
}
export const setActiveCategory = async (categoryId:string) => {
  try {
    const store = await getCatStoreData()
    const category = await getCategoryById(categoryId)
    store.activeCategory = category
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify(store))
  } catch (e) {
    console.log({SetActiveCategoryError: e})
  }
}

export const deleteCategory = async (categoryId:string) => {
  try {
    const previousCategories = await getAllCategories()
    const newCategories = previousCategories.filter(category => category.id !== categoryId)
    const newStoreData = await getCatStoreData()
    newStoreData.categories = newCategories
    // get active data and if it's the one being deleted, set active to null
    if (newStoreData.activeCategory?.id === categoryId) newStoreData.activeCategory = null
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify(newStoreData))
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