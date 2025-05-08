import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FindBookings = ({ handleAcceptBooking }) => {
  const [availableBookings, setAvailableBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token'); 
        const res = await axios.get("http://localhost:5000/api/consultation/confirmed-without-driver", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setAvailableBookings(res.data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {availableBookings.map((booking) => (
        <div key={booking._id} className="bg-white p-4 shadow border border-[#F27781] rounded-xl">
          <div className="font-bold text-[#F27781] mb-2">{booking.userId?.name || "Unnamed Booker"}</div>
          <div className="text-gray-700 mb-1">
            <strong>From:</strong> {booking.source?.address?.city || "N/A"}
          </div>
          <div className="text-gray-700 mb-1">
            <strong>To:</strong> {booking.destination?.address?.city || "N/A"}
          </div>
          <div className="text-sm text-gray-500">
            {new Date(booking.startDate).toLocaleString()} - {new Date(booking.endDate).toLocaleString()}
          </div>
          <button
            onClick={() => handleAcceptBooking(booking)}
            className="mt-3 px-4 py-2 bg-[#F27781] text-white rounded-md hover:bg-[#d14d5e]"
          >
            Accept Booking
          </button>
        </div>
      ))}
    </div>
  );
};

export default FindBookings;
