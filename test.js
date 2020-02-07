
// if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
//     console.log('getUserMedia supported.');
//     navigator.mediaDevices.getUserMedia (
//        {
//             video: true,
//             audio: true
         
//        })
 
//        // Success callback
//        .then(function(stream) {
//             const mediaRecorder = new MediaRecorder(stream);
//             mediaRecorder.start();
//             mediaRecorder.stop();

//             pc = new RTCPeerConnection()
//        })
 
//        // Error callback
//        .catch(function(err) {
//           console.log('The following getUserMedia error occured: ' + err);
//        }
//     );
//  } else {
//     console.log('getUserMedia not supported on your browser!');
//  }



//  navigator.getUserMedia({video: false,audio: true}, function(stream) {
//     const mediaRecorder = new MediaRecorder(stream);
//     mediaRecorder.start();
//     mediaRecorder.stop();
// }, function(err) { alert("there was an error " + err)});




// const signaling = new SignalingChannel();
const constraints = {audio: true, video: true};
const configuration = {iceServers: [{
    urls: [ "stun:bturn2.xirsys.com" ]
 }, {
    username: "CrdmfPFuQZrLKm1iJyFv-xHJUSci3WJ3nut3onfHamEg1hMFtOraLgngdOFxWhlWAAAAAF49kYZzaGFoZWVya2hhbGlk",
    credential: "ad928fa6-49c7-11ea-9cce-9646de0e6ccd",
    urls: [
        "turn:bturn2.xirsys.com:80?transport=udp",
        "turn:bturn2.xirsys.com:3478?transport=udp",
        "turn:bturn2.xirsys.com:80?transport=tcp",
        "turn:bturn2.xirsys.com:3478?transport=tcp",
        "turns:bturn2.xirsys.com:443?transport=tcp",
        "turns:bturn2.xirsys.com:5349?transport=tcp"
    ]
 }]};
const pc = new RTCPeerConnection(configuration);

// send any ice candidates to the other peer
// pc.onicecandidate = ({candidate}) => signaling.send({candidate});
console.log(pc.getStats());
// // let the "negotiationneeded" event trigger offer generation
// pc.onnegotiationneeded = async () => {
//   try {
//     await pc.setLocalDescription(await pc.createOffer());
//     // send the offer to the other peer
//     signaling.send({desc: pc.localDescription});
//   } catch (err) {
//     console.error(err);
//   }
// };
