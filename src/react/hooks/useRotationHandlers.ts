import {
  type RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { type RotationData, attachKnobHandlers } from '../../js/core'
import { cursor } from '../../js/cursor-layer'

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
  // NOTE:
  // Within this hook, radians only changes when a rotation action occurs.
  // When radians changes, it triggers a callback function related to value changes.
  // However, when it needs to synchronize with an externally provided value, there is no need to notify the value change since the external source already knows the value.
  // This behavior is similar to the controlled pattern of an input in React.
  // Therefore, to handle external value synchronization, useRef is used to prevent unnecessary updates.
  const internalRadiansRef = useRef(defaultRadians)
  const [radians, setRadians] = useState(defaultRadians)
  const [rotationData, setRotationData] = useState<RotationData>({
    ['delta.radians']: 0,
    ['delta.angle']: 0,
    ['abs.radians']: 0,
    ['abs.angle']: 0,
  })
  const [status, setStatus] = useState(RotationStatus.Idle)

  const [isRotating, setIsRotating] = useState(false)
  useLayoutEffect(() => {
    if (isRotating) {
      cursor.show('grabbing')
    } else {
      cursor.hide()
    }

    return () => { }
  }, [isRotating])

  const setInternalRadians = useCallback((value: number) => {
    internalRadiansRef.current = value
  }, [])

  useLayoutEffect(() => {
    return attachKnobHandlers({
      target: ref.current!,
      onRotationStart: () => {
        setIsRotating(true)
        setStatus(RotationStatus.Begin)
      },
      onRotation: (data) => {
        internalRadiansRef.current += data['delta.radians']
        setRadians(internalRadiansRef.current)
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
    setInternalRadians,
    status,
  }
}
