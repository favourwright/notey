import React, { forwardRef, useCallback, useMemo } from 'react'
import { NativeScrollEvent, NativeSyntheticEvent, SectionList, SectionListRenderItemInfo, View } from 'react-native'
import { SharedValue } from 'react-native-reanimated'
import NoteItem from './NoteItem'
import { NoteType } from '@/store/notes'
import Seperator from '../Seperator'

type Props = {
  notes: NoteType[]
  onShowOptions: (note: NoteType) => void
  removingNoteId: string | null
  listFade: SharedValue<number>
  // scrolls away with the list
  header: React.ReactElement
  // stays pinned to the top of the screen
  stickyHeader: React.ReactElement
  footer: React.ReactElement | null
  onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => void
}

const ItemSeparator = () => (
  <View className='px-5'>
    <Seperator padding='px-0' color='bg-secondary/20' />
  </View>
)

const Notelist = forwardRef<SectionList<NoteType>, Props>(({
  notes,
  onShowOptions,
  removingNoteId,
  listFade,
  header,
  stickyHeader,
  footer,
  onScroll,
}, ref) => {
  const sections = useMemo(() => [{ key: 'notes', data: notes }], [notes])

  const renderItem = useCallback(({ item, index }: SectionListRenderItemInfo<NoteType>) => (
    <View className='px-5'>
      {index === 0 && <View className='mt-8'>
        <Seperator padding='px-0' color='bg-secondary/20' />
      </View>}
      <NoteItem
        note={item}
        index={index}
        onShowOptions={onShowOptions}
        isRemoving={item.id === removingNoteId}
        listFade={listFade}
      />
    </View>
  ), [onShowOptions, removingNoteId, listFade])

  const renderSectionHeader = useCallback(() => stickyHeader, [stickyHeader])

  return (
    <SectionList
      ref={ref}
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 80 }}
      sections={sections}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      stickySectionHeadersEnabled
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      ItemSeparatorComponent={ItemSeparator}
      initialNumToRender={12}
      windowSize={7}
      onScroll={onScroll}
      scrollEventThrottle={32}
    />
  )
})

export default Notelist
