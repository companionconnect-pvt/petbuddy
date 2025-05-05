import React, { useEffect, useState } from "react";
import API from "../api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import BookingModal from "./BookPethouseModal";
import PetClinicModal from "./PetClinicModal";
import ClinicBookingModal from "./ClinicBookingModal"; // Import the ClinicBookingModal
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
  const [modalType, setModalType] = useState(null); // 'pethouse-info' | 'clinic-info' | 'pethouse-booking' | 'clinic-booking'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pethouseRes, clinicRes] = await Promise.all([
          API.get("/pethouse/"),
          API.get("/petclinic/")
        ]);
        setPethouses(pethouseRes.data);
        setClinics(clinicRes.data);
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

  const openInfoModal = (item, type) => {
    setSelectedItem(item);
    setModalIsOpen(true);
    setModalType(`${type}-info`);
  };

  const openBookingModal = (item, type) => {
    setSelectedItem(item);
    setBookingModalOpen(true);
    setModalType(`${type}-booking`);
  };

  const closeModals = () => {
    setModalIsOpen(false);
    setBookingModalOpen(false);
    setSelectedItem(null);
    setModalType(null);
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

      {type === "clinic" && item.clinicAddress?.openingHours && (
        <div className="mt-2">
          <h3 className="font-semibold text-sm">Opening Hours:</h3>
          <p className="text-sm text-gray-600 mb-1">
            {item.clinicAddress.openingHours} - {item.clinicAddress.closingHours}
          </p>
        </div>
      )}

      <div className="mt-3 text-sm">
        <span className="font-semibold">Rating:</span>{" "}
        {item.rating ? renderStars(item.rating) : "No ratings yet"}
      </div>

      <div className="mt-4 flex justify-between">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          onClick={() => openInfoModal(item, type)}
        >
          Know More
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
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
    <div className="flex flex-col lg:flex-row h-screen">
      <div className="w-full lg:w-1/2 overflow-y-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Available Services</h1>
        
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
          {activeTab === "pethouses" ? (
            pethouses.map((house) => renderCard(house, "pethouse"))
          ) : (
            clinics.map((clinic) => renderCard(clinic, "clinic"))
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedItem && modalIsOpen && modalType === "clinic-info" && (
        <PetClinicModal
          petClinic={selectedItem}
          isOpen={modalIsOpen}
          onClose={closeModals}
        />
      )}

      {selectedItem && bookingModalOpen && modalType === "pethouse-booking" && (
        <BookingModal
          petHouse={selectedItem}
          isOpen={bookingModalOpen}
          onClose={closeModals}
        />
      )}

{selectedItem && bookingModalOpen && modalType === "clinic-booking" && (
  console.log('Modal props:', {
    isOpen: bookingModalOpen,
    petClinic: selectedItem,
    modalType
  }),
  <ClinicBookingModal
    petClinic={selectedItem}
    isOpen={bookingModalOpen}
    onClose={closeModals}
  />
)}
    </div>
  );
};

export default UserDashboard;