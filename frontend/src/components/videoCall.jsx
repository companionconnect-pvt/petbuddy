import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

const socket = io("http://localhost:5000");

export default function VideoCall({ roomId }) {
  const localMainRef = useRef(null);
  const localThumbRef = useRef(null);
  const remoteRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [offerSent, setOfferSent] = useState(false);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  useEffect(() => {
    socket.on("start-call", initiateCall);
    socket.on("offer", ({ offer }) => answerCall(offer));
    socket.on("answer", async ({ answer }) => {
      if (pcRef.current) await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
    });
    socket.on("ice-candidate", async ({ candidate }) => {
      if (candidate && pcRef.current) await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    });
    socket.on("user-left", () => {
      if (remoteRef.current) remoteRef.current.srcObject = null;
    });

    return () => {
      ["start-call","offer","answer","ice-candidate","user-left"].forEach(evt => socket.off(evt));
      cleanupCall();
    };
  }, []);

  const handleReady = () => {
    socket.emit("join-room", roomId);
    socket.emit("ready", roomId);
    setReady(true);
  };

  async function getMedia() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      // assign to both views
      if (localMainRef.current) localMainRef.current.srcObject = stream;
      if (localThumbRef.current) localThumbRef.current.srcObject = stream;
      return stream;
    } catch (e) {
      console.error(e);
      if (e.name.includes("NotAllowed")) {
        setPermissionDenied(true);
        setError("Permission denied. Enable camera and mic.");
      } else {
        setError("Error: " + e.message);
      }
      throw e;
    }
  }

  function setupPeer(stream) {
    const pc = new RTCPeerConnection();
    pcRef.current = pc;
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) socket.emit("ice-candidate", { roomId, candidate });
    };
    pc.ontrack = ({ streams }) => {
      if (remoteRef.current) remoteRef.current.srcObject = streams[0];
    };
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
    return pc;
  }

  async function initiateCall() {
    try {
      const stream = await getMedia();
      setupPeer(stream);
      setInCall(true);
      if (!offerSent && pcRef.current) {
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        socket.emit("offer", { roomId, offer });
        setOfferSent(true);
      }
      setError(null);
      setPermissionDenied(false);
    } catch {} // error already handled
  }

  async function answerCall(offer) {
    try {
      const stream = await getMedia();
      const pc = setupPeer(stream);
      setInCall(true);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { roomId, answer });
      setError(null);
      setPermissionDenied(false);
    } catch {} // error handled
  }

  function toggleAudio() {
    if (!localStreamRef.current) return;
    localStreamRef.current.getAudioTracks().forEach(t => (t.enabled = !audioEnabled));
    setAudioEnabled(prev => !prev);
  }

  function toggleVideo() {
    if (!localStreamRef.current) return;
    localStreamRef.current.getVideoTracks().forEach(t => (t.enabled = !videoEnabled));
    setVideoEnabled(prev => !prev);
  }

  function leaveCall() {
    socket.emit("leave-room", roomId);
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
    cleanupCall();
    setInCall(false);
  }

  function cleanupCall() {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
  }

  return (
    <div className="relative w-full h-screen bg-gray-900">
      {/* Fullscreen remote or local */}
      {inCall ? (
        <video ref={remoteRef} autoPlay className="absolute inset-0 w-full h-full object-contain bg-black" />
      ) : (
        <video ref={localMainRef} autoPlay muted className="absolute inset-0 w-full h-full object-contain bg-black" />
      )}

      {/* Thumbnail always present but only visible in call */}
      <div className={`${inCall ? 'block' : 'hidden'} absolute bottom-4 left-4 w-32 h-24 bg-black rounded overflow-hidden border border-white`}>
        <video ref={localThumbRef} autoPlay muted className="w-full h-full object-cover" />
      </div>

      {/* Controls */}
      {(inCall || ready) && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4 bg-gray-800 bg-opacity-75 p-2 rounded-lg">
          <button onClick={toggleAudio} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full text-white">
            {audioEnabled ? <Mic /> : <MicOff />}
          </button>
          <button onClick={toggleVideo} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full text-white">
            {videoEnabled ? <Video /> : <VideoOff />}
          </button>
          <button onClick={leaveCall} className="p-2 bg-red-600 hover:bg-red-500 rounded-full text-white">
            <PhoneOff />
          </button>
        </div>
      )}

      {/* Ready / Error */}
      {!inCall && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center">
          {error && <p className="text-red-500 mb-2">{error}</p>}
          {!ready && (
            <button onClick={handleReady} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Ready
            </button>
          )}
          {permissionDenied && (
            <button onClick={initiateCall} className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Retry Permissions
            </button>
          )}
        </div>
      )}
    </div>
  );
}
