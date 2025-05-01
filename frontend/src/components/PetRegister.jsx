import React, { useState } from "react";
import API from "../api";

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

      setMessage({ text: "Signup successful!", isError: false });

      setFormData({
        name: "",
        species: "",
        breed: "",
        age: "",
        weight: "",
        gender: "",
      });

    } catch (err) {
        console.log(err);
      setMessage({
        text: err.response?.data?.message || "Signup failed.",
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "name", label: "Name" },
    { name: "species", label: "Species" },
    { name: "breed", label: "Breed" },
    { name: "age", label: "Age", type: "number" },
    { name: "weight", label: "Weight", type: "number" },
    { name: "gender", label: "Gender"},
  ];

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-semibold mb-6 text-center">Pet Clinic Signup</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(({ name, label, type = "text" }) => (
          <div key={name}>
            <label className="block font-medium mb-1">{label}</label>
            <input
              type={type}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Submitting..." : "Sign Up"}
        </button>

        {message.text && (
          <p
            className={`text-center mt-2 text-sm ${
              message.isError ? "text-red-600" : "text-green-600"
            }`}
          >
            {message.text}
          </p>
        )}
      </form>
    </div>
  );
};

export default PetRegister;
