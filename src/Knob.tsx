import { useMemo, useRef } from "react"
import { useRotationHandlers } from "./useKnobHandlers"
import "./Knob.css"
import { usePointerUp } from "./usePointerUp"

interface KnobProps {
  minAngle?: number
  maxAngle?: number
  minValue?: number
  maxValue?: number
  defaultValue?: number
  startAngle?: number
  stepAngle?: number
}

export function Knob({
  minAngle,
  maxAngle,
  minValue = 0,
  maxValue = 1,
  defaultValue = 0.5,
  startAngle = 0,
  stepAngle,
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

  const knobRef = useRef<HTMLButtonElement>(null)

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

  const value = useMemo(() => {
    const computedValue =
      (clampedRadians / (maxRadians - minRadians)) * (maxValue - minValue)

    return computedValue + minValue
  }, [clampedRadians, minRadians, maxRadians, minValue, maxValue])

  return (
    <>
      <div className="knob-container">
        <button
          className="knob-head"
          draggable
          style={{
            cursor: "grab",
            transform: `rotate(${((clampedRadians + startRadians) / Math.PI) * 180}deg)`,
          }}
          ref={knobRef}
        ></button>
      </div>
      <div>{value.toFixed(3)}</div>
    </>
  )
}
