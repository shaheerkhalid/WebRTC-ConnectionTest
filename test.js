const stunServer = {"url": "stun:bturn2.xirsys.com"};
const turnServer = {
              url: 'turn:bturn2.xirsys.com:80?transport=udp',
              username: 'ymms7Hxn1MyMr0YO5S3MM5BkwgARPkN6TxQOZiXRfrsFK2lRGQbLK8Qt4DHlGry7AAAAAF49v1hzaGFoZWVya2hhbGlk',
              credential: 'fd212486-49e2-11ea-8456-9646de0e6ccd'
  };

const mediaStreamConstraints = {
  video: true,
  audio: true
};

let localStream;

var video = document.querySelector('video');

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
  dataChannelSend.placeholder = '';
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
  var data = dataChannelSend.value;
  sendChannel.send(data);
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
  testStun.disabled = true;
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
    testTurn.disabled = true;
    testStun.disabled = true;
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

