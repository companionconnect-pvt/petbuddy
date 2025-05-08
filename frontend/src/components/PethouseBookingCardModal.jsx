import { motion } from "framer-motion";
import { FiCalendar, FiMapPin } from "react-icons/fi";
import { RiShieldUserLine } from "react-icons/ri";

const PetHouseBookingCardModal = ({
  booking,
  onClose,
  onCancel,
  onChat,
  onVideoCall,
  onReschedule,
}) => {
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
        className="bg-white rounded-2xl p-8 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
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

        <div className="flex space-x-3 pt-4 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors duration-200"
          >
            Cancel Appointment
          </button>

          <button
            onClick={onReschedule}
            className={`flex-1 px-4 py-2 text-[#F27781] border border-[#F27781] rounded-lg hover:bg-[#F27781] hover:text-white transition-colors duration-200 ${
              booking.status === "cancelled"
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disabled={booking.status === "cancelled"}
          >
            Reschedule
          </button>

          {["Online", "Video"].includes(booking.mode) && (
            <>
              <button
                onClick={onVideoCall}
                className="flex-1 px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors duration-200"
              >
                Video Call
              </button>

              <button
                onClick={onChat}
                className="flex-1 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors duration-200"
              >
                Chat
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PetHouseBookingCardModal;
