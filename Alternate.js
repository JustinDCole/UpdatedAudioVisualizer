const audioCtx = new window.AudioContext()
const dimension = audioCtx.destination
var analyser = audioCtx.createAnalyser({ fftSize: 2048, sampleRate: 44100 })
const bufferLength = analyser.frequencyBinCount
const dataArray = new Uint8Array(bufferLength)
const canvas = document.getElementById('canvasContainer')
const canvasCtx = canvas.getContext('2d')
analyser.smoothingTimeConstant = 0.1

// draw an oscilloscope of the current audio source
async function activeSound () {
  const audiopacket = await aggregateSound()
  if (audioCtx.state === 'suspended') { // if the visualizer isn't active, initiate a trigger for the visualizer to pick up on the audio context when an user gesture is made
    await audioCtx.resume()
  }
  if (audioCtx.state === 'running') {
    document.getElementById('audioButton').addEventListener('click', () => {
      audioCtx.resume()
    })
  }
  const microphone = audioCtx.createMediaStreamSource(audiopacket)
  microphone.connect(analyser)
  microphone.connect(dimension) // required
}

activeSound()
aggregateSound()

const scale = {
  A: [440, 384],
  Asharp: 466.2,
  B: 493.9,
  Cdash: 523.3,
  C: 261.6,
  Csharp: 277.2,
  D: 293.7,
  Dsharp: 311.1,
  E: 329.6,
  F: 349.2,
  Fsharp: [370, 406.8],
  G: 392,
  Gsharp: 415.3
}

const spectrum = {
  color1: 'green',
  color2: 'cyan',
  color3: 'yellow',
  color4: 'blue',
  color5: 'violet',
  color6: 'orange',
  color7: 'red'
}

function aggregateSound () {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      autoGainControl: false,
      noiseSuppression: false,
      latency: 0
    }
  })
}

function draw () {
  window.requestAnimationFrame(draw)
  analyser.getByteTimeDomainData(dataArray)
  const gainz = audioCtx.createGain()
  gainz.gain.value = Math.floor(Math.random() * 70) + 1
  gainz.connect(dimension)
  analyser.maxDecibels = 8000

  const WIDTH = canvas.width
  const HEIGHT = canvas.height
  const lineWidth = 4

  canvasCtx.fillStyle = 'rgb(50, 50, 0)'
  canvasCtx.clearRect(0, 0, WIDTH, HEIGHT)
  canvasCtx.beginPath()

  var sliceWidth = WIDTH / bufferLength
  var x = 0

  for (var i = 0; i < bufferLength; i++) {
    var v = dataArray[i] / 128.0
    var y = v * HEIGHT / 2
    if (i === 0) {
      canvasCtx.moveTo(x, y)
    } else {
      canvasCtx.lineTo(x, y)
    }
    canvasCtx.fillRect(x, (HEIGHT / 2), lineWidth, y)
    x += sliceWidth
  }

  var digitToHex = (c) => {
    const hex = c.toString(16)
    return hex.length === 1 ? `0${hex}` : hex
  }

  if (audioCtx.resume === false) {
    canvasCtx.stroke.stop()
  }

  if (audioCtx.resume === true) {
    var R
    var G
    var B
    let wholeval = `#${digitToHex(R)}${digitToHex(G)}${digitToHex(B)}` // actual RGB value that appears on the screen

    const rgbval = Math.floor(Math.random() * 256) + 1

    for (const note in scale) {
      for (let i = 0; i < dataArray; i++) {
        if (dataArray[i] !== note) {
          switch (wholeval) {
            case 1:
              if (note in scale < 484 && note > 400) {
                wholeval = spectrum[color1]
              }
              break
            case 2:
              if (note in scale < 508 && note > 484) {
                wholeval = spectrum[color2]
              }
              break
            case 3:
              if (note in scale < 526 && note > 508) {
                wholeval = spectrum[color3]
              }
              break
            case 4:
              if (note in scale < 606 && note > 526) {
                wholeval = spectrum[color4]
              }
              break
            case 5:
              if (note in scale < 630 && note > 606) {
                wholeval = spectrum[color5]
              }
              break
            case 6:
              if (note in scale < 668 && note > 631) {
                wholeval = spectrum[color7]
              }
              break
            case 7:
              if (note in scale < 668 && note > 789) {
                wholeval = spectrum[color8]
              }
              break
          }
        } canvasCtx.stroke.continue()
      }
    }
  }

    const colorBoxes = document.getElementById('colorBlockContainer').getElementsByTagName('div')
    colorBoxes[i].style.backgroundColor = wholeval

    canvasCtx.lineTo(canvas.width, canvas.height * 2)
    canvasCtx.strokeStyle = wholeval

    canvasCtx.stroke()
  }
}

draw()

// function manipulateFrequencyRange () {
// start = 0
// end = audioCtx.sampleRate / 2
// output = []
// for (var i = start; i < audioCtx.sampleRate / 2; i++) {
//  output.push[i]
// freqpitch = Math.floor(Math.random()* output)
// speedOfLight = 299792458
// wavelength = speedOfLight / freqpitch
// if (wavelength < || > num  ) {
// colorBoxes[i].style.backgroundColor = whatever color you want
// }
// }
//
// --------------------------------------------------------------------------------
handlers()
function handlers () {
  document.getElementById('addPaletteColor').addEventListener('click', () => {
    flashElement(document.getElementById('addPaletteColor')) // feedback of click
    const div = document.createElement('div')
    div.innerHTML = '<input type=\'color\' class=\'paletteBlock\'>'
    document.getElementById('colorPalette').appendChild(div) // works without altering the colors
    // document.getElementById('colorPalette').innerHTML += `<div><input type='color' class='paletteBlock'></div>`; //messes up chosen colors for some reason

    document.getElementById('removePaletteColor').addEventListener('click', () => {
      flashElement(document.getElementById('removePaletteColor')) // feedback of click
      document.getElementById('colorPalette').removeChild(div)

      const hueManipulation = document.getElementById('colorPalette').getElementsByTagName('input')
      hueManipulation.getElementsByTagName('value')
      if (hueManipulation.length > 1) hueManipulation[hueManipulation.length - 1].remove()
    })
  })

  var flashElement = function (elem) {
    elem.style.backgroundColor = 'red'
    setTimeout(function () {
      elem.style.backgroundColor = 'black'
    })
    document.getElementById('audioButton').addEventListener('click', () => {
      document.getElementById('audioButton').style.backgroundColor = 'darkgreen'
      audioCtx.close()
    })
  }
}

// for (let value of set) === n * dataArray[i];
// })
// or
// let colormap = new Map()
// colormap.set(R, R * dataArray[i])
// colormap.set(G, G * dataArray[i])
// colormap.set(B, B * dataArray[i])
// let colorset = {
// colorone: R
// colortwo: G
// colorthree: B
// };
// let map = new Map(Object.entries(colorset))
// const scale = [R, G, B]
// -------------------------------------------------------------------------
// for (var p = 0; p < dataArray; p++) {
// scale.map(n => {
//  n = n * dataArray[i]
// canvasCtx.strokeStyle = n
// colorBoxes[8].style.backgroundColor = n  // This is prob. the best example of what could potentially be done.
// })
// }
// -------------------------------------------------------------------------
// function rgbToHex(r, g, b) {
// return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
