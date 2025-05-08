import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Settings, User } from "lucide-react";
import { useParams } from "react-router-dom";

const socket = io("http://localhost:5000");

export default function VideoCall() {
  const { roomId } = useParams();
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
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [callDuration, setCallDuration] = useState(0);

  // Call timer
  useEffect(() => {
    let interval;
    if (inCall) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [inCall]);

  useEffect(() => {
    socket.on("start-call", initiateCall);
    socket.on("offer", ({ offer }) => answerCall(offer));
    socket.on("answer", async ({ answer }) => {
      if (pcRef.current) await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      setConnectionStatus("connected");
    });
    socket.on("ice-candidate", async ({ candidate }) => {
      if (candidate && pcRef.current) await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    });
    socket.on("user-left", () => {
      if (remoteRef.current) remoteRef.current.srcObject = null;
      setConnectionStatus("disconnected");
    });
    socket.on("connection-state-change", state => {
      setConnectionStatus(state);
    });

    return () => {
      ["start-call","offer","answer","ice-candidate","user-left","connection-state-change"].forEach(evt => socket.off(evt));
      cleanupCall();
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReady = () => {
    socket.emit("join-room", roomId);
    socket.emit("ready", roomId);
    setReady(true);
    setConnectionStatus("connecting");
  };

  async function getMedia() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60 }
        }, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      localStreamRef.current = stream;
      if (localMainRef.current) localMainRef.current.srcObject = stream;
      if (localThumbRef.current) localThumbRef.current.srcObject = stream;
      return stream;
    } catch (e) {
      console.error(e);
      if (e.name.includes("NotAllowed")) {
        setPermissionDenied(true);
        setError("Camera & microphone access was denied");
      } else {
        setError("Failed to access media devices");
      }
      throw e;
    }
  }

  function setupPeer(stream) {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" }
      ]
    });
    pcRef.current = pc;
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) socket.emit("ice-candidate", { roomId, candidate });
    };
    pc.ontrack = ({ streams }) => {
      if (remoteRef.current) remoteRef.current.srcObject = streams[0];
    };
    pc.onconnectionstatechange = () => {
      socket.emit("connection-state-change", pc.connectionState);
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
    setConnectionStatus("disconnected");
  }

  function cleanupCall() {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
  }

  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      {/* Video streams */}
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
        {inCall ? (
          <video 
            ref={remoteRef} 
            autoPlay 
            className="w-full h-full object-cover"
            style={{ transform: videoEnabled ? 'scaleX(1)' : 'scaleX(-1)' }}
          />
        ) : (
          <video 
            ref={localMainRef} 
            autoPlay 
            muted 
            className="w-full h-full object-cover"
            style={{ transform: videoEnabled ? 'scaleX(1)' : 'scaleX(-1)' }}
          />
        )}
      </div>

      {/* Local video thumbnail */}
      <div className={`absolute ${inCall ? 'bottom-28' : 'bottom-8'} right-8 w-48 h-36 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 transition-all duration-300`}>
        <video 
          ref={localThumbRef} 
          autoPlay 
          muted 
          className="w-full h-full object-cover"
          style={{ transform: videoEnabled ? 'scaleX(1)' : 'scaleX(-1)' }}
        />
        {!videoEnabled && (
          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
            <User className="w-12 h-12 text-white/50" />
          </div>
        )}
      </div>

      {/* Connection status bar */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-transparent via-black/70 to-transparent py-2 px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionStatus === "connected" ? 'bg-green-500 animate-pulse' : 
            connectionStatus === "connecting" ? 'bg-yellow-500 animate-pulse' : 
            'bg-red-500'
          }`}></div>
          <span className="text-white text-sm font-medium">
            {connectionStatus === "connected" ? 'Connected' : 
             connectionStatus === "connecting" ? 'Connecting...' : 'Disconnected'}
          </span>
        </div>
        {inCall && (
          <div className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
            {formatTime(callDuration)}
          </div>
        )}
        <button className="text-white hover:text-gray-300">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
        <button 
          onClick={toggleAudio}
          className={`p-4 rounded-full shadow-lg transition-all ${
            audioEnabled 
              ? 'bg-white/10 hover:bg-white/20 text-white' 
              : 'bg-red-500/90 hover:bg-red-600 text-white'
          }`}
          aria-label={audioEnabled ? "Mute microphone" : "Unmute microphone"}
        >
          {audioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>
        
        <button 
          onClick={toggleVideo}
          className={`p-4 rounded-full shadow-lg transition-all ${
            videoEnabled 
              ? 'bg-white/10 hover:bg-white/20 text-white' 
              : 'bg-red-500/90 hover:bg-red-600 text-white'
          }`}
          aria-label={videoEnabled ? "Turn off camera" : "Turn on camera"}
        >
          {videoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>
        
        <button 
          onClick={leaveCall}
          className="p-4 bg-red-600 hover:bg-red-700 rounded-full shadow-lg text-white transition-all"
          aria-label="End call"
        >
          {inCall ? <PhoneOff className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
        </button>
      </div>

      {/* Ready screen */}
      {!inCall && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 backdrop-blur-sm">
          <div className="text-center max-w-md px-6 py-8 bg-gray-800/90 rounded-2xl shadow-2xl border border-gray-700/50">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-600/20 flex items-center justify-center">
              <Phone className="w-10 h-10 text-blue-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Video Call</h2>
            <p className="text-gray-300 mb-6">Room ID: <span className="font-mono bg-gray-700/50 px-2 py-1 rounded">{roomId}</span></p>
            
            {error && (
              <div className="mb-6 p-3 bg-red-900/50 text-red-100 rounded-lg border border-red-700/50">
                {error}
              </div>
            )}
            
            <div className="flex flex-col space-y-3">
              {!ready && !permissionDenied && (
                <button 
                  onClick={handleReady}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all flex items-center justify-center space-x-2"
                >
                  <span>Join Call</span>
                </button>
              )}
              
              {permissionDenied && (
                <button 
                  onClick={initiateCall}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all"
                >
                  Allow Camera & Microphone
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}