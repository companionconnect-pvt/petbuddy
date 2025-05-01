import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

const EditPet = () => {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    weight: "",
    gender: "",
    medicalHistory: [],
  });

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const res = await API.get(`/pet/${petId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setFormData(res.data);
      } catch (err) {
        alert("Failed to fetch pet data");
      }
    };

    fetchPet();
  }, [petId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/pet/${petId}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      navigate("/profile");
    } catch (err) {
      alert("Failed to update pet");
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
    <div className="max-w-md mx-auto mt-10 p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">Edit Pet</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        {fields.map(({ name , label, type = "text" }) => (
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
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Save Changes</button>
      </form>
    </div>
  );
};

export default EditPet;
