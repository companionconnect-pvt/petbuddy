import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import io from "socket.io-client";
import { useParams } from "react-router-dom";
import axios from "axios";

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Establish socket connection
const socket = io("http://localhost:5000"); // Change to your backend URL

// Routing component
const Routing = ({ start, end }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!start || !end) return;

    // Remove previous routing control if it exists
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    // Create new routing control
    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(start[0], start[1]),
        L.latLng(end[0], end[1])
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: "#0078FF", weight: 4 }]
      },
      createMarker: () => null, // Disable default markers
    }).addTo(map);

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, start, end]);

  return null;
};

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
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch booking details including destination
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const token = localStorage.getItem('token'); 
        const res = await axios.get(`http://localhost:5000/api/consultation/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const booking = res.data;
        
        if (booking.destination && booking.destination.latitude && booking.destination.longitude) {
          setDestination([
            booking.destination.latitude,
            booking.destination.longitude
          ]);
        } else {
          setError("Destination coordinates not found in booking");
        }
      } catch (err) {
        setError("Failed to fetch booking details");
        console.error("Error fetching booking:", err);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  // Handle socket connection and location updates
  useEffect(() => {
    if (!bookingId) return;

    console.log("🔗 Joining room:", bookingId);
    socket.emit("joinBookingRoom", bookingId);

    const handleLocationUpdate = ({ bookingId: incomingId, lat, lng }) => {
      console.log("📡 Received:", { incomingId, lat, lng });

      if (incomingId === bookingId && !isNaN(lat) && !isNaN(lng)) {
        const newPosition = [Number(lat), Number(lng)];
        setDriverPosition(newPosition);
      }
    };

    socket.on("locationUpdate", handleLocationUpdate);

    return () => {
      console.log("🚪 Leaving room:", bookingId);
      socket.off("locationUpdate", handleLocationUpdate);
      socket.emit("leaveRoom", bookingId);
    };
  }, [bookingId]);

  if (loading) {
    return <div>Loading map...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer 
        center={[28.61, 77.23]} 
        zoom={13} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Driver Marker */}
        {driverPosition && (
          <>
            <ChangeMapView coords={driverPosition} />
            <Marker position={driverPosition}>
              <Popup>Driver is here</Popup>
            </Marker>
          </>
        )}
        
        {/* Destination Marker */}
        {destination && (
          <Marker position={destination}>
            <Popup>Your destination</Popup>
          </Marker>
        )}
        
        {/* Routing between driver and destination */}
        {driverPosition && destination && (
          <Routing start={driverPosition} end={destination} />
        )}
      </MapContainer>
    </div>
  );
};

export default UserLiveMap;