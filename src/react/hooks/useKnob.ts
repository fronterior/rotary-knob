import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { RotationStatus, useRotationHandlers } from './useRotationHandlers'
import { useSteppedRadians } from './useSteppedRadians'
import { useClampedRadians } from './useClampedRadians'
import type { RotationData } from '../../js/core'

export interface UseKnobProps {
  defaultValue?: number
  minDegrees?: number
  maxDegrees?: number
  minValue?: number
  maxValue?: number
  startDegrees?: number
  stepDegrees?: number
  stepValue?: number
  value?: number
  onDeltaChange?: (rotationData: RotationData) => void
  onValueChange?: (value: number, rotationData: RotationData) => void
  onStatusChange?: (status: RotationStatus) => void
}

export function useKnob({
  defaultValue = 0.5,
  minDegrees = -Infinity,
  maxDegrees = Infinity,
  minValue = 0,
  maxValue = 1,
  startDegrees = 0,
  stepDegrees,
  stepValue,
  value,
  onDeltaChange,
  onValueChange,
  onStatusChange,
}: UseKnobProps) {
  const isInfiniteKnob =
    !Number.isFinite(minDegrees) && !Number.isFinite(maxDegrees)

  // props to radians
  const { minRadians, maxRadians, startRadians, stepRadians } = useMemo(() => {
    const minRadians = Number.isFinite(minDegrees)
      ? (minDegrees! / 180) * Math.PI
      : -Infinity
    const maxRadians = Number.isFinite(maxDegrees)
      ? (maxDegrees! / 180) * Math.PI
      : Infinity
    const startRadians =
      startDegrees && Number.isFinite(startDegrees)
        ? (startDegrees / 180) * Math.PI
        : 0

    const rangeRadians =
      Number.isFinite(maxRadians) && Number.isFinite(minRadians)
        ? maxRadians - minRadians
        : Math.PI * 2
    const isValidStepValue = stepValue && Number.isFinite(stepValue)
    let stepRadians = isValidStepValue
      ? (stepValue / (maxValue - minValue)) * rangeRadians
      : 0
    stepRadians =
      isInfiniteKnob && stepDegrees
        ? (stepDegrees / 180) * Math.PI
        : stepRadians

    return { minRadians, maxRadians, startRadians, stepRadians }
  }, [
    minDegrees,
    maxDegrees,
    startDegrees,
    stepValue,
    minValue,
    maxValue,
    stepDegrees,
    isInfiniteKnob,
  ])

  // defaultValue to radians
  const defaultRadians = useMemo(() => {
    if (
      minDegrees === undefined ||
      maxDegrees === undefined ||
      isInfiniteKnob
    ) {
      return 0
    }

    return (
      ((minDegrees +
        ((maxDegrees - minDegrees) * (defaultValue - minValue)) /
        (maxValue - minValue)) /
        180) *
      Math.PI
    )
  }, [minDegrees, maxDegrees, defaultValue, minValue, maxValue, isInfiniteKnob])

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
      ref: knobRef,
      defaultRadians,
      onRotationEnd() {
        setInternalRadians(clampedRadians)
      },
    })

  const knobStatusRef = useRef(status)
  knobStatusRef.current = status

  const steppedRadians = useSteppedRadians(radians, stepRadians)

  const clampedRadians = useClampedRadians(
    steppedRadians,
    minRadians,
    maxRadians,
  )

  useLayoutEffect(() => {
    if (isControlledValue) {
      return
    }

    setIntegratedRadians(clampedRadians)
  }, [clampedRadians, isControlledValue])

  const computedDegrees = useMemo(
    () => ((integratedRadians + startRadians) / Math.PI) * 180,
    [integratedRadians, startRadians],
  )

  const computedValue = useMemo(() => {
    const computedValue =
      (clampedRadians / (maxRadians - minRadians)) * (maxValue - minValue)
    if (Number.isNaN(computedValue)) {
      return 0
    }

    if (!stepValue) {
      return computedValue + minValue
    }

    const previousValue = computedValue - (computedValue % stepValue)
    const nextValue = Math.min(previousValue + stepValue, maxValue)

    return Math.abs(computedValue - previousValue) <
      Math.abs(computedValue - nextValue)
      ? previousValue
      : nextValue
  }, [clampedRadians, minRadians, maxRadians, minValue, maxValue, stepValue])

  // effect
  const previousRotationData = useRef<RotationData>({
    ['delta.degrees']: 0,
    ['delta.radians']: 0,
    ['abs.degrees']: computedDegrees,
    ['abs.radians']: clampedRadians,
  })
  // It is called only when the knob angle changes.
  useLayoutEffect(() => {
    const rotationData = {
      ['delta.degrees']:
        computedDegrees - previousRotationData.current['abs.degrees'],
      ['delta.radians']:
        clampedRadians - previousRotationData.current['abs.radians'],
      ['abs.degrees']: computedDegrees,
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
      minDegrees == undefined ||
      maxDegrees === undefined
    ) {
      return
    }
    const radiansByValueProp =
      ((minDegrees +
        ((maxDegrees - minDegrees) * (value - minValue)) /
        (maxValue - minValue)) /
        180) *
      Math.PI

    if (Number.isNaN(radiansByValueProp)) {
      return
    }

    // NOTE:
    // stepValue is designed to ignore knob rotation corresponding to the value's angle.
    // However, if internalRadians is updated when the value changes,
    // the ignored interval in the useSteppedRadians hook gets reset,
    // causing the knob to rotate at an angle equal to half of stepValue.
    // Therefore, when stepValue is present, internalRadians is not updated here,
    // and changes are driven by the value derived from useSteppedRadians.
    // Or, even if stepValue is set, it will synchronize when the value change is triggered externally rather than through a rotation action.
    if (!stepValue || knobStatusRef.current === RotationStatus.Idle) {
      setInternalRadians(radiansByValueProp)
    }
    setIntegratedRadians(radiansByValueProp)
  }, [
    value,
    minDegrees,
    maxDegrees,
    minValue,
    maxValue,
    stepValue,
    setInternalRadians,
  ])

  return {
    ref: knobRef,
    value: computedValue,
    degrees: computedDegrees,
    radians,
    rotationData,
    status,
  }
}
