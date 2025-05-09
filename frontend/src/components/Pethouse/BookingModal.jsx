import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiUser, FiCalendar } from "react-icons/fi";
import { RiShieldUserLine } from "react-icons/ri";
import API from "../../api"; // Assuming your API instance is here
import { useNavigate } from "react-router-dom";

/**
 * Modal component to display details of a single booking and handle status updates.
 * API calls for status changes (confirm, cancel, complete) are handled internally.
 *
 * Assumes the booking object structure is similar to the consultation,
 * including nested petId, userId, and payment objects.
 * It also assumes medicalHistory is an array within petId.
 *
 * @param {object} props - Component props.
 * @param {object} props.booking - The booking object to display.
 * @param {function} props.onClose - Function to call when the modal should close.
 * @param {function} [props.onActionSuccess] - Optional function to call in the parent
 * after a status update API call is successful.
 * Useful for triggering a data refetch in the parent.
 * @param {function} [props.onVideoCall] - Optional function to handle video call click.
 * @param {function} [props.onChat] - Optional function to handle chat click.
 */
const BookingModal = ({
  booking,
  onClose,
  onActionSuccess, // Added optional prop for parent notification
}) => {
  console.log("Booking -", booking);
  // State to manage loading state for each action button
  const [loadingAction, setLoadingAction] = useState(null); // 'confirm', 'cancel', 'complete', 'reschedule'
  const navigate = useNavigate();

  // If no booking object is provided, don't render the modal
  if (!booking) {
    return null;
  }

  const token = localStorage.getItem("token"); // Get token here as API calls are internal

  // Helper function to format date and time
  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const dateOptions = {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    };
    const formattedDate = date.toLocaleDateString("en-US", dateOptions);
    const bookingID = booking._id; // Assuming booking ID is available in the booking object

    return timeString ? `${formattedDate} at ${timeString}` : formattedDate;
  };

  // --- Action Handlers with internal API calls ---

  const handleConfirmClick = async () => {
    setLoadingAction("confirm");
    try {
      if (!token) {
        alert("Authentication token not found. Please log in.");
        // Optionally navigate to login or call a parent logout handler
        return;
      }
      // Assuming this is the correct endpoint for confirming a booking
      await API.patch(
        `/pethouse/booking/${booking._id}/accept`,
        {}, // No body needed for a simple status update
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Booking confirmed successfully!");
      if (onActionSuccess) onActionSuccess(); // Notify parent
      onClose(); // Close modal on success
    } catch (err) {
      console.error("Failed to confirm booking:", err);
      alert("Failed to confirm booking. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCancelClick = async () => {
    setLoadingAction("cancel");
    try {
      if (!token) {
        alert("Authentication token not found. Please log in.");
        return;
      }
      // Assuming this endpoint is used for cancelling/rejecting
      await API.patch(
        `/pethouse/booking/${booking._id}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Booking cancelled successfully!");
      if (onActionSuccess) onActionSuccess(); // Notify parent
      onClose(); // Close modal on success
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      alert("Failed to cancel booking. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCompleteClick = async () => {
    setLoadingAction("complete");
    const completionNotes = prompt("Enter completion notes (optional):"); // Simple prompt for input

    try {
      if (!token) {
        alert("Authentication token not found. Please log in.");
        return;
      }
      // Assuming this endpoint marks a booking as completed
      await API.put(
        `/booking/complete/${booking._id}`,
        { notes: completionNotes || "No notes provided." }, // Include notes from prompt
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Booking marked as completed!");
      if (onActionSuccess) onActionSuccess(); // Notify parent
      onClose(); // Close modal on success
    } catch (err) {
      console.error("Failed to complete booking:", err);
      alert("Failed to mark booking as completed. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRescheduleClick = () => {
    // Rescheduling is complex and usually involves selecting new dates/times.
    // This is best handled by navigating to a dedicated rescheduling page or
    // opening a separate, complex form modal.
    // For this example, we'll just use an alert or call a parent handler.
    alert(`Reschedule functionality for booking ${booking._id} would go here.`);
    // If you have a parent handler for rescheduling:
    // if (onReschedule) onReschedule(booking);
    // onClose(); // Decide if modal should close immediately
  };

  const handleVideoCallClick = () => {
    if (booking.status === "cancelled") {
      toast.error("Cannot start video call for cancelled booking");
      return;
    }
    navigate(`/video-call/${booking._id}`);
  };

  const handleChatClick = () => {
    if (booking.status === "cancelled") {
      toast.error("Cannot chat for cancelled booking");
      return;
    }
    navigate(`/chat/${booking._id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose} // Allows closing by clicking outside
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl" // Increased max-width slightly
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
      >
        <div className="p-6 space-y-6">
          {" "}
          {/* Added spacing */}
          {/* Header */}
          <div className="flex justify-between items-start pb-4 border-b border-gray-200">
            {" "}
            {/* Added border */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Booking Details
              </h2>
              <p className="text-gray-600 text-sm">
                {" "}
                {/* Smaller text for date */}
                {formatDateTime(
                  booking.appointmentDate,
                  booking.appointmentTime
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-300" // Added focus style
              disabled={!!loadingAction} // Disable close while action is loading
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>{" "}
              {/* Use SVG for 'X' */}
            </button>
          </div>
          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pet Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 flex items-center text-blue-700">
                {" "}
                {/* Added text color */}
                <FiUser className="mr-2" />
                Pet Information
              </h3>
              <div className="space-y-2 text-gray-700">
                {" "}
                {/* Added text color */}
                <p>
                  <span className="text-gray-600 font-medium">Name:</span>{" "}
                  <span className="font-normal">
                    {booking.petId?.name || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600 font-medium">Species:</span>{" "}
                  <span className="font-normal capitalize">
                    {booking.petId?.species || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600 font-medium">Breed:</span>{" "}
                  <span className="font-normal capitalize">
                    {booking.petId?.breed || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600 font-medium">Age:</span>{" "}
                  <span className="font-normal">
                    {booking.petId?.age || "N/A"} years
                  </span>
                </p>
              </div>
            </div>

            {/* Owner Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 flex items-center text-green-700">
                {" "}
                {/* Added text color */}
                <FiUser className="mr-2" />
                Owner Information
              </h3>
              <div className="space-y-2 text-gray-700">
                {" "}
                {/* Added text color */}
                <p>
                  <span className="text-gray-600 font-medium">Name:</span>{" "}
                  <span className="font-normal">
                    {booking.userId?.name || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600 font-medium">Email:</span>{" "}
                  <span className="font-normal">
                    {booking.userId?.email || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600 font-medium">Phone:</span>{" "}
                  <span className="font-normal">
                    {booking.userId?.phoneNumber || "N/A"}
                  </span>
                </p>
              </div>
            </div>

            {/* Booking Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 flex items-center text-purple-700">
                {" "}
                {/* Added text color */}
                <FiCalendar className="mr-2" />
                Booking Information
              </h3>
              <div className="space-y-2 text-gray-700">
                {" "}
                {/* Added text color */}
                {/* Check if serviceType is an array and has elements before accessing name */}
                {Array.isArray(booking.serviceType) &&
                  booking.serviceType.length > 0 && (
                    <p>
                      <span className="text-gray-600 font-medium">
                        Service Type:
                      </span>{" "}
                      <span className="font-normal capitalize">
                        {booking.serviceType[0]?.name || "N/A"}{" "}
                        {/* Access the name property */}
                      </span>
                    </p>
                  )}
                {/* You might add booking duration if available */}
                {/* {booking.duration && (
                    <p>
                      <span className="text-gray-600 font-medium">Duration:</span>{" "}
                      <span className="font-normal">{booking.duration}</span>
                    </p>
                 )} */}
                <p>
                  <span className="text-gray-600 font-medium">Status:</span>{" "}
                  <span
                    className={`font-normal capitalize ${
                      booking.status === "confirmed"
                        ? "text-green-600"
                        : booking.status === "pending"
                        ? "text-amber-600" // Changed from yellow for better visibility
                        : booking.status === "cancelled" ||
                          booking.status === "rejected" // Added rejected
                        ? "text-red-600"
                        : booking.status === "completed"
                        ? "text-blue-600" // Status for completed
                        : ""
                    }`}
                  >
                    {booking.status || "N/A"}{" "}
                    {/* Display N/A if status is null */}
                  </span>
                </p>
                {/* Display Clinic Location if relevant to booking */}
                {booking.petClinicId && (
                  <p>
                    <span className="text-gray-600 font-medium">Location:</span>{" "}
                    <span className="font-normal">
                      {booking.petClinicId?.name || "N/A"}
                    </span>
                  </p>
                )}
                {/* Add other booking specific fields here */}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 flex items-center text-amber-700">
                {" "}
                {/* Added text color */}
                <RiShieldUserLine className="mr-2" />
                Payment Information
              </h3>
              <div className="space-y-2 text-gray-700">
                {" "}
                {/* Added text color */}
                <p>
                  <span className="text-gray-600 font-medium">Amount:</span>{" "}
                  <span className="font-normal">
                    {booking.payment?.amount
                      ? `₹${booking.payment.amount.toFixed(2)}` // Format currency
                      : "N/A"}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600 font-medium">Method:</span>{" "}
                  <span className="font-normal capitalize">
                    {booking.payment?.method || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600 font-medium">Status:</span>{" "}
                  <span className="font-normal capitalize">
                    {booking.payment?.status || "N/A"}
                  </span>
                </p>
                {/* Add payment transaction ID or other details if available */}
                {/* {booking.payment?.transactionId && (
                    <p>
                      <span className="text-gray-600 font-medium">Transaction ID:</span>{" "}
                      <span className="font-normal">{booking.payment.transactionId}</span>
                    </p>
                 )} */}
              </div>
            </div>
          </div>
          {/* Notes Section */}
          {booking.notes && (
            <div className="mt-6">
              {" "}
              {/* Added margin top */}
              <h3 className="font-semibold text-lg mb-2 text-gray-800">
                Notes
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
                <p className="whitespace-pre-wrap">{booking.notes}</p>
              </div>
            </div>
          )}
          {/* Medical History Section */}
          {booking.petId?.medicalHistory &&
            booking.petId.medicalHistory.length > 0 && (
              <div className="mt-6">
                {" "}
                {/* Added margin top */}
                <h3 className="font-semibold text-lg mb-3 text-gray-800">
                  Medical History
                </h3>
                <div className="space-y-4">
                  {" "}
                  {/* Added space between history items */}
                  {booking.petId.medicalHistory.map((medical, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 p-4 rounded-lg shadow-sm text-gray-700"
                    >
                      {" "}
                      {/* Slightly different styling */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        {" "}
                        {/* Adjusted grid for smaller screens */}
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            Date
                          </p>
                          <p className="text-sm font-medium">
                            {medical.date
                              ? new Date(medical.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            Vet/Clinic
                          </p>{" "}
                          {/* Changed label from Clinic */}
                          <p className="text-sm font-medium capitalize">
                            {medical.doctor ||
                              medical.clinic ||
                              "Not specified"}{" "}
                            {/* Added clinic fallback */}
                          </p>
                        </div>
                      </div>
                      {medical.description && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 font-medium">
                            Description
                          </p>
                          <p className="text-sm font-normal whitespace-pre-wrap">
                            {medical.description}
                          </p>
                        </div>
                      )}
                      {medical.treatment && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 font-medium">
                            Treatment
                          </p>
                          <p className="text-sm font-normal whitespace-pre-wrap">
                            {medical.treatment}
                          </p>
                        </div>
                      )}
                      {medical.notes && (
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            Notes
                          </p>
                          <p className="text-sm font-normal whitespace-pre-wrap">
                            {medical.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200 justify-end">
            {" "}
            {/* Added padding top and justify end */}
            {booking.status === "pending" && (
              <>
                <button
                  onClick={handleConfirmClick}
                  disabled={loadingAction === "confirm"}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingAction === "confirm"
                    ? "Confirming..."
                    : "Confirm Booking"}
                </button>
                <button
                  onClick={handleVideoCallClick}
                  disabled={!!loadingAction} // Disable if any action is loading
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Video Call
                </button>
                <button
                  onClick={handleChatClick}
                  disabled={!!loadingAction} // Disable if any action is loading
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Chat
                </button>
                <button
                  onClick={handleCancelClick}
                  disabled={loadingAction === "cancel"}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingAction === "cancel"
                    ? "Cancelling..."
                    : "Cancel Booking"}
                </button>
              </>
            )}
            {booking.status === "confirmed" && (
              <>
                <button
                  onClick={handleCompleteClick}
                  disabled={loadingAction === "complete"}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingAction === "complete"
                    ? "Completing..."
                    : "Mark as Completed"}
                </button>
                <button
                  onClick={handleVideoCallClick}
                  disabled={!!loadingAction} // Disable if any action is loading
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Video Call
                </button>
                <button
                  onClick={handleChatClick}
                  disabled={!!loadingAction} // Disable if any action is loading
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Chat
                </button>
                <button
                  onClick={handleCancelClick} // Allow cancelling confirmed bookings
                  disabled={loadingAction === "cancel"}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingAction === "cancel"
                    ? "Cancelling..."
                    : "Cancel Booking"}
                </button>
              </>
            )}
            {/* Reschedule button visible for pending or confirmed */}
            {(booking.status === "pending" ||
              booking.status === "confirmed") && (
              <button
                onClick={handleRescheduleClick}
                disabled={!!loadingAction} // Disable if any action is loading
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reschedule
              </button>
            )}
            {/* Add buttons for other statuses if needed (e.g., view summary for completed) */}
            {/* {booking.status === "completed" && (
                <button
                  onClick={() => alert("View Summary functionality")}
                   className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  View Summary
                </button>
             )} */}
            {/* Close Button - always visible unless an action is loading */}
            <button
              onClick={onClose}
              disabled={!!loadingAction} // Disable close while action is loading
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BookingModal;
