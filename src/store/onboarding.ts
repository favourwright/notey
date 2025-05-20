import AsyncStorage from "@react-native-async-storage/async-storage";

export type SlideType = {
  id: string;
  animation: string;
  title: string;
  description: string;
  Component?: (props: { onNext?: () => void; onPrev?: () => void }) => JSX.Element;
};

export type OnboardingRecord = {
  isOnboardingCompleted: boolean
  username: string
  startWithSampleNotes: boolean
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

export const shouldStartWithSampleNotes = async () => {
  try {
    const record = await getOnboardingRecords()
    return record.startWithSampleNotes
  } catch (e) {
    console.log({'error': e});
  }
}
export const setStartNewNotesWithTemplate = async (startWithSampleNotes:boolean) => {
  try {
    const record = await getOnboardingRecords()
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify({...record, startWithSampleNotes}));
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
      startWithSampleNotes: true
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