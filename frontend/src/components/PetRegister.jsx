import React, { useState } from "react";
import API from "../api";
import { FiUser, FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";

const PetRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    weight: "",
    gender: "",
    medicalHistory : [{ date: "", description: "", doctor: "", treatment: ""}],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", isError: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", isError: false });

    try {
      const data = {
        ...formData,
        medicalHistory: JSON.stringify(formData.medicalHistory),
      };
      const res = await API.post("/pet/signup", formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setMessage({ text: "Pet registered successfully!", isError: false });
      setFormData({
        name: "",
        species: "",
        breed: "",
        age: "",
        weight: "",
        gender: "",
        medicalHistory: [{ date: "", description: "", doctor: "", treatment: "" }],
      });
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Registration failed. Please try again.",
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const speciesOptions = ["Dog", "Cat", "Bird", "Rabbit", "Hamster", "Other"];
  const genderOptions = ["Male", "Female", "Other"];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto my-10 p-8 bg-white rounded-2xl shadow-sm border border-gray-100"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Register Your Pet</h2>
        <p className="text-gray-500">Complete your pet's information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pet Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FiUser size={16} />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F27781] focus:border-transparent"
                placeholder="e.g. Max"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Species</label>
            <select
              name="species"
              value={formData.species}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F27781] focus:border-transparent"
            >
              <option value="">Select Species</option>
              {speciesOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Breed</label>
            <input
              type="text"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F27781] focus:border-transparent"
              placeholder="e.g. Golden Retriever"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age (years)</label>
              <input
                type="number"
                name="age"
                min="0"
                max="30"
                value={formData.age}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F27781] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                min="0"
                step="0.1"
                value={formData.weight}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F27781] focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F27781] focus:border-transparent"
            >
              <option value="">Select Gender</option>
              {genderOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-lg ${
              message.isError ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-[#F27781] text-white rounded-xl hover:bg-[#d45f6a] transition-all duration-200 shadow-sm flex justify-center items-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registering...
            </>
          ) : (
            "Register Pet"
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default PetRegister;