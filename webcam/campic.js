import Webcam from 'webcam-easy';

const webcamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('canvas');
const snapSoundElement = document.getElementById('snapSound');
const webcam = new Webcam(webcamElement, 'user', canvasElement, snapSoundElement);

let picture = webcam.snap();
document.querySelector('#download-photo').href = picture;

webcam.stop()

