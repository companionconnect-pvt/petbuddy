import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Custom marker icons
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const dropoffIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const socket = io('http://localhost:5000');

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
        styles: [{ color: '#4a6baf', weight: 5, opacity: 0.9, dashArray: '5, 5' }],
      },
      show: false,
      addWaypoints: false,
      routeWhileDragging: false,
      fitSelectedRoutes: true
    }).addTo(map);

    return () => {
      map.removeControl(routingControl);
    };
  }, [current, source, destination, map]);

  return null;
};

const MapComponent = ({ activeTrip }) => {
  console.log(activeTrip);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newPosition = {
          bookingId : activeTrip.id,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentPosition(newPosition);
        setLocationAccuracy(position.coords.accuracy);
        socket.emit('locationUpdate', newPosition);
      },
      (error) => {
        console.error('Error getting location: ', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const sourceCoordinates = activeTrip?.sourceCoordinates;
  const destCoordinates = activeTrip?.destCoordinates;

  if (!currentPosition) {
    return (
      <div className="map-loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading map and your location...</p>
      </div>
    );
  }

  return (
    <div className="premium-map-container">
      <MapContainer 
        center={currentPosition} 
        zoom={15} 
        className="map-view"
        zoomControl={false}
      >
        <ChangeMapView center={currentPosition} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        <Marker position={currentPosition} icon={userIcon}>
          <Popup className="custom-popup">
            <h3 className="popup-title">Your current location</h3>
            {locationAccuracy && (
              <p className="popup-subtext">Accuracy: ~{Math.round(locationAccuracy)} meters</p>
            )}
          </Popup>
        </Marker>
        
        {sourceCoordinates && (
          <Marker position={sourceCoordinates} icon={pickupIcon}>
            <Popup className="custom-popup">
              <h3 className="popup-title">Pickup location</h3>
            </Popup>
          </Marker>
        )}
        
        {destCoordinates && (
          <Marker position={destCoordinates} icon={dropoffIcon}>
            <Popup className="custom-popup">
              <h3 className="popup-title">Drop-off location</h3>
            </Popup>
          </Marker>
        )}

        {sourceCoordinates && destCoordinates && currentPosition && (
          <Routing 
            current={currentPosition} 
            source={sourceCoordinates} 
            destination={destCoordinates} 
          />
        )}
      </MapContainer>

      <div className="map-info-panel">
        <div className="info-header">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#4A6BAF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 16V12" stroke="#4A6BAF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8H12.01" stroke="#4A6BAF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>Trip Status</h3>
        </div>
        <p className="info-status">
          {activeTrip ? 'Active trip in progress' : 'No active trip'}
        </p>
        {activeTrip && (
          <div className="trip-details">
            <div className="detail-row">
              <span className="detail-label">From:</span>
              <span className="detail-value">{activeTrip.from}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">To:</span>
              <span className="detail-value">{activeTrip.to}</span>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .premium-map-container {
          position: relative;
          height: 500px;
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .map-view {
          height: 100%;
          width: 100%;
          background: #f8f9fa;
        }
        
        .map-loading-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 500px;
          background: #f8f9fa;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(74, 107, 175, 0.2);
          border-radius: 50%;
          border-top-color: #4A6BAF;
          animation: spin 1s ease-in-out infinite;
        }
        
        .loading-text {
          margin-top: 16px;
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          color: #4A6BAF;
          font-weight: 500;
        }
        
        .map-info-panel {
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 1000;
          padding: 16px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          width: 240px;
        }
        
        .info-header {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .info-header h3 {
          margin: 0 0 0 8px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #4A6BAF;
        }
        
        .info-status {
          margin: 0 0 12px 0;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #333;
          font-weight: 500;
        }
        
        .trip-details {
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          padding-top: 12px;
        }
        
        .detail-row {
          display: flex;
          margin-bottom: 6px;
        }
        
        .detail-label {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: #666;
          font-weight: 500;
          width: 50px;
        }
        
        .detail-value {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: #333;
          font-weight: 500;
          flex: 1;
        }
        
        .custom-popup {
          font-family: 'Inter', sans-serif;
          padding: 8px 12px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .popup-title {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }
        
        .popup-subtext {
          margin: 4px 0 0 0;
          font-size: 12px;
          color: #666;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MapComponent;