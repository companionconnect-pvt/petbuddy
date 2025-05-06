import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

const ChangeMapView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const Routing = ({ current, source, destination }) => {
  const map = useMap();

  useEffect(() => {
    if (!current || !source || !destination) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(current.lat, current.lng),
        L.latLng(source.lat, source.lng),
        L.latLng(destination.lat, destination.lng),
      ],
      createMarker: () => null,
      lineOptions: {
        styles: [{ color: '#003366', weight: 4, opacity: 0.8 }],
      },
      show: false,
      addWaypoints: false,
      routeWhileDragging: false,
    }).addTo(map);

    return () => {
      map.removeControl(routingControl);
    };
  }, [current, source, destination, map]);

  return null;
};
const MapComponent = ({ activeTrip }) => {
  const [currentPosition, setCurrentPosition] = useState(null);

  useEffect(() => {
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
  }, []);

  const sourceCoordinates = activeTrip?.sourceCoordinates;
  const destCoordinates = activeTrip?.destCoordinates;

  if (!currentPosition) return <div>Loading map...</div>;

  return (
    <MapContainer center={currentPosition} zoom={13} style={{ height: '400px', width: '100%' }}>
      <ChangeMapView center={currentPosition} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <Marker position={currentPosition}><Popup>You are here!</Popup></Marker>
      {sourceCoordinates && <Marker position={sourceCoordinates}><Popup>Pickup</Popup></Marker>}
      {destCoordinates && <Marker position={destCoordinates}><Popup>Drop-off</Popup></Marker>}

      {sourceCoordinates && destCoordinates && currentPosition && (
        <Routing current={currentPosition} source={sourceCoordinates} destination={destCoordinates} />
      )}
    </MapContainer>
  );
};

export default MapComponent; 