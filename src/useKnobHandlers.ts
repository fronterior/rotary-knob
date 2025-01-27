import { type RefObject, useLayoutEffect, useState } from "react"
import { attachKnobHandlers } from "./core"

interface UseKnobHandlersProps<Target extends HTMLElement> {
  defaultValue?: number
  ref: RefObject<Target>
}

export function useKnobHandlers<Target extends HTMLElement>({
  defaultValue = 0,
  ref,
}: UseKnobHandlersProps<Target>) {
  const [radians, setRadians] = useState(defaultValue)

  useLayoutEffect(() => {
    return attachKnobHandlers(ref.current!, ({ ["delta.radians"]: delta }) => {
      setRadians((value) => {
        const nextvalue = value + delta

        return nextvalue
      })
    })
  }, [ref])

  return radians
}
