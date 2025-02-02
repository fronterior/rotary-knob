import { useLayoutEffect, useRef } from 'react'

export function usePointerUp(handle: (ev: PointerEvent) => void) {
  const handleRef = useRef<typeof handle>(() => { })
  handleRef.current = handle

  useLayoutEffect(() => {
    const wrapper: typeof handle = (ev) => {
      handleRef.current(ev)
    }

    window.addEventListener('pointerup', wrapper)
    return () => {
      window.removeEventListener('pointerup', wrapper)
    }
  }, [])
}
