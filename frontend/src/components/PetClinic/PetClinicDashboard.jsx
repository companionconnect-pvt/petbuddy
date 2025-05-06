import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiPhone,
  FiMapPin,
  FiFilter,
  FiSearch,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { RiShieldUserLine } from "react-icons/ri";

const PetClinicDashboard = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    mode: "all",
    dateRange: "all",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [completionDetails, setCompletionDetails] = useState({
    description: "",
    treatment: "",
    notes: "",
  });
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/petclinic/login");
        return;
      }

      const res = await API.get("/consultation/clinic", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConsultations(res.data);
    } catch (err) {
      console.error("Failed to fetch consultations", err);
      alert("Failed to load consultations");
    } finally {
      setLoading(false);
    }
  };

  const filteredConsultations = consultations
    .filter((consultation) => {
      const matchesSearch =
        consultation.petId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        consultation.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filters.status === "all" || consultation.status === filters.status;

      const matchesMode =
        filters.mode === "all" || consultation.mode === filters.mode;

      const now = new Date();
      const consultationDate = new Date(consultation.appointmentDate);
      let matchesDate = true;

      if (filters.dateRange === "today") {
        matchesDate =
          consultationDate.toDateString() === now.toDateString();
      } else if (filters.dateRange === "upcoming") {
        matchesDate = consultationDate > now;
      } else if (filters.dateRange === "past") {
        matchesDate = consultationDate < now;
      }

      return matchesSearch && matchesStatus && matchesMode && matchesDate;
    })
    .sort((a, b) => {
      return new Date(a.appointmentDate) - new Date(b.appointmentDate);
    });

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const modeOptions = [
    { value: "all", label: "All Modes" },
    { value: "in-person", label: "In-Person" },
    { value: "video-call", label: "Video Call" },
  ];

  const dateOptions = [
    { value: "all", label: "All Dates" },
    { value: "today", label: "Today" },
    { value: "upcoming", label: "Upcoming" },
    { value: "past", label: "Past" },
  ];

  const petMedicalHistoryUpdate = async (petId, medicalHistoryData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/petclinic/login");
        return;
      }
      const res = await API.put(
        `/pet/medicalHistory/${petId}`,
        medicalHistoryData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data;
    } catch (error) {
      console.error("Failed to update Pet Medical History: ", error);
      throw error; // Re-throw to handle in the calling function
    }
  };

  const updateConsultationStatus = async (consultation, newStatus, details = null) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/petclinic/login");
        return;
      }
  
      const payload = { status: newStatus };
      const id = consultation._id;
      
      if (newStatus === "completed" && details) {
        payload.description = details.description; // Make sure this matches your backend expectation
        payload.treatment = details.treatment;
        payload.notes = details.notes;
      }
  
      // First update the consultation status
      await API.put(
        `/consultation/${id}/status`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      // If completing, also update pet medical history
      if (newStatus === "completed" && details) {
        const medicalHistoryData = {
          date: new Date().toISOString(), // Fixed from .now to .toISOString()
          description: details.description,
          doctor: consultation.petClinicId?.name || "Clinic Doctor", // Added fallback
          treatment: details.treatment,
          notes: details.notes,
        };
  
        await petMedicalHistoryUpdate(
          consultation.petId._id, // Use the consultation parameter directly
          medicalHistoryData
        );
      }
  
      // Refresh consultations and reset state
      fetchConsultations();
      setShowDetail(false);
      setShowCompletionForm(false);
      setCompletionDetails({
        description: "",
        treatment: "",
        notes: "",
      });
      
    } catch (err) {
      console.error("Failed to update status", err);
      alert(`Failed to update consultation status: ${err.response?.data?.message || err.message}`);
    }
  };

  const CompletionFormModal = ({ 
    consultation, 
    onClose, 
    onSubmit, 
  }) => {
    const [details, setDetails] = useState({
      description: "",
      treatment: "",
      notes: "",
    });
    const handleSubmit = () => {
      onSubmit(consultation, "completed", details);
      onClose();
    };
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-2xl w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Complete Consultation
                </h2>
                <p className="text-gray-600">
                  Please enter the consultation details to mark as completed
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={details.description}
                  onChange={(e) =>
                    setDetails({ ...details, description: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment Provided
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={details.treatment}
                  onChange={(e) =>
                    setDetails({ ...details, treatment: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  value={details.notes}
                  onChange={(e) =>
                    setDetails({ ...details, notes: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {onSubmit(consultation, "completed", details);
                  
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={!details.description || !details.treatment}
              >
                Submit & Complete
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const ConsultationDetailCard = ({ consultation, onClose }) => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {consultation.mode === "in-person"
                    ? "In-Person Consultation"
                    : "Video Consultation"}
                </h2>
                <p className="text-gray-600">
                  {new Date(consultation.appointmentDate).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                  {consultation.appointmentTime &&
                    ` at ${consultation.appointmentTime}`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <FiUser className="mr-2 text-blue-500" />
                  Pet Information
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="text-gray-600">Name:</span>{" "}
                    <span className="font-medium">
                      {consultation.petId?.name || "N/A"}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Species:</span>{" "}
                    <span className="font-medium capitalize">
                      {consultation.petId?.species || "N/A"}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Breed:</span>{" "}
                    <span className="font-medium capitalize">
                      {consultation.petId?.breed || "N/A"}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Age:</span>{" "}
                    <span className="font-medium">
                      {consultation.petId?.age || "N/A"} years
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <FiUser className="mr-2 text-green-500" />
                  Owner Information
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="text-gray-600">Name:</span>{" "}
                    <span className="font-medium">
                      {consultation.userId?.name || "N/A"}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Email:</span>{" "}
                    <span className="font-medium">
                      {consultation.userId?.email || "N/A"}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Phone:</span>{" "}
                    <span className="font-medium">
                      {consultation.userId?.phoneNumber || "N/A"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <FiCalendar className="mr-2 text-purple-500" />
                  Consultation Details
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="text-gray-600">Mode:</span>{" "}
                    <span className="font-medium capitalize">
                      {consultation.mode}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Status:</span>{" "}
                    <span
                      className={`font-medium capitalize ${
                        consultation.status === "confirmed"
                          ? "text-green-600"
                          : consultation.status === "pending"
                          ? "text-yellow-600"
                          : consultation.status === "cancelled"
                          ? "text-red-600"
                          : ""
                      }`}
                    >
                      {consultation.status}
                    </span>
                  </p>
                  {consultation.mode === "in-person" && (
                    <p>
                      <span className="text-gray-600">Location:</span>{" "}
                      <span className="font-medium">
                        {consultation.petClinicId?.name || "N/A"}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <RiShieldUserLine className="mr-2 text-amber-500" />
                  Payment Information
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="text-gray-600">Amount:</span>{" "}
                    <span className="font-medium">
                      {consultation.payment?.amount
                        ? `₹${consultation.payment.amount}`
                        : "N/A"}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Method:</span>{" "}
                    <span className="font-medium capitalize">
                      {consultation.payment?.method || "N/A"}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Status:</span>{" "}
                    <span className="font-medium capitalize">
                      {consultation.payment?.status || "N/A"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {consultation.notes && (
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Notes</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{consultation.notes}</p>
                </div>
              </div>
            )}
            {consultation.petId.medicalHistory.map((medical, index) => (
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Medical History</h3>
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="text-sm font-medium">
                          {new Date(medical.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Clinic</p>
                        <p className="text-sm font-medium capitalize">
                          {medical.doctor || 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <div className="mb-2">
                      <p className="text-xs text-gray-500">Description</p>
                      <p className="text-sm font-medium">
                        {medical.description || 'No description'}
                      </p>
                    </div>
                    {medical.treatment && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500">Treatment</p>
                        <p className="text-sm font-medium">{medical.treatment}</p>
                      </div>
                    )}
                    {medical.notes && (
                      <div>
                        <p className="text-xs text-gray-500">Notes</p>
                        <p className="text-sm font-medium">{medical.notes}</p>
                      </div>
                    )}
                  </div>
                  </div>
                ))}

            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              {consultation.status === "pending" && (
                <>
                  <button
                    onClick={() =>
                      updateConsultationStatus(consultation, "confirmed")
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Confirm Appointment
                  </button>
                  <button
                    onClick={() =>
                      updateConsultationStatus(consultation, "cancelled")
                    }
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Cancel Appointment
                  </button>
                </>
              )}
              {consultation.status === "confirmed" && (
                <>
                  <button
                    onClick={() => {
                      setCompletionDetails({
                        description: "",
                        treatment: "",
                        notes: "",
                      });
                      setShowCompletionForm(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Mark as Completed
                  </button>
                  <button
                    onClick={() =>
                      updateConsultationStatus(consultation, "cancelled")
                    }
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Cancel Appointment
                  </button>
                </>
              )}
              
              <button
                onClick={() => {
                  alert("Reschedule functionality would go here");
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reschedule
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Clinic Dashboard</h1>
          <p className="text-gray-600">
            Manage all your clinic consultations in one place
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by pet or owner name..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiFilter className="mr-2" />
              Filters
              {showFilters ? (
                <FiChevronUp className="ml-1" />
              ) : (
                <FiChevronDown className="ml-1" />
              )}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={filters.status}
                      onChange={(e) =>
                        setFilters({ ...filters, status: e.target.value })
                      }
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Consultation Mode
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={filters.mode}
                      onChange={(e) =>
                        setFilters({ ...filters, mode: e.target.value })
                      }
                    >
                      {modeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date Range
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={filters.dateRange}
                      onChange={(e) =>
                        setFilters({ ...filters, dateRange: e.target.value })
                      }
                    >
                      {dateOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredConsultations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiCalendar className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No consultations found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filters.status !== "all" || filters.mode !== "all"
                ? "Try adjusting your search or filters"
                : "You don't have any consultations yet"}
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilters({
                  status: "all",
                  mode: "all",
                  dateRange: "all",
                });
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredConsultations.map((consultation) => (
              <motion.div
                key={consultation._id}
                whileHover={{ y: -2 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                onClick={() => {
                  setSelectedConsultation(consultation);
                  setShowDetail(true);
                }}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {consultation.petId?.name || "Unknown Pet"}
                      </h3>
                      <p className="text-gray-600">
                        Owner: {consultation.userId?.name || "Unknown Owner"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        consultation.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : consultation.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : consultation.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {consultation.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center">
                      <FiCalendar className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {new Date(consultation.appointmentDate).toLocaleDateString()}
                        {consultation.appointmentTime &&
                          ` • ${consultation.appointmentTime}`}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <RiShieldUserLine className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600 capitalize">
                        {consultation.mode}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FiUser className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600 capitalize">
                        {consultation.petId?.species || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-400 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-600">
                        {consultation.payment?.amount
                          ? `₹${consultation.payment.amount}`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showDetail && selectedConsultation && (
          <ConsultationDetailCard
            consultation={selectedConsultation}
            onClose={() => setShowDetail(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCompletionForm && selectedConsultation && (
          <CompletionFormModal
          consultation={selectedConsultation}
          onClose={() => setShowCompletionForm(false)}
          onSubmit={updateConsultationStatus}
        />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PetClinicDashboard;