import { useLayoutEffect, useRef } from 'react'

export function usePointerUp(handle: () => void) {
  const handleRef = useRef(() => { })
  handleRef.current = handle

  useLayoutEffect(() => {
    const wrapper = () => {
      handleRef.current()
    }

    window.addEventListener('pointerup', wrapper)
    return () => {
      window.removeEventListener('pointerup', wrapper)
    }
  }, [])
}
