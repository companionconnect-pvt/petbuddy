import { useState } from "react";
import API from "../../api";

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    street: "",
    city: "",
    state: "",
    zip: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/pethouse/signup", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          zip: form.zip,
        },
      });

      localStorage.setItem("token", res.data.token);
      alert("Signup successful");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  const fields = [
    { name: "name", label: "Name" },
    { name: "email", label: "Email" },
    { name: "phone", label: "Phone Number" },
    { name: "password", label: "Password", type: "password" },
    { name: "street", label: "Street" },
    { name: "city", label: "City" },
    { name: "state", label: "State" },
    { name: "zip", label: "ZIP Code" },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-200 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-3xl transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
      >
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8">
          Sign Up
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {fields.map(({ name, label, type }) => (
            <div key={name} className="flex flex-col">
              <label
                htmlFor={name}
                className="mb-1 text-sm font-medium text-gray-700"
              >
                {label}
              </label>
              <input
                type={type || "text"}
                id={name}
                name={name}
                value={form[name]}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder={`Enter ${label}`}
                required
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-md transition duration-300"
        >
          Create Account
        </button>
      </form>
    </div>
  );
};

export default Signup;
