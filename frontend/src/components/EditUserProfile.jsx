import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const EditUserProfile = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password:"",
    street: "",
    city: "",
    state: "",
    zip: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/user/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        console.log(res.data);
        setFormData({
          name: res.data.name,
          email: res.data.email,
          phoneNumber: res.data.phoneNumber,
          password: res.data.password,
          street: res.data.address.street,
          city: res.data.address.city,
          state: res.data.address.state,
          zip: res.data.address.zip,
        });
      } catch (err) {
        alert("Failed to load profile");
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put("/user/me", {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip
        },
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      alert("Profile updated successfully!");
      navigate("/profile");
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  const fields = [
    { name: "name", label: "Name" },
    { name: "email", label: "Email" },
    { name: "phoneNumber", label: "PhoneNumber" },
    { name: "password", label: "Password", type: "password" },
    { name: "street", label: "Street" },
    { name: "city", label: "City" },
    { name: "state", label: "State" },
    { name: "zip", label: "Zip" },
  ];

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map(({ name , label, type = "text" }) => (
            <div key={name}>
                <label className = "block font-medium mb-1">{label}</label>
                <input
                type = {type}
                name = {name}
                value = {name === "password" ? "" : formData[name]}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>
        ))}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditUserProfile;
