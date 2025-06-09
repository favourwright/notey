import { View, Text, TouchableOpacity, ScrollView, TextInput, Pressable, Alert, Keyboard, useWindowDimensions, KeyboardAvoidingView, Platform } from 'react-native'
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { format } from "date-fns";
import {
  getNoteById,
  saveNote,
  deleteNote,
  type NoteType,
  processNoteContent,
} from '@/store/notes';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Seperator from '@/components/Seperator';
import Colors from '@/constants/Colors';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';
import uuid from 'react-native-uuid';
import ManageCategories from '@/components/ManageCategories';
import Toast from 'react-native-root-toast';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { CategoryActionModes, getActiveCategory, getAllCategories, NoteCategoryType } from '@/store/categories';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useHeaderHeight } from '@react-navigation/elements'
import HeaderRight from '@/components/note/header/HeaderRight';
import { getAutoSave as getAutoSaveNotesPreference } from '@/store/notes';
import Textarea from '@/components/Textarea';

const NewNote = () => {
  const navigation = useNavigation()
  const params = useLocalSearchParams()
  const hasNoteId = params.noteId !== 'undefined'
  const [storedNoteId, setStoredNoteId] = useState<string|undefined>(undefined)
  const { bottom } = useSafeAreaInsets()
  const { width:screenWidth } = useWindowDimensions()
  const headerHeight = useHeaderHeight()

  function useDebounce<T extends (...args: any[]) => void>(
    func: T,
    wait = 500
  ): T {
    const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      return () => {
        if (timeout.current) clearTimeout(timeout.current);
      };
    }, []);

    return ((...args: any[]) => {
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        func(...args);
      }, wait);
    }) as T;
  }

  const [note, setNote] = useState<NoteType>({
    id: '',
    title: '',
    content: '',
    categoryId: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  const [selectedCategory, setSelectedcategory] = useState<NoteCategoryType|null>(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  // used to track changes / dirtines of note
  const [savedNoteState, setSavedNoteState] = useState<Partial<NoteType>>({
    title: '',
    content: '',
  })
  const [detectedTotalCost, setDetectedTotalCost] = useState(0)
  const [detectedCurrencySymbol, setDetectedCurrencySymbol] = useState('#')

  const contentInputRef = useRef<TextInput>(null)
  const scrollViewRef = useRef(null)
  // set some guide default values
  useEffect(()=>{
    if(!hasNoteId) {
      (async ()=>{
        const sample:NoteType = {
          id: uuid.v4() as string,
          title: '',
          content: '',
          categoryId: '', // will be updated later
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        isDirty.current = true;

        // for categories, first check if user has an actively selected category
        const activeCat = await getActiveCategory()
        if(activeCat) {
          setSelectedcategory(activeCat)
          setNote({...sample, categoryId: activeCat.id})
          setSavedNoteState({...sample, categoryId: activeCat.id})
          return
        }
        // if not, set the first category as the active category
        const cats = await getAllCategories()
        if(cats.length) setSelectedcategory(cats[0])
        setNote({...sample, categoryId: cats[0].id})
        setSavedNoteState({...sample, categoryId: cats[0].id})
      })()

      // focus on content input if noteId is not available
      setTimeout(()=>contentInputRef.current?.focus())
    }
  },[])

  // fetch note details if noteId is available
  useEffect(() => {
    // get note details
    if (!hasNoteId) return
    (async () => {
      const note = await getNoteById(params.noteId as string || '')
      if (!note) return
      setNote(note)
      setSavedNoteState({
        title: note.title,
        content: note.content,
        categoryId: note.categoryId,
      })
      setStoredNoteId(note.id)
      setSelectedcategory(note.category)
    })()
  },[])

  // used to process sum calculations
  useEffect(()=>{
    const { totalCost, currencySymbol } = processNoteContent(note.content)
    setDetectedTotalCost(totalCost)
    setDetectedCurrencySymbol(currencySymbol)
  }, [note.content])
  
  const isDirty = useRef<boolean>()
  const isTitleDirty = useRef<boolean>()
  const isActiveCategoryDirty = useRef<boolean>()
  const isSomethingDirty = useMemo(() => {
    return isDirty.current || isTitleDirty.current || isActiveCategoryDirty.current
  }, [isDirty.current, isTitleDirty.current, isActiveCategoryDirty.current])

  const checkIfDirty = ({oldValue, newValue}:{oldValue:string,newValue:string}) => {
    return oldValue !== newValue
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      title: null,
      headerStyle: { backgroundColor: Colors.dark.secondary },
      headerLeft: () => (
        <TouchableOpacity activeOpacity={.8} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={26} color={Colors.dark.primary} />
        </TouchableOpacity>
      ),
      headerRight: () => <HeaderRight
        noteStored={hasNoteId || !!storedNoteId}
        noteDirty={isSomethingDirty}
        handleSaveNote={handleSaveNote}
        handleDeleteNote={()=>handleDeleteNote(storedNoteId!)}
      />,
      headerShadowVisible: false,
    })
  }, [navigation, note.title, note.content, storedNoteId, isSomethingDirty])

  const handleInputChange = ({field,value}:{field:'title'|'content',value:string}) => {
    setNote(prev => {
      const updated = { ...prev, [field]: value }

      // Check dirtiness based on savedNoteState
      if (field === 'title') {
        isTitleDirty.current = checkIfDirty({
          oldValue: savedNoteState.title ?? '',
          newValue: value
        })
      }
      if (field === 'content') {
        isDirty.current = checkIfDirty({
          oldValue: savedNoteState.content ?? '',
          newValue: value
        })
      }

      debounceAutoSave(updated)
      return updated
    })
  }

  // handle saving / updating note
  const handleSaveNote = useCallback(() => {
    saveNote({ ...note, updatedAt: new Date() })
    setSavedNoteState({
      title: note.title,
      content: note.content,
      categoryId: note.categoryId,
    })
    isDirty.current = false
    isTitleDirty.current = false
    isActiveCategoryDirty.current = false
    setStoredNoteId(note.id)
  }, [note])

  // handle auto-saving
  const [isSaving, setIsSaving] = useState(false);
  const autoSave = useCallback(async (noteToSave: NoteType) => {
    const autoSaveOn = await getAutoSaveNotesPreference()
    if (!autoSaveOn) return

    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    saveNote({ ...noteToSave, updatedAt: new Date() })
    setSavedNoteState({
      title: noteToSave.title,
      content: noteToSave.content,
      categoryId: noteToSave.categoryId,
    })
    isDirty.current = false
    isTitleDirty.current = false
    isActiveCategoryDirty.current = false

    // Force a re-render to update the UI and animated values
    setNote(prevNote => ({ ...prevNote }))

    setStoredNoteId(noteToSave.id)
    setIsSaving(false)
  }, [])
  const debounceAutoSave = useDebounce(autoSave, 1000)

  const handleDeleteNote = async (id:string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    Alert.alert('Confirm note delete', null, [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {text: 'Delete', onPress: async () => {
        // delete note
        await deleteNote(id)
        navigation.goBack()
      }},
    ]);
  }
  const handleCategoryUpdate = (cat:NoteCategoryType)=>{
    setSelectedcategory(cat);
    setNote({...note, categoryId: cat.id})
    isActiveCategoryDirty.current = checkIfDirty({
      oldValue: savedNoteState.categoryId,
      newValue: cat.id
    })
  }

  const handleCopyTotalCost = async () =>{
    await Clipboard.setStringAsync(detectedTotalCost.toLocaleString());
    
    Toast.show('Cost Copied', {
      duration: Toast.durations.SHORT,
      backgroundColor: '#C9C9C9',
      shadow: false,
      textColor: 'black',
      containerStyle: {
        borderRadius: 14,
        padding: 10,
      }
    });
  }

  const handleOpenCatModal = () =>{
    setIsCategoryModalOpen(true)
    Keyboard.dismiss()
  }

  const isDirtySharedVal = useSharedValue(false)
  useEffect(()=>{
    isDirtySharedVal.value = isSomethingDirty
  },[isDirty.current, isTitleDirty.current, isActiveCategoryDirty.current])

  const animatedBtnStyle = useAnimatedStyle(()=>{
    return {
      opacity: isDirtySharedVal.value ?
        withSpring(1) :
        withSpring(0),
      transform: [{
        translateY: isDirtySharedVal.value ?
          withSpring(0) :
          withSpring(100)
      }]
    }
  })
  const pressedSharedVal = useSharedValue(false)
  const animatedBtnOnpressStyle = useAnimatedStyle(()=>{
    return {
      transform: [{
        scale: pressedSharedVal.value ?
          withSpring(.91) :
          withSpring(1)
      }]
    }
  })

  // Add keyboard height tracking
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const keyboardWillShow = Platform.OS === 'ios' 
      ? Keyboard.addListener('keyboardWillShow', (e) => {
          setKeyboardHeight(e.endCoordinates.height)
          // Add small delay to ensure layout is updated
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }, 50)
        })
      : Keyboard.addListener('keyboardDidShow', (e) => {
          setKeyboardHeight(e.endCoordinates.height)
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }, 50)
        })
    
    const keyboardWillHide = Platform.OS === 'ios'
      ? Keyboard.addListener('keyboardWillHide', () => setKeyboardHeight(0))
      : Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0))

    return () => {
      keyboardWillShow.remove()
      keyboardWillHide.remove()
    }
  }, [])

  return (
    <View className='flex-1 bg-secondary'>
      <StatusBar style='dark' backgroundColor='white' />
      <Seperator className='mt-1' color='bg-gray-500' height='h-0.5' />
      
      <View className='h-full flex-1'>
        <View className='flex-row justify-between px-5 mt-4'>
          <Text className='text-gray-500'>
            {format(note.updatedAt, "dd / MM / yy")} {isSaving && 'saving...'}
          </Text>
          <Text
            onPress={handleOpenCatModal}
            className='text-gray-500'>
            #{selectedCategory?.name || '<uncategorized>'}
          </Text>
        </View>
        <View className='flex-row justify-between items-center mt-2 px-5'>
          <TextInput
            value={note.title}
            selectTextOnFocus={hasNoteId?false:true}
            onChangeText={(value) => handleInputChange({field:'title', value})}
            className='text-3xl py-2 flex-1'
            placeholder='untitled Note'
          />
          {!!detectedTotalCost && <Pressable
            onLongPress={handleCopyTotalCost}
            className='pl-2 flex-row items-start'>
            <Text className='text-3xl text-accent'>{detectedCurrencySymbol}</Text>
            <Text className='text-3xl max-w-56' numberOfLines={1}>
              {detectedTotalCost.toLocaleString()}
            </Text>
          </Pressable>}
        </View>

        <Textarea
          value={note.content}
          onChangeText={(value) => handleInputChange({field:'content', value})}
          contentInputRef={contentInputRef}
          screenWidth={screenWidth}
        />

        <Animated.View
          style={animatedBtnStyle}
          className='absolute bottom-10 right-5'>
          <Pressable onPress={handleSaveNote}>
            {({pressed}) => {
              pressedSharedVal.value = pressed
              return (<Animated.View
                style={[{elevation: 5}, animatedBtnOnpressStyle]}
                className='flex-row self-end justify-center items-center gap-2
              bg-accent px-5 py-3 rounded-full shadow-lg shadow-primary/20'>
                <Entypo name="save" size={20} className='!text-black/70' />
                <Text className='text-2xl text-black/70'>
                  {!hasNoteId && !storedNoteId ? 'save' : 'update'}
                </Text>
              </Animated.View>)
            }}
          </Pressable>
        </Animated.View>
      </View>
      <ManageCategories
        mode={CategoryActionModes.SELECT}
        onCategorySelect={handleCategoryUpdate}
        activeCategory={selectedCategory}
        isOpen={[isCategoryModalOpen, setIsCategoryModalOpen]}
      />
    </View>
  )
}

export default NewNote