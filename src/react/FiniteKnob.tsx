import { useLayoutEffect, useRef, type ReactNode } from 'react'
import {
  FiniteKnob as FiniteKnobClass,
  type FiniteKnobOptions,
} from '../js/FiniteKnob'

export function FiniteKnob({
  children,
  ...params
}: { children: ReactNode } & FiniteKnobOptions) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!ref.current) {
      return
    }

    const finiteKnob = new FiniteKnobClass(ref.current, params)

    return () => {
      finiteKnob.destroy()
    }
  }, [])

  return (
    <div
      ref={ref}
      style={{
        display: 'inline-block',
        cursor: 'grab',
      }}
    >
      {children}
    </div>
  )
}
