import React, { useState } from "react";
import VideoCall from "./VideoCall";

const VideoCallRoom = () => {
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);

  const handleJoin = () => {
    if (roomId.trim() === "") {
      alert("Please enter a Room ID (like Booking ID)");
      return;
    }
    setJoined(true);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      {!joined ? (
        <div className="bg-white shadow-lg rounded-lg p-8 w-96 text-center">
          <h2 className="text-2xl font-bold mb-4">Join Video Call Room</h2>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID (e.g. booking123)"
            className="w-full border px-4 py-2 mb-4 rounded"
          />
          <button
            onClick={handleJoin}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Join and Ready
          </button>
        </div>
      ) : (
        <VideoCall roomId={roomId} />
      )}
    </div>
  );
};

export default VideoCallRoom;
