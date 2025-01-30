import { Knob } from './react'
import './App.css'
import './style/sample.css'
import { useState } from 'react'

function App() {
  const [value, setValue] = useState(0)
  const [value2, setValue2] = useState(0)

  return (
    <div>
      <h1>Rotary Knob</h1>
      <h2>Component</h2>
      <h3>Knob</h3>
      <div>
        <Knob
          defaultValue={0}
          minAngle={0}
          maxAngle={300}
          minValue={0}
          maxValue={5}
          startAngle={210}
          stepValue={1}
          onStatusChange={console.log}
        >
          <button type="button" className="knob" />
        </Knob>
      </div>
      <div>
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
      </div>
      <h3>Infinite Knob</h3>
      <div>
        <Knob startAngle={225} onDeltaChange={console.log}>
          <button type="button" className="knob" />
        </Knob>
      </div>
      <div>
        <Knob startAngle={225} stepAngle={30} onValueChange={console.log}>
          <button type="button" className="knob" />
        </Knob>
      </div>
      <h1>Controlled Value</h1>
      <div>
        <input
          type="number"
          min="0"
          max="1"
          step="0.1"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
        />
        <Knob
          defaultValue={value}
          value={value}
          onValueChange={setValue}
          minAngle={0}
          maxAngle={270}
          minValue={0}
          maxValue={1}
          stepValue={0.1}
          startAngle={225}
        >
          <button type="button" className="knob" />
        </Knob>
      </div>
      <div>
        <input
          type="number"
          min={0}
          max={5}
          step={1}
          value={value2}
          onChange={(e) => setValue2(Number(e.target.value))}
        />
        <Knob
          defaultValue={0}
          value={value2}
          onValueChange={setValue2}
          minAngle={0}
          maxAngle={300}
          minValue={0}
          maxValue={5}
          stepValue={1}
          startAngle={210}
        >
          <button type="button" className="knob" />
        </Knob>
      </div>
      <h2>Hooks</h2>
      <h3>useKnob</h3>
    </div>
  )
}

export default App
