import { View, Text, TouchableOpacity, TextInput, Pressable, useWindowDimensions, Keyboard } from 'react-native'
import { UNSTABLE_usePreventRemove as usePreventRemove, useNavigation, type NavigationAction } from "@react-navigation/native";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { format } from "date-fns";
import {
  getNoteById,
  saveNote,
  deleteNote,
  type NoteType,
  processNoteContent,
  getAutoSave as getAutoSaveNotesPreference,
} from '@/store/notes';
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
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import HeaderRight from '@/components/note/header/HeaderRight';
import Textarea from '@/components/Textarea';
import Confirm from '@/components/Confirm';

const AUTO_SAVE_DELAY = 1000

const showToast = (text:string) => Toast.show(text, {
  duration: Toast.durations.SHORT,
  backgroundColor: '#C9C9C9',
  shadow: false,
  textColor: 'black',
  containerStyle: {
    borderRadius: 14,
    padding: 10,
  }
})

type SavedNoteState = Pick<NoteType, 'title'|'content'|'categoryId'>

const NewNote = () => {
  const navigation = useNavigation()
  const params = useLocalSearchParams()
  const hasNoteId = params.noteId !== 'undefined'
  const [storedNoteId, setStoredNoteId] = useState<string|undefined>(undefined)
  const { width:screenWidth } = useWindowDimensions()

  const [note, setNote] = useState<NoteType>(() => ({
    id: uuid.v4() as string,
    title: '',
    content: '',
    categoryId: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  }))
  const [selectedCategory, setSelectedcategory] = useState<NoteCategoryType|null>(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const categoryModal = useMemo(
    () => [isCategoryModalOpen, setIsCategoryModalOpen] as [boolean, (value:boolean)=>void],
    [isCategoryModalOpen]
  )
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean|null>(null)

  // what's in storage, used to work out whether the note has unsaved changes
  const [savedNoteState, setSavedNoteState] = useState<SavedNoteState>({
    title: '',
    content: '',
    categoryId: '',
  })
  const savedNoteRef = useRef(savedNoteState)
  const updateSavedNoteState = useCallback((next:SavedNoteState) => {
    savedNoteRef.current = next
    setSavedNoteState(next)
  }, [])

  const contentInputRef = useRef<TextInput>(null)

  useEffect(()=>{
    getAutoSaveNotesPreference().then((value) => setAutoSaveEnabled(!!value))
  },[])

  // set some guide default values
  useEffect(()=>{
    if(!hasNoteId) {
      (async ()=>{
        // for categories, first check if user has an actively selected category
        // if not, use the first category
        const activeCat = await getActiveCategory()
        const category = activeCat || (await getAllCategories())?.[0]
        if(!category) return
        setSelectedcategory(category)
        // only touches the category, in case typing has already started
        setNote(prev => ({...prev, categoryId: category.id}))
        updateSavedNoteState({...savedNoteRef.current, categoryId: category.id})
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
      const storedNote = await getNoteById(params.noteId as string || '')
      if (!storedNote?.id) return
      setNote(storedNote)
      updateSavedNoteState({
        title: storedNote.title,
        content: storedNote.content,
        categoryId: storedNote.categoryId,
      })
      setStoredNoteId(storedNote.id)
      setSelectedcategory(storedNote.category)
    })()
  },[])

  // used to process sum calculations
  const { totalCost: detectedTotalCost, currencySymbol: detectedCurrencySymbol } = useMemo(
    () => processNoteContent(note.content),
    [note.content]
  )

  const isNewNote = !hasNoteId && !storedNoteId
  const hasChanges = note.title !== savedNoteState.title
    || note.content !== savedNoteState.content
    || note.categoryId !== savedNoteState.categoryId
  // a new note has nothing worth saving until something has been written
  const canSave = hasChanges && (!isNewNote || !!note.title.trim() || !!note.content.trim())
  const isAutoSavePending = !!autoSaveEnabled && canSave

  // the latest values, for callbacks that shouldn't be recreated on each keystroke
  const noteRef = useRef(note)
  noteRef.current = note
  const canSaveRef = useRef(canSave)
  canSaveRef.current = canSave
  const isDeleted = useRef(false)

  // every save goes through here. The note is marked as saved straight away so
  // the UI responds immediately, and put back if the write fails.
  const persist = useCallback(async (snapshot:NoteType) => {
    if (isDeleted.current) return false
    const previous = savedNoteRef.current
    const next = {
      title: snapshot.title,
      content: snapshot.content,
      categoryId: snapshot.categoryId,
    }
    updateSavedNoteState(next)
    const saved = await saveNote({ ...snapshot, updatedAt: new Date() })
    if (!saved) {
      if (savedNoteRef.current === next) updateSavedNoteState(previous)
      return false
    }
    setStoredNoteId(snapshot.id)
    return true
  }, [])

  // handle saving / updating note
  const handleSaveNote = useCallback(async () => {
    if (!canSaveRef.current) return
    const saved = await persist(noteRef.current)
    if (!saved && !isDeleted.current) showToast("Couldn't save note")
  }, [])

  // handle auto-saving
  useEffect(() => {
    if (!isAutoSavePending) return
    const timeout = setTimeout(() => persist(noteRef.current), AUTO_SAVE_DELAY)
    return () => clearTimeout(timeout)
  }, [note.title, note.content, note.categoryId, isAutoSavePending])

  // handle leaving with unsaved changes
  const pendingLeaveAction = useRef<NavigationAction|null>(null)
  const isSavingToLeave = useRef(false)
  usePreventRemove(canSave, ({ data }) => {
    if (isDeleted.current) {
      navigation.dispatch(data.action)
      return
    }
    if (isSavingToLeave.current) return
    pendingLeaveAction.current = data.action

    // autosave is on, so finish the pending save rather than asking
    if (autoSaveEnabled) {
      isSavingToLeave.current = true
      persist(noteRef.current).then((saved) => {
        isSavingToLeave.current = false
        if (saved) {
          navigation.dispatch(data.action)
        } else {
          // never leave silently if the save failed
          showToast("Couldn't save note")
          setShowLeaveConfirm(true)
        }
      })
      return
    }

    Keyboard.dismiss()
    setShowLeaveConfirm(true)
  })

  const handleDiscardAndLeave = () => {
    if (pendingLeaveAction.current) navigation.dispatch(pendingLeaveAction.current)
  }

  const handleDeleteNote = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setShowDeleteConfirm(true)
  }, [])

  const noteStored = hasNoteId || !!storedNoteId
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
        noteStored={noteStored}
        noteDirty={canSave}
        handleSaveNote={handleSaveNote}
        handleDeleteNote={handleDeleteNote}
      />,
      headerShadowVisible: false,
    })
  }, [navigation, noteStored, canSave])

  const handleInputChange = ({field,value}:{field:'title'|'content',value:string}) => {
    setNote(prev => ({ ...prev, [field]: value }))
  }

  const handleConfirmDelete = async () => {
    // stops any autosave from writing the note back after it's deleted.
    // Saves already queued finish first, so the delete always wins
    isDeleted.current = true
    await deleteNote(noteRef.current.id)
    navigation.goBack()
    setShowDeleteConfirm(false)
  }
  const handleCategoryUpdate = useCallback((cat:NoteCategoryType)=>{
    setSelectedcategory(cat);
    setNote(prev => ({...prev, categoryId: cat.id}))
  }, [])

  const handleCopyTotalCost = async () =>{
    await Clipboard.setStringAsync(detectedTotalCost.toLocaleString());
    showToast('Cost Copied')
  }

  const handleOpenCatModal = () =>{
    setIsCategoryModalOpen(true)
    Keyboard.dismiss()
  }

  const isDirtySharedVal = useSharedValue(false)
  useEffect(()=>{
    isDirtySharedVal.value = canSave
  },[canSave])

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

  // moves with the keyboard frame by frame. The height is negative when open
  const { height: keyboardHeight } = useReanimatedKeyboardAnimation()
  const floatingBtnStyle = useAnimatedStyle(() => ({
    bottom: Math.max(40, -keyboardHeight.value + 20),
    position: 'absolute',
    right: 20,
  }))

  return (
    <View className='flex-1 bg-secondary'>
      <StatusBar style='dark' backgroundColor='white' />
      <Seperator className='mt-1' color='bg-gray-500' height='h-0.5' />
      
      <View className='h-full flex-1'>
        <View className='flex-row justify-between px-5 mt-4'>
          <Text className='text-gray-500'>
            {format(note.updatedAt, "dd / MM / yy")} {isAutoSavePending && 'saving...'}
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
          placeholder='Write something...'
        />

        <Animated.View
          style={[animatedBtnStyle, floatingBtnStyle]}
          pointerEvents={canSave ? 'auto' : 'none'}
        >
          <Pressable
            onPress={handleSaveNote}
            onPressIn={()=>{ pressedSharedVal.value = true }}
            onPressOut={()=>{ pressedSharedVal.value = false }}>
            <Animated.View
              style={[{elevation: 5}, animatedBtnOnpressStyle]}
              className='flex-row self-end justify-center items-center gap-2
            bg-accent px-5 py-3 rounded-full shadow-lg shadow-primary/20'>
              <Entypo name="save" size={20} className='!text-black/70' />
              <Text className='text-2xl text-black/70'>
                {isNewNote ? 'save' : 'update'}
              </Text>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </View>
      <ManageCategories
        mode={CategoryActionModes.SELECT}
        onCategorySelect={handleCategoryUpdate}
        activeCategory={selectedCategory}
        isOpen={categoryModal}
      />

      <Confirm
        visible={showDeleteConfirm}
        title="Confirm note delete"
        destructive={true}
        icon={<Feather name="trash-2" size={26} className='!text-red-300' />}
        onDismiss={() => setShowDeleteConfirm(false)}
        customButtons={[
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setShowDeleteConfirm(false),
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: handleConfirmDelete,
          },
        ]}
      />

      <Confirm
        visible={showLeaveConfirm}
        title="Unsaved changes"
        message="Discard your changes and leave?"
        onDismiss={() => setShowLeaveConfirm(false)}
        customButtons={[
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: handleDiscardAndLeave,
          },
        ]}
      />
    </View>
  )
}

export default NewNote