import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock, FiArrowLeft } from "react-icons/fi";
import { motion } from "framer-motion";

const EditUserProfile = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    street: "",
    city: "",
    state: "",
    zip: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/user/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setFormData({
          name: res.data.name,
          email: res.data.email,
          phoneNumber: res.data.phoneNumber,
          password: "", // Never pre-fill password fields
          street: res.data.address?.street || "",
          city: res.data.address?.city || "",
          state: res.data.address?.state || "",
          zip: res.data.address?.zip || "",
        });
      } catch (err) {
        setMessage({ text: "Failed to load profile", isError: true });
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", isError: false });

    try {
      await API.put(
        "/user/me",
        {
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password || undefined, // Only send password if changed
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMessage({ text: "Profile updated successfully!", isError: false });
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Update failed. Please try again.",
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fieldGroups = [
    {
      title: "Personal Information",
      icon: <FiUser size={18} />,
      fields: [
        { name: "name", label: "Full Name", icon: <FiUser size={16} /> },
        { name: "email", label: "Email Address", icon: <FiMail size={16} /> },
        { name: "phoneNumber", label: "Phone Number", icon: <FiPhone size={16} /> },
        { name: "password", label: "New Password", type: "password", icon: <FiLock size={16} /> },
      ],
    },
    {
      title: "Address",
      icon: <FiMapPin size={18} />,
      fields: [
        { name: "street", label: "Street Address", icon: <FiMapPin size={16} /> },
        { name: "city", label: "City", icon: <FiMapPin size={16} /> },
        { name: "state", label: "State/Province", icon: <FiMapPin size={16} /> },
        { name: "zip", label: "ZIP/Postal Code", icon: <FiMapPin size={16} /> },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-[#F27781] hover:text-[#d45f6a] mb-6 transition-colors duration-200"
        >
          <FiArrowLeft className="mr-2" />
          Back to Profile
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-gray-500 mt-2">Update your personal information</p>
          </div>

          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            {fieldGroups.map((group, groupIndex) => (
              <motion.div
                key={groupIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: groupIndex * 0.1 }}
                className="p-8"
              >
                <div className="flex items-center mb-6">
                  <div className="p-2 rounded-lg bg-[#F27781] bg-opacity-10 text-[#F27781] mr-3">
                    {group.icon}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">{group.title}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {group.fields.map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {field.label}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          {field.icon}
                        </div>
                        <input
                          type={field.type || "text"}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          placeholder={`Enter ${field.label}`}
                          className={`w-full border border-gray-300 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F27781] focus:border-transparent ${
                            field.type === "password" && "tracking-widest"
                          }`}
                          autoComplete={
                            field.name === "password" ? "new-password" : "off"
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}

            <div className="p-8 bg-gray-50">
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg mb-6 ${
                    message.isError
                      ? "bg-red-50 text-red-600"
                      : "bg-green-50 text-green-600"
                  }`}
                >
                  {message.text}
                </motion.div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-[#F27781] text-white rounded-xl hover:bg-[#d45f6a] transition-all duration-200 shadow-sm flex items-center"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default EditUserProfile;