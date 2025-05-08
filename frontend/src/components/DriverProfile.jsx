import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiStar, FiLogOut, FiEdit, FiSave, FiX, FiPhone, FiMail, FiCreditCard, FiCalendar, FiTruck } from "react-icons/fi";
import { FaCar, FaRegUserCircle, FaAward, FaMoneyBillWave } from "react-icons/fa";
import { RiShieldStarLine, RiNumber1 } from "react-icons/ri";
import { MdDirectionsCar, MdDateRange } from "react-icons/md";

const DriverProfile = () => {
  const [driver, setDriver] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDriverProfile();
  }, []);

  const fetchDriverProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const res = await API.get("/driver/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Fetched driver profile:", res.data);
      setDriver(res.data.driver);
    } catch (err) {
      console.error("Error fetching driver profile:", err);
      setError("Failed to fetch driver data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (field, value) => {
    setEditingField(field);
    setEditValue(value || "");
  };

  const handleNestedEditClick = (parentField, field, value) => {
    setEditingField(`${parentField}.${field}`);
    setEditValue(value || "");
  };

  const handleSaveClick = async () => {
    if (!editValue.trim()) {
      alert("Field cannot be empty");
      return;
    }

    const [parentField, childField] = editingField.includes('.') 
      ? editingField.split('.') 
      : [editingField, null];

    const updatedData = childField 
      ? { [parentField]: { [childField]: editValue } } 
      : { [parentField]: editValue };

    try {
      const token = localStorage.getItem("token");
      const res = await API.put("/driver/me", updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update the driver state
      setDriver(prev => {
        if (childField) {
          return {
            ...prev,
            [parentField]: {
              ...prev[parentField],
              [childField]: editValue
            }
          };
        } else {
          return {
            ...prev,
            [parentField]: editValue
          };
        }
      });

      setEditingField(null);
      setEditValue("");
    } catch (err) {
      console.error("Update error:", err);
      alert(err.response?.data?.message || "Update failed. Please try again.");
    }
  };

  const renderEditableField = (label, fieldName, value, icon, isNested = false) => (
    <motion.div
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
      whileHover={{ y: -3 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center mb-4">
        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 mr-3">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-gray-700">{label}</h3>
      </div>
      
      {editingField === fieldName ? (
        <div className="flex items-center space-x-3">
          <input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 border border-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSaveClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-1"
            >
              <FiSave size={16} />
              <span>Save</span>
            </button>
            <button
              onClick={() => {
                setEditingField(null);
                setEditValue("");
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 flex items-center space-x-1"
            >
              <FiX size={16} />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <p className="text-gray-800 text-lg font-medium">
            {value || <span className="text-gray-400">Not provided</span>}
          </p>
          <button
            onClick={() => isNested 
              ? handleNestedEditClick(fieldName.split('.')[0], fieldName.split('.')[1], value)
              : handleEditClick(fieldName, value)
            }
            className="p-2 rounded-full hover:bg-gray-50 transition-colors duration-200 text-gray-500 hover:text-blue-600"
          >
            <FiEdit size={18} />
          </button>
        </div>
      )}
    </motion.div>
  );

  const renderSelectField = (label, fieldName, value, options, icon) => (
    <motion.div
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
      whileHover={{ y: -3 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center mb-4">
        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 mr-3">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-gray-700">{label}</h3>
      </div>
      
      {editingField === fieldName ? (
        <div className="flex items-center space-x-3">
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 border border-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          >
            {options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <div className="flex space-x-2">
            <button
              onClick={handleSaveClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-1"
            >
              <FiSave size={16} />
              <span>Save</span>
            </button>
            <button
              onClick={() => {
                setEditingField(null);
                setEditValue("");
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 flex items-center space-x-1"
            >
              <FiX size={16} />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <p className="text-gray-800 text-lg font-medium capitalize">
            {value || <span className="text-gray-400">Not provided</span>}
          </p>
          <button
            onClick={() => {
              setEditingField(fieldName);
              setEditValue(value);
            }}
            className="p-2 rounded-full hover:bg-gray-50 transition-colors duration-200 text-gray-500 hover:text-blue-600"
          >
            <FiEdit size={18} />
          </button>
        </div>
      )}
    </motion.div>
  );

  const renderDateField = (label, fieldName, value, icon, isNested = false) => (
    <motion.div
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
      whileHover={{ y: -3 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center mb-4">
        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 mr-3">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-gray-700">{label}</h3>
      </div>
      
      {editingField === fieldName ? (
        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 border border-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSaveClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-1"
            >
              <FiSave size={16} />
              <span>Save</span>
            </button>
            <button
              onClick={() => {
                setEditingField(null);
                setEditValue("");
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 flex items-center space-x-1"
            >
              <FiX size={16} />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <p className="text-gray-800 text-lg font-medium">
            {value ? new Date(value).toLocaleDateString() : <span className="text-gray-400">Not provided</span>}
          </p>
          <button
            onClick={() => isNested 
              ? handleNestedEditClick(fieldName.split('.')[0], fieldName.split('.')[1], value)
              : handleEditClick(fieldName, value)
            }
            className="p-2 rounded-full hover:bg-gray-50 transition-colors duration-200 text-gray-500 hover:text-blue-600"
          >
            <FiEdit size={18} />
          </button>
        </div>
      )}
    </motion.div>
  );

  const renderNumberField = (label, fieldName, value, icon, isNested = false) => (
    <motion.div
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
      whileHover={{ y: -3 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center mb-4">
        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 mr-3">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-gray-700">{label}</h3>
      </div>
      
      {editingField === fieldName ? (
        <div className="flex items-center space-x-3">
          <input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 border border-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSaveClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-1"
            >
              <FiSave size={16} />
              <span>Save</span>
            </button>
            <button
              onClick={() => {
                setEditingField(null);
                setEditValue("");
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 flex items-center space-x-1"
            >
              <FiX size={16} />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <p className="text-gray-800 text-lg font-medium">
            {value || <span className="text-gray-400">Not provided</span>}
          </p>
          <button
            onClick={() => isNested 
              ? handleNestedEditClick(fieldName.split('.')[0], fieldName.split('.')[1], value)
              : handleEditClick(fieldName, value)
            }
            className="p-2 rounded-full hover:bg-gray-50 transition-colors duration-200 text-gray-500 hover:text-blue-600"
          >
            <FiEdit size={18} />
          </button>
        </div>
      )}
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"
        ></motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-gray-600">
        <p className="text-lg">{error}</p>
        <button
          onClick={fetchDriverProfile}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="text-center mt-10 text-gray-600">
        <p className="text-lg">No driver data found</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Driver Profile
          </h1>
          <p className="text-gray-500 mt-2">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl p-8 flex flex-col items-center text-center shadow-sm border border-gray-100"
          >
            <div className="relative mb-6 group">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <img
                src={
                  driver.photo ||
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80"
                }
                alt="driver"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md relative z-10"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {driver.name}
            </h2>
            <p className="text-gray-600 mb-2">{driver.vehicle?.vehicleType} Driver</p>
            
            <div className="flex items-center justify-center mb-4">
              <RiShieldStarLine className="text-yellow-500 mr-1" size={18} />
              <span className="text-gray-600">
                Rating: {driver.rating?.toFixed(1) || "N/A"}
              </span>
            </div>

            <div className="w-full mb-6">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-500">Profile Completion</span>
                <span className="text-sm font-medium text-blue-600">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: '85%' }}
                ></div>
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
              className="w-full px-6 py-3 text-white bg-gradient-to-br from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition duration-300 shadow-sm font-medium flex items-center justify-center space-x-2"
            >
              <FiLogOut size={18} />
              <span>Logout</span>
            </button>
          </motion.div>

          {/* Right Side - Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <FiUser className="mr-2 text-blue-600" size={20} />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderEditableField("Full Name", "name", driver.name, <FaRegUserCircle size={20} />)}
                {renderEditableField("Phone Number", "phone", driver.phone, <FiPhone size={20} />)}
                {renderEditableField("Email Address", "email", driver.email, <FiMail size={20} />)}
                {renderEditableField("UPI ID", "upiId", driver.upiId, <FaMoneyBillWave size={20} />)}
              </div>
            </motion.div>

            {/* Vehicle Information Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <MdDirectionsCar className="mr-2 text-blue-600" size={22} />
                Vehicle Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderSelectField(
                  "Vehicle Type", 
                  "vehicle.vehicleType", 
                  driver.vehicle?.vehicleType, 
                  ["Sedan", "SUV", "Hatchback", "Van", "Truck", "Motorcycle"],
                  <FiTruck size={20} />
                )}
                {renderEditableField(
                  "Vehicle Model", 
                  "vehicle.vehicleModel", 
                  driver.vehicle?.vehicleModel, 
                  <FaCar size={20} />,
                  true
                )}
                {renderEditableField(
                  "Vehicle Number", 
                  "vehicle.vehicleNumber", 
                  driver.vehicle?.vehicleNumber, 
                  <RiNumber1 size={20} />,
                  true
                )}
                {renderNumberField(
                  "Seating Capacity", 
                  "vehicle.vehicleCapacity", 
                  driver.vehicle?.vehicleCapacity, 
                  <FiUser size={20} />,
                  true
                )}
              </div>
            </motion.div>

            {/* Documents Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <FiCreditCard className="mr-2 text-blue-600" size={20} />
                Documents
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderEditableField(
                  "License Number", 
                  "license.number", 
                  driver.license?.number, 
                  <RiShieldStarLine size={20} />,
                  true
                )}
                {renderDateField(
                  "License Expiry", 
                  "license.expiryDate", 
                  driver.license?.expiryDate, 
                  <MdDateRange size={20} />,
                  true
                )}
                {renderEditableField(
                  "Aadhaar Number", 
                  "adharCard.adharNumber", 
                  driver.adharCard?.adharNumber, 
                  <FaAward size={20} />,
                  true
                )}
              </div>
            </motion.div>

            {/* Status Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <FiStar className="mr-2 text-blue-600" size={20} />
                Status & Statistics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderSelectField(
                  "Account Status", 
                  "status", 
                  driver.status, 
                  ["active", "inactive", "suspended"],
                  <RiShieldStarLine size={20} />
                )}
                {renderSelectField(
                  "Availability", 
                  "availability", 
                  driver.availability, 
                  ["available", "busy"],
                  <FiCalendar size={20} />
                )}
                {renderNumberField(
                  "Total Earnings (INR)", 
                  "totalEarnings.total", 
                  driver.totalEarnings?.total, 
                  <FaMoneyBillWave size={20} />,
                  true
                )}
                {renderNumberField(
                  "Rating", 
                  "rating", 
                  driver.rating?.toFixed(1), 
                  <FiStar size={20} />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;