import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';

const Routing = ({ currentPosition, destinationPosition }) => {
  const map = useMap(); // Access the map instance

  useEffect(() => {
    // Add routing control after the map is ready
    const routeControl = L.Routing.control({
      waypoints: [
        L.latLng(currentPosition.lat, currentPosition.lng), // Current position
        L.latLng(destinationPosition.lat, destinationPosition.lng), // Destination
      ],
      createMarker: function () {
        return null; // Optional: disable markers at route points
      },
      routeWhileDragging: true, // Optional: allows real-time route updates when dragging waypoints
      lineOptions: {
        styles: [
          {
            color: '#003366', // Dark blue color (bright dark blue)
            weight: 4, // Line thickness
            opacity: 0.7, // Line opacity
          },
        ],
      },
    }).addTo(map);

    return () => {
      map.removeControl(routeControl); // Clean up when the component is unmounted
    };
  }, [currentPosition, destinationPosition, map]);

  return null;
};

const MapComponent = () => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [destinationPosition] = useState({ lat: 28.6139, lng: 77.2090 }); // Example: New Delhi (change to your destination)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location: ', error);
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
    }
  }, []);

  if (!currentPosition) {
    return <div>Loading...</div>;
  }

  return (
    <MapContainer
      center={currentPosition}
      zoom={15}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={currentPosition}>
        <Popup>You are here!</Popup>
      </Marker>
      <Marker position={destinationPosition}>
        <Popup>Destination</Popup>
      </Marker>
      {/* Add Routing Component */}
      <Routing currentPosition={currentPosition} destinationPosition={destinationPosition} />
    </MapContainer>
  );
};

export default MapComponent;
