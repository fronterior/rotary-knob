import { useMemo } from "react"

export function useSteppedRadians(radians: number, stepRadians: number) {
  return useMemo(() => {
    if (!stepRadians) {
      return radians
    }

    const scaledValue = Math.floor(radians / stepRadians)

    const lowValue = scaledValue
    const highValue = scaledValue + 1

    return (
      (((stepRadians + (radians % stepRadians)) % stepRadians) / stepRadians >
        0.5
        ? highValue
        : lowValue) * stepRadians
    )
  }, [radians, stepRadians])
}
