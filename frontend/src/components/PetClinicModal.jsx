import React from "react";
import Modal from "react-modal";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiPhone, 
  FiMail, 
  FiMapPin, 
  FiClock,
  FiAward,
  FiBriefcase
} from "react-icons/fi";

const PetClinicModal = ({ petClinic, isOpen, onClose }) => {
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
      width: "90%",
      maxWidth: "600px",
      padding: 0,
      borderRadius: "16px",
      border: "none",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
    },
  };

  const InfoCard = ({ icon, title, value }) => (
    <motion.div 
      className="flex items-start p-4 bg-white rounded-xl border border-gray-100 shadow-xs"
      whileHover={{ y: -2 }}
    >
      <div className="p-3 rounded-lg bg-blue-50 text-[#F27781] mr-4">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-500">{title}</h4>
        <p className="text-lg font-medium text-gray-800 mt-1">{value}</p>
      </div>
    </motion.div>
  );

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
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#F27781] to-[#F27781] p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {petClinic.name}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-blue-100 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard
                icon={<FiPhone size={20} />}
                title="Phone"
                value={petClinic.phone || "Not provided"}
              />
              <InfoCard
                icon={<FiMail size={20} />}
                title="Email"
                value={petClinic.email || "Not provided"}
              />
            </div>

            <InfoCard
              icon={<FiMapPin size={20} />}
              title="Address"
              value={
                petClinic?.address
                  ? `${petClinic.address.street}, ${petClinic.address.city}, ${petClinic.address.state} ${petClinic.address.zip}`
                  : "Not provided"
              }
            />

            <InfoCard
              icon={<FiClock size={20} />}
              title="Opening Hours"
              value={
                petClinic.clinicAddress
                  ? `${petClinic.clinicAddress.openingHours} - ${petClinic.clinicAddress.closingHours}`
                  : "Not provided"
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard
                icon={<FiAward size={20} />}
                title="Specialization"
                value={petClinic.specialization || "Not specified"}
              />
              <InfoCard
                icon={<FiBriefcase size={20} />}
                title="Experience"
                value={petClinic.experience ? `${petClinic.experience} years` : "Not specified"}
              />
            </div>

            <div className="pt-4">
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#F27781] to-[#F27781] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-medium shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </Modal>
  );
};

export default PetClinicModal;