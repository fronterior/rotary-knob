import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react"
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
  value?: number
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
  value,
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

  const [integratedRadians, setIntegratedRadians] = useState(defaultRadians)
  const isControlledValue = value !== undefined

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
    const computedValue =
      (clampedRadians / (maxRadians - minRadians)) * (maxValue - minValue)

    return computedValue + minValue
  }, [clampedRadians, minRadians, maxRadians, minValue, maxValue])

  // effect
  const ignoreEffectRef = useRef(false)
  const previousRotationData = useRef<RotationData>({
    ['delta.angle']: 0,
    ['delta.radians']: 0,
    ['abs.angle']: computedAngle,
    ['abs.radians']: clampedRadians
  })
  // It is called only when the knob angle changes.
  useLayoutEffect(() => {
    const rotationData = {
      ['delta.angle']: computedAngle - previousRotationData.current['abs.angle'],
      ['delta.radians']: clampedRadians - previousRotationData.current['abs.radians'],
      ['abs.angle']: computedAngle,
      ['abs.radians']: clampedRadians
    }
    previousRotationData.current = rotationData

    if (ignoreEffectRef.current) {
      return
    }

    onValueChange?.(computedValue, rotationData)
    // WARN: Intentionally exclude specific dependencies to ensure it is called only during rotation(uncontrolled)
  }, [clampedRadians, computedValue])

  // It is called when the drag rotation action is performed.
  useLayoutEffect(() => {
    if (ignoreEffectRef.current) {
      return
    }

    onDeltaChange?.(rotationData)
    // WARN: Intentionally exclude specific dependencies to ensure it is called only during rotation(uncontrolled)
  }, [rotationData])

  // It is called when the knob is pressed, rotated, or released.
  useLayoutEffect(() => {
    if (ignoreEffectRef.current) {
      return
    }

    onStatusChange?.(status)
    // WARN: Intentionally exclude specific dependencies to ensure it is called only during rotation(uncontrolled)
  }, [status])

  // for controlled value prop
  useLayoutEffect(() => {
    if (
      value === undefined ||
      minAngle == undefined ||
      maxAngle === undefined
    ) {
      return
    }
    const radiansByValueProp = ((minAngle +
      ((maxAngle - minAngle) * (value - minValue)) /
      (maxValue - minValue)) /
      180) *
      Math.PI

    if (Number.isNaN(radiansByValueProp)) {
      return
    }

    ignoreEffectRef.current = true
    setIntegratedRadians(radiansByValueProp)
    setRadians(radiansByValueProp)

  }, [value, minAngle, maxAngle, minValue, maxValue, setRadians])


  useEffect(() => {
    ignoreEffectRef.current = false
  }, [ignoreEffectRef.current])

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
