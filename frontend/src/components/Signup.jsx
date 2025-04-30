import { useState } from "react";
import API from "../api";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    upi: ""
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/signup", {
        name: form.name,
        email: form.email,
        phoneNumber: form.phoneNumber,
        password: form.password,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          zip: form.zip
        },
        paymentMethods: [{
          methodType: "UPI",
          details: form.upi
        }]
      });

      localStorage.setItem("token", res.data.token);
      alert("Signup successful");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 space-y-3">
      <h2 className="text-xl font-bold">Signup</h2>
      {["name", "email", "phoneNumber", "password", "street", "city", "state", "zip", "upi"].map((field) => (
        <input
          key={field}
          type={field === "password" ? "password" : "text"}
          name={field}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          value={form[field]}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
      ))}
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Signup</button>
    </form>
  );
};

export default Signup;
