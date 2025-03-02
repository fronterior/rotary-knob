import { Knob } from '../../react/Knob'
import './Example.css'
import '../../style/sample.css'
import { useEffect, useRef, useState } from 'react'
import { FiniteKnob } from '../../react/FiniteKnob'

function Example() {
  const [value, setValue] = useState(0)
  const [value2, setValue2] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current!.value = value2.toString()
  }, [value2])

  return (
    <div>
      <FiniteKnob
        minRadians={0}
        maxRadians={Math.PI * 2}
        defaultValue={0}
        minValue={0}
        maxValue={10}
      >
        <div style={{ width: 100, height: 100 }}>Text</div>
      </FiniteKnob>
      <h1>Rotary Knob</h1>
      <h2>Component</h2>
      <h3>Knob</h3>
      <div>
        <Knob
          defaultValue={0}
          minDegrees={0}
          maxDegrees={300}
          minValue={0}
          maxValue={5}
          startDegrees={210}
          stepValue={1}
          onStatusChange={console.log}
        >
          <button type="button" className="knob" />
        </Knob>
      </div>
      <div>
        <Knob
          defaultValue={0.3}
          minDegrees={0}
          maxDegrees={270}
          minValue={0}
          maxValue={1}
          startDegrees={225}
        >
          <button type="button" className="knob" />
        </Knob>
      </div>
      <h3>Infinite Knob</h3>
      <div>
        <Knob startDegrees={225} onDeltaChange={console.log}>
          <button type="button" className="knob" />
        </Knob>
      </div>
      <div>
        <Knob startDegrees={225} stepDegrees={30} onValueChange={console.log}>
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
          minDegrees={0}
          maxDegrees={270}
          minValue={0}
          maxValue={1}
          stepValue={0.1}
          startDegrees={225}
        >
          <button type="button" className="knob" />
        </Knob>
      </div>
      <div>
        <input
          ref={inputRef}
          type="number"
          min={0}
          max={5}
          step={1}
          defaultValue={value2}
          onBlur={(e) => setValue2(Number(e.target.value))}
        />
        <Knob
          defaultValue={value2}
          value={value2}
          onValueChange={setValue2}
          minDegrees={0}
          maxDegrees={300}
          minValue={0}
          maxValue={5}
          startDegrees={210}
        >
          <button type="button" className="knob" />
        </Knob>
      </div>
      <h2>Hooks</h2>
      <h3>useKnob</h3>
    </div>
  )
}

export default Example
