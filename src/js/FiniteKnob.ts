import { attachKnobHandlers, KnobRotation, KnobStatus } from './core'
import { cursor } from './cursor-layer'
import { clamp, radiansToDegrees } from './utils'

export type CreateFiniteKnobParatemters = {
  defaultValue?: number
  minDegrees?: number
  maxDegrees?: number
  startDegrees?: number
  minValue?: number
  maxValue?: number
  stepValue?: number
  onDeltaChange?(rotation: KnobRotation): void
  onStatusChange?(status: KnobStatus): void
  onValueChange?(value: number, rotation: KnobRotation): void
}

export interface FiniteKnobOptions {
  minRadians: number
  maxRadians: number
  startDegrees?: number
  defaultValue: number
  minValue: number
  maxValue: number
  stepValue?: number
  isReversed?: boolean
  onDeltaChange?(rotation: KnobRotation): void
  onValueChange?(value: number, rotation: KnobRotation): void
  onStatusChange?(status: KnobStatus): void
}

export class FiniteKnob<Target extends HTMLElement> {
  value!: number

  rangeValue: number

  radians: number

  rangeRadians: number

  constructor(
    private target: Target,
    public options: FiniteKnobOptions,
  ) {
    const {
      minValue,
      maxValue,
      isReversed = false,
      onDeltaChange = () => {},
      onValueChange = () => {},
      onStatusChange = () => {},
    } = this.options

    this.options.startDegrees ??= 0

    this.rangeValue = maxValue - minValue

    this.setValue(options.defaultValue)

    this.rangeRadians = this.options.maxRadians - this.options.minRadians

    this.radians = this.valueToRadians(this.value)

    this.render(this.radians)

    this.destroy = attachKnobHandlers({
      target,
      onRotationStart: () => {
        onStatusChange(KnobStatus.Begin)
        cursor.show('grabbing')
      },
      onRotation: (rotation) => {
        this.radians += rotation['delta.radians']
        const { clampedValue, clampedRadians } = this.compute(this.radians)
        this.value = clampedValue
        this.render(clampedRadians)

        const value = isReversed
          ? maxValue - (this.value - minValue)
          : this.value

        onValueChange(value, {
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

  private compute(radians: number) {
    const { rangeValue, rangeRadians } = this
    const { minValue, maxValue } = this.options

    let value = minValue + (radians / rangeRadians) * rangeValue

    if (this.options.stepValue) {
      value = this.computeStep(value)
    }

    const clampedValue = clamp(value, minValue, maxValue)
    const clampedRadians = this.valueToRadians(clampedValue)

    return {
      clampedValue,
      clampedRadians,
    }
  }

  private computeStep(value: number) {
    const stepValue = this.options.stepValue!

    const previousValue = value - (value % stepValue)
    const nextValue = Math.min(previousValue + stepValue, this.options.maxValue) // The last stepValue may not be evenly distributed depending on the range of values, so it is necessary to compare it with maxValue to accurately reflect the rotation angle.

    return Math.abs(value - previousValue) < Math.abs(value - nextValue)
      ? previousValue
      : nextValue
  }

  private valueToRadians(value: number) {
    return (
      ((value - this.options.minValue) / this.rangeValue) * this.rangeRadians
    )
  }

  setValue(value: number) {
    const { minValue, maxValue, stepValue, isReversed } = this.options
    this.value = stepValue
      ? clamp(this.computeStep(value), minValue, maxValue)
      : value

    this.value = clamp(value, minValue, maxValue)

    if (isReversed) {
      this.value = maxValue - (this.value - minValue)
    }

    this.radians = this.valueToRadians(this.value)
  }

  getValue() {
    const { minValue, maxValue, isReversed } = this.options

    if (isReversed) {
      return maxValue - (this.value - minValue)
    }

    return this.value
  }

  render(radians: number) {
    const degrees = radiansToDegrees(
      clamp(radians, this.options.minRadians, this.options.maxRadians),
    )
    this.target.style.transform = `rotate(${this.options.startDegrees + degrees}deg)`
  }

  destroy() {
    // inited in constructor
  }
}
