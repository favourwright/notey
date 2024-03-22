import { useEffect, useLayoutEffect, useState } from 'react';
import { Link, useNavigation } from 'expo-router';
import { View, Text, ScrollView, FlatList, Pressable } from 'react-native';
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
          <Text className='text-6xl text-secondary/20 font-medium'>/14</Text>
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
