import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import editIcon from "../assets/pencil-svgrepo-com.svg";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiStar, FiLogOut, FiEdit, FiSave } from "react-icons/fi";
import { FaCar, FaRegUserCircle } from "react-icons/fa";
import { RiShieldStarLine } from "react-icons/ri";

const DriverProfile = () => {
  const [driver, setDriver] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDriverProfile();
  }, []);

  useEffect(() => {
    if (driver) {
      console.log("Driver state updated:", driver);
    }
  }, [driver]);

  const fetchDriverProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const res = await API.get("/driver/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Fetched driver profile:", res.data);
      setDriver(res.data);
    } catch (err) {
      console.error("Error fetching driver profile:", err);
      alert("Failed to fetch driver data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (field, value) => {
    setEditingField(field);
    setEditValue(value || "");
  };

  const handleSaveClick = async () => {
    const updatedData = { [editingField]: editValue };

    try {
      await API.put("/driver/me", updatedData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setDriver({ ...driver, [editingField]: editValue });
      setEditingField(null);
      setEditValue("");
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  const renderEditableField = (label, fieldName, value, icon, fieldKey) => (
    <motion.div
      key={fieldKey}
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
          <button
            onClick={handleSaveClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-1"
          >
            <FiSave size={16} />
            <span>Save</span>
          </button>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <p className="text-gray-800 text-lg font-medium">
            {value || <span className="text-gray-400">Not provided</span>}
          </p>
          <button
            onClick={() => handleEditClick(fieldName, value)}
            className="p-2 rounded-full hover:bg-gray-50 transition-colors duration-200 text-gray-500 hover:text-blue-600"
          >
            <FiEdit size={18} />
          </button>
        </div>
      )}
    </motion.div>
  );

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"
        ></motion.div>
      </div>
    );

  if (!driver)
    return (
      <div className="text-center mt-10 text-gray-600">
        <p className="text-lg">Failed to load profile data</p>
        <button
          onClick={fetchDriverProfile}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );

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
            <div className="flex items-center justify-center mb-4">
              <RiShieldStarLine className="text-yellow-500 mr-1" size={18} />
              <span className="text-gray-600">
                Rating: {driver.rating || "N/A"}
              </span>
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

          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {renderEditableField(
                "Full Name",
                "name",
                driver.driver.name,
                <FaRegUserCircle size={20} />,
                "name"
              )}
              {renderEditableField(
                "Vehicle Model",
                "vehicle",
                driver.driver.vehicle.vehicleModel,
                <FaCar size={20} />,
                "vehicle"
              )}
              {renderEditableField(
                "Rating",
                "rating",
                driver.rating?.toString(),
                <FiStar size={20} />,
                "rating"
              )}
              {renderEditableField(
                "License Plate",
                "licensePlate",
                driver.driver.vehicle.licensePlate,
                <RiShieldStarLine size={20} />,
                "licensePlate"
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;