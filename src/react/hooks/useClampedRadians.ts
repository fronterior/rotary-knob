import { useMemo } from 'react'

export function useClampedRadians(
  radians: number,
  minRadians: number,
  maxRadians: number,
) {
  return useMemo(() => {
    return Math.min(maxRadians, Math.max(minRadians, radians))
  }, [radians, minRadians, maxRadians])
}
