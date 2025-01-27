import "./App.css"
import { Knob } from "./Knob"
import styles from "./Knob.module.css"

function App() {
  return (
    <div>
      <Knob
        minAngle={0}
        maxAngle={300}
        minValue={0}
        maxValue={1}
        stepAngle={60}
        startAngle={210}
      >
        <button type="button" className={styles.head} />
      </Knob>
      <Knob
        minAngle={0}
        maxAngle={270}
        minValue={0}
        maxValue={1}
        defaultValue={0.3}
        startAngle={225}
      >
        <button type="button" className={styles.head} />
      </Knob>
      <button>test</button>
    </div>
  )
}

export default App
