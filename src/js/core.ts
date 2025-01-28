export type RotationData = {
  "delta.radians": number
  "delta.angle": number
  "abs.radians": number
  "abs.angle": number
}

interface AttachKnobHandlersProps<Target extends HTMLElement> {
  target: Target
  onRotationStart?: () => void
  onRotation: (data: RotationData) => void
  onRotationEnd?: () => void
}

export function attachKnobHandlers<Target extends HTMLElement>({
  target,
  onRotationStart,
  onRotation,
  onRotationEnd,
}: AttachKnobHandlersProps<Target>) {
  let isDragging = false
  let targetCenterX = 0
  let targetCenterY = 0
  let startCursorX = 0
  let startCursorY = 0

  let radians = 0

  function handleDown(ev: PointerEvent) {
    ev.preventDefault()

    const targetRect = target.getBoundingClientRect()
    targetCenterX = targetRect.left + targetRect.width / 2
    targetCenterY = targetRect.top + targetRect.height / 2

    startCursorX = ev.clientX
    startCursorY = ev.clientY

    radians = Math.atan2(
      startCursorY - targetCenterY,
      startCursorX - targetCenterX,
    )

    isDragging = true
    onRotationStart?.()
  }

  function handleMove(ev: PointerEvent) {
    if (!isDragging) {
      return
    }

    const nextCursorX = ev.clientX
    const nextCursorY = ev.clientY
    const nextRadians = Math.atan2(
      nextCursorY - targetCenterY,
      nextCursorX - targetCenterX,
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
      "delta.radians": deltaRadians,
      "delta.angle": (deltaRadians * 180) / Math.PI,
      "abs.radians": nextRadians,
      "abs.angle": (nextRadians * 180) / Math.PI,
    })
  }

  function handleEnd() {
    if (!isDragging) {
      return
    }

    isDragging = false
    onRotationEnd?.()
  }

  target.addEventListener("pointerdown", handleDown)
  document.addEventListener("pointermove", handleMove)
  document.addEventListener("pointerup", handleEnd)

  return () => {
    target.removeEventListener("pointerdown", handleDown)
    document.removeEventListener("pointermove", handleMove)
    document.removeEventListener("pointerup", handleEnd)
  }
}
