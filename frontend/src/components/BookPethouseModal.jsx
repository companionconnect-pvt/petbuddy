import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import API from "../api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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
        amount: selectedService.price || 0,
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
      alert("Booking failed.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="w-full max-w-6xl mx-auto mt-16 bg-white rounded-lg shadow-lg p-6 flex flex-col gap-6"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50"
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Info and Map */}
        <div className="w-full md:w-1/2">
          <h2 className="text-2xl font-semibold text-pink-500 mb-3">
            {petHouse.name}
          </h2>
          <p className="text-lg mb-1">
            <strong>Email:</strong> {petHouse.email}
          </p>
          <p className="text-lg mb-1">
            <strong>Phone:</strong> {petHouse.phone}
          </p>
          <p className="text-lg mb-4">
            <strong>Address:</strong> {petHouse.address?.street},{" "}
            {petHouse.address?.city}, {petHouse.address?.state} -{" "}
            {petHouse.address?.zip}
          </p>

          <div className="mb-4">
            <h3 className="font-semibold text-xl mb-2">Services & Pricing:</h3>
            <ul className="ml-4 list-disc text-gray-700">
              {petHouse.services?.map((service, index) => (
                <li key={index}>
                  {service.name} -{" "}
                  {service.options?.map((opt, i) => (
                    <span key={i} className="ml-2">
                      {opt.petType}: ₹{opt.price}
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          </div>

          {/* Map */}
          <div className="h-60 rounded-lg overflow-hidden shadow mb-4">
            {petHouse.latitude && petHouse.longitude ? (
              <MapContainer
                center={[petHouse.latitude, petHouse.longitude]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[petHouse.latitude, petHouse.longitude]}>
                  <Popup>
                    {petHouse.name} <br /> {petHouse.address?.city}
                  </Popup>
                </Marker>
              </MapContainer>
            ) : (
              <p className="text-sm text-gray-500 p-4">
                Location not available
              </p>
            )}
          </div>
        </div>

        {/* Right: Booking Form */}
        <div className="w-full md:w-1/2">
          <h2 className="text-xl font-semibold text-pink-500 mb-4">
            Book a Service
          </h2>

          {/* Pet Selection */}
          <label className="block mb-2 text-sm font-medium">Select Pet</label>
          <select
            className="w-full border rounded-lg px-3 py-2 mb-4"
            value={selectedPetId}
            onChange={(e) => setSelectedPetId(e.target.value)}
          >
            <option value="">-- Choose Pet --</option>
            {pets.map((pet) => (
              <option key={pet._id} value={pet._id}>
                {pet.name} ({pet.type})
              </option>
            ))}
          </select>

          {/* Service Selection */}
          <label className="block mb-2 text-sm font-medium">
            Select Service
          </label>
          <select
            className="w-full border rounded-lg px-3 py-2 mb-4"
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
                  {svc.name} ({svc.petType}) - ₹{svc.price}
                </option>
              ))}
          </select>

          {/* Date Pickers */}
          <div className="flex gap-4 mb-4">
            <div className="flex flex-col w-1/2">
              <label className="text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                className="border rounded-lg px-3 py-2"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col w-1/2">
              <label className="text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                className="border rounded-lg px-3 py-2"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Payment Method */}
          <label className="block mb-2 text-sm font-medium">
            Payment Method
          </label>
          <select
            className="w-full border rounded-lg px-3 py-2 mb-4"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="cash">Cash</option>
          </select>

          {/* Action Buttons */}
          <div className="flex justify-between mt-6">
            <button
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              onClick={handleBooking}
              disabled={bookingLoading}
            >
              {bookingLoading ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PetHouseBookingModal;
