import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';

const ManageCategories = ({isOpen:[openState,setOpenState]}:{isOpen:[boolean, (value:boolean)=>void]}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  // callbacks
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

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        backdropComponent={renderBackdrop}
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={['30%', '50%']}
        onChange={handleSheetChanges}
        onDismiss={() => setOpenState(false)}
      >
        <BottomSheetView style={ {
          flex: 1,
          alignItems: 'center',
        }}>
          <Text>Awesome 🎉</Text>
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  )
}

export default ManageCategories

// const 