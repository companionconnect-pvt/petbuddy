// PetHouseModal.js
import React from "react";
import Modal from "react-modal"; // Ensure Modal is imported properly

const modalStyles = {
  content: {
    top: "50%",
    left: "25%",
    right: "auto",
    bottom: "auto",
    transform: "translate(-50%, -50%)",
    width: "80%",
    maxWidth: "600px",
    padding: "20px",
    borderRadius: "8px",
    backgroundColor: "white",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    zIndex: 1050,
  },
};

const PetHouseModal = ({ petHouse, isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={modalStyles}
      ariaHideApp={false}
    >
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-semibold mb-4">{petHouse.name}</h2>
        <p className="text-lg mb-2">
          <strong>Email: </strong>
          {petHouse.email}
        </p>
        <p className="text-lg mb-2">
          <strong>Phone: </strong>
          {petHouse.phone}
        </p>
        <p className="text-lg mb-2">
          <strong>Address: </strong>
          {petHouse.address?.street}, {petHouse.address?.city},{" "}
          {petHouse.address?.state} - {petHouse.address?.zip}
        </p>
        <div className="mt-4">
          <h3 className="font-semibold text-xl">Services & Pricing:</h3>
          <ul className="ml-4 list-disc text-lg text-gray-700">
            {petHouse.services?.map((service, index) => (
              <li key={index} className="mb-2">
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
        <div className="mt-4">
          <button
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PetHouseModal; // Default export
