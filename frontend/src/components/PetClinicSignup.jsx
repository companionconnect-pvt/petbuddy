import React, { useState } from "react";
import API from "../api";
import { FiUpload, FiUser, FiMail, FiLock, FiPhone, FiBriefcase, FiCalendar, FiMapPin, FiClock } from "react-icons/fi";

const PetClinicSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    experience: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    openingHours: "",
    closingHours: "",
    registeredName: "",
  });

  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setLicense(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", isError: false });

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      if (license) data.append("license", license);

      const res = await API.post("/petclinic/signup", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage({ text: "Signup successful! Redirecting...", isError: false });
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          password: "",
          phone: "",
          specialization: "",
          experience: "",
          street: "",
          city: "",
          state: "",
          zip: "",
          openingHours: "",
          closingHours: "",
          registeredName: "",
        });
        setLicense(null);
      }, 1500);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Signup failed. Please try again.",
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fieldGroups = [
    {
      title: "Clinic Information",
      icon: <FiBriefcase className="mr-2" />,
      fields: [
        { name: "name", label: "Clinic Name", icon: <FiBriefcase className="text-gray-400" />},
        { name: "registeredName", label: "Registered Person Name", icon: <FiUser className="text-gray-400" /> },
      ]
    },
    {
      title: "Contact Details",
      icon: <FiMail className="mr-2" />,
      fields: [
        { name: "email", label: "Email", type: "email", icon: <FiMail className="text-gray-400" /> },
        { name: "password", label: "Password", type: "password", icon: <FiLock className="text-gray-400" /> },
        { name: "phone", label: "Phone Number", icon: <FiPhone className="text-gray-400" /> },
      ]
    },
    {
      title: "Professional Details",
      icon: <FiBriefcase className="mr-2" />,
      fields: [
        { name: "specialization", label: "Specialization", icon: <FiBriefcase className="text-gray-400" /> },
        { name: "experience", label: "Years of Experience", type: "number", icon: <FiCalendar className="text-gray-400" /> },
      ]
    },
    {
      title: "Address",
      icon: <FiMapPin className="mr-2" />,
      fields: [
        { name: "street", label: "Street Address", icon: <FiMapPin className="text-gray-400" /> },
        { name: "city", label: "City", icon: <FiMapPin className="text-gray-400" /> },
        { name: "state", label: "State", icon: <FiMapPin className="text-gray-400" /> },
        { name: "zip", label: "ZIP Code", icon: <FiMapPin className="text-gray-400" /> },
      ]
    },
    {
      title: "Business Hours",
      icon: <FiClock className="mr-2" />,
      fields: [
        { name: "openingHours", label: "Opening Time", type: "time", icon: <FiClock className="text-gray-400" /> },
        { name: "closingHours", label: "Closing Time", type: "time", icon: <FiClock className="text-gray-400" /> },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#F27781] to-[#F27781] p-6 text-white">
            <h2 className="text-3xl font-bold text-center">Pet Clinic Registration</h2>
            <p className="text-center text-blue-100 mt-2">
              Join our network of trusted pet healthcare providers
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            {fieldGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-4">
                <div className="flex items-center text-lg font-semibold text-gray-700 border-b pb-2">
                  {group.icon}
                  {group.title}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {group.fields.map(({ name, label, type = "text", icon }) => (
                    <div key={name} className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {label}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          {icon}
                        </div>
                        <input
                          type={type}
                          name={name}
                          value={formData[name]}
                          onChange={handleChange}
                          required
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="space-y-4">
              <div className="flex items-center text-lg font-semibold text-gray-700 border-b pb-2">
                <FiUpload className="mr-2" />
                License Verification
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Upload Veterinary License
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleFileChange}
                          required
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      {license 
                        ? `Selected: ${license.name}` 
                        : "JPG, PNG or PDF up to 5MB"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full px-6 py-3 text-[#F27781] border border-[#F27781] rounded-lg hover:bg-[#F27781] hover:text-white transition duration-300 shadow-md hover:shadow-lg font-medium ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Complete Registration"
                )}
              </button>
            </div>

            {message.text && (
              <div
                className={`rounded-md p-4 ${
                  message.isError
                    ? "bg-red-50 border border-red-200"
                    : "bg-green-50 border border-green-200"
                }`}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    {message.isError ? (
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      message.isError ? "text-red-800" : "text-green-800"
                    }`}>
                      {message.text}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default PetClinicSignup;