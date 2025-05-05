import React, { useEffect, useState } from "react";
import API from "../api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import BookingModal from "./BookPethouseModal";
import ClinicModal from "./BookClinicModal";

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
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pethouses");

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingType, setBookingType] = useState("pethouse");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pethouseRes = await API.get("/pethouse/");
        const clinicRes = await API.get("/petclinic/");

        console.log(clinicRes.data);
        setPethouses(pethouseRes.data); // Correct
        setClinics(clinicRes.data); // Correct
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderStars = (rating) => {
    const full = Math.floor(rating || 0);
    const empty = 5 - full;
    return (
      <span className="text-yellow-500">
        {"★".repeat(full)}
        <span className="text-gray-300">{"★".repeat(empty)}</span>
      </span>
    );
  };

  const openModal = (item, type) => {
    setSelectedItem({ ...item, type });
    setModalIsOpen(true);
  };

  const openBookingModal = (item, type) => {
    setSelectedItem({ ...item, type });
    setBookingType(type);
    setBookingModalOpen(true);
  };

  const closeModals = () => {
    setModalIsOpen(false);
    setBookingModalOpen(false);
    setSelectedItem(null);
  };

  const renderCard = (item, type) => (
    <div
      key={item._id}
      className="bg-white shadow-md rounded-lg p-4 border hover:shadow-lg transition max-w-md w-full"
    >
      <h2 className="text-xl font-semibold">{item.name}</h2>
      <p className="text-sm text-gray-600 mb-1">{item.email}</p>
      <p className="text-sm text-gray-600 mb-1">{item.phone}</p>
      <p className="text-gray-700 mb-2">
        {item.address?.street}, {item.address?.city}, {item.address?.state} -{" "}
        {item.address?.zip}
      </p>

      {/* Map */}
      {item.location?.latitude && item.location?.longitude && (
        <div className="my-3 rounded overflow-hidden">
          <MapContainer
            center={[item.location.latitude, item.location.longitude]}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: "200px", width: "100%", borderRadius: "8px" }}
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
              position={[item.location.latitude, item.location.longitude]}
              icon={customIcon}
            >
              <Popup>
                {item.name} <br />
                {item.address?.city}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      )}

      <div className="mt-2">
        <h3 className="font-semibold text-sm">Services & Pricing:</h3>
        <ul className="ml-4 list-disc text-sm text-gray-700"></ul>
      </div>

      <div className="mt-3 text-sm">
        <span className="font-semibold">Rating:</span>{" "}
        {item.rating ? renderStars(item.rating) : "No ratings yet"}
      </div>

      <div className="mt-3 text-xs text-gray-500">
        <p>Created at: {new Date(item.createdAt).toLocaleString()}</p>
        <p>Updated at: {new Date(item.updatedAt).toLocaleString()}</p>
      </div>

      <div className="mt-4 flex justify-between">
        <button
          className="px-4 py-2 bg-[#F27781] hover:bg-[#e76872] text-white rounded-md"
          onClick={() => openBookingModal(item, type)}
        >
          Book Now
        </button>
      </div>
    </div>
  );

  if (loading)
    return <div className="text-center mt-10 text-lg">Loading...</div>;

  return (
    <div className="bg-[#FAF9F6] min-h-screen font-sans text-[#222222]">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-4">
          <button
            onClick={() => setActiveTab("pethouses")}
            className={`mr-4 px-4 py-2 rounded ${
              activeTab === "pethouses"
                ? "bg-[#F27781] text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Pet Houses
          </button>
          <button
            onClick={() => setActiveTab("clinics")}
            className={`px-4 py-2 rounded ${
              activeTab === "clinics"
                ? "bg-[#F27781] text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Clinics
          </button>
        </div>

        <div className="flex flex-col items-start gap-4">
          {activeTab === "pethouses"
            ? pethouses.map((house) => renderCard(house, "pethouse"))
            : clinics.map((clinic) => renderCard(clinic, "clinic"))}
        </div>
      </div>

      {selectedItem && modalIsOpen && selectedItem.type === "clinic" && (
        <ClinicModal
          clinic={selectedItem}
          isOpen={modalIsOpen}
          onClose={closeModals}
        />
      )}

      {selectedItem && bookingModalOpen && bookingType === "pethouse" && (
        <BookingModal
          petHouse={selectedItem}
          isOpen={bookingModalOpen}
          onClose={closeModals}
        />
      )}
    </div>
  );
};

export default UserDashboard;
