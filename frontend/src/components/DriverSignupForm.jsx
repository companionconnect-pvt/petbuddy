import React, { useState } from 'react';

const DriverSignupForm = () => {
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
    currentLocation: "28.61,77.20", // Example: "28.61,77.20"
  });

  const [files, setFiles] = useState({
    licensePhoto: null,
    adharPhoto: null,
    vehiclePhoto: null,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    
    // Log form and files to check their content before appending to FormData
    console.log('Form Data:', form);
    console.log('Files:', files);
  
    Object.entries(form).forEach(([key, value]) => {
      if (value) {  // Ensure only non-empty values are added
        formData.append(key, value);
      }
    });
  
    Object.entries(files).forEach(([key, file]) => {
      if (file) {
        console.log(`Adding file for ${key}:`, file);
        formData.append(key, file);
      }
    });
  
    // Log formData to ensure correct values are being appended
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
  
    try {
      const res = await fetch('http://localhost:5000/api/driver/signup', {
        method: 'POST',
        body: formData,
      });
  
      const data = await res.json();
      console.log('Signup Response:', data);
      alert(data.message || 'Driver registered!');
    } catch (err) {
      console.error('Signup Error:', err);
      alert('Signup failed');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-2xl space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">Driver Signup</h2>

        {[
          'name', 'email', 'password', 'phone',
          'vehicleType', 'vehicleModel', 'vehicleNumber', 'vehicleCapacity',
          'licenseNumber', 'licenseExpiry', 'adharNumber', 'currentLocation'
        ].map((field) => (
          <div key={field}>
            <label className="block mb-1 capitalize text-sm font-medium text-gray-700">
              {field.replace(/([A-Z])/g, ' $1')}
            </label>
            <input
              type={field === 'password' ? 'password' : 'text'}
              name={field}
              value={form[field]}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        {[
          { label: 'License Photo', name: 'licensePhoto' },
          { label: 'Adhar Photo', name: 'adharPhoto' },
          { label: 'Vehicle Photo', name: 'vehiclePhoto' },
        ].map(({ label, name }) => (
          <div key={name}>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              {label}
            </label>
            <input
              type="file"
              name={name}
              accept="image/*"
              onChange={handleFileChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition duration-200"
        >
          Sign Up Driver
        </button>
      </form>
    </div>
  );
};

export default DriverSignupForm;
