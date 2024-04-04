import { useEffect, useLayoutEffect, useState } from 'react';
import { useFocusEffect, useNavigation } from 'expo-router';
import { View, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import NameNGreeting from '@/components/header/NameNGreeting';
import FilterPills from '@/components/FilterPills';
import { type NoteType, getAllNotes, clearAllNotes } from '@/store/notes';
import Notelist from '@/components/note/Notelist';

export default function Home() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <NameNGreeting name="Favour" />,
    });
  }, [navigation]);

  const [notes, setNotes] = useState<NoteType[]>([])
  useFocusEffect(() => {
    (async ()=>{
      const notes = await getAllNotes()
      setNotes(notes)
    })()
    // clearAllNotes()
  })


  const [selectedFilter, setSelectedFilter] = useState<string|null>('lists')
  const [filterList, setFilterList] = useState([
    'personal',
    'work',
    'grocery',
    'study',
    'books',
    'articles',
    'lists',
  ])

  return (
    <View className="flex-1 bg-primary">
      <StatusBar style="light" />
      <ScrollView className="flex-1" stickyHeaderIndices={[1]}>
        <View className='px-5 mt-10 flex-row items-end mb-8'>
          <View className='flex-grow gap-4'>
            <Text className='text-6xl text-secondary font-medium'>Your</Text>
            <Text className='text-6xl text-secondary font-medium pl-10'>notes</Text>
          </View>
          <Text className='text-6xl text-secondary/20 font-medium'>/{notes.length}</Text>
        </View>

        <View className='bg-primary py-2'>
          <FilterPills list={filterList} selected={selectedFilter} onChange={setSelectedFilter} />
        </View>

        <View className='mt-8 px-5'>
          <Notelist notes={notes} />
        </View>
      </ScrollView>
    </View>
  );
}
