import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryActionModes, deleteCategory, getAllCategories, NoteCategoryType, saveCategory } from '@/store/categories';
import Seperator from './Seperator';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import uuid from 'react-native-uuid';

const ManageCategories = ({
  isOpen:[openState,setOpenState],
  onChange,
  mode,
  activeCategory,
  onCategorySelect,
}:{
  isOpen:[boolean, (value:boolean)=>void],
  onChange?:(categories:NoteCategoryType[])=>void,
  mode: CategoryActionModes,
  activeCategory?: NoteCategoryType,
  onCategorySelect?: (cat:NoteCategoryType) => void
}) => {
  const { bottom } = useSafeAreaInsets()
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['30%', '50%'], []);
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
        const newCat = prev?.length ? [payload, ...prev] : [payload]
        onChange && onChange(newCat)
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
          onChange && onChange(newCat)
          return newCat
        })
      }},
    ]);
  }

  useEffect(()=>{
    (async ()=>{
      const cat = await getAllCategories()
      setRenderedCategories(cat)
      setActiveMode(mode)
    })()
  },[mode, openState]) // so that each time its opened, we fetch again

  const [activeMode, setActiveMode] = useState<CategoryActionModes>(CategoryActionModes.SELECT)

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        backdropComponent={renderBackdrop}
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        keyboardBehavior="interactive"
        onDismiss={() => setOpenState(false)}
      >
        <BottomSheetView className='flex-1 px-5'>
          <View style={{paddingBottom:bottom}} className='flex-1'>
            {activeMode === CategoryActionModes.EDIT && <BottomSheetTextInput
              value={newCat}
              onChangeText={setNewCat}
              onSubmitEditing={handleCreateCategory}
              placeholder='add new category'
              className='self-stretch bg-black/80 p-4 py-3 text-lg leading-[18px]
              text-white placeholder:text-white/50 rounded-3xl'
            />}
            <View className='flex-row justify-between'>
              <Text className='mt-3 text-lg font-medium opacity-50'>Categories</Text>
              {mode === CategoryActionModes.SELECT && (
                <Text
                  onPress={()=>setActiveMode(
                    (prev)=>
                      prev===CategoryActionModes.SELECT ?
                        CategoryActionModes.EDIT :
                        CategoryActionModes.SELECT
                    )
                  }
                  className='mt-3 text-lg font-medium'>
                  {activeMode===CategoryActionModes.SELECT ? 'edit' : 'save'}
                </Text>
              )}
            </View>

            <FlatList
              className='flex-1 mt-2'
              data={renderedCategories}
              scrollEnabled={true}
              keyExtractor={(item)=>item.id}
              renderItem={({ item, index }) => (
                <CategoryItem
                  mode={activeMode}
                  handleDeleteCategory={handleDeleteCategory}
                  category={item}
                  isHighlighted={activeCategory?.id === item.id}
                  handleSelect={onCategorySelect}
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
  mode,
  isHighlighted,
  handleSelect
}:{
  category: NoteCategoryType,
  handleDeleteCategory:(id:string)=>void,
  mode: CategoryActionModes,
  isHighlighted?:boolean,
  handleSelect?: (cat:NoteCategoryType) => void
}) => {
  return (
    <View
      className={`flex-row py-2 gap-4 items-center border-y
      ${isHighlighted && mode === CategoryActionModes.SELECT ? 'bg-black/5 border-black rounded' : 'border-transparent'}
    `}>
      {mode === CategoryActionModes.EDIT && <Pressable
        onPress={()=>handleDeleteCategory(category.id)}
        disabled={category?.isDefault}>
        <Entypo name="circle-with-minus" size={30} color={category?.isDefault ? "lightgray" : 'black'} />
      </Pressable>}
      <Text
        onPress={()=>mode === CategoryActionModes.SELECT && handleSelect && handleSelect(category)}
        className='text-2xl flex-1'
        suppressHighlighting
        disabled={mode === CategoryActionModes.EDIT}>
        {category.name}
      </Text>
      {mode === CategoryActionModes.EDIT && <MaterialIcons name="drag-handle" size={30} color="gray" />}
    </View>
  )
}