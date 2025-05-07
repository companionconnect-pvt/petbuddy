import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import API from "../api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FiX, FiCalendar, FiCreditCard, FiHome, FiUser, FiDollarSign } from "react-icons/fi";
import { FaPaw } from "react-icons/fa";

Modal.setAppElement("#root");

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const PetHouseBookingModal = ({ isOpen, onClose, petHouse }) => {
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const fetchPets = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get("/pet/fetchall", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPets(res.data);
      } catch (err) {
        console.error("Failed to fetch pets", err);
      }
    };

    fetchPets();
  }, [isOpen]);

  useEffect(() => {
    if (selectedService && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setTotalPrice(selectedService.price * diffDays);
    } else {
      setTotalPrice(0);
    }
  }, [selectedService, startDate, endDate]);

  const handleBooking = async () => {
    if (!selectedPetId || !selectedService || !startDate || !endDate) {
      alert("Please fill all required fields.");
      return;
    }

    const bookingData = {
      petHouseId: petHouse._id,
      petId: selectedPetId,
      serviceType: [
        {
          name: selectedService.name,
          petType: selectedService.petType,
          price: selectedService.price,
        },
      ],
      startDate,
      endDate,
      payment: {
        amount: totalPrice,
        method: paymentMethod,
        status: "pending",
      },
    };

    try {
      setBookingLoading(true);
      await API.post("/booking/createBooking", bookingData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      alert("Booking successful!");
      onClose();
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Booking failed. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="w-full max-w-6xl mx-auto my-8 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-2xl p-0 overflow-hidden border border-gray-100"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50"
      closeTimeoutMS={300}
    >
      <div className="relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
        >
          <FiX className="text-gray-600 text-xl" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Left: Info and Map */}
          <div className="w-full md:w-1/2 bg-gradient-to-br from-pink-50 to-purple-50 p-8">
            <div className="flex items-center mb-6">
              <div className="bg-pink-100 p-3 rounded-xl mr-4">
                <FiHome className="text-pink-600 text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{petHouse.name}</h2>
                <p className="text-pink-600 font-medium">{petHouse.address?.city}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <div className="bg-gray-100 p-2 rounded-lg mr-3">
                  <FiUser className="text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="font-medium">{petHouse.email}</p>
                  <p className="font-medium">{petHouse.phone}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-gray-100 p-2 rounded-lg mr-3">
                  <FaPaw className="text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">
                    {petHouse.address?.street}, {petHouse.address?.city}, {petHouse.address?.state} -{" "}
                    {petHouse.address?.zip}
                  </p>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-pink-100 text-pink-600 p-2 rounded-lg mr-2">
                  <FaPaw />
                </span>
                Services & Pricing
              </h3>
              <div className="space-y-3">
                {petHouse.services?.map((service, index) => (
                  <div key={index} className="bg-white p-4 rounded-xl shadow-sm">
                    <h4 className="font-medium text-gray-800 mb-2">{service.name}</h4>
                    <div className="space-y-2">
                      {service.options?.map((opt, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">
                            {opt.petType}
                          </span>
                          <span className="text-pink-600 font-semibold">
                            ₹{opt.price}/day
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            <div className="h-64 rounded-xl overflow-hidden shadow-lg border border-gray-200">
              {petHouse.latitude && petHouse.longitude ? (
                <MapContainer
                  center={[petHouse.latitude, petHouse.longitude]}
                  zoom={15}
                  scrollWheelZoom={false}
                  style={{ height: "100%", width: "100%" }}
                  className="rounded-xl"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[petHouse.latitude, petHouse.longitude]}>
                    <Popup className="font-medium">
                      <FaPaw className="inline mr-1 text-pink-600" />
                      {petHouse.name}
                    </Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-100">
                  <p className="text-gray-500">Location not available</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Booking Form */}
          <div className="w-full md:w-1/2 bg-white p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Book Your Pet's Stay</h2>

            {/* Pet Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Pet</label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 appearance-none bg-white"
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                >
                  <option value="">-- Choose Your Pet --</option>
                  {pets.map((pet) => (
                    <option key={pet._id} value={pet._id}>
                      {pet.name} ({pet.type})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Service Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Service</label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 appearance-none bg-white"
                  onChange={(e) => setSelectedService(JSON.parse(e.target.value))}
                >
                  <option value="">-- Choose Service --</option>
                  {petHouse.services
                    ?.flatMap((service) =>
                      service.options?.map((opt, idx) => ({
                        name: service.name,
                        petType: opt.petType,
                        price: opt.price,
                      }))
                    )
                    .map((svc, idx) => (
                      <option key={idx} value={JSON.stringify(svc)}>
                        {svc.name} ({svc.petType}) - ₹{svc.price}/day
                      </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Date Pickers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  {/* <FiCalendar className="absolute right-3 top-3.5 text-gray-400" /> */}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                  />
                  {/* <FiCalendar className="absolute right-3 top-3.5 text-gray-400" /> */}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  className={`py-3 px-2 rounded-xl border ${paymentMethod === "upi" ? "border-pink-500 bg-pink-50" : "border-gray-300"} flex flex-col items-center`}
                  onClick={() => setPaymentMethod("upi")}
                >
                  <FiCreditCard className="text-gray-700 mb-1" />
                  <span className="text-xs">UPI</span>
                </button>
                <button
                  className={`py-3 px-2 rounded-xl border ${paymentMethod === "card" ? "border-pink-500 bg-pink-50" : "border-gray-300"} flex flex-col items-center`}
                  onClick={() => setPaymentMethod("card")}
                >
                  <FiCreditCard className="text-gray-700 mb-1" />
                  <span className="text-xs">Card</span>
                </button>
                <button
                  className={`py-3 px-2 rounded-xl border ${paymentMethod === "cash" ? "border-pink-500 bg-pink-50" : "border-gray-300"} flex flex-col items-center`}
                  onClick={() => setPaymentMethod("cash")}
                >
                  <FiDollarSign className="text-gray-700 mb-1" />
                  <span className="text-xs">Cash</span>
                </button>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-gray-50 p-4 rounded-xl mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Service Price:</span>
                <span className="font-medium">₹{selectedService?.price || 0}/day</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">
                  {startDate && endDate ? (
                    <>
                      {Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1} days
                    </>
                  ) : (
                    "0 days"
                  )}
                </span>
              </div>
              <div className="border-t border-gray-200 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-xl font-bold text-pink-600">₹{totalPrice}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="px-6 py-3 bg-gradient-to-r from-[#F27781] to-[#F27781] text-white rounded-xl hover:opacity-90 transition-opacity font-medium flex items-center"
                onClick={handleBooking}
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PetHouseBookingModal;