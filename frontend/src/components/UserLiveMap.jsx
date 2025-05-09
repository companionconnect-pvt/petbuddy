import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import io from "socket.io-client";
import { useParams } from "react-router-dom";

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Establish socket connection
const socket = io("http://localhost:5000"); // Change to your backend URL

// Helper to change map view on location update
function ChangeMapView({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 14);
    }
  }, [coords, map]);
  return null;
}

const UserLiveMap = () => {
  const { bookingId } = useParams();
  const [driverPosition, setDriverPosition] = useState(null);

  useEffect(() => {
    if (!bookingId) return;

    console.log("🔗 Joining room:", bookingId);
    socket.emit("joinBookingRoom", bookingId);

    const handleLocationUpdate = ({ bookingId: incomingId, lat, lng }) => {
      console.log("📡 Received:", { incomingId, lat, lng });

      if (incomingId === bookingId && !isNaN(lat) && !isNaN(lng)) {
        setDriverPosition([Number(lat), Number(lng)]);
      }
    };

    socket.on("locationUpdate", handleLocationUpdate);

    return () => {
      console.log("🚪 Leaving room:", bookingId);
      socket.off("locationUpdate", handleLocationUpdate);
      socket.emit("leaveRoom", bookingId);
    };
  }, [bookingId]);

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer center={[28.61, 77.23]} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://osm.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {driverPosition && (
          <>
            <ChangeMapView coords={driverPosition} />
            <Marker position={driverPosition}>
              <Popup>Driver is here</Popup>
            </Marker>
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default UserLiveMap;
