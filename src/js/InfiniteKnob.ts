import { attachKnobHandlers, KnobRotation, KnobStatus } from './core'
import { cursor } from './cursor-layer'
import { radiansToDegrees } from './utils'

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

    this.destroy = attachKnobHandlers({
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

    return radians
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
    const degrees = radiansToDegrees(radians)
    this.target.style.transform = `rotate(${this.options.startDegrees + degrees}deg)`
  }

  destroy() {
    // inited in constructor
  }
}
