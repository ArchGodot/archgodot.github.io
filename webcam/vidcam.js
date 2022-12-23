navigator.mediaDevices.enumerateDevices()
  .then(getVideoInputs)
  .catch(errorCallback);
 
function getVideoInputs(mediaDevices){
      mediaDevices.forEach(mediaDevice => {
        if (mediaDevice.kind === 'videoinput') {
          this._webcamList.push(mediaDevice);
        }
      });
}
navigator.mediaDevices.getUserMedia(this.getMediaConstraints())
  .then(stream => {
      this._webcamElement.srcObject = stream;
      this._webcamElement.play();
  })
  .catch(error => {
     //...
  });

