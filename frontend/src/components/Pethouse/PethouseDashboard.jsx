import { useEffect, useState } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";

const PethouseDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/pethouse/login");
        return;
      }

      const res = await API.get("/booking/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(res.data);

      setBookings(res.data);
    } catch (err) {
      alert("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/pethouse/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Pet House Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p className="text-center text-gray-600">No bookings found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white shadow-md rounded-lg p-4 border-l-4 border-green-500"
            >
              <h2 className="text-xl font-semibold mb-2">
                {booking.name} ({booking.pet?.type})
              </h2>
              <p>
                <strong>Service:</strong> {booking.service?.name}
              </p>
              <p>
                <strong>Pet Type:</strong> {booking.service?.petType}
              </p>
              <p>
                <strong>Price:</strong> ₹{booking.service?.price}
              </p>
              <p>
                <strong>Start Date:</strong> {booking.startDate}
              </p>
              <p>
                <strong>End Date:</strong> {booking.endDate}
              </p>
              <p>
                <strong>Payment Method:</strong> {booking.paymentMethod}
              </p>
              <p>
                <strong>User:</strong> {booking.user?.name} (
                {booking.user?.email})
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PethouseDashboard;
