
const landscape = document.getElementById('vvisualizer')
const wholecontext = new window.AudioContext({
  latencyHint: 'interactive',
  sampleRate: 44100
})

const diagnosticNode = new window.AnalyserNode(wholecontext, { fftSize: 256 })
const analyser = wholecontext.createAnalyser()
analyser.maxDecibels = 2000
analyser.maxDecibels = -90
const oscillation = wholecontext.createOscillator()
const gainz = wholecontext.createGain()

oscillation.frequency.value = 440
gainz.gain.value = 0.5

oscillation.connect(gainz)
gainz.connect(wholecontext.destination)

oscillation.start()
gainz.gain.setValueAtTime(0.5, wholecontext.currentTime + 6)
gainz.gain.linearRampToValueAtTime(1, wholecontext.currentTime + 1)
oscillation.stop(wholecontext.currentTime + 6)

establishContextt()
resizeClientSideWindow()
adjustScale()
colorMap()

function resizeClientSideWindow () {
  window.addEventListener('resize', adjustScale) // browser will automatically adjust to maintain low pixelation if the width/height of said browser is changed
}

async function establishContextt () {
  const soundscape = await getSound()
  if (wholecontext.state === 'suspended') {
    await wholecontext.resume()
  }
  const source = wholecontext.createMediaStreamSource(soundscape)
  source.connect(diagnosticNode)
  source.connect(wholecontext.destination)
}

function getSound () {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      autoGainControl: false,
      noiseSuppression: false,
      latency: 0
    }
  })
}

function colorMap () {
  window.requestAnimationFrame(colorMap)

  const bufferLength = diagnosticNode.frequencyBinCount // determines how many frequencies that'll be measured from the audio stream incoming, from input to output
  const inputbits = new Uint8Array(bufferLength) // copies all the frequencies processed and played out into an unsigned byte array
  diagnosticNode.getByteFrequencyData(inputbits)
  const width = landscape.width
  const height = landscape.height
  const barWidth = width / bufferLength // the width of the visualizer divided by the total number of frequencies processed

  const contextDimensions = landscape.getContext('2d') // defines a two-dimensional presentation for the visualizer
  contextDimensions.clearRect(0, 0, width, height) // how much, and in what direction will the frequencies that appear shift in the window

  inputbits.forEach((item, i) => {
    const yaxis = item / 255 * height / 1.5 // determines the positioning of each individual vertical bar on the bar graph
    const xaxis = barWidth * i

    contextDimensions.fillStyle = `rgb(${yaxis / height * 400}, 255, 255, 255)`
    contextDimensions.fillRect(xaxis, height - yaxis, barWidth, yaxis) // the figurative coat of paint applied over the 2d space
  })
}

function adjustScale () {
  landscape.width = landscape.clientWidth * window.devicePixelRatio
  landscape.height = landscape.clientHeight * window.devicePixelRatio // stops any pixelation that might happen by resizing the graph in relation to the dimensions of the visualizer client-side on the window
}
