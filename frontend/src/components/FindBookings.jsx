import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiMapPin, FiUser, FiCalendar, FiCheck } from 'react-icons/fi';

const FindBookings = ({ handleAcceptBooking }) => {
  
  const [availableBookings, setAvailableBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token'); 
        const res = await axios.get("http://localhost:5000/api/consultation/confirmed-without-driver", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(res.data);
        setAvailableBookings(res.data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (availableBookings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">No available bookings at the moment</div>
        <div className="text-gray-400">Check back later for new ride requests</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {availableBookings.map((booking) => (
          <motion.div
            key={booking._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 mr-3">
                <FiUser size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                {booking.userId?.name || "Unnamed Booker"}
              </h3>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex items-center text-gray-700">
                <FiMapPin className="text-indigo-600 mr-2" size={16} />
                <div>
                  <span className="font-medium">From:</span> {booking.source?.address?.city || "N/A"}
                </div>
              </div>
              <div className="flex items-center text-gray-700">
                <FiMapPin className="text-indigo-600 mr-2" size={16} />
                <div>
                  <span className="font-medium">To:</span> {booking.destination?.address?.city || "N/A"}
                </div>
              </div>
              <div className="flex items-center text-gray-700">
                <FiClock className="text-indigo-600 mr-2" size={16} />
                <div>
                  <span className="font-medium">Duration:</span> {booking.duration || "N/A"} mins
                </div>
              </div>
              <div className="flex items-center text-gray-700">
                <FiCalendar className="text-indigo-600 mr-2" size={16} />
                <div className="text-sm">
                  {new Date(booking.startDate).toLocaleString()} - {new Date(booking.endDate).toLocaleString()}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleAcceptBooking(booking)}
              className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <FiCheck size={18} />
              <span>Accept Booking</span>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FindBookings;