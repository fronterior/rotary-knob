import { useMemo, useRef } from "react"
import { useKnobHandlers } from "./useKnobHandlers"
import "./Knob.css"

export function Knob() {
  const options = useMemo(
    () => ({
      minAngle: 0,
      maxAngle: 270,
      minValue: 0,
      maxValue: 1,
      defaultValue: 0,
      startAngle: 225,
      step: 6,
    }),
    [],
  )

  const knobRef = useRef<HTMLButtonElement>(null)

  const radians = useKnobHandlers({
    defaultValue: options.defaultValue,
    ref: knobRef,
  })

  const { minRadians, maxRadians, startRadians } = useMemo(() => {
    const { minAngle, maxAngle, startAngle } = options
    const minRadians = (minAngle / 180) * Math.PI
    const maxRadians = (maxAngle / 180) * Math.PI
    const startRadians = (startAngle / 180) * Math.PI

    return { minRadians, maxRadians, startRadians }
  }, [options])

  const clampedRadians = useMemo(() => {
    return Math.min(maxRadians, Math.max(minRadians, radians))
  }, [radians, minRadians, maxRadians])

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
