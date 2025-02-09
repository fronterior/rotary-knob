import { Knob } from '../../js'

console.log(Knob)

const div = Object.assign(document.createElement('div'), {
  style: 'width: 100px; height: 100px; background: salmon;',
})

document.body.append(div)

const knob = new Knob(div, {
  defaultValue: 1,
  minValue: 1,
  maxValue: 7,
  minDegrees: 0,
  maxDegrees: 270,
  onValueChange: console.log,
})

console.log(knob)
