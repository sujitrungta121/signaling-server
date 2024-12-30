const { Server } = require("socket.io");
let IO;

module.exports.initIO = (httpServer) => {
  IO = new Server(httpServer);

  IO.use((socket, next) => {
    if (socket.handshake.query) {
      let callerId = socket.handshake.query.callerId;
      // console.log(socket,"pringthe caller id")
      socket.user = callerId;
      next();
    }
  });

  IO.on("connection", (socket) => {
    console.log(socket?.user, "Connecteds");
    socket.join(socket.user);

    socket.on("call", (data) => {
      let calleeId = data.recipent;
      let rtcMessage = data.sdp;
   console.log(calleeId,rtcMessage,"pringthe ")
      socket.to(calleeId).emit("newCall", {
        caller: socket.user,
        callerSdpOffer: rtcMessage,
      });
    });

    socket.on("answerCall", (data) => {
      let recipent = data.caller;
      sdpOfferAnswer = data.sdpOfferAnswer;
// console.log("in the answercaall ",data,callerId,rtcMessage)
// console.log(recipent,sdpOfferAnswer,"in the answer call")
      socket.to(recipent).emit("callAnswered", {
        recipent,
        sdpOfferAnswer
      });
    });

    socket.on("ice-candidate", (data) => {
      console.log("ICEcandidate data.calleeId", data.recipient);
      let calleeId = data.recipient;
      let candidate = data.candidate;
      console.log("socket.user emit", calleeId,candidate);

      socket.to(calleeId).emit("new-ice-candidate", {
        candidate: candidate
      });
    });
    socket.on("end-call",(data)=>{
      let recipient=data?.recipient;
      // console.log(recipient,"printhe in teh  end call")
      socket.to(recipient).emit("call-ended")
    })
    socket.on("reject-call",(data)=>{
    let recipient=data?.recipient;
    // console.log(recipient,data,"pringthe recipient")
    socket.to(recipient).emit("rejected")
    })
    socket.on("call-rejected",(data)=>{
      let recipient=data?.recipient
      socket.emit("call-rejected-by-recipient",{
        recipient:recipient
      })
    })

    socket.on("close-call",(data)=>{
      let recipient=data?.recipient;
      socket.to(recipient).emit("closedCall")
    })
  });
};

module.exports.getIO = () => {
  if (!IO) {
    throw Error("IO not initilized.");
  } else {
    return IO;
  }
};
