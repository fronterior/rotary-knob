import { attachKnobHandlers, KnobRotation, KnobStatus } from './core'
import { cursor } from './cursor-layer'
import { clamp, radiansToDegrees } from './utils'

export type CreateInfiniteKnobParameters = {
  minDegrees?: number
  maxDegrees?: number
  startDegrees?: number
  stepDegrees?: number
  onChange?(rotation: KnobRotation): void
  onStatusChange?(status: KnobStatus): void
}

interface InfiniteKnobOptions {
  minRadians: number
  maxRadians: number
  startDegrees: number
  stepRadians?: number
  onDeltaChange(rotation: KnobRotation): void
  onStatusChange(status: KnobStatus): void
}

export class InfiniteKnob<Target extends HTMLElement> {
  radians: number

  constructor(
    private target: Target,
    public options: InfiniteKnobOptions,
  ) {
    const { onStatusChange, onDeltaChange } = options
    this.radians = 0
    this.render(this.radians)

    this.destory = attachKnobHandlers({
      target,
      onRotationStart: () => {
        onStatusChange(KnobStatus.Begin)
        cursor.show('grabbing')
      },
      onRotation: (rotation) => {
        this.radians += rotation['delta.radians']
        const radians = this.compute(this.radians)

        this.render(radians)

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
    if (this.options.stepRadians) {
      radians = this.computeStep(radians)
    }

    return clamp(radians, this.options.minRadians, this.options.maxRadians)
  }

  private computeStep(radians: number) {
    const step = this.options.stepRadians!

    const previousValue = radians - (radians % step)
    const nextValue = previousValue + step

    return Math.abs(radians - previousValue) < Math.abs(radians - nextValue)
      ? previousValue
      : nextValue
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
