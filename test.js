const stunServer = {"url": "stun:bturn2.xiasdfdsfrsys.com"};
const turnServer = {
              url: 'turn:bturn2.xirasdfsasys.com:80?transport=udp',
              username: 'ymms7Hxn1MyMr0YO5S3MM5BkwgARPkN6TxQOZiXRfrsFK2lRGQbLK8Qt4DHlGry7AAAAAF49v1hzaGFoZWVya2hhbGlk',
              credential: 'fd212486-49e2-11ea-8456-9646de0e6ccd'
  };

const mediaStreamConstraints = {
  video: true,
  audio: true
};

let localStream;

function gotLocalMediaStream(mediaStream) {
  localStream = mediaStream;
  testStun.disabled = false;
  testTurn.disabled = false;
  // localVideo.srcObject = mediaStream;
}

// Handles error by logging a message to the console with the error message.
function handleLocalMediaStreamError(error) {
  printInfo('navigator.getUserMedia error: '+ error);
  testStun.disabled = true;
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

