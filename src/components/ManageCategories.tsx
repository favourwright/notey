import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { TextInput } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { deleteCategory, getAllCategories, NoteCategoryType, saveCategory } from '@/store/categories';
import Seperator from './Seperator';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import uuid from 'react-native-uuid';

const ManageCategories = ({
  isOpen:[openState,setOpenState],
  onChange,
}:{
  isOpen:[boolean, (value:boolean)=>void],
  onChange:(categories:NoteCategoryType[])=>void
}) => {
  const { bottom } = useSafeAreaInsets()
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const handleSheetChanges = useCallback((index: number) => {
    // console.log('handleSheetChanges', index);
  }, []);
  const renderBackdrop = useCallback(
		(props) => (
			<BottomSheetBackdrop
				{...props}
        enableTouchThrough={false}
        disappearsOnIndex={-1}
        pressBehavior="close"
			/>
		),
		[]
	);

  useEffect(()=>{
    if(openState) handlePresentModalPress()
  },[openState])

  const [newCat, setNewCat] = useState('')
  const [renderedCategories, setRenderedCategories] = useState<NoteCategoryType[]>([])
  const handleCreateCategory = async ()=>{
    const sanitized = newCat.replace(/[^a-zA-Z\s]/g, '') // remove all characters except alphabets and spaces
    const payload: NoteCategoryType = {
      id: uuid.v4() as string,
      name: sanitized,
    }
    try {
      await saveCategory(payload)
      setRenderedCategories((prev)=>{
        const newCat = prev?.length ? [...prev, payload] : [payload]
        onChange(newCat)
        return newCat
      })
      setNewCat('')
    } catch(err) {
      alert(err)
    }
  }
  const handleDeleteCategory = async (id:string)=>{
    Alert.alert('Sure you want to delete this?', null, [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {text: 'OK', onPress: async () => {
        await deleteCategory(id)
        // remove category from rendered categories
        setRenderedCategories((prev)=>{
          const newCat = prev.filter((cat)=>cat.id!==id)
          onChange(newCat)
          return newCat
        })
      }},
    ]);
  }

  useEffect(()=>{
    (async ()=>{
      const cat = await getAllCategories()
      setRenderedCategories(cat)
    })()
  },[openState]) // so that each time its opened, we fetch again

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        backdropComponent={renderBackdrop}
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={['30%', '50%']}
        onChange={handleSheetChanges}
        onDismiss={() => setOpenState(false)}
      >
        <BottomSheetView className='flex-1 px-5'>
          <View style={{paddingBottom:bottom}} className='flex-1'>
            <TextInput
              value={newCat}
              onChangeText={setNewCat}
              onSubmitEditing={handleCreateCategory}
              placeholder='grocery'
              className='self-stretch bg-black/80 p-4 text-lg leading-[18px]
              text-white placeholder:text-white/50 rounded-3xl'
            />
            <Text className='mt-3 text-right text-lg font-medium'>Categories</Text>
            <FlatList
              className='mt-2'
              data={renderedCategories}
              keyExtractor={(item)=>item.id}
              renderItem={({ item, index }) => (
                <CategoryItem
                  handleDeleteCategory={handleDeleteCategory}
                  category={item}
                />
              )}
              ItemSeparatorComponent={()=><Seperator padding='px-0' />}
            />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  )
}

export default ManageCategories

const CategoryItem = ({
  category,
  handleDeleteCategory,
}:{
  category:{
    name:string,
    id:string,
    isDefault?:boolean
  },
  handleDeleteCategory:(id:string)=>void
}) => {
  return (
    <View className='flex-row py-2 gap-4 items-center'>
      <Pressable onPress={()=>handleDeleteCategory(category.id)} disabled={category?.isDefault}>
        <Entypo name="circle-with-minus" size={30} color={category?.isDefault ? "lightgray" : 'black'} />
      </Pressable>
      <Text className='text-2xl flex-1'>{category.name}</Text>
      <MaterialIcons name="drag-handle" size={30} color="gray" />
    </View>
  )
}