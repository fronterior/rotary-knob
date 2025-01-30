import { type ReactNode } from 'react'
import { useKnob, UseKnobProps } from './hooks/useKnob'

interface KnobProps extends UseKnobProps {
  children: ReactNode
}

export function Knob({
  defaultValue = 0.5,
  minAngle,
  maxAngle,
  minValue = 0,
  maxValue = 1,
  children,
  startAngle = 0,
  stepValue,
  value,
  onDeltaChange,
  onValueChange,
  onStatusChange,
}: KnobProps) {
  const { ref, angle } = useKnob({
    defaultValue,
    minAngle,
    maxAngle,
    minValue,
    maxValue,
    startAngle,
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
        transform: `rotate(${angle}deg)`,
      }}
      ref={ref}
    >
      {children}
    </div>
  )
}
