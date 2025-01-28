# Rotary Knob
This is a Knob UI component that includes features such as value adjustment through rotation, step, and angle limits. However, it does not include any styles. You need to create your own knob design.

## Usage
### A knob with restricted values
```jsx
import {Knob} from 'rotary-knob/react'
import 'rotray-knob/style/sample.css'

<Knob
  defaultValue={0.3}
  minAngle={0}
  maxAngle={270}
  minValue={0}
  maxValue={1}
  startAngle={225}
>
  <button type="button" className="knob" />
</Knob>
```

```jsx
import {Knob} from 'rotary-knob/react'
import 'rotray-knob/style/sample.css'

<Knob
  defaultValue={1}
  minAngle={0}
  maxAngle={300}
  minValue={0}
  maxValue={5}
  startAngle={210}
  stepAngle={60}
  onStatusChange={console.log}
>
  <button type="button" className="knob" />
</Knob>
```

### Infinite knob
```jsx
import {Knob} from 'rotary-knob/react'
import 'rotray-knob/style/sample.css'

<Knob
startAngle={225}
onDeltaChange={console.log}
>
  <button type="button" className="knob" />
</Knob>
```

```jsx
import {Knob} from 'rotary-knob/react'
import 'rotray-knob/style/sample.css'

<Knob
  startAngle={225}
  stepAngle={30}
  onValueChange={console.log}
>
  <button type="button" className="knob" />
</Knob>
```
