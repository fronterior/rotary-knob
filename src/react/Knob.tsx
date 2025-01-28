import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react"
import { RotationStatus, useRotationHandlers } from "./hooks/useRotationHandlers"
import { usePointerUp } from "./hooks/usePointerUp"
import { useSteppedRadians } from "./hooks/useSteppedRadians"
import { useClampedRadians } from "./hooks/useClampedRadians"
import type { RotationData } from "../js/core"

interface KnobProps {
  defaultValue?: number
  minAngle?: number
  maxAngle?: number
  minValue?: number
  maxValue?: number
  children: ReactNode
  startAngle?: number
  stepAngle?: number
  onDeltaChange?: (rotationData: RotationData) => void
  onValueChange?: (value: number, rotationData: RotationData) => void
  onStatusChange?: (status: RotationStatus) => void
}

export function Knob({
  defaultValue = 0.5,
  minAngle,
  maxAngle,
  minValue = 0,
  maxValue = 1,
  children,
  startAngle = 0,
  stepAngle,
  onDeltaChange,
  onValueChange,
  onStatusChange,
}: KnobProps) {
  // props to radians
  const { minRadians, maxRadians, startRadians, stepRadians } = useMemo(() => {
    const minRadians = Number.isFinite(minAngle)
      ? (minAngle! / 180) * Math.PI
      : -Infinity
    const maxRadians = Number.isFinite(maxAngle)
      ? (maxAngle! / 180) * Math.PI
      : Infinity
    const startRadians =
      startAngle && Number.isFinite(startAngle)
        ? (startAngle / 180) * Math.PI
        : 0
    const stepRadians =
      stepAngle && Number.isFinite(stepAngle) ? (stepAngle / 180) * Math.PI : 0

    return { minRadians, maxRadians, startRadians, stepRadians }
  }, [minAngle, maxAngle, startAngle, stepAngle])

  // defaultValue to radians
  const defaultRadians = useMemo(() => {
    if (minAngle === undefined || maxAngle === undefined) {
      return 0
    }

    return (
      ((minAngle +
        ((maxAngle - minAngle) * (defaultValue - minValue)) /
        (maxValue - minValue)) /
        180) *
      Math.PI
    )
  }, [minAngle, maxAngle, defaultValue, minValue, maxValue])

  const knobRef = useRef<HTMLDivElement>(null)

  const { rotationData, radians, setRadians, status } = useRotationHandlers({
    defaultRadians,
    ref: knobRef,
  })

  const steppedRadians = useSteppedRadians(radians, stepRadians)

  const clampedRadians = useClampedRadians(steppedRadians, minRadians, maxRadians)

  usePointerUp(() => {
    setRadians(clampedRadians)
  })

  const computedAngle = useMemo(
    () => ((clampedRadians + startRadians) / Math.PI) * 180,
    [clampedRadians, startRadians],
  )

  const value = useMemo(() => {
    const computedValue =
      (clampedRadians / (maxRadians - minRadians)) * (maxValue - minValue)

    return computedValue + minValue
  }, [clampedRadians, minRadians, maxRadians, minValue, maxValue])

  const previousRotationData = useRef<RotationData>({
    ['delta.angle']: 0,
    ['delta.radians']: 0,
    ['abs.angle']: computedAngle,
    ['abs.radians']: clampedRadians
  })
  useLayoutEffect(() => {
    const rotationData = {
      ['delta.angle']: computedAngle - previousRotationData.current['abs.angle'],
      ['delta.radians']: clampedRadians - previousRotationData.current['abs.radians'],
      ['abs.angle']: computedAngle,
      ['abs.radians']: clampedRadians
    }
    onValueChange?.(value, rotationData)
    previousRotationData.current = rotationData
  }, [clampedRadians, computedAngle, value, onValueChange])

  useLayoutEffect(() => {
    onDeltaChange?.(rotationData)
  }, [rotationData, onDeltaChange])

  useLayoutEffect(() => {
    onStatusChange?.(status)
  }, [status, onStatusChange])

  if (!children) {
    return null
  }

  return (
    <div
      style={{
        display: 'inline-block',
        cursor: 'grab',
        transform: `rotate(${computedAngle}deg)`,
      }}
      ref={knobRef}
    >
      {children}
    </div>
  )
}
