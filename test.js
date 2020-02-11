const stunServer = {"url": "stun:bturn2.xirsys.com"};
const turnServer = {
              url: 'turn:bturn2.xirsys.com:80?transport=udp',
              username: 'ymms7Hxn1MyMr0YO5S3MM5BkwgARPkN6TxQOZiXRfrsFK2lRGQbLK8Qt4DHlGry7AAAAAF49v1hzaGFoZWVya2hhbGlk',
              credential: 'fd212486-49e2-11ea-8456-9646de0e6ccd'
  };

const mediaStreamConstraints = {
  video: {
    facingMode: 'user'
  },
  audio: true
};

let localStream;
let dataChannel;

var video = document.querySelector('video');
var photo = document.getElementById('photo');
var photoContext = photo.getContext('2d');

function snapPhoto() {
  photoContext.drawImage(video, 0, 0, photo.width, photo.height);
  show(photo, sendBtn);
}

function sendPhoto() {
  // Split data channel message in chunks of this byte length.
  var CHUNK_LEN = 64000;
  var img = photoContext.getImageData(0, 0, photoContextW, photoContextH),
    len = img.data.byteLength,
    n = len / CHUNK_LEN | 0;

  console.log('Sending a total of ' + len + ' byte(s)');
  dataChannel.send(len);

  // split the photo and send in chunks of about 64KB
  for (var i = 0; i < n; i++) {
    var start = i * CHUNK_LEN,
      end = (i + 1) * CHUNK_LEN;
    console.log(start + ' - ' + (end - 1));
    dataChannel.send(img.data.subarray(start, end));
  }

  // send the reminder, if any
  if (len % CHUNK_LEN) {
    console.log('last ' + len % CHUNK_LEN + ' byte(s)');
    dataChannel.send(img.data.subarray(n * CHUNK_LEN));
  }
}
function receiveDataChromeFactory() {
  var buf, count;

  return function onmessage(event) {
    if (typeof event.data === 'string') {
      buf = window.buf = new Uint8ClampedArray(parseInt(event.data));
      count = 0;
      console.log('Expecting a total of ' + buf.byteLength + ' bytes');
      return;
    }

    var data = new Uint8ClampedArray(event.data);
    buf.set(data, count);

    count += data.byteLength;
    console.log('count: ' + count);

    if (count === buf.byteLength) {
      // we're done: all data chunks have been received
      console.log('Done. Rendering photo.');
      renderPhoto(buf);
    }
  };
}

function renderPhoto(data) {
  var canvas = document.createElement('canvas');
  canvas.width = photoContextW;
  canvas.height = photoContextH;
  canvas.classList.add('incomingPhoto');
  // trail is the element holding the incoming images
  trail.insertBefore(canvas, trail.firstChild);

  var context = canvas.getContext('2d');
  var img = context.createImageData(photoContextW, photoContextH);
  img.data.set(data);
  context.putImageData(img, 0, 0);
}

function grabWebCamVideo() {
  console.log('Getting user media (video) ...');
  navigator.mediaDevices.getUserMedia({
    video: true
  })
  .then(gotStream)
  .catch(function(e) {
    alert('getUserMedia() error: ' + e.name);
  });
}



function createConnection() {
  // dataChannelSend.placeholder = '';
  var servers = null;
  pcConstraint = null;
  dataConstraint = null;
  trace('Using SCTP based data channels');
  // For SCTP, reliable and ordered delivery is true by default.
  // Add localConnection to global scope to make it visible
  // from the browser console.
  window.localConnection = localConnection =
      new RTCPeerConnection(servers, pcConstraint);
  trace('Created local peer connection object localConnection');

  sendChannel = localConnection.createDataChannel('sendDataChannel',
      dataConstraint);
  trace('Created send data channel');

  localConnection.onicecandidate = iceCallback1;
  sendChannel.onopen = onSendChannelStateChange;
  sendChannel.onclose = onSendChannelStateChange;

  // Add remoteConnection to global scope to make it visible
  // from the browser console.
  window.remoteConnection = remoteConnection =
      new RTCPeerConnection(servers, pcConstraint);
  trace('Created remote peer connection object remoteConnection');

  remoteConnection.onicecandidate = iceCallback2;
  remoteConnection.ondatachannel = receiveChannelCallback;

  localConnection.createOffer().then(
    gotDescription1,
    onCreateSessionDescriptionError
  );
  startButton.disabled = true;
  closeButton.disabled = false;
}

function sendData() {
  // var data = dataChannelSend.value;
  sendChannel.send('test');
  trace('Sent Data: ' + data);
}






function gotLocalMediaStream(mediaStream) {
  localStream = mediaStream;
  testStun.disabled = false;
  testTurn.disabled = false;
  video.srcObject = mediaStream;
}

// Handles error by logging a message to the console with the error message.
function handleLocalMediaStreamError(error) {
  printInfo('navigator.getUserMedia error: '+ error);
  // testStun.disabled = true;
}


function handleConnection(event) {
  const peerConnection = event.target;
  const iceCandidate = event.candidate;

  if (iceCandidate) {
    const newIceCandidate = new RTCIceCandidate(iceCandidate);
    const otherPeer = getOtherPeer(peerConnection);

    otherPeer.addIceCandidate(newIceCandidate)
      .then(() => {
        handleConnectionSuccess(peerConnection);
      }).catch((error) => {
        handleConnectionFailure(peerConnection, error);
      });

    console.trace(`${getPeerName(peerConnection)} ICE candidate:\n` +
          `${event.candidate.candidate}.`);
  }
}


function setSessionDescriptionError(error){

}

function setLocalDescriptionSuccess(des){

}


function createdOffer(description) {
  console.trace(`Offer from localPeerConnection:\n${description.sdp}`);

  console.trace('localPeerConnection setLocalDescription start.');
  localPeerConnection.setLocalDescription(description)
    .then(() => {
      setLocalDescriptionSuccess(localPeerConnection);
    }).catch(setSessionDescriptionError);

  console.trace('remotePeerConnection setRemoteDescription start.');
  remotePeerConnection.setRemoteDescription(description)
    .then(() => {
      setRemoteDescriptionSuccess(remotePeerConnection);
    }).catch(setSessionDescriptionError);

  console.trace('remotePeerConnection createAnswer start.');
  remotePeerConnection.createAnswer()
    .then(createdAnswer)
    .catch(setSessionDescriptionError);
}

// Logs answer to offer creation and sets peer connection session descriptions.
function createdAnswer(description) {
  console.trace(`Answer from remotePeerConnection:\n${description.sdp}.`);

  console.trace('remotePeerConnection setLocalDescription start.');
  remotePeerConnection.setLocalDescription(description)
    .then(() => {
      setLocalDescriptionSuccess(remotePeerConnection);
    }).catch(setSessionDescriptionError);

  console.trace('localPeerConnection setRemoteDescription start.');
  localPeerConnection.setRemoteDescription(description)
    .then(() => {
      setRemoteDescriptionSuccess(localPeerConnection);
    }).catch(setSessionDescriptionError);
}





function printInfo(description){
  console.log(description);
  output.innerHTML = description;
}

function checkTurnOrStun(turnConfig, timeout){ 
    return new Promise(function(resolve, reject){
  
      setTimeout(function(){
          if(promiseResolved){
              if (promiseResolved == 'STUN') resolve('STUN');
              return;
          }
          resolve(false);
          promiseResolved = true;
      }, timeout || 5000);

      var promiseResolved = false
        , myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection   //compatibility for firefox and chrome
        , pc = new myPeerConnection({iceServers:[turnConfig]})
        , noop = function(){};
      window.remoteConnection = pc;
      remotePeerConnection = new myPeerConnection({iceServers:[turnConfig]});
      var dataChannel = pc.createDataChannel("dataChannel", {reliable: false});    //create a bogus data channel

      pc.onicecandidate = function (event) {
          if (!event || !event.candidate) return;
          answerer && answerer.addIceCandidate(event.candidate);
      };


      pc.createOffer(function(sdp){
        if(sdp.sdp.indexOf('typ relay') > -1){ // sometimes sdp contains the ice candidates...
          promiseResolved = 'TURN'; 
          resolve(true);
        }

        console.trace(`Offer from localPeerConnection:\n${sdp.sdp}`);

        console.trace('localPeerConnection setLocalDescription start.');
        pc.setLocalDescription(sdp)
          .then(() => {
            setLocalDescriptionSuccess(localPeerConnection);
          }).catch(setSessionDescriptionError);

        console.trace('remotePeerConnection setRemoteDescription start.');
        pc.setRemoteDescription(sdp)
          .then(() => {
            setRemoteDescriptionSuccess(remotePeerConnection);
          }).catch(setSessionDescriptionError);

        console.trace('remotePeerConnection createAnswer start.');
        remotePeerConnection.createAnswer()
          .then(createdAnswer)
          .catch(setSessionDescriptionError);




        pc.setLocalDescription(sdp, noop, noop);
      }, noop);    // create offer and set local description
      pc.onicecandidate = function(ice){  //listen for candidate events
        if( !ice || !ice.candidate || !ice.candidate.candidate)  return;
        if (ice.candidate.candidate.indexOf('typ relay')!=-1) { promiseResolved = 'TURN'; resolve('TURN'); }
        else if (!promiseResolved  && (ice.candidate.candidate.indexOf('typ prflx')!=-1 || ice.candidate.candidate.indexOf('typ srflx')!=-1)){
            promiseResolved = 'STUN';
          if (turnConfig.url.indexOf('turn:')!==0) resolve('STUN');
        }



        else return;
      };
    });   
  }


  
  
  // testTurn.onclick = checkTurnOrStun({
  //             url: 'turn:bturn2.xirasdfsasys.com:80?transport=udp',
  //             username: 'ymms7Hxn1MyMr0YO5S3MM5BkwgARPkN6TxQOZiXRfrsFK2lRGQbLK8Qt4DHlGry7AAAAAF49v1hzaGFoZWVya2hhbGlk',
  //             credential: 'fd212486-49e2-11ea-8456-9646de0e6ccd'
  // }).then(function(result){
  //     printInfo(
  //     result ? 'YES, Server active as '+result : 'NO, server not active');

  //     output.innerHTML = '<p>'+ result ? 'YES, Server active as '+result : 'NO, server not active' +'</p>'; 
  // }).catch(console.error.bind(console));

  function preStart(){
    testTurn.disabled = false;
    testStun.disabled = false;
    navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
    .then(gotLocalMediaStream).catch(handleLocalMediaStreamError);

  }


  preStart();

 function start(b_name){
  
  let server = null;
   
   
    console.log(b_name);
  if(b_name == "testStun"){
     server = stunServer;
   }else if(b_name == "testTurn"){
     server = turnServer;
   }
   console.log(server);
   checkTurnOrStun(server).then(function(result){
    printInfo(
      result ? 'YES, Server active as '+result : 'NO, server not active');
    }).catch(console.error.bind(console));

 }

