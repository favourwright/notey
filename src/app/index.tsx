import { useEffect, useLayoutEffect, useState } from 'react';
import { useNavigation } from 'expo-router';
import { View, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import NameNGreeting from '@/components/header/NameNGreeting';
import FilterPills from '@/components/FilterPills';
import { type NoteType, getAllNotes, clearAllNotes } from '@/store/notes';
import Notelist from '@/components/note/Notelist';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import ManageCategories from '@/components/ManageCategories';
import { CategoryActionModes, getActiveCategory, getAllCategories, NoteCategoryType, setActiveCategory } from '@/store/categories';
import { clearOnboardingRecords, getUsername } from '@/store/onboarding';
import NoteOptionsModal from '@/components/NoteOptionsModal';
import Seperator from '@/components/Seperator';

export default function Home() {
  const navigation = useNavigation();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [username, setUsername] = useState('')

  useEffect(()=>{
    (async ()=>{
      setUsername(await getUsername())
    })()
  },[])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <NameNGreeting name={username} />,
    });
  }, [navigation,username]);

  const [notes, setNotes] = useState<NoteType[]>([])
  const renderedNotes = (noteCategory: NoteCategoryType|null) => {
    if(!noteCategory) return notes
    return notes.filter(note => note.categoryId === noteCategory.id)
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const notes = await getAllNotes()
      setNotes(notes)

      // for categories
      const cats = await getAllCategories()
      setCatList(cats)

      // for active category
      const activeCat = await getActiveCategory()
      setSelectedcategory(activeCat)
    });
  
    return unsubscribe; // Cleanup function
  }, [navigation.isFocused]); // Dependency array


  const [selectedCategory, setSelectedcategory] = useState<NoteCategoryType|null>(null)
  const [catList, setCatList] = useState<NoteCategoryType[]>([])

  const handleSetSelectedCategory = (cat:NoteCategoryType) => {
    setSelectedcategory(cat)
    setActiveCategory(cat?.id)
  }

  const handleCatUpdate = (cats:NoteCategoryType[]) => {
    setCatList(cats)
    // if the selected category is deleted, reset the selected category
    if(selectedCategory && !cats.find(cat => cat.id === selectedCategory.id)){
      setSelectedcategory(null)
      setActiveCategory(null)
    }
  }

  const noteModal = useState(false)
  const [noteToSeeOptions, setNoteToSeeOptions] = useState<NoteType>(undefined)
  const handleShowNoteOptions = (note:NoteType) =>{
    setNoteToSeeOptions(note)
    const [_,setter] = noteModal
    setter(true)
  }

  return (
    <View className="flex-1 bg-primary">
      <StatusBar style="light" />
      <ScrollView className="flex-1" stickyHeaderIndices={[1]}>
        <View className='px-5 mt-10 flex-row items-end mb-8'>
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
            className='text-6xl text-secondary/20 font-medium'
            style={{fontFamily: 'CoveredByYourGrace_400Regular'}}>
            /{notes.length}
          </Text>
        </View>

        <View className='bg-primary py-2'>
          <FilterPills
            list={catList}
            selected={selectedCategory}
            onChange={handleSetSelectedCategory}
            onAddBtnPress={()=>setIsCategoryModalOpen(true)}
          />
        </View>

        <View className='mt-8 px-5 flex-1'>
          <Seperator padding='px-0' color='bg-secondary/20' />
          <Notelist
            notes={renderedNotes(selectedCategory)}
            onShowOptions={handleShowNoteOptions}
          />

          {/* emoty state UI */}
          {renderedNotes(selectedCategory).length === 0 && (
            <View className='flex-1 justify-center items-center my-10 gap-10 mx-auto max-w-xs px-5'>
              {!selectedCategory && <><Entypo name='flower' size={80} className='!text-white/10' />
              <Text className='text-2xl text-white/20 text-center'>
                click the <AntDesign name='pluscircle' size={20} className='!text-white/20' /> button to add a new note
              </Text></>}
              {selectedCategory && <><MaterialCommunityIcons name='spider-web' size={80} className='!text-white/10' />
              <Text className='text-2xl text-white/20 text-center'>
                there are no notes in the category <Text className='text-white/40'>{selectedCategory.name}</Text>
              </Text></>}
            </View>
          )}
        </View>
      </ScrollView>
      <ManageCategories
        mode={CategoryActionModes.EDIT}
        onChange={handleCatUpdate}
        isOpen={[isCategoryModalOpen, setIsCategoryModalOpen]}
      />
      <NoteOptionsModal
        note={noteToSeeOptions}
        isOpen={noteModal}
        onNoteDelete={async ()=>{
          const notes = await getAllNotes()
          setNotes(notes)
        }}
      />
    </View>
  );
}
