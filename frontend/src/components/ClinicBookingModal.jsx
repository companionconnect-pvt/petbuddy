import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import API from "../api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiPhone, 
  FiCalendar,
  FiClock,
  FiUser,
  FiMapPin,
  FiChevronDown,
  FiX
} from "react-icons/fi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ClinicBookingModal = ({ petClinic, isOpen, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPet, setSelectedPet] = useState("");
  const [serviceMode, setServiceMode] = useState("In-Person");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pets, setPets] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  
  // Sample available times
  const availableTimes = [
    "09:00 AM", "10:00 AM", "11:00 AM", 
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"
  ];  

  const serviceModes = [
    "In-Person",
    "Video-Call",
  ];

  const paymentMethods = [
    "UPI",
    "Card",
    "Cash",
  ];

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
  
    try {
        setIsSubmitting(true);
      if (!selectedPet || !serviceMode || !selectedDate || !selectedTime) {
        alert("Please fill all required fields.");
        return;
      }
      
      const ConsultationData = {
        petClinicId: petClinic._id,
        petId: selectedPet,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        mode: serviceMode,
        status: "pending",
        notes: notes,
        payment: {
          amount: petClinic.clinicAddress.amount,
          method: paymentMethod,
          status: "pending",
        }
      };
  
      const response = await API.post("/consultation/createConsultation", ConsultationData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
        alert("Appointment booked successfully!");
        onClose();
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Booking failed: " + (error.response?.data?.message || error.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalStyles = {
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      backdropFilter: "blur(4px)",
      zIndex: 1000,
    },
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      transform: "translate(-50%, -50%)",
      width: "60%",
      maxWidth: "90%",
      height: "auto",
      padding: 0,
      borderRadius: "16px",
      border: "none",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
    },
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={modalStyles}
      ariaHideApp={false}
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#F27781] to-[#F27781] p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white">Book Appointment</h2>
                <div className="flex items-center mt-2">
                  <FiMapPin className="text-blue-100 mr-2" />
                  <p className="text-blue-100">{petClinic.name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-[#e9cdd0] transition-colors p-1"
              >
                <FiX size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                {/* Service Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consultation Mode
                  </label>
                  <div className="relative">
                    <select
                      value={serviceMode}
                      onChange={(e) => setServiceMode(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F27781] focus:border-transparent appearance-none"
                    >
                      {serviceModes.map((mode) => (
                        <option key={mode} value={mode.toLowerCase()}>
                          {mode}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-3.5 text-gray-400" />
                  </div>
                </div>

                {/* Date Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appointment Date
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      minDate={new Date()}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F27781] focus:border-transparent"
                      placeholderText="Select date"
                    />
                    <FiCalendar className="absolute right-3 top-3.5 text-gray-400" />
                  </div>
                </div>

                {/* Time Slot */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Slot
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimes.map((time) => (
                      <motion.button
                        key={time}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                          selectedTime === time
                            ? "bg-[#F27781] text-white border-[#F27781]"
                            : "border-gray-200 hover:border-[#F27781]"
                        }`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Pet Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Pet
                  </label>
                  <div className="relative">
                    <select
                      value={selectedPet}
                      onChange={(e) => setSelectedPet(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F27781] focus:border-transparent appearance-none"
                    >
                      <option value="">Select your pet</option>
                      {pets.map((pet) => (
                        <option key={pet._id} value={pet._id}>
                          {pet.name} ({pet.breed})
                        </option>
                      ))}
                    </select>
                    <FiUser className="absolute right-3 top-3.5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <div className="relative">
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F27781] focus:border-transparent appearance-none"
                    >
                      {paymentMethods.map((method) => (
                        <option key={method} value={method.toLowerCase()}>
                          {method}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-3.5 text-gray-400" />
                  </div>
                </div>
                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F27781] focus:border-transparent"
                    placeholder="Any special requirements or notes for the vet..."
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.98 }}
                    disabled={!selectedDate || !selectedTime || !selectedPet || isSubmitting}
                    className={`w-full py-3 px-6 rounded-lg text-white font-medium shadow-md transition-opacity ${
                      !selectedDate || !selectedTime || !selectedPet
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#F27781] to-[#F27781] hover:opacity-90"
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      "Confirm Appointment"
                    )}
                  </motion.button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </AnimatePresence>
    </Modal>
  );
};

export default ClinicBookingModal;