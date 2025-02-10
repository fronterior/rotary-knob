import { attachKnobHandlers, KnobRotation, KnobStatus } from './core'
import { cursor } from './cursor-layer'

interface InfiniteKnobOptions {
  defaultRadians: number
  minRadians: number
  maxRadians: number
  startDegress: number
  stepRadians: number
  onDeltaChange(rotation: KnobRotation): void
  onStatusChange(status: KnobStatus): void
}

export class InfiniteKnob<Target extends HTMLElement> {
  constructor(
    private target: Target,
    public options: InfiniteKnobOptions,
  ) {
    const { onStatusChange, onDeltaChange } = options

    this.destory = attachKnobHandlers({
      target,
      onRotationStart: () => {
        onStatusChange(KnobStatus.Begin)
        cursor.show('grabbing')
      },
      onRotation: (rotation) => {
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

  destory() {
    // inited in constructor
  }
}
