import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DriverSignupForm = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    vehicleType: '',
    vehicleModel: '',
    vehicleNumber: '',
    vehicleCapacity: '',
    licenseNumber: '',
    licenseExpiry: '',
    adharNumber: '',
    currentLocation: "28.61,77.20",
    upiId:'',
  });

  const [files, setFiles] = useState({
    licensePhoto: null,
    adharPhoto: null,
    vehiclePhoto: null,
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setForm((prevForm) => ({
          ...prevForm,
          currentLocation: `${latitude},${longitude}`,
        }));
      },
      (error) => {
        console.error('Error fetching location:', error);
        alert("Couldn't fetch location. Please allow location access.");
      }
    );
  }, []);
  
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFiles({ ...files, [e.target.name]: e.target.files[0] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    Object.entries(files).forEach(([key, file]) => {
      if (file) formData.append(key, file);
    });

    try {
      const res = await fetch('http://localhost:5000/api/driver/signup', {
        method: 'POST',
        body: formData,
      });
    
      const data = await res.json();
    
      if (res.ok) {
        alert(data.message || 'Driver registered!');
        navigate('/');
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (err) {
      alert('Signup failed');
    }
  }
    
  const formFields = [
    'name', 'email', 'password', 'phone',
    'vehicleType', 'vehicleModel', 'vehicleNumber', 'vehicleCapacity',
    'licenseNumber', 'licenseExpiry', 'adharNumber',
    'upiId', 
    'currentLocation',
  ];
  

  const fileFields = [
    { label: 'License Photo', name: 'licensePhoto' },
    { label: 'Adhar Photo', name: 'adharPhoto' },
    { label: 'Vehicle Photo', name: 'vehiclePhoto' },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-200 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-3xl transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
      >
        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-8">Driver Sign Up</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {formFields.map((field) => (
            <div key={field} className="flex flex-col">
              <label htmlFor={field} className="mb-1 text-sm font-medium text-gray-700 capitalize">
                {field.replace(/([A-Z])/g, ' $1')}
              </label>
              <input
                type={field === 'password' ? 'password' : 'text'}
                id={field}
                name={field}
                value={form[field]}
                onChange={handleChange}
                required
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1')}`}
              />
            </div>
          ))}

          {fileFields.map(({ label, name }) => (
            <div key={name} className="flex flex-col">
              <label htmlFor={name} className="mb-1 text-sm font-medium text-gray-700">
                {label}
              </label>
              <input
                type="file"
                name={name}
                accept="image/*"
                onChange={handleFileChange}
                required
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-md transition duration-300"
        >
          Create Driver Account
        </button>
      </form>
    </div>
  );
};

export default DriverSignupForm;
