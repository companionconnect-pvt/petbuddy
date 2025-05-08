import { motion } from "framer-motion";
import { FiCalendar, FiMapPin } from "react-icons/fi";
import { RiShieldUserLine } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import API from "../api";
import toast from "react-hot-toast";

const PetHouseBookingCardModal = ({
  booking,
  onClose,
  onCancel,
  onReschedule,
}) => {
  const navigate = useNavigate();
  const bookingID = booking._id;
  const token = localStorage.getItem("token");

  const handleVideoCall = () => {
    if (booking.status === "cancelled") {
      toast.error("Cannot start video call for cancelled booking");
      return;
    }
    navigate(`/video-call/${bookingID}`);
  };

  const handleChat = () => {
    if (booking.status === "cancelled") {
      toast.error("Cannot chat for cancelled booking");
      return;
    }
    navigate(`/chat/${bookingID}`);
  };

  const cancelAppointment = async () => {
    if (booking.status === "cancelled") {
      toast.error("This booking is already cancelled");
      return;
    }

    if (booking.status === "confirmed") {
      toast.error("Confirmed bookings cannot be cancelled");
      return;
    }

    try {
      const response = await API.delete(`/booking/${bookingID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        toast.success("Booking cancelled successfully");
        onCancel?.();
        onClose();
      }
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            toast.error("Please login to cancel booking");
            break;
          case 403:
            toast.error("You don't have permission to cancel this booking");
            break;
          case 404:
            toast.error("Booking not found");
            break;
          case 400:
            toast.error(error.response.data?.error || "Cannot cancel booking");
            break;
          default:
            toast.error("Failed to cancel booking");
        }
      } else {
        toast.error("Network error. Please try again");
      }
      console.error("Cancel error:", error);
    }
  };

  const rescheduleAppointment = async () => {
    if (booking.status === "cancelled") {
      toast.error("Cannot reschedule a cancelled booking");
      return;
    }

    const now = new Date();
    const startDate = new Date(booking.startDate);
    const daysBeforeStart = (startDate - now) / (1000 * 60 * 60 * 24);

    if (booking.status === "confirmed" && daysBeforeStart < 2) {
      toast.error("Rescheduling allowed only 2+ days before pickup");
      return;
    }

    const newStart = prompt("Enter new start date (YYYY-MM-DD):");
    if (!newStart) {
      toast.error("Start date is required");
      return;
    }

    const newEnd = prompt("Enter new end date (YYYY-MM-DD):");
    if (!newEnd) {
      toast.error("End date is required");
      return;
    }

    if (new Date(newStart) >= new Date(newEnd)) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      const response = await API.put(
        `/booking/${bookingID}/reschedule`,
        { startDate: newStart, endDate: newEnd },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        toast.success("Booking rescheduled successfully");
        onReschedule?.();
        onClose();
      }
    } catch (error) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            toast.error("Please login to reschedule booking");
            break;
          case 403:
            toast.error("You don't have permission to reschedule this booking");
            break;
          case 404:
            toast.error("Booking not found");
            break;
          case 400:
            toast.error(
              error.response.data?.error || "Cannot reschedule booking"
            );
            break;
          default:
            toast.error("Failed to reschedule booking");
        }
      } else {
        toast.error("Network error. Please try again");
      }
      console.error("Reschedule error:", error);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-2xl p-8 w-full max-w-xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {booking.petHouseId?.name || "Pet House"}
              </h3>
              <p className="text-gray-600">
                Booking ID: <span className="text-sm">{booking._id}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4 mb-6">
            {/* Dates */}
            <div className="flex items-start">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 mr-3">
                <FiCalendar size={18} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Booking Dates</p>
                <p className="font-medium">
                  From{" "}
                  {new Date(booking.startDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  to{" "}
                  {new Date(booking.endDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-start">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600 mr-3">
                <RiShieldUserLine size={18} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p
                  className={`font-medium capitalize ${
                    booking.status === "confirmed"
                      ? "text-green-600"
                      : booking.status === "pending"
                      ? "text-yellow-600"
                      : booking.status === "cancelled"
                      ? "text-red-600"
                      : ""
                  }`}
                >
                  {booking.status}
                </p>
              </div>
            </div>

            {/* Location */}
            {booking.petHouseId?.address && (
              <div className="flex items-start">
                <div className="p-2 rounded-lg bg-green-50 text-green-600 mr-3">
                  <FiMapPin size={18} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-700">
                    {booking.petHouseId.address.street},{" "}
                    {booking.petHouseId.address.city},{" "}
                    {booking.petHouseId.address.state}
                  </p>
                </div>
              </div>
            )}

            {/* Service Type */}
            <div className="flex items-start">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 mr-3">
                🐾
              </div>
              <div>
                <p className="text-sm text-gray-500">Service Type</p>
                <p className="font-medium">
                  {Array.isArray(booking.serviceType)
                    ? booking.serviceType.map((s) => s.name).join(", ")
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Payment */}
            {booking.payment && (
              <div className="flex items-start">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 mr-3">
                  💰
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment</p>
                  <p className="font-medium">
                    {booking.payment.amount
                      ? `₹${booking.payment.amount}`
                      : "No fee specified"}
                  </p>
                  <p className="text-gray-600 text-sm capitalize">
                    {booking.payment.method} ({booking.payment.status})
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-3 pt-4 border-t border-gray-100">
          <button
            onClick={cancelAppointment}
            className="flex-1 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200"
          >
            Cancel Appointment
          </button>

          <button
            onClick={rescheduleAppointment}
            className={`flex-1 px-4 py-2 text-[#F27781] border border-[#F27781] rounded-lg hover:bg-[#F27781] hover:text-white transition-colors duration-200 ${
              booking.status === "cancelled"
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={booking.status === "cancelled"}
          >
            Reschedule
          </button>

          <button
            onClick={handleVideoCall}
            className="flex-1 px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors duration-200"
          >
            Video Call
          </button>

          <button
            onClick={handleChat}
            className="flex-1 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-200"
          >
            Chat
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PetHouseBookingCardModal;
