import { useMemo, useRef } from "react"
import { useRotationHandlers } from "./useKnobHandlers"
import "./Knob.css"
import { usePointerUp } from "./usePointerUp"

export function Knob() {
  const options = useMemo(
    () => ({
      minAngle: 0,
      maxAngle: 300,
      minValue: 0,
      maxValue: 5,
      defaultValue: 0,
      startAngle: 210,
      step: 300 / 5,
    }),
    [],
  )

  const { minRadians, maxRadians, startRadians, stepRadians } = useMemo(() => {
    const { minAngle, maxAngle, startAngle, step } = options
    const minRadians = (minAngle / 180) * Math.PI
    const maxRadians = (maxAngle / 180) * Math.PI
    const startRadians = (startAngle / 180) * Math.PI
    const stepRadians = (step / 180) * Math.PI

    return { minRadians, maxRadians, startRadians, stepRadians }
  }, [options])

  const knobRef = useRef<HTMLButtonElement>(null)

  const [radians, setRadians] = useRotationHandlers({
    defaultRadians: options.defaultValue,
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
    const { minValue, maxValue } = options
    const computedValue =
      (clampedRadians / (maxRadians - minRadians)) * (maxValue - minValue)

    return computedValue + minValue
  }, [clampedRadians, minRadians, maxRadians, options])

  return (
    <>
      <div style={{ width: 30, height: 30, background: "blue" }}></div>
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
