import React, { useEffect, useState } from "react";
import { FiCalendar } from "react-icons/fi";
import { motion } from "framer-motion";
import API from "../api";
import PetHouseBookingCardModal from "./PethouseBookingCardModal";

const PetHouseBookingCard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPethouseBookings = async () => {
      try {
        const res = await API.get("/booking/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(res.data);
      } catch (err) {
        console.error("Failed to fetch pet house bookings", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPethouseBookings();
  }, []);

  const handleCloseModal = () => setSelectedBooking(null);
  const handleCancelBooking = () => alert("Cancel functionality would go here");
  const handleRescheduleBooking = () =>
    alert("Reschedule functionality would go here");

  if (loading)
    return <p className="text-center text-gray-500">Loading bookings...</p>;

  if (bookings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl p-8 shadow-xs border border-gray-100 text-center"
      >
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FiCalendar className="text-gray-400" size={32} />
        </div>
        <h4 className="text-lg font-medium text-gray-700 mb-2">
          No bookings yet
        </h4>
        <p className="text-gray-500 mb-6">
          You haven’t booked a pet house yet.
        </p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl p-8 shadow-xs border border-gray-100"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Pet House Bookings
            </h3>
            <p className="text-gray-500">Manage your pet’s stay</p>
          </div>
        </div>

        <ul className="space-y-4">
          {bookings.map((booking) => (
            <motion.li
              key={booking._id}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelectedBooking(booking)}
              className="cursor-pointer border border-gray-200 rounded-xl p-5 hover:shadow-xs transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-lg font-semibold text-gray-900 capitalize">
                    {booking.petId?.name || "Unknown Pet"} @{" "}
                    {booking.petHouseId?.name || "Unknown Pethouse"}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiCalendar className="mr-1" size={14} />
                      <span>
                        {new Date(booking.startDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}{" "}
                        -{" "}
                        {new Date(booking.endDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    booking.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : booking.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : booking.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {booking.status}
                </span>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Service Type</p>
                  <p className="font-medium">
                    {Array.isArray(booking.serviceType)
                      ? booking.serviceType.map((s) => s.name).join(", ")
                      : "N/A"}
                  </p>
                </div>
                <span className="text-sm text-blue-600 font-medium">
                  View Details
                </span>
              </div>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {selectedBooking && (
        <PetHouseBookingCardModal
          booking={selectedBooking}
          onClose={handleCloseModal}
          onCancel={handleCancelBooking}
          onReschedule={handleRescheduleBooking}
        />
      )}
    </>
  );
};

export default PetHouseBookingCard;
