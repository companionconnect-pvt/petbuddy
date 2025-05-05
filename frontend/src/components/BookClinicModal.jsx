import React, { useEffect, useState } from "react";
import API from "../api";
import Modal from "react-modal";

Modal.setAppElement("#root");

const ClinicModal = ({ isOpen, onClose, petHouse }) => {
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [bookingLoading, setBookingLoading] = useState(false);

  // Fetch user's pets
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await API.get("/pet/fetchall", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(res.data);
        setPets(res.data);
      } catch (err) {
        console.error("Failed to fetch pets", err);
      }
    };

    if (isOpen) fetchPets();
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
        amount: selectedService.price ? selectedService.price : 0,
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
      contentLabel="Booking Modal"
      className="max-w-lg mx-auto mt-20 bg-white rounded-lg shadow-lg p-6"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start"
    >
      <h2 className="text-xl font-bold mb-4">Book at {petHouse.name}</h2>

      <label className="block mb-2 text-sm font-medium">Select Your Pet</label>
      <select
        className="w-full border rounded px-3 py-2 mb-4"
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

      <label className="block mb-2 text-sm font-medium">Select Service</label>
      <select
        className="w-full border rounded px-3 py-2 mb-4"
        onChange={(e) => {
          const service = JSON.parse(e.target.value);
          setSelectedService(service);
        }}
      >
        <option value="">-- Choose Service --</option>
        {petHouse.services?.map((service, idx) => (
          <option key={idx} value={JSON.stringify(service)}>
            {service.name} ({service.petType}) - ₹{service.price}
          </option>
        ))}
      </select>

      <div className="flex gap-4 mb-4">
        <div className="flex flex-col w-1/2">
          <label className="text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col w-1/2">
          <label className="text-sm font-medium mb-1">End Date</label>
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <label className="block mb-2 text-sm font-medium">Payment Method</label>
      <select
        className="w-full border rounded px-3 py-2 mb-4"
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
      >
        <option value="upi">UPI</option>
        <option value="card">Card</option>
        <option value="cash">Cash</option>
      </select>

      <div className="flex justify-between mt-6">
        <button
          className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={handleBooking}
          disabled={bookingLoading}
        >
          {bookingLoading ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </Modal>
  );
};

export default ClinicModal;
