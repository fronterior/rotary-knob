import { type RefObject, useLayoutEffect, useState } from "react"
import { type RotationData, attachKnobHandlers } from "../../js/core"
import { cursor } from "../../js/cursor-layer"

interface UseKnobHandlersProps<Target extends HTMLElement> {
  defaultRadians?: number
  ref: RefObject<Target>
}

export enum RotationStatus {
  Idle,
  Begin,
  Rotating,
  End,
}


export function useRotationHandlers<Target extends HTMLElement>({
  defaultRadians = 0,
  ref,
}: UseKnobHandlersProps<Target>) {
  const [radians, setRadians] = useState(defaultRadians)
  const [rotationData, setRotationData] = useState<RotationData>({ ['delta.radians']: 0, ['delta.angle']: 0, ['abs.radians']: 0, ['abs.angle']: 0 })
  const [status, setStatus] = useState(RotationStatus.Idle)

  const [isRotating, setIsRotating] = useState(false)
  useLayoutEffect(() => {
    if (isRotating) {
      cursor.show("grabbing")
    } else {
      cursor.hide()
    }

    return () => { }
  }, [isRotating])

  useLayoutEffect(() => {
    return attachKnobHandlers({
      target: ref.current!,
      onRotationStart: () => {
        setIsRotating(true)
        setStatus(RotationStatus.Begin)
      },
      onRotation: (data) => {
        setRadians((value) => {
          const delta = data["delta.radians"]
          const nextvalue = value + delta

          return nextvalue
        })
        setRotationData(data)
        setStatus(RotationStatus.Rotating)
      },
      onRotationEnd: () => {
        setIsRotating(false)
        setStatus(RotationStatus.End)
      },
    })
  }, [ref])

  useLayoutEffect(() => {
    if (status === RotationStatus.End) {
      setStatus(RotationStatus.Idle)
    }
  }, [status])

  return {
    radians,
    rotationData,
    setRadians,
    status,
  }
}
