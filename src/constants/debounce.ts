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