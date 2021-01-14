
var canvas = document.getElementById('canvasContainer') // DEBUG onto color picker
var canvasCtx = canvas.getContext('2d') // DEBUG onto color picker
var HEIGHT = canvas.height // canvas size
var WIDTH = canvas.width

navigator.getUserMedia = navigator.getUserMedia ||
      navigator.webkitGetUserMedia || navigator.mozGetUserMedia

const audioContext = new window.AudioContext()
const speaker = audioContext.destination// required
const processor = audioContext.createScriptProcessor(256, 1, 1)
const inputBuffer = new window.AnalyserNode(audioContext)
const bufferLength = inputBuffer.frequencyBinCount // determines how many frequencies that'll be measured from the audio stream incoming, from input to output
const inputbits = new Uint8Array(bufferLength)

const processAudio = () => {
  inputBuffer.getByteFrequencyData(inputbits)
}

// -------------------------

const microphoneStream =
          stream => {
            const microphone = audioContext.createMediaStreamSource(audiopacket)
            microphone.connect(processor)
            processor.connect(speaker) // required
          }

// TODO: handle error properly
const userMediaError = err => console.error(err)

processor.addEventListener('audioprocess', processAudio)
const audiopacket = navigator.mediaDevices.getUserMedia({
  audio: true,
  video: false,
  echoCancellation: false,
  autoGainControl: false,
  noiseSuppression: false,
  latency: 0,
  microphoneStream,
  userMediaError
})

draw()

function draw () {
  // logTimeStamp(); //DEBUG - see how fast this function runs

  // CONVERT raw audio data and process it here

  // Example Mode#1 - average data exampl----------- Separate visualizer example--------------------------------------------
  // sine-ish wave form- put into canvas - just a indication audio is comming through - not part of the project
  canvasCtx.clearRect(0, 0, WIDTH, HEIGHT)

  var barWidth = Math.floor(WIDTH / bufferLength)
  var y
  var x = 0

  for (var i = 0; i < inputbits; i++) {
    y = inputbits[i]
    y = y * (HEIGHT / 2)
    x += barWidth
  }

  canvasCtx.fillStyle = getRandomRgb()
  canvasCtx.fillRect(x, (HEIGHT / 2), barWidth, y)

  // ----------------------------------------------------------------
} // end draw

// ----------------------------------------------------------------

// ----------------------------------------------------------------

// end draw

getRandomRgb()

function getRandomRgb () {
  var num = Math.round(0xffffff * Math.random())
  var r = num > 20
  var g = num > 8 & 255
  var b = num & 255
  return 'rgb(' + r + ', ' + g + ', ' + b + ')'
}
