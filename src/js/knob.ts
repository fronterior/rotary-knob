import { attachKnobHandlers, KnobRotation, KnobStatus } from './core'
import { cursor } from './cursor-layer'
import { degreesToRadians } from './utils'

export interface KnobOptions {
  defaultValue?: number
  minDegrees?: number
  maxDegrees?: number
  minValue?: number
  maxValue?: number
  startDegrees?: number
  stepDegrees?: number
  stepValue?: number
  value?: number
  onDeltaChange?(rotation: KnobRotation): void
  onValueChange?(value: number, rotation: KnobRotation): void
  onStatusChange?(status: KnobStatus): void
}

export class Knob<Target extends HTMLElement> {
  private options: KnobOptions = {
    defaultValue: 0.5,
    minDegrees: -Infinity,
    maxDegrees: Infinity,
    minValue: 0,
    maxValue: 1,
    startDegrees: 0,
  }

  isInfiniteKnob: boolean
  minRadians: number
  maxRadians: number
  startRadians: number
  stepRadians: number
  defaultRadians: number
  isControlledValue: boolean

  constructor(
    public target: Target,
    options: KnobOptions,
  ) {
    Object.assign(this.options, options)

    const {
      defaultValue: defaultValueOptional,
      value,
      minDegrees: minDegreesOptional,
      maxDegrees: maxDegreesOptional,
      minValue: minValueOptional,
      maxValue: maxValueOptional,
      startDegrees,
      stepDegrees,
      stepValue,
      onDeltaChange,
      onValueChange,
      onStatusChange,
    } = this.options

    // Those values should actually exist
    const defaultValue = defaultValueOptional!
    const minDegrees = minDegreesOptional!
    const maxDegrees = maxDegreesOptional!
    const minValue = minValueOptional!
    const maxValue = maxValueOptional!

    const isFiniteMinDegrees = Number.isFinite(minDegreesOptional)
    const isFiniteMaxDegrees = Number.isFinite(maxDegreesOptional)

    if (isFiniteMinDegrees !== isFiniteMaxDegrees) {
      throw new Error(
        `Both minDegrees and maxDegrees must either be provided together or not provided at all. Current values: minDegrees: ${options.minDegrees}, maxDegrees: ${options.maxDegrees}`,
      )
    }

    this.isInfiniteKnob = !isFiniteMinDegrees && !isFiniteMaxDegrees
    if (
      this.isInfiniteKnob ||
      'minValue' in options ||
      'maxValue' in options ||
      'value' in options ||
      'defaultValue' in options ||
      'stepValue' in options
    ) {
      console.warn(
        'Infinite knob does not support minValue, maxValue, defaultValue, stepValue, or value.',
      )
    }

    this.minRadians = Number.isFinite(minDegrees)
      ? degreesToRadians(minDegrees)
      : -Infinity
    this.maxRadians = Number.isFinite(maxDegrees)
      ? degreesToRadians(maxDegrees)
      : Infinity
    this.startRadians =
      startDegrees && Number.isFinite(startDegrees)
        ? degreesToRadians(startDegrees)
        : 0

    const rangeRadians =
      Number.isFinite(this.maxRadians) && Number.isFinite(this.minRadians)
        ? this.maxRadians - this.minRadians
        : Math.PI * 2
    const isValidStepValue = stepValue && Number.isFinite(stepValue)
    this.stepRadians = isValidStepValue
      ? (stepValue / (maxValue! - minValue!)) * rangeRadians
      : 0
    this.stepRadians =
      this.isInfiniteKnob && stepDegrees
        ? degreesToRadians(stepDegrees)
        : this.stepRadians

    this.defaultRadians = degreesToRadians(
      minDegrees +
        ((maxDegrees - minDegrees) * (defaultValue - minValue)) /
          (maxValue - minValue),
    )

    this.isControlledValue = value !== undefined

    this.destory = attachKnobHandlers({
      target,
      onRotationStart() {
        onStatusChange?.(KnobStatus.Begin)
        cursor.show('grabbing')
      },
      onRotation(data) {
        // onValueChange
        onDeltaChange?.(data)
        onStatusChange?.(KnobStatus.Rotating)
      },
      onRotationEnd() {
        onStatusChange?.(KnobStatus.End)
        setTimeout(() => onStatusChange?.(KnobStatus.Idle))
        cursor.hide()
      },
    })
  }

  setOptions(options: KnobOptions) {
    const mergedOptions = { ...this.options, ...options }
    this.destory()

    return new Knob(this.target, mergedOptions)
  }

  destory() {
    // inited in constructor
  }
}
