import React, { useEffect, useState } from "react";
import API from "../api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import BookingModal from "./BookPethouseModal";
import PetClinicModal from "./PetClinicModal";
import ClinicBookingModal from "./ClinicBookingModal";
import { motion, AnimatePresence } from "framer-motion";
import { FiMapPin, FiPhone, FiMail, FiClock, FiStar, FiChevronRight } from "react-icons/fi";
import { FaDog, FaClinicMedical } from "react-icons/fa";

// Custom marker icons
const customIcon = new L.Icon({
  iconUrl: '/marker-icon.png', // Replace with your premium marker icon
  iconRetinaUrl: '/marker-icon-2x.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [38, 60],
  iconAnchor: [19, 60],
  popupAnchor: [1, -50],
  shadowSize: [60, 60],
});

const UserDashboard = () => {
  const [pethouses, setPethouses] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pethouses");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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
    const half = Math.round(rating - full) ? 1 : 0;
    const empty = 5 - full - half;
    return (
      <div className="flex items-center">
        <div className="flex">
          {[...Array(full)].map((_, i) => (
            <FiStar key={`full-${i}`} className="text-yellow-400 fill-current" />
          ))}
          {[...Array(half)].map((_, i) => (
            <FiStar key={`half-${i}`} className="text-yellow-400 fill-current opacity-50" />
          ))}
          {[...Array(empty)].map((_, i) => (
            <FiStar key={`empty-${i}`} className="text-gray-300" />
          ))}
        </div>
        <span className="ml-1 text-sm text-gray-500">{rating?.toFixed(1) || 'New'}</span>
      </div>
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

  const filteredItems = (items) => {
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.address?.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const renderCard = (item, type) => (
    <motion.div
      key={item._id}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 max-w-sm w-full"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative h-48">
        {item.location?.latitude && item.location?.longitude && (
          <MapContainer
            center={[item.location.latitude, item.location.longitude]}
            zoom={14}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
            className="rounded-t-xl"
          >
            <TileLayer
              attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
              url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
            />
            <Marker
              position={[item.location.latitude, item.location.longitude]}
              icon={customIcon}
            >
              <Popup className="font-medium">
                {item.name} <br />
                {item.address?.city}
              </Popup>
            </Marker>
          </MapContainer>
        )}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-sm flex items-center">
          {type === "pethouse" ? (
            <FaDog className="text-[#F27781] mr-1" />
          ) : (
            <FaClinicMedical className="text-green-500 mr-1" />
          )}
          <span className="text-xs font-medium">
            {type === "pethouse" ? "Pet House" : "Clinic"}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold text-gray-800">{item.name}</h2>
          {renderStars(item.rating)}
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center text-gray-600">
            <FiMapPin className="mr-2 text-gray-400" />
            <span className="text-sm">
              {item.address?.street}, {item.address?.city}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <FiPhone className="mr-2 text-gray-400" />
            <span className="text-sm">{item.phone}</span>
          </div>
          {type === "clinic" && item.clinicAddress?.openingHours && (
            <div className="flex items-center text-gray-600">
              <FiClock className="mr-2 text-gray-400" />
              <span className="text-sm">
                {item.clinicAddress.openingHours} - {item.clinicAddress.closingHours}
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between">
          {type === "clinic" ? (
            <button
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center"
            onClick={() => openInfoModal(item, type)}
          >
            Details <FiChevronRight className="ml-1" />
          </button>
          ) : (<></>)}
          <button
            className="px-4 py-2 bg-gradient-to-r from-[#F27781] to-[#F27781] text-white rounded-lg hover:from-[#e85f6a] hover:to-[#e85f6a] transition-all shadow-md hover:shadow-lg"
            onClick={() => openBookingModal(item, type)}
          >
            Book Now
          </button>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-[#F27781] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading premium services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Pet Care Services</h1>
            <p className="text-gray-600 mt-2">
              Find the best {activeTab === "pethouses" ? "pet houses" : "clinics"} for your furry friends
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 relative w-full md:w-64">
            <input
              type="text"
              placeholder={`Search ${activeTab === "pethouses" ? "pet houses" : "clinics"}...`}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F27781] focus:border-transparent shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-1 mb-8 inline-flex">
          <button
            onClick={() => setActiveTab("pethouses")}
            className={`px-6 py-2 rounded-lg transition-all ${
              activeTab === "pethouses"
                ? "bg-[#F27781] text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center">
              <FaDog className="mr-2" />
              Pet Houses
            </div>
          </button>
          <button
            onClick={() => setActiveTab("clinics")}
            className={`px-6 py-2 rounded-lg transition-all ${
              activeTab === "clinics"
                ? "bg-[#F27781] text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center">
              <FaClinicMedical className="mr-2" />
              Clinics
            </div>
          </button>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {activeTab === "pethouses" ? (
            filteredItems(pethouses).length > 0 ? (
              filteredItems(pethouses).map((house) => renderCard(house, "pethouse"))
            ) : (
              <div className="col-span-3 text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FaDog className="inline-block text-4xl" />
                </div>
                <h3 className="text-xl font-medium text-gray-600">No pet houses found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search query</p>
              </div>
            )
          ) : (
            filteredItems(clinics).length > 0 ? (
              filteredItems(clinics).map((clinic) => renderCard(clinic, "clinic"))
            ) : (
              <div className="col-span-3 text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FaClinicMedical className="inline-block text-4xl" />
                </div>
                <h3 className="text-xl font-medium text-gray-600">No clinics found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search query</p>
              </div>
            )
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
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
          <ClinicBookingModal
            petClinic={selectedItem}
            isOpen={bookingModalOpen}
            onClose={closeModals}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserDashboard;