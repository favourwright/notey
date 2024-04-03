import { useEffect, useLayoutEffect, useState } from 'react';
import { useNavigation } from 'expo-router';
import { View, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import NameNGreeting from '@/components/header/NameNGreeting';
import FilterPills from '@/components/FilterPills';
import type { NoteItemType } from '@/components/note/NoteItem';
import Notelist from '@/components/note/Notelist';

const sampleNotes:NoteItemType[] = [
  {
    id: 1,
    title: 'First note',
    content: 'This is the first note',
    createdAt: new Date(),
  },
  {
    id: 2,
    title: 'Second note',
    content: 'This is the second note',
    createdAt: new Date(),
  },
  {
    id: 3,
    title: 'Third note',
    content: 'This is the third note',
    createdAt: new Date(),
  },
  {
    id: 4,
    title: 'Fourth note',
    content: 'This is the fourth note',
    createdAt: new Date(),
  },
  {
    id: 5,
    title: 'Fifth note',
    content: 'This is the fifth note',
    createdAt: new Date(),
  },
  {
    id: 6,
    title: 'Sixth note',
    content: 'This is the sixth note',
    createdAt: new Date(),
  },
  {
    id: 7,
    title: 'Seventh note',
    content: 'This is the seventh note',
    createdAt: new Date(),
  },
  {
    id: 8,
    title: 'Eighth note',
    content: 'This is the eighth note',
    createdAt: new Date(),
  },
  {
    id: 9,
    title: 'Ninth note',
    content: 'This is the ninth note',
    createdAt: new Date(),
  },
  {
    id: 10,
    title: 'Tenth note',
    content: 'This is the tenth note',
    createdAt: new Date(),
  },
  {
    id: 11,
    title: 'Eleventh note',
    content: 'This is the eleventh note',
    createdAt: new Date(),
  },
  {
    id: 12,
    title: 'Twelfth note',
    content: 'This is the twelfth note',
    createdAt: new Date(),
  },
  {
    id: 13,
    title: 'Thirteenth note',
    content: 'This is the thirteenth note',
    createdAt: new Date(),
  },
  {
    id: 14,
    title: 'Fourteenth note',
    content: 'This is the fourteenth note',
    createdAt: new Date(),
  },
  {
    id: 15,
    title: 'Fifteenth note',
    content: 'This is the fifteenth note',
    createdAt: new Date(),
  },
  {
    id: 16,
    title: 'Sixteenth note',
    content: 'This is the sixteenth note',
    createdAt: new Date(),
  },
  {
    id: 17,
    title: 'Seventeenth note',
    content: 'This is the seventeenth note',
    createdAt: new Date(),
  },
  {
    id: 18,
    title: 'Eighteenth note',
    content: 'This is the eighteenth note',
    createdAt: new Date(),
  },
  {
    id: 19,
    title: 'Nineteenth note',
    content: 'This is the nineteenth note',
    createdAt: new Date(),
  },
  {
    id: 20,
    title: 'Twentieth note',
    content: 'This is the twentieth note',
    createdAt: new Date(),
  },
  {
    id: 21,
    title: 'Twenty-first note',
    content: 'This is the twenty-first note',
    createdAt: new Date(),
  },
  {
    id: 22,
    title: 'Twenty-second note',
    content: 'This is the twenty-second note',
    createdAt: new Date(),
  },
]

export default function Home() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <NameNGreeting name="Favour" />,
    });
  }, [navigation]);

  const [selectedFilter, setSelectedFilter] = useState<string|null>('lists')
  const [filterList, setFilterList] = useState([
    'personal',
    'work',
    'home',
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
          <Text className='text-6xl text-secondary/20 font-medium'>/{sampleNotes.length}</Text>
        </View>

        <View className='bg-primary py-2'>
          <FilterPills list={filterList} selected={selectedFilter} onChange={setSelectedFilter} />
        </View>

        <View className='mt-8 px-5'>
          <Notelist notes={sampleNotes} />
        </View>
      </ScrollView>
    </View>
  );
}
