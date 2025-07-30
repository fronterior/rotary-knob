import type { KnobRotation, KnobStatus } from './core'

export interface HalfInfiniteKnobOptions {
  defaultValue?: number
  minValue?: number
  maxValue?: number
  stepValue?: number
  startDegrees?: number
  isReversed?: boolean
  onDeltaChange?(rotation: KnobRotation): void
  onValueChange?(value: number, rotation: KnobRotation): void
  onStatusChange?(status: KnobStatus): void
}

export class HalfInfiniteKnob {
  value!: number

  startDegrees: number

  constructor(
    private target: HTMLElement,
    public options: HalfInfiniteKnobOptions,
  ) {
    this.validate(this.options)

    this.startDegrees = this.options.startDegrees ?? 0

    this.setValue(
      this.options.defaultValue ??
        this.options.minValue ??
        this.options.maxValue ??
        0,
    )
  }

  validate(options: HalfInfiniteKnobOptions) {
    if (
      Number.isFinite(options.minValue) &&
      Number.isFinite(options.maxValue)
    ) {
      throw new Error('minValue or maxValue must be infinite')
    }
  }

  private attach() {}

  setValue(value: number) {}
}
