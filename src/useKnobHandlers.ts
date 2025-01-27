import { type RefObject, useLayoutEffect, useState } from "react"
import { attachKnobHandlers } from "./core"

interface UseKnobHandlersProps<Target extends HTMLElement> {
  defaultRadians?: number
  minRadians?: number
  maxRadians?: number
  ref: RefObject<Target>
}

export function useKnobHandlers<Target extends HTMLElement>({
  defaultRadians = 0,
  minRadians = -Infinity,
  maxRadians = Infinity,
  ref,
}: UseKnobHandlersProps<Target>) {
  const [radians, setRadians] = useState(defaultRadians)

  useLayoutEffect(() => {
    return attachKnobHandlers(
      ref.current!,
      ({ ["delta.radians"]: delta }) => {
        setRadians((value) => {
          const nextvalue = value + delta

          return nextvalue
        })
      },
      () => {
        setRadians((value) => Math.min(maxRadians, Math.max(minRadians, value)))
      },
    )
  }, [ref, minRadians, maxRadians])

  return radians
}
