const audioCtx = new window.AudioContext()
const dimension = audioCtx.destination
var analyser = audioCtx.createAnalyser({ fftSize: 2048, sampleRate: 44100 })
const canvas = document.getElementById('canvasContainer')
const canvasCtx = canvas.getContext('2d')
analyser.smoothingTimeConstant = 0.2
const bufferLength = analyser.frequencyBinCount
const dataArray = new Uint8Array(bufferLength)

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
handlers()

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

var num = Math.round(0xffffff * Math.random())
var R = num >> 16
var G = num >> 8 & 255
var B = num & 255
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
  const colorBoxes = document.getElementById('colorBlockContainer').getElementsByTagName('div')

  canvasCtx.lineTo(canvas.width, canvas.height * 2)
  canvasCtx.strokeStyle = 'rgb(' + R + ', ' + G + ', ' + B + ')'
  colorBoxes[0].style.backgroundColor = `rgb(${R}, ${G}, ${B})`
  canvasCtx.stroke()

  //
  //
  var length = dataArray.length
  let quantities = 0

  for (v = 0; v < length; v++) {
    quantities = 0
    quantities += dataArray[v]
  }
  var average = quantities / length
  const rotateHue = rotation => (rgbToHue) => {
    rgbToHue = () => {
      Math.round(Math.atan2(Math.sqrt(3) * (G - B), 2 * R - G - B) * 180 / Math.PI)
    }
    const modulo = (x, n) => (x % n + n) % n
    var newHue = modulo(rgbToHue + rotation, 360)
    if (average > 100 || average < 1700) {
      canvasCtx.strokeStyle = newHue
    } else {
      colorBoxes[0].style.backgroundColor = canvasCtx.strokeStyle
    }
    return newHue
  }
  rotateHue()
}

draw()

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
