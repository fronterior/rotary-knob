import { attachKnobHandlers, KnobRotation, KnobStatus } from './core'
import { cursor } from './cursor-layer'
import { clamp, radiansToDegrees } from './utils'

interface FiniteKnobOptions {
  defaultRadians: number
  minRadians: number
  maxRadians: number
  rangeRadians: number
  startDegrees: number
  defaultValue: number
  minValue: number
  maxValue: number
  rangeValue: number
  stepValue?: number
  stepDegrees?: number
  onDeltaChange(rotation: KnobRotation): void
  onValueChange(value: number, rotation: KnobRotation): void
  onStatusChange(status: KnobStatus): void
}

export class FiniteKnob<Target extends HTMLElement> {
  value: number
  radians: number

  constructor(
    private target: Target,
    public options: FiniteKnobOptions,
  ) {
    const { onDeltaChange, onValueChange, onStatusChange } = this.options
    this.value = options.defaultValue
    this.radians = options.defaultRadians

    this.render(this.radians)

    this.destory = attachKnobHandlers({
      target,
      onRotationStart: () => {
        onStatusChange(KnobStatus.Begin)
        cursor.show('grabbing')
      },
      onRotation: (rotation) => {
        this.radians += rotation['delta.radians']
        const { clampedValue, clampedRadians } = this.computeValue(this.radians)
        console.log(rotation)
        this.value = clampedValue

        this.render(clampedRadians)

        onValueChange(this.value, {
          ...rotation,
          'abs.radians': clampedRadians,
          'abs.degrees': radiansToDegrees(clampedRadians),
        })
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

  private computeValue(radians: number) {
    const { minValue, maxValue, rangeValue, rangeRadians } = this.options

    let value = minValue + (radians / rangeRadians) * rangeValue

    if (this.options.stepValue) {
      value = this.computeSteppedValue(value)
    }

    const clampedValue = clamp(value, minValue, maxValue)
    const clampedRadians = this.valueToRadians(clampedValue)

    return {
      clampedValue,
      clampedRadians,
    }
  }

  private computeSteppedValue(value: number) {
    const stepValue = this.options.stepValue!

    const previousValue = value - (value % stepValue)
    const nextValue = Math.min(previousValue + stepValue, this.options.maxValue) // The last stepValue may not be evenly distributed depending on the range of values, so it is necessary to compare it with maxValue to accurately reflect the rotation angle.

    return Math.abs(value - previousValue) < Math.abs(value - nextValue)
      ? previousValue
      : nextValue
  }

  private valueToRadians(value: number) {
    return (
      ((value - this.options.minValue) / this.options.rangeValue) *
      this.options.rangeRadians
    )
  }

  setValue(value: number) {
    this.value = this.options.stepValue
      ? clamp(
          this.computeSteppedValue(value),
          this.options.minValue,
          this.options.maxValue,
        )
      : value

    this.value = clamp(value, this.options.minValue, this.options.maxValue)
    this.radians = this.valueToRadians(this.value)
  }

  render(radians: number) {
    const degrees = radiansToDegrees(
      clamp(radians, this.options.minRadians, this.options.maxRadians),
    )
    this.target.style.transform = `rotate(${this.options.startDegrees + degrees}deg)`
  }

  destory() {
    // inited in constructor
  }
}
