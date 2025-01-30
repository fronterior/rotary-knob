import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { RotationStatus, useRotationHandlers } from './useRotationHandlers'
import { usePointerUp } from './usePointerUp'
import { useSteppedRadians } from './useSteppedRadians'
import { useClampedRadians } from './useClampedRadians'
import type { RotationData } from '../../js/core'

export interface UseKnobProps {
  defaultValue?: number
  minAngle?: number
  maxAngle?: number
  minValue?: number
  maxValue?: number
  startAngle?: number
  stepValue?: number
  value?: number
  onDeltaChange?: (rotationData: RotationData) => void
  onValueChange?: (value: number, rotationData: RotationData) => void
  onStatusChange?: (status: RotationStatus) => void
}

export function useKnob({
  defaultValue = 0.5,
  minAngle,
  maxAngle,
  minValue = 0,
  maxValue = 1,
  startAngle = 0,
  stepValue,
  value,
  onDeltaChange,
  onValueChange,
  onStatusChange,
}: UseKnobProps) {
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

    const rangeRadians =
      Number.isFinite(maxRadians) && Number.isFinite(minRadians)
        ? maxRadians - minRadians
        : Math.PI * 2
    const stepRadians =
      stepValue && Number.isFinite(stepValue)
        ? (stepValue / (maxValue - minValue)) * rangeRadians
        : 0

    return { minRadians, maxRadians, startRadians, stepRadians }
  }, [minAngle, maxAngle, startAngle, stepValue, minValue, maxValue])

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

  // NOTE:
  // This state is used to support both uncontrolled and controlled values.
  // If the value prop is undefined, it is treated as uncontrolled, and the updated angle is synchronized with this state when a rotation event occurs.
  // When a value is provided, it is directly synchronized with this state(The value is internally converted to radians).
  // During rotation events, the value itself is not directly updated; instead, the onValueChange, onDeltaChange, and onStatusChange functions are called.
  // You need to update the value through these functions.
  const [integratedRadians, setIntegratedRadians] = useState(defaultRadians)
  const isControlledValue = value !== undefined

  const knobRef = useRef<HTMLDivElement>(null)

  const { rotationData, radians, setInternalRadians, status } =
    useRotationHandlers({
      defaultRadians,
      ref: knobRef,
    })

  const steppedRadians = useSteppedRadians(radians, stepRadians)
  const steppedValue = useMemo(() => {
    if (stepValue === undefined || value === undefined) {
      return null
    }

    const sign = Math.sign(rotationData['delta.radians'])

    return value + sign * stepValue
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepValue, steppedRadians])

  const clampedRadians = useClampedRadians(
    steppedRadians,
    minRadians,
    maxRadians,
  )
  const clampedValue = useMemo(() => {
    if (!steppedValue) {
      return null
    }

    return Math.min(maxValue, Math.max(minValue, steppedValue))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steppedValue, minValue, maxValue, stepValue])

  usePointerUp(() => {
    setInternalRadians(clampedRadians)
  })

  useLayoutEffect(() => {
    if (isControlledValue) {
      return
    }

    setIntegratedRadians(clampedRadians)
  }, [clampedRadians, isControlledValue])

  const computedAngle = useMemo(
    () => ((integratedRadians + startRadians) / Math.PI) * 180,
    [integratedRadians, startRadians],
  )

  const computedValue = useMemo(() => {
    if (clampedValue !== null) {
      return clampedValue
    }

    const computedValue =
      (clampedRadians / (maxRadians - minRadians)) * (maxValue - minValue)

    return computedValue + minValue
  }, [clampedRadians, minRadians, maxRadians, minValue, maxValue, clampedValue])

  // effect
  const previousRotationData = useRef<RotationData>({
    ['delta.angle']: 0,
    ['delta.radians']: 0,
    ['abs.angle']: computedAngle,
    ['abs.radians']: clampedRadians,
  })
  // It is called only when the knob angle changes.
  useLayoutEffect(() => {
    const rotationData = {
      ['delta.angle']:
        computedAngle - previousRotationData.current['abs.angle'],
      ['delta.radians']:
        clampedRadians - previousRotationData.current['abs.radians'],
      ['abs.angle']: computedAngle,
      ['abs.radians']: clampedRadians,
    }
    previousRotationData.current = rotationData

    onValueChange?.(computedValue, rotationData)
    // WARN: Intentionally exclude specific dependencies to ensure it is called only during rotation(uncontrolled)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clampedRadians, computedValue])

  // It is called when the drag rotation action(PointerMove) is performed.
  useLayoutEffect(() => {
    onDeltaChange?.(rotationData)
    // WARN: Intentionally exclude specific dependencies to ensure it is called only during rotation(uncontrolled)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotationData])

  // It is called when the knob is pressed, rotated, or released.
  useLayoutEffect(() => {
    onStatusChange?.(status)
    // WARN: Intentionally exclude specific dependencies to ensure it is called only during rotation(uncontrolled)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // for controlled value synchronization
  useLayoutEffect(() => {
    if (
      value === undefined ||
      minAngle == undefined ||
      maxAngle === undefined
    ) {
      return
    }
    const radiansByValueProp =
      ((minAngle +
        ((maxAngle - minAngle) * (value - minValue)) / (maxValue - minValue)) /
        180) *
      Math.PI

    if (Number.isNaN(radiansByValueProp)) {
      return
    }

    setIntegratedRadians(radiansByValueProp)
  }, [value, minAngle, maxAngle, minValue, maxValue, setInternalRadians])

  return {
    ref: knobRef,
    value: computedValue,
    angle: computedAngle,
    radians,
    rotationData,
    status,
  }
}
