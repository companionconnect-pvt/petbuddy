import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import editIcon from "../assets/pencil-svgrepo-com.svg";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiStar } from "react-icons/fi";
import { FaCar } from "react-icons/fa";

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

  // useEffect(() => {
  //   console.log(driver); // Log driver state to see what it holds
  // }, [driver]);
  
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
    setEditValue(value || ""); // Ensure editValue is never undefined
  };

  const handleSaveClick = async () => {
    const updatedData = { [editingField]: editValue };

    try {
      await API.put("/driver/me", updatedData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      // Directly update the state after saving the data
      setDriver({ ...driver, [editingField]: editValue });
      setEditingField(null);
      setEditValue(""); // Clear edit value after saving
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  const renderEditableField = (label, fieldName, value, icon, fieldKey) => (
    <motion.div
      key={fieldKey} // Ensure the key is unique for each field
      className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 hover:shadow-sm transition-all duration-300"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-lg bg-blue-50 text-blue-600 mr-3">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
      </div>
      {editingField === fieldName ? (
        <div className="flex items-center space-x-3">
          <input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 border border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSaveClick}
            className="px-4 py-3 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300"
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
            <img src={editIcon} className="h-5 w-5 opacity-70 hover:opacity-100" alt="edit" />
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

  if (!driver)
    return (
      <div className="text-center mt-10 text-gray-500">
        <p>Failed to load profile data</p>
        <button
          onClick={fetchDriverProfile}
          className="mt-4 px-6 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Driver Profile </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl p-8 flex flex-col items-center text-center shadow-xs border border-gray-100"
        >
          <div className="relative mb-6 group">
            <img
              src={driver.photo || "https://www.w3schools.com/howto/img_avatar.png"}
              alt="driver"
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{driver.name}</h2>
          <p className="text-gray-500 mb-4">Rating: {driver.rating || "N/A"} ⭐</p>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
            className="w-full px-6 py-3 text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition duration-300 shadow-md font-medium"
          >
            Logout
          </button>
        </motion.div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {renderEditableField("Name", "name", driver.driver.name, <FiUser size={20} />, "name")}
            {renderEditableField("Vehicle", "vehicle", driver.driver.vehicle.vehicleModel, <FaCar size={20} />, "vehicle")}
            {renderEditableField("Rating", "rating", driver.rating?.toString(), <FiStar size={20} />, "rating")}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
