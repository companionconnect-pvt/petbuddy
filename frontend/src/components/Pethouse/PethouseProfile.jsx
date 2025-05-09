import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api"; // Assuming this is your configured API client
import editIconSvg from "../../assets/pencil-svgrepo-com.svg"; // Ensure this path is correct
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCalendar,
  FiStar,
  FiList,
  FiGlobe,
  FiEdit2, // For edit photo icon
  FiSave, // For save icon
  FiX, // For cancel icon
} from "react-icons/fi";

// Helper to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const PethouseProfile = () => {
  const [pethouse, setPethouse] = useState(null);
  const [editingField, setEditingField] = useState(null); // e.g., "name", "address.street"
  const [editValue, setEditValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const fetchPethouseProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login"); // Or pethouse login
        throw new Error("No token found");
      }

      const res = await API.get("/pethouse/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPethouse(res.data);
    } catch (err) {
      console.error("Error fetching pethouse profile:", err);
      // Keep previous data if fetch fails, or clear it
      // setPethouse(null);
      alert("Failed to fetch profile data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchPethouseProfile();
  }, [fetchPethouseProfile]);

  const handleEditClick = (field, currentValue) => {
    setEditingField(field);
    // For address, we might want to edit all parts together or provide the specific part
    if (field.startsWith("address.")) {
      const addressPart = field.split(".")[1];
      setEditValue(pethouse.address[addressPart] || "");
    } else {
      setEditValue(currentValue || "");
    }
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  const handleSaveClick = async () => {
    if (isSaving) return;
    setIsSaving(true);

    let updatedData = {};
    if (editingField.startsWith("address.")) {
      const addressPart = editingField.split(".")[1];
      updatedData = {
        address: {
          ...pethouse.address,
          [addressPart]: editValue,
        },
      };
    } else {
      updatedData = { [editingField]: editValue };
    }

    try {
      const token = localStorage.getItem("token");
      await API.put("/pethouse/profile", updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update local state optimistically or re-fetch
      if (editingField.startsWith("address.")) {
        const addressPart = editingField.split(".")[1];
        setPethouse((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            [addressPart]: editValue,
          },
        }));
      } else {
        setPethouse((prev) => ({ ...prev, [editingField]: editValue }));
      }

      setEditingField(null);
      setEditValue("");
      // Optionally, show a success message
    } catch (err) {
      console.error("Update failed:", err);
      alert(err.response?.data?.message || "Update failed. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // TODO: Implement photo upload logic
      // 1. Create FormData
      // 2. Append file to FormData
      // 3. Make API call to upload photo
      // 4. On success, update pethouse.photo URL and local state
      alert("Photo upload functionality to be implemented.");
      console.log("Selected file:", file);
    }
  };

  const RenderEditableField = ({
    label,
    fieldName,
    value,
    icon,
    type = "text",
  }) => (
    <motion.div
      key={fieldName}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 "
      
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="p-2 rounded-lg bg-[#FFF0F5] text-[#F27781] mr-3">
            {icon}
          </div>
          <h3 className="text-md font-semibold text-gray-700">{label}</h3>
        </div>
        {editingField !== fieldName && (
          <button
            onClick={() => handleEditClick(fieldName, value)}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-[#F27781] transition-colors"
            aria-label={`Edit ${label}`}
          >
            <FiEdit2 size={18} />
          </button>
        )}
      </div>

      {editingField === fieldName ? (
        <div className="mt-2 space-y-3">
          <input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27781] focus:border-transparent"
            autoFocus
          />
          <div className="flex items-center space-x-2 justify-end">
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSaving}
            >
              <FiX className="inline mr-1" /> Cancel
            </button>
            <button
              onClick={handleSaveClick}
              className="px-4 py-2 text-sm font-medium text-white bg-[#F27781] rounded-lg hover:bg-[#D9536F] transition-colors flex items-center"
              disabled={isSaving}
            >
              <FiSave className="inline mr-1" />{" "}
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 text-md ml-10 truncate">
          {value || <span className="text-gray-400 italic">Not set</span>}
        </p>
      )}
    </motion.div>
  );

  const RenderDisplayField = ({ label, value, icon }) => (
    <motion.div
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-200"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center mb-1">
        <div className="p-2 rounded-lg bg-[#FFF0F5] text-[#F27781] mr-3">
          {icon}
        </div>
        <h3 className="text-md font-semibold text-gray-700">{label}</h3>
      </div>
      <p className="text-gray-800 text-md ml-10 truncate">
        {value || <span className="text-gray-400 italic">N/A</span>}
      </p>
    </motion.div>
  );

  if (isLoading && !pethouse) {
    // Show loader only on initial load
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-20 w-20 border-t-4 border-b-4 border-[#F27781]"
        ></motion.div>
      </div>
    );
  }

  if (!pethouse) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Profile Data Unavailable
        </h2>
        <p className="text-gray-500 mb-6">
          We couldn't load the pethouse profile information. Please check your
          connection or try again.
        </p>
        <button
          onClick={fetchPethouseProfile}
          className="px-6 py-3 text-white bg-[#F27781] rounded-lg hover:bg-[#D9536F] transition duration-300 font-medium shadow-md"
        >
          Retry Loading Profile
        </button>
      </div>
    );
  }

  const {
    name,
    email,
    phone,
    address,
    services,
    rating,
    createdAt,
    photo,
    latitude,
    longitude,
  } = pethouse;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-rose-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Pet House Profile
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and update your pethouse information.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column: Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1 bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center self-start"
          >
            <div className="relative group mb-4">
              <img
                src={photo || "https://www.w3schools.com/howto/img_avatar.png"}
                alt={name}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <label
                htmlFor="photo-upload"
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
              >
                <FiEdit2 size={24} className="text-white" />
                <input
                  type="file"
                  id="photo-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </label>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">
              {name}
            </h2>
            <p className="text-sm text-gray-500 mb-1 text-center">{email}</p>
            <div className="text-xs text-gray-500 mb-6 text-center">
              <FiCalendar className="inline mr-1" /> Member since{" "}
              {formatDate(createdAt)}
            </div>

            <button
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login"); // Or your specific pethouse login route
              }}
              className="w-full px-4 py-3 text-red-600 border border-red-500 rounded-lg hover:bg-red-500 hover:text-white transition duration-300 font-medium text-sm shadow-sm"
            >
              Logout
            </button>
          </motion.div>

          {/* Right Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-xl font-semibold text-gray-700 mb-3 px-1">
                Contact & Basic Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RenderEditableField
                  label="Pethouse Name"
                  fieldName="name"
                  value={name}
                  icon={<FiUser size={18} />}
                />
                <RenderEditableField
                  label="Phone Number"
                  fieldName="phone"
                  value={phone}
                  icon={<FiPhone size={18} />}
                  type="tel"
                />
              </div>
            </motion.section>

            {/* Address Details Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-xl font-semibold text-gray-700 mb-3 px-1">
                Address Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RenderEditableField
                  label="Street Address"
                  fieldName="address.street"
                  value={address?.street}
                  icon={<FiMapPin size={18} />}
                />
                <RenderEditableField
                  label="City"
                  fieldName="address.city"
                  value={address?.city}
                  icon={<FiMapPin size={18} />}
                />
                <RenderEditableField
                  label="State"
                  fieldName="address.state"
                  value={address?.state}
                  icon={<FiMapPin size={18} />}
                />
                <RenderEditableField
                  label="Zip Code"
                  fieldName="address.zip"
                  value={address?.zip}
                  icon={<FiMapPin size={18} />}
                  type="text"
                />
              </div>
            </motion.section>

            {/* Service Information Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-gray-700 mb-3 px-1">
                Service Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RenderDisplayField
                  label="Services Offered"
                  value={
                    services?.map((s) => s.name).join(", ") ||
                    "No services listed"
                  }
                  icon={<FiList size={18} />}
                />
                <RenderDisplayField
                  label="Overall Rating"
                  value={
                    rating ? `${Number(rating).toFixed(1)} ★` : "Not rated yet"
                  }
                  icon={<FiStar size={18} />}
                />
              </div>
            </motion.section>

            {/* Location Coordinates Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-xl font-semibold text-gray-700 mb-3 px-1">
                Location Coordinates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RenderDisplayField
                  label="Latitude"
                  value={latitude}
                  icon={<FiGlobe size={18} />}
                />
                <RenderDisplayField
                  label="Longitude"
                  value={longitude}
                  icon={<FiGlobe size={18} />}
                />
              </div>
              {latitude && longitude && (
                <div className="mt-4">
                  <a
                    href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#F27781] border border-[#F27781] rounded-lg hover:bg-[#F27781] hover:text-white transition-colors"
                  >
                    <FiMapPin className="mr-2" /> View on Google Maps
                  </a>
                </div>
              )}
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PethouseProfile;
