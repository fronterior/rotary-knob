import { type RefObject, useLayoutEffect, useState } from "react"
import { attachKnobHandlers } from "./core"

interface UseKnobHandlersProps<Target extends HTMLElement> {
  defaultRadians?: number
  ref: RefObject<Target>
}

export function useRotationHandlers<Target extends HTMLElement>({
  defaultRadians = 0,
  ref,
}: UseKnobHandlersProps<Target>) {
  const [radians, setRadians] = useState(defaultRadians)

  useLayoutEffect(() => {
    return attachKnobHandlers(ref.current!, ({ ["delta.radians"]: delta }) => {
      setRadians((value) => {
        const nextvalue = value + delta

        return nextvalue
      })
    })
  }, [ref])

  return [radians, setRadians] as const
}
