import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import {
  motion,
  AnimatePresence
} from "framer-motion";
import {
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCalendar,
  FiEdit2,
  FiSave,
  FiX,
  FiFileText,
  FiClock,
  FiHome
} from "react-icons/fi";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const PetClinicProfile = () => {
  const [clinic, setClinic] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const fetchClinicProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        throw new Error("No token found");
      }

      const res = await API.get("/petclinic/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClinic(res.data);
    } catch (err) {
      console.error("Error fetching clinic profile:", err);
      alert("Failed to fetch profile data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClinicProfile();
  }, []);

  const handleEditClick = (field, currentValue) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token"); // Get token once
    console.log("Token before signout:", token); // Log the token you are sending

    try {
        // Correct way to send headers with a POST request (assuming Axios or similar)
        // The second argument is the request body (null if no body needed for logout)
        // The third argument is the config object, where headers go
        const res = await API.post("/petclinic/logout", null, {
             headers: {
                 Authorization: `Bearer ${token}`
             }
         });

        console.log("Backend response:", res.data); // Log the response data

    } catch (error) {
        console.error("Signout failed:", error.response ? error.response.data : error.message);
        // Handle errors, maybe show a message to the user
    } finally {
        // Always remove token and update state regardless of backend success/failure for a client-side "logout"
        localStorage.removeItem("token");
                
        console.log("Token removed from localStorage");
        navigate("/login");
      }

  }

  const handleSaveClick = async () => {
    if (isSaving) return;
    setIsSaving(true);

    let updatedData = {};
    if (editingField.startsWith("address.")) {
      const addressPart = editingField.split(".")[1];
      updatedData = {
        address: {
          ...clinic.address,
          [addressPart]: editValue,
        },
      };
    } else if (editingField.startsWith("clinicAddress.")) {
      const clinicPart = editingField.split(".")[1];
      updatedData = {
        clinicAddress: {
          ...clinic.clinicAddress,
          [clinicPart]: editValue,
        },
      };
    } else {
      updatedData = { [editingField]: editValue };
    }

    try {
      const token = localStorage.getItem("token");
      await API.put("/petclinic/profile", updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update local state
      setClinic(prev => {
        if (editingField.startsWith("address.")) {
          const addressPart = editingField.split(".")[1];
          return {
            ...prev,
            address: {
              ...prev.address,
              [addressPart]: editValue,
            },
          };
        } else if (editingField.startsWith("clinicAddress.")) {
          const clinicPart = editingField.split(".")[1];
          return {
            ...prev,
            clinicAddress: {
              ...prev.clinicAddress,
              [clinicPart]: editValue,
            },
          };
        } else {
          return { ...prev, [editingField]: editValue };
        }
      });
  
      setEditingField(null);
      setEditValue("");
    } catch (err) {
      console.error("Update failed:", err);
      alert(err.response?.data?.message || "Update failed. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const RenderEditableField = ({
    label,
    fieldName,
    value,
    icon,
  }) => (
    <motion.div
      key={fieldName}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-200"
      
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

//   if (isLoading && !clinic) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-gray-50">
//         <motion.div
//           animate={{ rotate: 360 }}
//           transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//           className="rounded-full h-20 w-20 border-t-4 border-b-4 border-[#F27781]"
//         ></motion.div>
//       </div>
//     );
//   }

  if (!clinic) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Profile Data Unavailable
        </h2>
        <p className="text-gray-500 mb-6">
          We couldn't load the clinic profile information. Please check your
          connection or try again.
        </p>
        <button
          onClick={fetchClinicProfile}
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
    specialization,
    experience,
    clinicAddress,
    createdAt,
  } = clinic;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-rose-100 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Pet Clinic Profile
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and update your clinic information.
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
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-4xl font-bold">
                {name.charAt(0)}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">
              {name}
            </h2>
            <p className="text-sm text-gray-500 mb-1 text-center">{email}</p>
            <div className="text-xs text-gray-500 mb-6 text-center">
              <FiCalendar className="inline mr-1" /> Member since{" "}
              {formatDate(createdAt)}
            </div>

            <div className="w-full mb-4">
              <h3 className="text-center text-lg font-semibold text-gray-700 mb-2">Specialization</h3>
              <p className="text-center text-gray-600">{specialization}</p>
            </div>

            <div className="w-full mb-4">
              <h3 className="text-center text-lg font-semibold text-gray-700 mb-2">Experience</h3>
              <p className="text-center text-gray-600">{experience} years</p>
            </div>

            <button
              onClick={() => {
                handleLogout();
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
            key={`profile-${clinic._id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-xl font-semibold text-gray-700 mb-3 px-1">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RenderEditableField
                  label="Clinic Name"
                  fieldName="name"
                  value={name}
                  icon={<FiHome size={18} />}
                />
                <RenderEditableField
                  label="Email"
                  fieldName="email"
                  value={email}
                  icon={<FiMail size={18} />}
                  type="email"
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
                  label="Street"
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
                />
              </div>
            </motion.section>

            {/* Clinic Information Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-gray-700 mb-3 px-1">
                Clinic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RenderEditableField
                  label="Registered Name"
                  fieldName="clinicAddress.registeredName"
                  value={clinicAddress?.registeredName}
                  icon={<FiFileText size={18} />}
                />
                <RenderEditableField
                  label="Opening Hours"
                  fieldName="clinicAddress.openingHours"
                  value={clinicAddress?.openingHours}
                  icon={<FiClock size={18} />}
                />
                <RenderEditableField
                  label="Closing Hours"
                  fieldName="clinicAddress.closingHours"
                  value={clinicAddress?.closingHours}
                  icon={<FiClock size={18} />}
                />
                <RenderEditableField
                  label="Amount"
                  fieldName="clinicAddress.amount"
                  value={clinicAddress?.amount}
                  icon={<FiClock size={18} />}
                />
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetClinicProfile;