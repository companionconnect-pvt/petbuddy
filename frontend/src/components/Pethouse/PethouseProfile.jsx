import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api"; // Assuming this is your configured API client
import { motion } from "framer-motion";
import {
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCalendar,
  FiStar,
  FiList,
  FiGlobe,
  FiLogOut, // For logout button
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

// Component to render display fields consistently
const DisplayInfoField = ({ label, value, icon, isMultiLine = false }) => (
  <motion.div
    className="bg-white rounded-xl p-5 shadow-sm border border-gray-200"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-start mb-1">
      {" "}
      {/* Changed to items-start for multiline */}
      <div className="p-2.5 rounded-lg bg-pink-50 text-[#F27781] mr-3 mt-1">
        {" "}
        {/* Adjusted padding and added mt-1 */}
        {icon}
      </div>
      <div>
        <h3 className="text-md font-semibold text-gray-500">{label}</h3>
        <p
          className={`text-gray-800 text-md ${
            isMultiLine ? "whitespace-pre-line" : "truncate"
          }`}
        >
          {value || <span className="text-gray-400 italic">Not provided</span>}
        </p>
      </div>
    </div>
  </motion.div>
);

const PethouseProfile = () => {
  const [pethouse, setPethouse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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
      alert("Failed to fetch profile data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchPethouseProfile();
  }, [fetchPethouseProfile]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login"); // Or your specific pethouse login route
  };

  if (isLoading && !pethouse) {
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

  const formattedAddress = address
    ? `${address.street || ""}\n${address.city || ""}${
        address.city && address.state ? ", " : ""
      }${address.state || ""}\n${address.zip || ""}`.trim()
    : "Not provided";

  const servicesList =
    services?.length > 0
      ? services.map((s) => s.name).join(", ")
      : "No services listed";

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-rose-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Pet House Profile
          </h1>
          <p className="text-gray-600 mt-1">View your pethouse information.</p>
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
                src={photo || "https://www.w3schools.com/howto/img_avatar.png"} // Default avatar
                alt={name || "Pethouse"}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg"
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">
              {name || "Pethouse Name"}
            </h2>
            <p className="text-sm text-gray-500 mb-1 text-center break-all">
              {email}
            </p>
            <div className="text-xs text-gray-500 mb-6 text-center">
              <FiCalendar className="inline mr-1" /> Member since{" "}
              {formatDate(createdAt)}
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-3 text-red-600 border border-red-500 rounded-lg hover:bg-red-500 hover:text-white transition duration-300 font-medium text-sm shadow-sm"
            >
              <FiLogOut className="mr-2" /> Logout
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
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DisplayInfoField
                  label="Pethouse Name"
                  value={name}
                  icon={<FiUser size={18} />}
                />
                <DisplayInfoField
                  label="Phone Number"
                  value={phone}
                  icon={<FiPhone size={18} />}
                />
              </div>
            </motion.section>

            {/* Full Address Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-xl font-semibold text-gray-700 mb-3 px-1">
                Full Address
              </h3>
              <DisplayInfoField
                label="Location"
                value={formattedAddress}
                icon={<FiMapPin size={18} />}
                isMultiLine={true}
              />
            </motion.section>

            {/* Service Details Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-gray-700 mb-3 px-1">
                Service Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DisplayInfoField
                  label="Services Offered"
                  value={servicesList}
                  icon={<FiList size={18} />}
                />
                <DisplayInfoField
                  label="Overall Rating"
                  value={
                    rating ? `${Number(rating).toFixed(1)} ★` : "Not rated yet"
                  }
                  icon={<FiStar size={18} />}
                />
              </div>
            </motion.section>

            {/* Geographical Location Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-xl font-semibold text-gray-700 mb-3 px-1">
                Geographical Coordinates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DisplayInfoField
                  label="Latitude"
                  value={latitude?.toString()}
                  icon={<FiGlobe size={18} />}
                />
                <DisplayInfoField
                  label="Longitude"
                  value={longitude?.toString()}
                  icon={<FiGlobe size={18} />}
                />
              </div>
              {latitude && longitude && (
                <div className="mt-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <a
                    href={`http://maps.google.com/?q=${latitude},${longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#F27781] rounded-lg hover:bg-[#D9536F] transition-colors w-full justify-center sm:w-auto"
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
