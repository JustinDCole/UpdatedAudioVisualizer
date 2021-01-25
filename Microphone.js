
const audioCtx = new window.AudioContext()
const dimension = audioCtx.destination
var analyser = audioCtx.createAnalyser({ fftSize: 2048, sampleRate: 44100 })
const bufferLength = analyser.frequencyBinCount
const dataArray = new Uint8Array(bufferLength)
const canvas = document.getElementById('canvasContainer')
const canvasCtx = canvas.getContext('2d')
analyser.smoothingTimeConstant = 0.1

const dataArray2 = new Uint8Array(bufferLength)

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
  //
  //
  var num = Math.round(0xffffff * Math.random())
  var R = num >> 16
  var G = num >> 8 & 255
  var B = num & 255
  const colorBoxes = document.getElementById('colorBlockContainer').getElementsByTagName('div')
  //
  // for (i = 0; i < colorBoxes[i]; i++) {
  // const bgcolor = colorBoxes[i].style.backgroundColor.transform
  // colorBoxes[i].addElement(bgcolor)

  canvasCtx.lineTo(canvas.width, canvas.height * 2)
  canvasCtx.strokeStyle = 'rgb(' + R + ', ' + G + ', ' + B + ')'
  //
  colorBoxes[0].style.backgroundColor = `rgb(${R}, ${G}, ${B})`
  colorBoxes[0].style.filter = 'brightness(1550%)'
  colorBoxes[0].style.animationDelay = '-16s'
  //
  colorBoxes[1].style.backgroundColor = `rgb(${R}, ${G}, ${B})`
  colorBoxes[1].style.filter = 'opacity(66%)'
  colorBoxes[1].style.animationDelay = '-258s'
  //
  colorBoxes[2].style.backgroundColor = `rgb(${R}, ${G}, ${B})`
  colorBoxes[2].style.animationDelay = '3s'
  colorBoxes[3].style.backgroundColor = `rgb(${R}, ${G}, ${B})`
  colorBoxes[3].style.filter = 'blur(18px)'
  colorBoxes[3].style.animationDelay = '3s'
  colorBoxes[4].style.backgroundColor = `rgb(${R}, ${G}, ${B})`
  colorBoxes[4].style.filter = 'contrast(11%)'

  // for (bgcolor of colorBoxes[7]) {
  //  bgcolor = 'rotate(40deg)'
  // }
  // }
  analyser.getByteFrequencyData(dataArray2)
  var averageVolume = getAverageVolume(dataArray2)
  averageVolume *= 2 // make it larger
  if (averageVolume > 50) {
    colorBoxes[7].style.backgroundColor = `rgb(${88}, ${98}, ${108})`
  } // clamp
  for (v = 0; v < colorBoxes[v - 1]; v++) {
    if (v % 2 === 0 && v > 3) {
      colorBoxes[v].style.backgroundColor = `rgb(${R < 20}, ${G < 50}, ${B > 120})`
    }
  }
  canvasCtx.stroke()
}
draw()
function getAverageVolume () {
  var amplitudeSum = 0

  for (var i = 0; i < dataArray2; i++) {
    amplitudeSum += dataArray2[i]
  }

  return amplitudeSum / dataArray2[i]
}

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
// If you console.log dataArray, you get an infinite set of arrays of 128 byte integers,
// So you can't manipulate that, or map it into anything since there's no tangible data to be manipulated with
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
// el.addEventListener("transitionrun", whatever you want);

// function oscillator () {
// const osc = audioCtx.createOscillator()
// osc.connect(audioCtx.destination)
// osc.start()
// osc.stop(audioCtx.currentTime + 1)
// osc.frequency.setValueAtTime(440, audioCtx.currentTime)
// osc.frequency.linearRampToValueAtTime(
//    440 * Math.pow(2, 1 / 12),
//   audioCtx.currentTime
// )
// }

