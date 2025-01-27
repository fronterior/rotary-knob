type RadiansData = {
  "delta.radians": number
  "delta.angle": number
  "abs.radians": number
  "abs.angle": number
}

export function attachKnobHandlers<Target extends HTMLElement>(
  target: Target,
  onChange: (data: RadiansData) => void,
  onPointerUp: () => void,
) {
  let isDragging = false
  let targetCenterX = 0
  let targetCenterY = 0
  let startCursorX = 0
  let startCursorY = 0

  let radians = 0

  function handleDown(ev: PointerEvent) {
    console.log("handleDown")
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

    onChange({
      "delta.radians": deltaRadians,
      "delta.angle": (deltaRadians * 180) / Math.PI,
      "abs.radians": nextRadians,
      "abs.angle": (nextRadians * 180) / Math.PI,
    })
  }

  function handleEnd(ev: PointerEvent) {
    isDragging = false
    onPointerUp?.()
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

interface CreateKnobTransFormerProps {
  min?: number
  max?: number
  step?: number
}

export function createKnobTransformer({}: CreateKnobTransFormerProps) {
  return function knobTransformer({
    ["delta.radians"]: deltaRadians,
  }: RadiansData) {}
}
