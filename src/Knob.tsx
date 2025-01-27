import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react"
import { useRotationHandlers } from "./useKnobHandlers"
import { usePointerUp } from "./usePointerUp"
import styles from "./Knob.module.css"

interface KnobProps {
  defaultValue?: number
  minAngle?: number
  maxAngle?: number
  minValue?: number
  maxValue?: number
  children: ReactNode
  startAngle?: number
  stepAngle?: number
  onChange?: (value: number) => void
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
  onChange,
}: KnobProps) {
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

  const [radians, setRadians] = useRotationHandlers({
    defaultRadians,
    ref: knobRef,
  })

  const steppedRadians = useMemo(() => {
    if (!stepRadians) {
      return radians
    }

    const scaledValue = Math.floor(radians / stepRadians)

    const lowValue = scaledValue
    const highValue = scaledValue + 1

    return (
      (((stepRadians + (radians % stepRadians)) % stepRadians) / stepRadians >
        0.5
        ? highValue
        : lowValue) * stepRadians
    )
  }, [radians, stepRadians])

  const clampedRadians = useMemo(() => {
    return Math.min(maxRadians, Math.max(minRadians, steppedRadians))
  }, [steppedRadians, minRadians, maxRadians])

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
  useLayoutEffect(() => {
    onChange?.(value)
  }, [value, onChange])

  if (!children) {
    return null
  }

  return (
    <div
      className={styles.container}
      style={{
        transform: `rotate(${computedAngle}deg)`,
      }}
      ref={knobRef}
    >
      {children}
    </div>
  )
}
