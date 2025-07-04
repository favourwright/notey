import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
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
import Colors from '@/constants/Colors';
import Confirm from './Confirm';

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
  const handleSetNewCat = (text:string)=>setNewCat(text.replace(/[^a-zA-Z\s]/g, '').toLocaleLowerCase())
  const [renderedCategories, setRenderedCategories] = useState<NoteCategoryType[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const handleCreateCategory = async ()=>{
    if(!newCat?.trim()) return setNewCat('')
    const payload: NoteCategoryType = {
      id: uuid.v4() as string,
      name: newCat,
    }
    try {
      await saveCategory(payload)
      setRenderedCategories((prev)=>{
        const newCat = prev?.length ? [payload, ...prev] : [payload]
        onChange && onChange(newCat)
        return newCat
      })
      setNewCat('')
      // doing this because the bottomsheet doesn't shrink back down
      // even when keyboard is dismissed
      bottomSheetModalRef.current?.snapToIndex(1)
    } catch(err) {
      alert(err)
    }
  }
  const handleDeleteCategory = async (id:string)=>{
    setCategoryToDelete(id)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return
    
    await deleteCategory(categoryToDelete)
    // remove category from rendered categories
    setRenderedCategories((prev)=>{
      const newCat = prev.filter((cat)=>cat.id!==categoryToDelete)
      onChange && onChange(newCat)
      return newCat
    })
    setShowDeleteConfirm(false)
    setCategoryToDelete(null)
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
    <>
      <BottomSheetModalProvider>
        <BottomSheetModal
          backdropComponent={renderBackdrop}
          ref={bottomSheetModalRef}
          index={0}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          keyboardBehavior="interactive"
          onDismiss={() => setOpenState(false)}
          backgroundStyle={{backgroundColor: Colors.dark.primary}}
          handleIndicatorStyle={{backgroundColor: Colors.dark.secondary}}
        >
          <BottomSheetView className='flex-1 px-5'>
            <View style={{paddingBottom:bottom}} className='flex-1'>
              {activeMode === CategoryActionModes.EDIT && <BottomSheetTextInput
                value={newCat}
                onChangeText={handleSetNewCat}
                onSubmitEditing={handleCreateCategory}
                autoCapitalize="none"
                placeholder='add new category'
                enterKeyHint='done'
                className='self-stretch bg-white/10 p-4 py-3 text-lg leading-[18px]
                text-white placeholder:text-white/50 rounded-3xl'
              />}
              <View className='flex-row justify-between'>
                <Text className='mt-3 text-lg font-medium text-white/50'>Categories</Text>
                {mode === CategoryActionModes.SELECT && (
                  <Text
                    onPress={()=>setActiveMode(
                      (prev)=>
                        prev===CategoryActionModes.SELECT ?
                          CategoryActionModes.EDIT :
                          CategoryActionModes.SELECT
                      )
                    }
                    className='mt-3 text-lg font-medium text-white'>
                    {activeMode===CategoryActionModes.SELECT ? 'edit' : 'done'}
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
                ItemSeparatorComponent={()=><Seperator padding='px-0' color='bg-white/10' />}
              />
            </View>
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>

      <Confirm
        visible={showDeleteConfirm}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        destructive={true}
        icon={<Entypo name="circle-with-minus" size={26} className='!text-red-300' />}
        onDismiss={() => {
          setShowDeleteConfirm(false)
          setCategoryToDelete(null)
        }}
        customButtons={[
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              setShowDeleteConfirm(false)
              setCategoryToDelete(null)
            },
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: handleConfirmDeleteCategory,
          },
        ]}
      />
    </>
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
      ${isHighlighted && mode === CategoryActionModes.SELECT ? 'bg-white/5 border-white rounded' : 'border-transparent'}
    `}>
      {mode === CategoryActionModes.EDIT && <Pressable
        onPress={()=>handleDeleteCategory(category.id)}
        disabled={category?.isDefault}>
        <Entypo
          name="circle-with-minus" size={30}
          style={{opacity: category?.isDefault ? 0.3 : 0.8}}
          color={Colors.dark.secondary}
        />
      </Pressable>}
      <Text
        onPress={()=>mode === CategoryActionModes.SELECT && handleSelect && handleSelect(category)}
        className='text-2xl flex-1 text-secondary/80'
        suppressHighlighting
        disabled={mode === CategoryActionModes.EDIT}>
        {category.name}
      </Text>
      {mode === CategoryActionModes.EDIT && <MaterialIcons name="drag-handle" size={30} color="gray" />}
    </View>
  )
}