import AsyncStorage from "@react-native-async-storage/async-storage";

export type SlideType = {
  id: string;
  animation: string;
  title: string;
  description: string;
  Component?: () => JSX.Element;
};

export type OnboardingRecord = {
  isOnboardingCompleted: boolean
  username: string
  startNewNotesWithTemplate: boolean
}

const STORE_KEY = '@notes-app-x/onboarding'

export const checkOnboardingSeen = async () => {
  try {
    const record = await getOnboardingRecords()
    return record.isOnboardingCompleted
  } catch (e) {
    console.log({'error': e});
  }
}
export const setOnboardingSeen = async () => {
  try {
    const record = await getOnboardingRecords()
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify({...record, isOnboardingCompleted: true}));
  } catch (e) {
    console.log({'error': e});
  }
}

export const getUsername = async () => {
  try {
    const record = await getOnboardingRecords()
    return record.username
  } catch (e) {
    console.log({'error': e});
  }
}
export const setUsername = async (username:string) => {
  try {
    const record = await getOnboardingRecords()
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify({...record, username}));
  } catch (e) {
    console.log({'error': e});
  }
}

export const shouldStartNewNotesWithTemplate = async () => {
  try {
    const record = await getOnboardingRecords()
    return record.startNewNotesWithTemplate
  } catch (e) {
    console.log({'error': e});
  }
}
export const setStartNewNotesWithTemplate = async (startNewNotesWithTemplate:boolean) => {
  try {
    const record = await getOnboardingRecords()
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify({...record, startNewNotesWithTemplate}));
  } catch (e) {
    console.log({'error': e});
  }
}

export const getOnboardingRecords = async ():Promise<OnboardingRecord> => {
  try {
    const value = await AsyncStorage.getItem(STORE_KEY);
    if (value === null) return {
      isOnboardingCompleted: false,
      username: null,
      startNewNotesWithTemplate: true
    } as OnboardingRecord
    return JSON.parse(value) as OnboardingRecord
  } catch(e) {
    console.log({onboardingRecordFetchErr: e})
  }
}

export const clearOnboardingRecords = async () => {
  try {
    await AsyncStorage.removeItem(STORE_KEY)
  } catch (e) {
    console.log({'error': e});
  }
}