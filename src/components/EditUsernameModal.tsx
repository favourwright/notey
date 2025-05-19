import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-root-toast';
import Colors from '@/constants/Colors';
import { getUsername } from '@/store/onboarding';
import { setUsername as setStoreUsername } from '@/store/onboarding';

const NoteOptionsModal = ({
  isOpen:[openState,setOpenState],
  onSave,
}:{
  isOpen:[boolean, (value:boolean)=>void],
  onSave:(username:string)=>void
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
    (async ()=>{
      setUsername(await getUsername())
    })()
    if(openState) handlePresentModalPress()
  },[openState])

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

  const [username, setUsername] = useState('')
  const handleUsernameSave = useCallback(async ()=>{
    if(username.length<3){
      showToast('Username must be at least 3 characters long')
      return
    }

    await setStoreUsername(username.trim())
    onSave && onSave(username.trim())
    bottomSheetModalRef.current?.dismiss()
    showToast('Username updated')
  },[username])

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
        backgroundStyle={{backgroundColor: Colors.dark.primary}}
        handleIndicatorStyle={{backgroundColor: Colors.dark.secondary}}
      >
        <BottomSheetView className='flex-1 px-5'>
          <View style={{paddingBottom:bottom}} className='flex-1 gap-4'>
            <BottomSheetTextInput
              value={username}
              onChangeText={setUsername}
              onSubmitEditing={handleUsernameSave}
              maxLength={20}
              placeholder='username'
              autoComplete='username'
              enterKeyHint='done'
              className='self-stretch rounded-2xl p-3 px-4 text-2xl leading-tight
              border-2 border-gray-500/10 text-secondary/80 placeholder:text-white/50'
            />
            <Pressable
              onPress={handleUsernameSave}
              className='bg-secondary/80 rounded-2xl p-2'>
              <Text
                className='text-primary/80 font-bold text-2xl text-center'>
                save
              </Text>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  )
}

export default NoteOptionsModal