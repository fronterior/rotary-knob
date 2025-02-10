import { Knob } from '../../js'

console.log(Knob)

const div = Object.assign(document.createElement('div'), {
  style: 'width: 100px; height: 100px; background: salmon;',
  innerText: 'A',
})

document.body.append(div)

const knob = new Knob(div, {
  defaultValue: 1,
  minValue: 1,
  maxValue: 14,
  minDegrees: 0,
  maxDegrees: 270,
  stepValue: 1,
  startDegrees: 180,
  onValueChange: console.log,
})

console.log(knob)
