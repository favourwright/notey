import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { deleteNote, NoteType, processNoteContent } from '@/store/notes';
import Feather from '@expo/vector-icons/Feather';
import Seperator from './Seperator';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-root-toast';
import Colors from '@/constants/Colors';
import Confirm from './Confirm';

const NoteOptionsModal = ({
  isOpen:[openState,setOpenState],
  note,
  onNoteDelete,
}:{
  isOpen:[boolean, (value:boolean)=>void],
  note: NoteType,
  onNoteDelete: ()=>void
}) => {
  const { bottom } = useSafeAreaInsets()
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => [200], []);
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
    // reset these when modal is closed
    if(!openState) {
      setDetectedTotalCost(null)
      setDetectedCurrencySymbol(null)
    }
  },[openState])

  const [detectedTotalCost, setDetectedTotalCost] = useState<number>(null)
  const [detectedCurrencySymbol, setDetectedCurrencySymbol] = useState<string>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  // used to process sum calculations
  useEffect(()=>{
    if(!note?.content) return
    const { totalCost, currencySymbol } = processNoteContent(note.content)
    setDetectedTotalCost(totalCost||null)
    setDetectedCurrencySymbol(currencySymbol||null)
  }, [openState, note?.content])

  const showToast = useCallback((text:string)=>{
    Toast.show(text, {
      duration: Toast.durations.SHORT,
      backgroundColor: '#C9C9C9',
      shadow: false,
      textColor: 'black',
      containerStyle: {
        borderRadius: 14,
        padding: 10,
      }
    });
  }, [])

  const handleCopyTotalCost = async () =>{
    await Clipboard.setStringAsync(detectedTotalCost.toLocaleString());
    showToast('Total Copied')
    bottomSheetModalRef.current.close()
  }

  const handleCopyContent = async () => {
    await Clipboard.setStringAsync(note.content);
    showToast('Note Content Copied')
    bottomSheetModalRef.current.close()
  }

  const handleDeleteNote = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    // delete note
    await deleteNote(note.id)
    showToast('Note Deleted')
    onNoteDelete && onNoteDelete()
    bottomSheetModalRef.current.close()
    setShowDeleteConfirm(false)
  }

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
            {note && <View style={{paddingBottom:bottom}} className='flex-1'>
              {detectedTotalCost && <><Pressable
                onPress={handleCopyTotalCost}
                className='flex-row items-center gap-3 py-3'>
                <Feather name="copy" size={24} color="gray" />
                <Text className='flex-1 text-2xl text-secondary/80'>Copy total</Text>
                <Text className='text-2xl text-secondary/30 max-w-40 flex-row' numberOfLines={1}>
                  <Text className='text-2xl'>{detectedCurrencySymbol || ''}</Text>
                  {detectedTotalCost.toLocaleString()}
                </Text>
              </Pressable>

              <Seperator padding='px-0' color='bg-primary/10' /></>}

              <Pressable
                onPress={handleCopyContent}
                className='flex-row items-center gap-3 py-3'>
                <Feather name="copy" size={24} color="gray" />
                <Text className='flex-1 text-2xl text-secondary/80'>Copy content</Text>
              </Pressable>

              <Seperator padding='px-0' color='bg-primary/10' />

              <Pressable
                onPress={handleDeleteNote}
                className='flex-row items-center gap-3 py-3'>
                <Feather name="trash-2" size={24} className='!text-red-300' />
                <Text className='flex-1 text-2xl text-red-300'>Delete note</Text>
              </Pressable>
            </View>}
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>

      <Confirm
        visible={showDeleteConfirm}
        title={`Delete ${note?.title || 'untitled'}?`}
        destructive={true}
        icon={<Feather name="trash-2" size={32} className='!text-red-300' />}
        confirmText="Delete"
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
    </>
  )
}

export default NoteOptionsModal