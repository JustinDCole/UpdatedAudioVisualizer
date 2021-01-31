
const audioCtx = new window.AudioContext()
const dimension = audioCtx.destination
var analyser = audioCtx.createAnalyser({ fftSize: 2048, sampleRate: 44100 })
var rhythm = new window.Rhythm()

var onAudioButtonClick = function () {
  if (rhythm.stopped === false) {
    rhythm.stop()
  }
  rhythm.plugMicrophone().then(function () {
    rhythm.start()
  })
}
document.getElementById('audiobutton').addEventListener('click', onAudioButtonClick)

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
  rhythm.connectExternalAudioElement(microphone)
}

activeSound()
aggregateSound()

rhythm.addRhythm('colorblock', 'neon', 50, 20, {
  from: [200, 235, 30],
  to: [125, 88, 33]
})

rhythm.addRythm('colorblock', 'pulse', 0, 10, {
  min: 1,
  max: 3.75
})

rhythm.addRythm('colorblock', 'blur', 0, 10)
