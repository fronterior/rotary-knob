import { type ReactNode } from 'react'
import { useKnob, UseKnobProps } from './hooks/useKnob'

interface KnobProps extends UseKnobProps {
  children: ReactNode
}

export function Knob({
  defaultValue = 0.5,
  minDegrees,
  maxDegrees,
  minValue = 0,
  maxValue = 1,
  children,
  startDegrees = 0,
  stepDegrees,
  stepValue,
  value,
  onDeltaChange,
  onValueChange,
  onStatusChange,
}: KnobProps) {
  const { ref, degrees } = useKnob({
    defaultValue,
    minDegrees,
    maxDegrees,
    minValue,
    maxValue,
    startDegrees,
    stepDegrees,
    stepValue,
    value,
    onDeltaChange,
    onValueChange,
    onStatusChange,
  })

  if (!children) {
    return null
  }

  return (
    <div
      style={{
        display: 'inline-block',
        cursor: 'grab',
        transform: `rotate(${degrees}deg)`,
      }}
      ref={ref}
    >
      {children}
    </div>
  )
}
