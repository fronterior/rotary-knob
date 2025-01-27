import { type RefObject, useLayoutEffect, useState } from "react"
import { attachKnobHandlers } from "./core"
import { cursor } from "./cursor-layer"

interface UseKnobHandlersProps<Target extends HTMLElement> {
  defaultRadians?: number
  ref: RefObject<Target>
}

export function useRotationHandlers<Target extends HTMLElement>({
  defaultRadians = 0,
  ref,
}: UseKnobHandlersProps<Target>) {
  const [radians, setRadians] = useState(defaultRadians)

  const [isRotating, setIsRotating] = useState(false)
  useLayoutEffect(() => {
    if (isRotating) {
      cursor.show("grabbing")
    } else {
      cursor.hide()
    }

    return () => {}
  }, [isRotating])

  useLayoutEffect(() => {
    return attachKnobHandlers({
      target: ref.current!,
      onRotationStart: () => {
        setIsRotating(true)
      },
      onRotation: ({ ["delta.radians"]: delta }) => {
        setRadians((value) => {
          const nextvalue = value + delta

          return nextvalue
        })
      },
      onRotationEnd: () => {
        setIsRotating(false)
      },
    })
  }, [ref])

  return [radians, setRadians] as const
}
