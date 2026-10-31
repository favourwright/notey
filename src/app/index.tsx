import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigation, useRouter } from 'expo-router';
import { View, Text, Pressable, SectionList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import NameNGreeting from '@/components/header/NameNGreeting';
import FilterPills from '@/components/FilterPills';
import { type NoteType, getAllNotes } from '@/store/notes';
import Notelist from '@/components/note/Notelist';
import { NOTE_REMOVE_DURATION } from '@/components/note/NoteItem';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import ManageCategories from '@/components/ManageCategories';
import { CategoryActionModes, getActiveCategory, getAllCategories, NoteCategoryType, setActiveCategory } from '@/store/categories';
import { getUsername } from '@/store/onboarding';
import NoteOptionsModal from '@/components/NoteOptionsModal';
import Seperator from '@/components/Seperator';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

const LIST_FADE_OUT_DURATION = 90;
const LIST_FADE_IN_DURATION = 200;

export default function Home() {
  const navigation = useNavigation();
  const { navigate } = useRouter();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [username, setUsername] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <NameNGreeting name={username} />,
    });
  }, [navigation, username]);

  const [notes, setNotes] = useState<NoteType[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedCategory, setSelectedcategory] = useState<NoteCategoryType|null>(null);
  const [catList, setCatList] = useState<NoteCategoryType[]>([]);

  const selectedCategoryId = selectedCategory?.id;
  const visibleNotes = useMemo(() => {
    if(!selectedCategoryId) return notes;
    return notes.filter(note => note.categoryId === selectedCategoryId);
  }, [notes, selectedCategoryId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      // load everything first and apply it in one update, so the list never
      // renders unfiltered notes before the active category arrives
      const [loadedNotes, cats, activeCat, name] = await Promise.all([
        getAllNotes(),
        getAllCategories(),
        getActiveCategory(),
        getUsername(),
      ]);
      setNotes(loadedNotes);
      setCatList(cats);
      setSelectedcategory(activeCat);
      setUsername(name);
      setIsLoaded(true);
    });
  
    return unsubscribe; // Cleanup function
  }, [navigation.isFocused]); // Dependency array

  const listRef = useRef<SectionList<NoteType>>(null);
  const scrollY = useRef(0);
  const headerHeight = useRef(0);
  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollY.current = e.nativeEvent.contentOffset.y;
  }, []);

  // the list fades in on first load, and dips and comes back when the filter
  // changes: the fade out covers the time spent rendering the new rows, and
  // the fade in starts as soon as they're ready
  const listFade = useSharedValue(0);
  const listFadeStyle = useAnimatedStyle(() => ({ opacity: listFade.value }));
  useEffect(() => {
    if(!isLoaded) return;
    // if scrolled down, go back to the first note,
    // otherwise a shorter list makes the scroll position jump
    if(scrollY.current > headerHeight.current) {
      listRef.current?.getScrollResponder()?.scrollTo({ y: headerHeight.current, animated: false });
    }
    listFade.value = withTiming(1, { duration: LIST_FADE_IN_DURATION });
  }, [isLoaded, selectedCategoryId]);

  const selectedCategoryIdRef = useRef(selectedCategoryId);
  selectedCategoryIdRef.current = selectedCategoryId;
  const handleSetSelectedCategory = useCallback((cat: NoteCategoryType) => {
    if(cat?.id === selectedCategoryIdRef.current) return;
    listFade.value = withTiming(0, { duration: LIST_FADE_OUT_DURATION });
    setSelectedcategory(cat);
    setActiveCategory(cat?.id);
  }, []);

  const handleCatUpdate = (cats: NoteCategoryType[]) => {
    setCatList(cats);
    // if the selected category is deleted, reset the selected category
    if(selectedCategory && !cats.find(cat => cat.id === selectedCategory.id)){
      setSelectedcategory(null);
      setActiveCategory(null);
    }
  };

  const noteModal = useState(false);
  const [, setIsNoteModalOpen] = noteModal;
  const [noteToSeeOptions, setNoteToSeeOptions] = useState<NoteType>(undefined);
  const handleShowNoteOptions = useCallback((note: NoteType) => {
    setNoteToSeeOptions(note);
    setIsNoteModalOpen(true);
  }, []);

  // the note is already deleted from storage at this point. The row plays its
  // removal animation first, then leaves the list
  const [removingNoteId, setRemovingNoteId] = useState<string|null>(null);
  const handleNoteDeleted = () => {
    const id = noteToSeeOptions?.id;
    if(!id) return;
    setRemovingNoteId(id);
    setTimeout(() => {
      setNotes(prev => prev.filter(note => note.id !== id));
      setRemovingNoteId(null);
    }, NOTE_REMOVE_DURATION + 20);
  };

  const handleOpenCategoryModal = useCallback(() => setIsCategoryModalOpen(true), []);

  // Animation for the floating button - Fixed to use only Reanimated
  const pressedSharedVal = useSharedValue(false);
  const animatedBtnOnpressStyle = useAnimatedStyle(() => {
    return {
      opacity: pressedSharedVal.value ?
        withSpring(0.7) :
        withSpring(1),
      transform: [{
        scale: pressedSharedVal.value ?
          withSpring(0.95) :
          withSpring(1)
      }]
    };
  });

  const listHeader = useMemo(() => (
    <View
      onLayout={(e) => { headerHeight.current = e.nativeEvent.layout.height; }}
      className='px-5 pt-10 flex-row items-end pb-8'>
      <View className='flex-grow gap-4'>
        <Text
          className='text-6xl text-secondary font-medium'
          style={{fontFamily: 'CoveredByYourGrace_400Regular'}}>
          Your
        </Text>
        <Text
          className='text-6xl text-secondary font-medium pl-10'
          style={{fontFamily: 'CoveredByYourGrace_400Regular'}}>
          notes
        </Text>
      </View>
      <Text
        className='text-6xl text-secondary/20 font-medium flex'
        style={{fontFamily: 'CoveredByYourGrace_400Regular'}}>
        <Text className='text-secondary/10'>/</Text>
        <Text>{notes.length}</Text>
      </Text>
    </View>
  ), [notes.length]);

  const stickyHeader = useMemo(() => (
    <View className='bg-primary py-2'>
      <FilterPills
        list={catList}
        selected={selectedCategory}
        onChange={handleSetSelectedCategory}
        onAddBtnPress={handleOpenCategoryModal}
      />
    </View>
  ), [catList, selectedCategory]);

  // empty state UI. Waits for the first load so it doesn't flash before notes appear
  const emptyState = isLoaded && visibleNotes.length === 0 ? (
    <Animated.View style={listFadeStyle} className='px-5 mt-8'>
      <Seperator padding='px-0' color='bg-secondary/20' />
      <View className='justify-center items-center my-10 gap-10 mx-auto max-w-xs px-5'>
        {!selectedCategory && <><Entypo name='flower' size={80} className='!text-white/10' />
        <Text className='text-2xl text-white/20 text-center'>
          click the <AntDesign name='pluscircle' size={20} className='!text-white/20' /> button to add a new note
        </Text></>}
        {selectedCategory && <><MaterialCommunityIcons name='spider-web' size={80} className='!text-white/10' />
        <Text className='text-2xl text-white/20 text-center'>
          click the <AntDesign name='pluscircle' size={20} className='!text-white/20' /> button to add a new note in
          <Text className='text-white/40'> {selectedCategory.name}</Text> category
        </Text></>}
      </View>
    </Animated.View>
  ) : null;

  return (
    <View className="flex-1 bg-primary">
      <StatusBar style="light" />
      <Notelist
        ref={listRef}
        notes={visibleNotes}
        onShowOptions={handleShowNoteOptions}
        removingNoteId={removingNoteId}
        listFade={listFade}
        header={listHeader}
        stickyHeader={stickyHeader}
        footer={emptyState}
        onScroll={handleScroll}
      />

      {/* Floating Add Button - Fixed to use only Reanimated */}
      <Pressable
        onPressIn={() => pressedSharedVal.value = true}
        onPressOut={() => pressedSharedVal.value = false}
        onPress={() => navigate('/undefined')}
        accessibilityLabel="Add new note"
        accessibilityHint={selectedCategory ? `Creates a new note in ${selectedCategory.name} category` : "Creates a new note"}
        accessibilityRole="button"
        className='absolute bottom-10 !right-10'
      >
        <Animated.View
          style={animatedBtnOnpressStyle}
          className='flex flex-row items-center gap-2 bg-accent rounded-full p-3 px-4'>
          <AntDesign name='pluscircle' size={24} />
          <Text className='text-xl font-bold'>new</Text>
        </Animated.View>
      </Pressable>

      <ManageCategories
        mode={CategoryActionModes.EDIT}
        onChange={handleCatUpdate}
        isOpen={[isCategoryModalOpen, setIsCategoryModalOpen]}
      />
      <NoteOptionsModal
        note={noteToSeeOptions}
        isOpen={noteModal}
        onNoteDelete={handleNoteDeleted}
      />
    </View>
  );
}
