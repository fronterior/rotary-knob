import { calculateRadians, radiansToDegrees } from './utils'

export type KnobRotation = {
  'delta.radians': number
  'delta.degrees': number
  'abs.radians': number
  'abs.degrees': number
}

export enum KnobStatus {
  Idle,
  Begin,
  Rotating,
  End,
}

interface AttachKnobHandlersProps<Target extends HTMLElement> {
  target: Target
  onRotationStart?: () => void
  onRotation: (knobRotation: KnobRotation) => void
  onRotationEnd?: () => void
}

export function attachKnobHandlers<Target extends HTMLElement>({
  target,
  onRotationStart,
  onRotation,
  onRotationEnd,
}: AttachKnobHandlersProps<Target>) {
  let isDragging = false
  let targetX = 0
  let targetY = 0
  let cursorX = 0
  let cursorY = 0

  let radians = 0

  function handleDown(ev: PointerEvent) {
    ev.preventDefault()

    const targetRect = target.getBoundingClientRect()
    targetX = targetRect.left + targetRect.width / 2
    targetY = targetRect.top + targetRect.height / 2

    cursorX = ev.clientX
    cursorY = ev.clientY

    radians = calculateRadians(targetX, targetY, cursorX, cursorY)

    isDragging = true
    onRotationStart?.()
  }

  function handleMove(ev: PointerEvent) {
    if (!isDragging) {
      return
    }

    const nextCursorX = ev.clientX
    const nextCursorY = ev.clientY
    const nextRadians = calculateRadians(
      targetX,
      targetY,
      nextCursorX,
      nextCursorY,
    )

    // the angle exceeds 180 degrees, its value is inverted. For example, 190 degrees is expressed as -170 degrees. To ensure consistent sign changes for the same direction of rotation, calculations are adjusted accordingly.
    const isInverted =
      Math.abs(radians) > Math.PI / 2 &&
      Math.sign(nextRadians) !== Math.sign(radians)

    const deltaRadians = isInverted
      ? Math.sign(radians) *
      (Math.PI - Math.abs(nextRadians) + Math.PI - Math.abs(radians))
      : nextRadians - radians

    radians = nextRadians

    onRotation({
      'delta.radians': deltaRadians,
      'delta.degrees': radiansToDegrees(deltaRadians),
      'abs.radians': nextRadians,
      'abs.degrees': radiansToDegrees(nextRadians),
    })
  }

  function handleEnd() {
    if (!isDragging) {
      return
    }

    isDragging = false
    onRotationEnd?.()
  }

  target.addEventListener('pointerdown', handleDown)
  globalThis.document?.addEventListener('pointermove', handleMove)
  globalThis.document?.addEventListener('pointerup', handleEnd)

  return () => {
    target.removeEventListener('pointerdown', handleDown)
    globalThis.document?.removeEventListener('pointermove', handleMove)
    globalThis.document?.removeEventListener('pointerup', handleEnd)
  }
}
