import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
    const handleAddPets = () => {
        try{
            navigate("/petRegister");
        } catch (err) {
            alert(err.response?.data?.message || "Server error")
        }
    };

  const handleEditProfile = () => {
    try{
      navigate("/edituserprofile");
    } catch (err) {
      alert(err.response?.data?.message || "Server error")
    }
  };

  const handleRemovePet = async (petId) => {
    try {
      const removePetPet = await API.delete(`/pet/${petId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      const res = await API.get("/user/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUser(res.data);
    } catch(err) {
      alert(err.response?.data?.message || "Server error")
    }
  }
  const handlePetChange = async(petId) => {
    try {
      navigate(`/editPet/${petId}`)
    } catch(err) {
      alert(err.response?.data?.message || "Server error")
    }
  }
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/user/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUser(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch user data");
      }
    };

    fetchProfile();
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="max-w-xl mx-auto mt-10">
      <button className="bg-slate-100 p-2 border-2 hover:bg-slate-200" onClick={handleEditProfile}> Edit Profile </button>
      <h2 className="text-2xl font-bold mb-4">Welcome, {user.name} </h2> 
      <p>Email: {user.email}</p>
      <p>Phone: {user.phoneNumber}</p>
      <p>Address: {user.address.street}, {user.address.city}, {user.address.state}, {user.address.zip}</p>
      <button className = "bg-slate-100 p-2 border-2 hover:bg-slate-200" onClick={handleAddPets}>Add Pets + </button>  
      <h3 className="text-xl font-semibold mt-6">Pets</h3>
      <ul className="list-disc pl-5">
        {user.pets.map((pet) => (
          <li key={pet._id}>
            {pet.name} - {pet.species} ({pet.breed})
            <button className= "m-2 border-2 p-1" onClick={() => {handlePetChange(pet._id)}}> Edit </button>
            <button className= "m-2 border-2 p-1" onClick={() => {handleRemovePet(pet._id)}}> Remove </button>
          </li>
        ))}
      </ul>

      <h3 className="text-xl font-semibold mt-6">Bookings</h3>
      <ul className="list-disc pl-5">
        {user.bookings.map((booking) => (
          <li key={booking._id}>
            {booking.serviceType} on {new Date(booking.startDate).toLocaleDateString()} - Status: {booking.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserProfile;
