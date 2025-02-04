# Rotary Knob

This is a Knob UI component that includes features such as value adjustment through rotation, step, and angle limits. However, it does not include any styles. You need to create your own knob design.

## Usage

### Components

#### A knob with restricted values

```jsx
import { Knob } from 'rotary-knob/react'
import 'rotray-knob/style/sample.css'
;<Knob
  defaultValue={0.3}
  minDegrees={0}
  maxDegrees={270}
  minValue={0}
  maxValue={1}
  startDegrees={225}
>
  <button type="button" className="knob" />
</Knob>
```

```jsx
import { Knob } from 'rotary-knob/react'
import 'rotray-knob/style/sample.css'
;<Knob
  defaultValue={1}
  minDegrees={0}
  maxDegrees={300}
  minValue={0}
  maxValue={5}
  startDegrees={210}
  stepValue={60}
  onStatusChange={console.log}
>
  <button type="button" className="knob" />
</Knob>
```

#### Infinite knob

```jsx
import { Knob } from 'rotary-knob/react'
import 'rotray-knob/style/sample.css'
;<Knob startDegrees={225} onDeltaChange={console.log}>
  <button type="button" className="knob" />
</Knob>
```

```jsx
import { Knob } from 'rotary-knob/react'
import 'rotray-knob/style/sample.css'
;<Knob stepDegrees={30} onValueChange={console.log}>
  <button type="button" className="knob" />
</Knob>
```

#### Controlled Value

```jsx
const [value, setValue] = useState(0)

<input
  type="number"
  min="0"
  max="1"
  step="0.1"
  value={value}
  onChange={(e) => setValue(Number(e.target.value))}
/>
<Knob
  defaultValue={0.3}
  value={value}
  onValueChange={setValue}
  minDegrees={0}
  maxDegrees={270}
  minValue={0}
  maxValue={1}
  startDegrees={225}
>
  <button type="button" className="knob" />
</Knob>

```

### Hooks

#### useKnob

```tsx
import { type ReactNode } from 'react'
import { useKnob, UseKnobProps } from './hooks/useKnob'

interface KnobProps extends UseKnobProps {
  children: ReactNode
}

export function Knob({
  defaultValue = 0.5,
  minDegrees,
  maxDegrees,
  minValue = 0,
  maxValue = 1,
  children,
  startDegrees = 0,
  stepDegrees,
  value,
  onDeltaChange,
  onValueChange,
  onStatusChange,
}: KnobProps) {
  const { ref, degrees } = useKnob({
    defaultValue,
    minDegrees,
    maxDegrees,
    minValue,
    maxValue,
    startDegrees,
    stepDegrees,
    value,
    onDeltaChange,
    onValueChange,
    onStatusChange,
  })

  if (!children) {
    return null
  }

  return (
    <div
      style={{
        display: 'inline-block',
        cursor: 'grab',
        transform: `rotate(${degrees}deg)`,
      }}
      ref={ref}
    >
      {children}
    </div>
  )
}
```
