import { attachKnobHandlers, KnobRotation, KnobStatus } from './core'
import { cursor } from './cursor-layer'
import { FiniteKnob } from './FiniteKnob'
import { InfiniteKnob } from './InfiniteKnob'
import { clamp, degreesToRadians } from './utils'

export interface KnobOptions {
  defaultValue?: number
  minDegrees?: number
  maxDegrees?: number
  minValue?: number
  maxValue?: number
  startDegrees?: number
  stepDegrees?: number
  stepValue?: number
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
  stepRadians?: number
  defaultRadians: number

  knob: FiniteKnob<Target>

  constructor(
    public target: Target,
    options: KnobOptions,
  ) {
    Object.assign(this.options, options)
    if (
      this.options.defaultValue !== undefined &&
      this.options.minValue !== undefined &&
      this.options.maxValue !== undefined
    ) {
      this.options.defaultValue = clamp(
        this.options.defaultValue,
        this.options.minValue,
        this.options.maxValue,
      )
    }

    const {
      defaultValue: defaultValueOptional,
      minDegrees: minDegreesOptional,
      maxDegrees: maxDegreesOptional,
      minValue: minValueOptional,
      maxValue: maxValueOptional,
      startDegrees: startDegreesOptional,
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
    const startDegrees = startDegreesOptional ?? 0

    const isFiniteMinDegrees = Number.isFinite(minDegreesOptional)
    const isFiniteMaxDegrees = Number.isFinite(maxDegreesOptional)

    this.isInfiniteKnob = !isFiniteMinDegrees || !isFiniteMaxDegrees
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

    if (this.options.stepDegrees) {
      this.stepRadians = degreesToRadians(this.options.stepDegrees)
    }

    const rangeRadians =
      Number.isFinite(this.maxRadians) && Number.isFinite(this.minRadians)
        ? this.maxRadians - this.minRadians
        : Math.PI * 2

    this.defaultRadians = degreesToRadians(
      minDegrees +
        ((maxDegrees - minDegrees) * (defaultValue - minValue)) /
          (maxValue - minValue),
    )

    this.knob = this.isInfiniteKnob
      ? new InfiniteKnob(target, {
          defaultRadians: 0,
          minRadians: this.minRadians,
          maxRadians: this.maxRadians,
          startDegrees,
          stepRadians: this.stepRadians,
          onDeltaChange: onDeltaChange ?? (() => {}),
          onStatusChange: onStatusChange ?? (() => {}),
        })
      : new FiniteKnob(target, {
          defaultRadians: this.defaultRadians,
          defaultValue,
          minRadians: this.minRadians,
          maxRadians: this.maxRadians,
          rangeRadians,
          startDegrees,
          stepValue,
          minValue,
          maxValue,
          rangeValue: maxValue - minValue,
          onDeltaChange: onDeltaChange ?? (() => {}),
          onValueChange: onValueChange ?? (() => {}),
          onStatusChange: onStatusChange ?? (() => {}),
        })
  }

  setOptions(options: KnobOptions) {
    const mergedOptions = { ...this.options, ...options }
    this.knob.destory()

    return new Knob(this.target, mergedOptions)
  }
}
