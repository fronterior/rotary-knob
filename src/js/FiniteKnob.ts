import { attachKnobHandlers, KnobRotation, KnobStatus } from './core'
import { cursor } from './cursor-layer'
import { clamp, radiansToDegrees } from './utils'

interface FiniteKnobOptions {
  defaultRadians: number
  minRadians: number
  maxRadians: number
  rangeRadians: number
  startRadians: number
  stepRadians: number
  defaultValue: number
  minValue: number
  maxValue: number
  rangeValue: number
  stepValue?: number
  onDeltaChange(rotation: KnobRotation): void
  onValueChange(value: number, rotation: KnobRotation): void
  onStatusChange(status: KnobStatus): void
}

export class FiniteKnob<Target extends HTMLElement> {
  value: number
  radians: number
  constructor(
    target: Target,
    public options: FiniteKnobOptions,
  ) {
    const { onDeltaChange, onValueChange, onStatusChange } = this.options
    this.value = options.defaultValue
    this.radians = options.defaultRadians

    this.destory = attachKnobHandlers({
      target,
      onRotationStart: () => {
        onStatusChange(KnobStatus.Begin)
        cursor.show('grabbing')
      },
      onRotation: (rotation) => {
        // const { value, radians } = this.compute(rotation)

        // this.value = value
        this.radians += rotation['delta.radians']
        const { value } = this.compute(this.radians)

        onValueChange(value, rotation)
        onDeltaChange(rotation)
        onStatusChange(KnobStatus.Rotating)
      },
      onRotationEnd: () => {
        this.radians = clamp(
          this.radians,
          options.minRadians,
          options.maxRadians,
        )

        onStatusChange(KnobStatus.End)
        setTimeout(() => onStatusChange(KnobStatus.Idle))
        cursor.hide()
      },
    })
  }

  private compute(radians: number) {
    const { minValue, maxValue, rangeValue, rangeRadians } = this.options

    const value = minValue + (radians / rangeRadians) * rangeValue

    return {
      value: clamp(value, minValue, maxValue),
    }
  }

  destory() {
    // inited in constructor
  }
}
