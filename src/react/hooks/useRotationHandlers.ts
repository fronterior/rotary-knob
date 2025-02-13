import {
  type RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import {
  type KnobRotation,
  KnobStatus,
  attachKnobHandlers,
} from '../../js/core'
import { cursor } from '../../js/cursor-layer'

interface UseKnobHandlersProps<Target extends HTMLElement> {
  ref: RefObject<Target>
  defaultRadians?: number
  onRotationEnd?(): void
}

export function useRotationHandlers<Target extends HTMLElement>({
  ref,
  defaultRadians = 0,
  onRotationEnd,
}: UseKnobHandlersProps<Target>) {
  // NOTE:
  // Within this hook, radians only changes when a rotation action occurs.
  // When radians changes, it triggers a callback function related to value changes.
  // However, when it needs to synchronize with an externally provided value, there is no need to notify the value change since the external source already knows the value.
  // This behavior is similar to the controlled pattern of an input in React.
  // Therefore, to handle external value synchronization, useRef is used to prevent unnecessary updates.
  const internalRadiansRef = useRef(defaultRadians)
  const [radians, setRadians] = useState(defaultRadians)
  const [rotation, setRotation] = useState<KnobRotation>({
    ['delta.radians']: 0,
    ['delta.degrees']: 0,
    ['abs.radians']: 0,
    ['abs.degrees']: 0,
  })
  const [status, setStatus] = useState(KnobStatus.Idle)

  const onRotationEndRef = useRef(onRotationEnd)
  onRotationEndRef.current = onRotationEnd

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
        setStatus(KnobStatus.Begin)
      },
      onRotation: (data) => {
        internalRadiansRef.current += data['delta.radians']
        setRadians(internalRadiansRef.current)
        setRotation(data)
        setStatus(KnobStatus.Rotating)
      },
      onRotationEnd: () => {
        setIsRotating(false)
        setStatus(KnobStatus.End)
        onRotationEndRef.current?.()
      },
    })
  }, [ref])

  useLayoutEffect(() => {
    if (status === KnobStatus.End) {
      setStatus(KnobStatus.Idle)
    }
  }, [status])

  return {
    radians,
    rotation,
    setInternalRadians,
    status,
  }
}
