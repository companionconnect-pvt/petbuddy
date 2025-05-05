import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import editIcon from "../assets/pencil-svgrepo-com.svg";
import binIcon from "../assets/trash-bin-trash-svgrepo-com.svg";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiPlus,
  FiCalendar,
} from "react-icons/fi";
import { RiShieldUserLine } from "react-icons/ri";
import ChatbotModal from "./chatbotModal";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState(null);
  const [showPetCard, setShowPetCard] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatPet, setChatPet] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await API.get("/user/me", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUser(res.data);
      console.log("User data : ", res.data);
    } catch (err) {
      alert("Failed to fetch user data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (field, currentValue) => {
    setEditingField(field);
    setEditValue(currentValue);
  };
  const handleRemovePet = async (petId) => {
    try {
      const removePetPet = await API.delete(`/pet/${petId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const res = await API.get("/user/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUser(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Server error");
    }
  };
  const handleSaveClick = async () => {
    try {
      let updatedData = {};
      if (editingField === "address") {
        const [street, city, state, zip] = editValue
          .split(",")
          .map((part) => part.trim());
        updatedData.address = { street, city, state, zip };
      } else {
        updatedData[editingField] = editValue;
      }

      await API.put("/user/me", updatedData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setEditingField(null);
      await fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };
  const handleChatClick = (pet) => {
    setChatPet(pet);
    setShowChatbot(true);
  };
  const PetCard = ({ pet, onClose }) => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-2xl p-8 w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-2xl font-bold text-gray-900">{pet.name}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Species</p>
              <p className="font-medium capitalize">{pet.species}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Breed</p>
              <p className="font-medium capitalize">{pet.breed}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Age</p>
              <p className="font-medium">{pet.age} years</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Weight</p>
              <p className="font-medium">{pet.weight} kg</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="font-medium capitalize">{pet.gender}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Medical History</p>
              <p className="font-medium capitalize">
                Date: {pet.medicalHistory.date}
              </p>
              <p className="font-medium capitalize">
                Description: {pet.medicalHistory.decription}
              </p>
              <p className="font-medium capitalize">
                Doctor: {pet.medicalHistory.doctor}
              </p>
              <p className="font-medium capitalize">
                Treatment: {pet.medicalHistory.treatment}
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => handleChatClick(pet)}
              className="px-4 py-2 text-[#F27781] border border-[#F27781] rounded-lg hover:bg-[#F27781] hover:text-white transition-colors duration-200"
            >
              Chat
            </button>
            <button
              onClick={() => navigate(`/editPet/${pet._id}`)}
              className="px-4 py-2 text-[#F27781] border border-[#F27781] rounded-lg hover:bg-[#F27781] hover:text-white transition-colors duration-200"
            >
              Edit
            </button>
            <button
              onClick={() => {
                handleRemovePet(pet._id);
                onClose();
              }}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const renderEditableField = (label, fieldName, value, icon) => (
    <motion.div
      className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 hover:shadow-sm transition-all duration-300"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 mr-3">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
      </div>
      {editingField === fieldName ? (
        <div className="flex items-center space-x-3">
          <input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 border border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSaveClick}
            className="px-4 py-3 text-[#F27781] border border-[#F27781] rounded-lg hover:bg-[#F27781] hover:text-white transition-all duration-300 shadow-xs"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <p className="text-gray-600 text-lg">{value || "Not provided"}</p>
          <button
            onClick={() => handleEditClick(fieldName, value)}
            className="p-2 rounded-full hover:bg-gray-50 transition-colors duration-200"
          >
            <img
              src={editIcon}
              className="h-5 w-5 opacity-70 hover:opacity-100"
              alt="edit"
            />
          </button>
        </div>
      )}
    </motion.div>
  );

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"
        ></motion.div>
      </div>
    );

  if (!user)
    return (
      <div className="text-center mt-10 text-gray-500">
        <p>Failed to load profile data</p>
        <button
          onClick={fetchProfile}
          className="mt-4 px-6 py-2 text-[#F27781] border border-[#F27781] rounded-lg hover:bg-[#F27781] hover:text-white transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      {/* Premium Header */}
      <div className="mb-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              My Profile
            </h1>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Premium Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl p-8 flex flex-col items-center text-center shadow-xs border border-gray-100"
        >
          <div className="relative mb-6 group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-md opacity-30 -z-10"></div>
            <img
              src="https://www.w3schools.com/howto/img_avatar.png"
              alt="avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
            />
            <button className="absolute bottom-0 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200">
              <img src={editIcon} className="h-4 w-4" alt="edit" />
            </button>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h2>
          <p className="text-gray-500 mb-6">{user.email}</p>

          <button
            onClick={() => navigate("/edituserprofile")}
            className="w-full px-6 py-3 text-[#F27781] border border-[#F27781] rounded-lg hover:bg-[#F27781] hover:text-white transition duration-300 shadow-md hover:shadow-lg font-medium"
          >
            Update Profile
          </button>
        </motion.div>

        {/* Editable Fields */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {renderEditableField(
              "Full Name",
              "name",
              user.name,
              <FiUser size={20} />
            )}
            {renderEditableField(
              "Email",
              "email",
              user.email,
              <FiMail size={20} />
            )}
            {renderEditableField(
              "Phone",
              "phoneNumber",
              user.phoneNumber,
              <FiPhone size={20} />
            )}

            {/* Premium Address Block */}
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 hover:shadow-sm transition-all duration-300"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center mb-4">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 mr-3">
                  <FiMapPin size={20} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Address</h3>
              </div>
              {editingField === "address" ? (
                <div className="flex items-center space-x-3">
                  <input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Street, City, State, ZIP"
                    className="flex-1 border border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSaveClick}
                    className="px-4 py-3 text-[#F27781] border border-[#F27781] rounded-lg hover:bg-[#F27781] hover:text-white transition-all duration-300 shadow-xs"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <p className="text-gray-600 text-lg">
                    {user.address?.street ? (
                      <>
                        {user.address.street}, {user.address.city},{" "}
                        {user.address.state} {user.address.zip}
                      </>
                    ) : (
                      "Not provided"
                    )}
                  </p>
                  <button
                    onClick={() =>
                      handleEditClick(
                        "address",
                        user.address
                          ? `${user.address.street}, ${user.address.city}, ${user.address.state} ${user.address.zip}`
                          : ""
                      )
                    }
                    className="p-2 rounded-full hover:bg-gray-50 transition-colors duration-200"
                  >
                    <img
                      src={editIcon}
                      className="h-5 w-5 opacity-70 hover:opacity-100"
                      alt="edit"
                    />
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Premium Pets and Bookings Sections */}
      <div className="grid lg:grid-cols-2 gap-8 mt-12">
        {/* Premium Pets Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl p-8 shadow-xs border border-gray-100"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">My Pets</h3>
              <p className="text-gray-500">Manage your pet profiles</p>
            </div>
            <button
              onClick={() => navigate("/petRegister")}
              className="flex items-center space-x-2 px-5 py-3 text-[#F27781] border border-[#F27781] rounded-lg hover:bg-[#F27781] hover:text-white transition-all duration-300 shadow-xs"
            >
              <FiPlus />
              <span>Add Pet</span>
            </button>
          </div>

          {user.pets.length > 0 ? (
            <ul className="space-y-4">
              {user.pets.map((pet) => (
                <motion.li
                  key={`pet-${pet._id}`}
                  whileHover={{ scale: 1.01 }}
                  className="border border-gray-200 rounded-xl p-5 hover:shadow-xs transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {pet.photo ? (
                          <img
                            src={pet.photo}
                            alt={pet.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-400 text-xl">
                            {pet.name.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="flex justify-between items-start"
                        onClick={() => {
                          setSelectedPet(pet);
                          setShowPetCard(true);
                        }}
                      >
                        <div>
                          <p className="text-lg font-semibold text-gray-900 truncate">
                            {pet.name}
                          </p>
                          <p className="text-sm text-gray-500 capitalize">
                            {pet.species} • {pet.breed}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/editPet/${pet._id}`)}
                            className="p-2 rounded-full hover:bg-blue-50 transition-colors duration-200"
                          >
                            <img
                              src={editIcon}
                              className="h-5 w-5 opacity-70 hover:opacity-100"
                              alt="edit"
                            />
                          </button>
                          <button
                            onClick={() => handleRemovePet(pet._id)}
                            className="p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
                          >
                            <img
                              src={binIcon}
                              className="h-5 w-5 opacity-70 hover:opacity-100"
                              alt="delete"
                            />
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FiPlus className="text-gray-400" size={32} />
              </div>
              <h4 className="text-lg font-medium text-gray-700 mb-2">
                No pets added yet
              </h4>
              <p className="text-gray-500 mb-6">
                Add your first pet to get started
              </p>
              <button
                onClick={() => navigate("/petRegister")}
                className="px-6 py-3 bg-gradient-to-r text-[#F27781] border border-[#F27781] rounded-lg hover:bg-[#F27781] hover:text-white transition-all duration-300 shadow-xs"
              >
                Add Pet
              </button>
            </div>
          )}
        </motion.div>

        {/* Premium Bookings Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl p-8 shadow-xs border border-gray-100"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">My Bookings</h3>
              <p className="text-gray-500">View and manage appointments</p>
            </div>
            <button
              onClick={() => navigate("/services")}
              className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r text-[#F27781] border border-[#F27781] rounded-lg hover:bg-[#F27781] hover:text-white transition-all duration-300 shadow-xs"
            >
              <FiCalendar />
              <span>Book Service</span>
            </button>
          </div>

          {user.bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FiCalendar className="text-gray-400" size={32} />
              </div>
              <h4 className="text-lg font-medium text-gray-700 mb-2">
                No bookings yet
              </h4>
              <p className="text-gray-500 mb-6">
                Schedule your first appointment
              </p>
              <button
                onClick={() => navigate("/services")}
                className="px-6 py-3 bg-gradient-to-r text-[#F27781] border border-[#F27781] rounded-lg hover:bg-[#F27781] hover:text-white transition-all duration-300 shadow-xs"
              >
                Book Now
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {user.bookings.map((booking) => (
                <motion.li
                  key={`booking-${booking._id}`}
                  whileHover={{ scale: 1.01 }}
                  className="border border-gray-200 rounded-xl p-5 hover:shadow-xs transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-semibold text-gray-900 capitalize">
                        {booking.serviceType}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <FiCalendar className="mr-1" size={14} />
                          <span>
                            {new Date(booking.startDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        {booking.pet && (
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded-full">
                              {booking.pet.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : booking.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Professional</p>
                      <p className="font-medium">
                        Dr. {booking.professional?.name || "Not assigned"}
                      </p>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View Details
                    </button>
                  </div>
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>
      <AnimatePresence>
        {showPetCard && (
          <PetCard
            key={selectedPet?._id ?? "petcard"}
            pet={selectedPet}
            onClose={() => setShowPetCard(false)}
          />
        )}
      </AnimatePresence>
      <ChatbotModal
        pet={chatPet}
        isOpen={showChatbot}
        onClose={() => setShowChatbot(false)}
      />
    </div>
  );
};

export default UserProfile;
