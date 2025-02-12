import { Knob } from '../../js'

console.log(Knob)

const knobDiv1 = Object.assign(document.createElement('div'), {
  style:
    'cursor: pointer; width: 100px; height: 100px; background: salmon; border-radius: 100%',
  innerText: 'A',
})

const knobDiv2 = Object.assign(document.createElement('div'), {
  style:
    'cursor: pointer; width: 100px; height: 100px; background: skyblue; border-radius: 100%',
  innerText: 'B',
})

const knobDiv3 = Object.assign(document.createElement('div'), {
  style:
    'cursor: pointer; width: 100px; height: 100px; background: yellow; border-radius: 100%',
  innerText: 'C',
})

document.body.append(knobDiv1, knobDiv2, knobDiv3)

const knob1 = new Knob(knobDiv1, {
  defaultValue: 1,
  minValue: 1,
  maxValue: 14,
  minDegrees: 0,
  maxDegrees: 270,
  stepValue: 1,
  startDegrees: 180,
  onValueChange: console.log,
})

const knob2 = new Knob(knobDiv2, {
  startDegrees: 180,
})

const knob3 = new Knob(knobDiv3, {
  stepDegrees: 60,
  startDegrees: 180,
})

console.log(knob2)
