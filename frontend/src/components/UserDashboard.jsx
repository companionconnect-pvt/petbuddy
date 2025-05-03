import React, { useEffect, useState } from "react";
import API from "../api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PetHouseModal from "./PetHouseModal";

// Fix for default icon path issue in Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const customIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const UserDashboard = () => {
  const [pethouses, setPethouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedPetHouse, setSelectedPetHouse] = useState(null);

  useEffect(() => {
    const fetchPethouses = async () => {
      try {
        const res = await API.get("/pethouse/");
        setPethouses(res.data);
      } catch (err) {
        console.error("Failed to fetch pet houses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPethouses();
  }, []);

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    return (
      <span className="text-yellow-500">
        {"★".repeat(fullStars)}
        <span className="text-gray-300">{"★".repeat(emptyStars)}</span>
      </span>
    );
  };

  const openModal = (house) => {
    setSelectedPetHouse(house);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedPetHouse(null);
  };

  if (loading)
    return <div className="text-center mt-10 text-lg">Loading...</div>;

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Left: Pethouse List */}
      <div className="w-full lg:w-1/2 overflow-y-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Available Pet Houses</h1>
        <div className="flex flex-col items-start gap-4">
          {pethouses.map((house) => (
            <div
              key={house._id}
              className="bg-white shadow-md rounded-lg p-4 border hover:shadow-lg transition max-w-md w-full"
            >
              <h2 className="text-xl font-semibold">{house.name}</h2>
              <p className="text-sm text-gray-600 mb-1">{house.email}</p>
              <p className="text-sm text-gray-600 mb-1">{house.phone}</p>
              <p className="text-gray-700 mb-2">
                {house.address?.street}, {house.address?.city},{" "}
                {house.address?.state} - {house.address?.zip}
              </p>

              <div className="mt-2">
                <h3 className="font-semibold text-sm">Services & Pricing:</h3>
                <ul className="ml-4 list-disc text-sm text-gray-700"></ul>
              </div>

              <div className="mt-3 text-sm">
                <span className="font-semibold">Rating:</span>{" "}
                {house.rating ? renderStars(house.rating) : "No ratings yet"}
              </div>

              <div className="mt-3 text-xs text-gray-500">
                <p>Created at: {new Date(house.createdAt).toLocaleString()}</p>
                <p>Updated at: {new Date(house.updatedAt).toLocaleString()}</p>
              </div>

              {/* Buttons */}
              <div className="mt-4 flex justify-between">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                  onClick={() => openModal(house)}
                >
                  Know More
                </button>
                <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition">
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Map */}
      <div className="w-full lg:w-1/2 h-[500px] lg:h-full z-index-0">
        <MapContainer
          center={[28.6139, 77.209]} // Default center (e.g., Delhi)
          zoom={10}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
          />

          {pethouses.map((house) => {
            const lat = house.latitude;
            const lng = house.longitude;

            if (lat && lng) {
              return (
                <Marker key={house._id} position={[lat, lng]} icon={customIcon}>
                  <Popup>
                    <strong>{house.name}</strong>
                    <br />
                    {house.address?.city}, {house.address?.state}
                  </Popup>
                </Marker>
              );
            }

            return null;
          })}
        </MapContainer>
      </div>

      {/* Modal Component */}
      {selectedPetHouse && (
        <PetHouseModal
          petHouse={selectedPetHouse}
          isOpen={modalIsOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default UserDashboard;
