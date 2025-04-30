import React, { useState } from "react";
import API from "../api";

const PetClinicSignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    experience: "",
    address: "",
    openingHours: "",
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

      setMessage({ text: "Signup successful!", isError: false });

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        specialization: "",
        experience: "",
        address: "",
        openingHours: "",
        registeredName: "",
      });

      setLicense(null);
    } catch (err) {
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
    { name: "email", label: "Email", type: "email" },
    { name: "password", label: "Password", type: "password" },
    { name: "phone", label: "Phone" },
    { name: "specialization", label: "Specialization" },
    { name: "experience", label: "Experience (Years)", type: "number" },
    { name: "address", label: "Clinic Address" },
    { name: "openingHours", label: "Opening Hours" },
    { name: "registeredName", label: "Registered Name" },
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

        <div>
          <label className="block font-medium mb-1">Upload License</label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

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

export default PetClinicSignup;
