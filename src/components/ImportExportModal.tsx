import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';

const ExportImportModal = ({
  isOpen: [openState, setOpenState],
  // onExport,
  // onImport,
}: {
  isOpen: [boolean, (value: boolean) => void];
  // onExport?: () => void;
  // onImport?: () => void;
}) => {
  const { bottom } = useSafeAreaInsets();
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
  
  useEffect(() => {
    if (openState) handlePresentModalPress();
  }, [openState, handlePresentModalPress]);

  // const handleExport = useCallback(() => {
  //   onExport && onExport();
  //   bottomSheetModalRef.current?.dismiss();
  // }, [onExport]);

  // const handleImport = useCallback(() => {
  //   onImport && onImport();
  //   bottomSheetModalRef.current?.dismiss();
  // }, [onImport]);

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        backdropComponent={renderBackdrop}
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        onDismiss={() => setOpenState(false)}
        backgroundStyle={{ backgroundColor: Colors.dark.primary }}
        handleIndicatorStyle={{ backgroundColor: Colors.dark.secondary }}
      >
        <BottomSheetView className='flex-1 px-5'>
          <View style={{ paddingBottom: bottom }} className='flex-1 gap-4'>
            <Text className='text-white text-xl font-bold mb-2 text-center'>
              Export / Import Data
            </Text>

            <View className='flex flex-row gap-4 h-32'>
              <TouchableOpacity
                activeOpacity={0.6}
                // onPress={handleExport}
                className='flex flex-col flex-1 items-center gap-2 justify-center border-2
                border-secondary/20 border-dashed rounded-2xl'>
                <Feather name="upload" size={24} color={Colors.dark.secondary} />
                <Text className='text-secondary/50 font-bold text-center'>
                  Export
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                activeOpacity={0.6}
                // onPress={handleImport}
                className='flex flex-col flex-1 items-center gap-2 justify-center border-2
                border-secondary/20 border-dashed rounded-2xl'>
                <Feather name="download" size={24} color={Colors.dark.secondary} />
                <Text className='text-secondary/50 font-bold text-center'>
                  Import
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};

export default ExportImportModal;