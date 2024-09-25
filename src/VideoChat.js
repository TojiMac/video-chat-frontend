import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "peerjs";

const VideoChat = () => {
  const [myId, setMyId] = useState("");
  const [userIdToCall, setUserIdToCall] = useState("");
  const [callAccepted, setCallAccepted] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);

  const userVideo = useRef();
  const remoteVideo = useRef();
  const connectionRef = useRef();
  const socketRef = useRef();
  const peerRef = useRef();

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    peerRef.current = new Peer(undefined, {
      host: "localhost",
      port: "9000",
      path: "/myapp",
    });

    peerRef.current.on("open", (id) => {
      setMyId(id);
    });

    peerRef.current.on("call", (call) => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          call.answer(stream);
          userVideo.current.srcObject = stream;

          call.on("stream", (remoteStream) => {
            setRemoteStream(remoteStream);
            remoteVideo.current.srcObject = remoteStream;
          });
        });
    });

    socketRef.current.on("user-connected", (userId) => {
      console.log(`User connected: ${userId}`);
    });
  }, []);

  const callUser = (id) => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;

        const call = peerRef.current.call(id, stream);
        call.on("stream", (remoteStream) => {
          setRemoteStream(remoteStream);
          remoteVideo.current.srcObject = remoteStream;
        });

        connectionRef.current = call;
      });
  };

  return (
    <div>
      <h2>Your ID: {myId}</h2>
      <input
        type="text"
        value={userIdToCall}
        onChange={(e) => setUserIdToCall(e.target.value)}
        placeholder="ID to call"
      />
      <button onClick={() => callUser(userIdToCall)}>Call</button>

      <div>
        <h3>Your Video</h3>
        <video playsInline muted ref={userVideo} autoPlay />
      </div>

      <div>
        {callAccepted && (
          <>
            <h3>Remote Video</h3>
            <video playsInline ref={remoteVideo} autoPlay />
          </>
        )}
      </div>
    </div>
  );
};

export default VideoChat;
