import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { exportData, importData, showOperationToast } from '@/store/notes';

const ExportImportModal = ({
  isOpen: [openState, setOpenState],
  onOperationComplete,
}: {
  isOpen: [boolean, (value: boolean) => void];
  onOperationComplete?: () => void;
}) => {
  const { bottom } = useSafeAreaInsets();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => [200], []);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

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

  const handleExport = useCallback(async () => {
    try {
      setIsExporting(true);
      const result = await exportData();
      
      if (result) {
        showOperationToast('Export successful!');
      } else {
        showOperationToast('Export failed', false);
      }
      
      if (onOperationComplete) {
        onOperationComplete();
      }
    } catch (error) {
      console.error('Export error:', error);
      showOperationToast('Export failed', false);
    } finally {
      setIsExporting(false);
    }
  }, [onOperationComplete]);

  const handleImport = useCallback(async () => {
    try {
      setIsImporting(true);
      const success = await importData();
      
      if (success) {
        showOperationToast('Import successful!');
        bottomSheetModalRef.current?.dismiss();
        if (onOperationComplete) {
          onOperationComplete();
        }
      } else {
        showOperationToast('Import cancelled or failed', false);
      }
    } catch (error) {
      console.error('Import error:', error);
      showOperationToast('Import failed', false);
    } finally {
      setIsImporting(false);
    }
  }, [onOperationComplete]);

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
                onPress={handleExport}
                disabled={isExporting || isImporting}
                className='flex flex-col flex-1 items-center gap-2 justify-center border-2
                 border-secondary/20 border-dashed rounded-2xl'>
                {isExporting ? (
                  <ActivityIndicator color={Colors.dark.secondary} size="small" />
                ) : (
                  <Feather name="upload" size={24} color={Colors.dark.secondary} />
                )}
                <Text className='text-secondary/50 font-bold text-center'>
                  {isExporting ? 'Exporting...' : 'Export'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                activeOpacity={0.6}
                onPress={handleImport}
                disabled={isExporting || isImporting}
                className='flex flex-col flex-1 items-center gap-2 justify-center border-2
                 border-secondary/20 border-dashed rounded-2xl'>
                {isImporting ? (
                  <ActivityIndicator color={Colors.dark.secondary} size="small" />
                ) : (
                  <Feather name="download" size={24} color={Colors.dark.secondary} />
                )}
                <Text className='text-secondary/50 font-bold text-center'>
                  {isImporting ? 'Importing...' : 'Import'}
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