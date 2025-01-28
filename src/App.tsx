import { Knob } from "./react"
import "./App.css"
import "./style/sample.css"

function App() {
  return (
    <div>
      <h1>Knob</h1>
      <div>
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
      <h1>Infinite Knob</h1>
      <div>
        <Knob
          startAngle={225}
          onDeltaChange={console.log}
        >
          <button type="button" className="knob" />
        </Knob>
      </div>
      <div>
        <Knob
          startAngle={225}
          stepAngle={30}
          onValueChange={console.log}
        >
          <button type="button" className="knob" />
        </Knob>
      </div>
    </div>
  )
}

export default App
