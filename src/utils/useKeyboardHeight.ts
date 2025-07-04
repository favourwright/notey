import { useCallback, useState } from 'react';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import { runOnJS } from 'react-native-reanimated';

/**
 * useKeyboardHeight
 * Returns the current keyboard height (in px) as it appears/disappears/moves.
 *
 * Usage:
 *   const keyboardHeight = useKeyboardHeight();
 */
export function useKeyboardHeight(): number {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const setHeight = useCallback((height: number) => {
    setKeyboardHeight(height);
  }, []);

  useKeyboardHandler(
    {
      onStart: (e) => {
        'worklet';
        runOnJS(setHeight)(e.height);
      },
      onEnd: (e) => {
        'worklet';
        runOnJS(setHeight)(e.height);
      },
      onInteractive: (e) => {
        'worklet';
        runOnJS(setHeight)(e.height);
      },
    },
    [setHeight]
  );

  return keyboardHeight;
} 