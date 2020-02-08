function setChannelEvents(channel, channelNameForConsoleOutput) {
  channel.onmessage = function (event) {
      console.debug(channelNameForConsoleOutput, 'received a message:', event.data);
  };

  channel.onopen = function () {
      channel.send('first text message over RTP data ports');
  };
  channel.onclose = function (e) {
      console.error(e);
  };
  channel.onerror = function (e) {
      console.error(e);
  };
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
      var dataChannel = pc.createDataChannel("dataChannel", {reliable: false});    //create a bogus data channel
      


      
      setChannelEvents(dataChannel, 'offerer');

      pc.onicecandidate = function (event) {
          if (!event || !event.candidate) return;
          answerer && answerer.addIceCandidate(event.candidate);
      };

      var mediaConstraints = {
        optional: [],
        mandatory: {
            OfferToReceiveAudio: false, // Hmm!!
            OfferToReceiveVideo: false // Hmm!!
        }
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


  checkTurnOrStun({"url": "stun:bturn2.xirsys.com"}).then(function(result){
      console.log(
      result ? 'YES, Server active as '+result : 'NO, server not active');
  }).catch(console.error.bind(console));
  
  checkTurnOrStun({
              url: 'turn:bturn2.xirsys.com:80?transport=udp',
              username: 'ymms7Hxn1MyMr0YO5S3MM5BkwgARPkN6TxQOZiXRfrsFK2lRGQbLK8Qt4DHlGry7AAAAAF49v1hzaGFoZWVya2hhbGlk',
              credential: 'fd212486-49e2-11ea-8456-9646de0e6ccd'
  }).then(function(result){
      console.log(
      result ? 'YES, Server active as '+result : 'NO, server not active');
  }).catch(console.error.bind(console));

 
  


//   checkTURNServer({
//     url: 'stun:bturn2.xirsys.com',
//     username: 'ymms7Hxn1MyMr0YO5S3MM5BkwgARPkN6TxQOZiXRfrsFK2lRGQbLK8Qt4DHlGry7AAAAAF49v1hzaGFoZWVya2hhbGlk',
//     credential: 'fd212486-49e2-11ea-8456-9646de0e6ccd'
// }).then(function(bool){
//     console.log('is TURN server active? ', bool? 'yes':'no');
// }).catch(console.error.bind(console));






