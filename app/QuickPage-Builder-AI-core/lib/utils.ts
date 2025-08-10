import { useRef, Ref, RefObject, useEffect } from 'react';

export function useCombinedRefs<T>(...refs: Array<Ref<T> | undefined>): RefObject<T> {
  const targetRef = useRef<T>(null);

  useEffect(() => {
    refs.forEach(ref => {
      if (!ref) return;

      if (typeof ref === 'function') {
        ref(targetRef.current);
      } else {
        if ((ref as RefObject<T>).current !== undefined) {
          (ref as RefObject<T>).current = targetRef.current as T;
        }
      }
    });
  }, [refs]);

  return targetRef as RefObject<T>;
}