import { useRef, useEffect } from 'react';

export function useDebounce<T extends (...args: any[]) => void>(
  func: T,
  wait?: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait || 500);
  };
}

// export function useDebounce<T extends (...args: any[]) => void>(
//   func: T,
//   wait = 500
// ): T {
//   const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

//   useEffect(() => {
//     return () => {
//       if (timeout.current) clearTimeout(timeout.current);
//     };
//   }, []);

//   return ((...args: any[]) => {
//     if (timeout.current) clearTimeout(timeout.current);
//     timeout.current = setTimeout(() => {
//       func(...args);
//     }, wait);
//   }) as T;
// }
