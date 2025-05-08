import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ClipboardListIcon,
  HomeIcon,
  CalendarIcon,
  StarIcon,
  ClockIcon, // For stats
  CheckCircleIcon, // For stats
  XCircleIcon, // For stats
  CollectionIcon, // Example, choose appropriate icons
} from "@heroicons/react/outline"; // Outline icons for sidebar and stats
import {
  UserCircleIcon as UserCircleSolidIcon, // Solid for topbar
  BellIcon as BellSolidIcon, // Solid for topbar
} from "@heroicons/react/solid";
import API from "../../api";

const PethouseDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Placeholder for new bookings today or other dynamic meta data for stats
  const [newBookingsToday, setNewBookingsToday] = useState(5); // Example value
  const [acceptanceRate, setAcceptanceRate] = useState(0); // Example value

  const fetchBookings = async () => {
    setLoading(true);
    try {
      if (!token) {
        navigate("/pethouse/login");
        return;
      }
      const res = await API.get("/booking/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data);

      // Calculate acceptance rate (example)
      const confirmedCount = res.data.filter(
        (b) => b.status === "confirmed"
      ).length;
      const totalNonCancelled = res.data.filter(
        (b) => b.status !== "cancelled"
      ).length;
      if (totalNonCancelled > 0) {
        setAcceptanceRate(
          Math.round((confirmedCount / totalNonCancelled) * 100)
        );
      }
    } catch (err) {
      console.error("Failed to load bookings:", err);
      alert("Failed to load bookings. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // You might want to fetch newBookingsToday from an API or calculate it
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/pethouse/login");
  };

  const handleAccept = async (id) => {
    try {
      await API.patch(
        `/pethouse/booking/${id}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchBookings(); // Re-fetch to update list
    } catch {
      alert("Failed to accept booking");
    }
  };

  const handleReject = async (id) => {
    try {
      await API.patch(
        `/pethouse/booking/${id}/cancel`, // Assuming this endpoint cancels/rejects
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchBookings(); // Re-fetch to update list
    } catch {
      alert("Failed to reject booking");
    }
  };

  const total = bookings.length;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const pending = bookings.filter((b) => b.status === "pending").length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;

  const sidebarNavItems = [
    ["Dashboard", ClipboardListIcon, "/pethouse/dashboard"], // Added path for Link
    ["Bookings", CalendarIcon, "/pethouse/dashboard"],
    ["Services", HomeIcon, "/pethouse/dashboard"],
    ["Reviews", StarIcon, "/pethouse/dashboard"],
  ];

  const statsData = [
    {
      label: "Total Bookings",
      value: total,
      icon: CollectionIcon,
      color: "bg-pink-100 text-[#F27781]",
      meta: `+${newBookingsToday} today`,
    },
    {
      label: "Accepted",
      value: confirmed,
      icon: CheckCircleIcon,
      color: "bg-green-100 text-green-600",
      meta: `${acceptanceRate}% acceptance`,
    },
    {
      label: "Pending",
      value: pending,
      icon: ClockIcon,
      color: "bg-yellow-100 text-yellow-600",
      meta: `${pending} awaiting action`,
    },
    {
      label: "Cancelled",
      value: cancelled,
      icon: XCircleIcon,
      color: "bg-gray-100 text-gray-600",
      meta: "",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Enhanced with gradient and better spacing */}
      <div className="w-64 bg-gradient-to-b from-[#F27781] to-[#D9536F] text-white flex flex-col p-4 space-y-6 shadow-lg">
        <div className="flex items-center space-x-3 px-2 py-3">
          <div className="p-2 bg-white/30 rounded-lg">
            <HomeIcon className="h-8 w-8 text-white" />
          </div>
          <span className="text-2xl font-semibold">PetHouse</span>
        </div>

        <nav className="flex-1 space-y-2">
          {sidebarNavItems.map(([label, Icon, path]) => (
            <Link // Changed to Link for navigation
              key={label}
              to={path}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-white/20 transition-colors group"
            >
              <Icon className="h-6 w-6 text-white/90 group-hover:text-white" />
              <span className="font-medium">{label}</span>
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors group mt-auto"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white/90 group-hover:text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="font-medium">Sign Out</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar - More refined with better shadows */}
        <header className="bg-white px-6 py-4 flex justify-between items-center border-b border-gray-200 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <input
              type="search"
              placeholder="Search bookings, users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F27781] focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div className="flex items-center space-x-6">
            <button className="relative text-gray-500 hover:text-gray-700">
              <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
              <BellSolidIcon className="h-6 w-6" />
            </button>
            <Link
              to="/pethouse/profile"
              className="flex items-center space-x-3 group"
            >
              <div className="relative">
                <UserCircleSolidIcon className="h-9 w-9 text-[#F27781] group-hover:text-[#D9536F] transition-colors" />
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white"></span>
              </div>
              <div className="text-right hidden md:block">
                <div className="font-medium text-gray-900">Pethouse Admin</div>
                <div className="text-xs text-gray-500">Manager Account</div>
              </div>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 space-y-6 overflow-auto bg-gray-50">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-[#F27781] to-[#E5A0AA] rounded-xl shadow-lg p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, Pethouse Admin!
            </h1>
            <p className="opacity-90">
              You have {pending} pending bookings requiring attention. Manage
              your services and keep your customers happy!
            </p>
          </div>

          {/* Stats - Cards with better design */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map(({ label, value, meta, icon: Icon, color }) => (
              <div
                key={label}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">
                      {value}
                    </p>
                    {meta && (
                      <p className="text-xs text-gray-500 mt-1">{meta}</p>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bookings Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Recent Bookings
            </h3>
            {loading ? (
              <p className="text-center text-gray-600 py-8">
                Loading bookings...
              </p>
            ) : bookings.length === 0 ? (
              <p className="text-center text-gray-600 py-8">
                No bookings found.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h2 className="text-lg font-semibold text-[#2C3E50]  truncate w-3/4">
                          {booking.userId?.name || "N/A"}
                        </h2>
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-full
                          ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : booking.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Email:</span>{" "}
                        {booking.userId?.email || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Service:</span>{" "}
                        {booking.serviceType?.[0]?.name ||
                          booking.service?.petType ||
                          "N/A"}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Pet:</span>{" "}
                        {booking.service?.petType || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Amount:</span> ₹
                        {booking.payment?.amount || "N/A"} (
                        {booking.payment?.status || "N/A"})
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Dates:</span>{" "}
                        {new Date(booking.startDate).toLocaleDateString()} -{" "}
                        {new Date(booking.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        <span className="font-medium">Payment Method:</span>{" "}
                        {booking.payment?.method || "N/A"}
                      </p>
                    </div>

                    <div className="mt-auto flex gap-3 pt-3 border-t border-gray-100">
                      {booking.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleAccept(booking._id)}
                            className="flex-1 px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleReject(booking._id)}
                            className="flex-1 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {booking.status === "confirmed" && (
                        <span className="text-sm font-semibold text-green-600 w-full text-center">
                          Booking Confirmed
                        </span>
                      )}
                      {booking.status === "cancelled" && (
                        <span className="text-sm font-semibold text-red-600 w-full text-center">
                          Booking Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PethouseDashboard;
