import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ClipboardListIcon,
  HomeIcon,
  CalendarIcon,
  StarIcon,
  UserCircleIcon,
} from "@heroicons/react/outline";
import API from "../../api";

const PethouseDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchBookings = async () => {
    try {
      if (!token) {
        navigate("/pethouse/login");
        return;
      }
      const res = await API.get("/booking/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data.bookings);
    } catch {
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

  const handleAccept = async (id) => {
    try {
      await API.patch(
        `/pethouse/booking/${id}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchBookings();
    } catch {
      alert("Failed to accept booking");
    }
  };

  const handleReject = async (id) => {
    try {
      await API.patch(
        `/pethouse/booking/${id}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchBookings();
    } catch {
      alert("Failed to reject booking");
    }
  };

  // Stats calculation
  const total = bookings.length;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const pending = bookings.filter((b) => b.status === "pending").length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside className="w-20 bg-white border-r border-[#F27781] px-4 py-6 flex flex-col justify-between lg:w-1/7">
        <div>
          <h2 className="text-2xl font-extrabold text-[#F27781] mb-8">
            PetHouse
          </h2>
          <nav className="space-y-4 text-[#222222]">
            {[
              ["Dashboard", ClipboardListIcon],
              ["Bookings", CalendarIcon],
              ["Services", HomeIcon],
              ["Reviews", StarIcon],
            ].map(([label, Icon]) => (
              <button
                key={label}
                className="flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md hover:bg-[#F27781] hover:text-white transition"
              >
                <Icon className="h-5 w-5" />
                <span className="font-extrabold">{label}</span>
              </button>
            ))}
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="text-[#F27781] font-extrabold py-2 border border-[#F27781] rounded-md hover:bg-[#F27781] hover:text-white transition"
        >
          Sign Out
        </button>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* TOPBAR */}
        <header className="bg-white px-6 py-4 flex justify-between items-center border-b border-gray-200">
          <input
            type="search"
            placeholder="Search bookings or users…"
            className="flex-1 max-w-md p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F27781]"
          />
          <div className="flex items-center space-x-4">
            <button className="relative">
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-[#F27781]" />
              🔔
            </button>
            <Link
              to="/pethouse/profile"
              className="flex items-center space-x-2"
            >
              <UserCircleIcon className="h-8 w-8 text-[#F27781]" />
              <div className="text-right">
                <div className="font-extrabold text-[#222222]">Profile</div>
                <div className="text-xs text-gray-500">Pet House</div>
              </div>
            </Link>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <main className="p-6 space-y-6 overflow-auto">
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Total Bookings", value: total },
              { label: "Accepted", value: confirmed },
              { label: "Pending", value: pending },
              { label: "Cancelled", value: cancelled },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-white p-4 rounded-xl shadow border border-[#F27781]"
              >
                <div className="text-sm font-extrabold text-[#222222]">
                  {label}
                </div>
                <div className="text-3xl font-extrabold text-[#F27781]">
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* BOOKINGS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <p className="col-span-full text-center text-gray-600">
                Loading bookings...
              </p>
            ) : bookings.length === 0 ? (
              <p className="col-span-full text-center text-gray-600">
                No bookings found.
              </p>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white shadow-md rounded-xl p-4 border border-[#F27781]"
                >
                  <h2 className="text-lg font-bold text-[#222222] mb-2">
                    {booking.userId?.name} ({booking.userId?.email})
                  </h2>
                  <p>
                    <strong>Service:</strong> {booking.serviceType[0]?.name}
                  </p>
                  <p>
                    <strong>Pet:</strong> {booking.service?.petType}
                  </p>
                  <p>
                    <strong>Amount:</strong> ₹{booking.payment.amount} (
                    {booking.payment.status})
                  </p>
                  <p>
                    <strong>Duration:</strong> {booking.startDate} →{" "}
                    {booking.endDate}
                  </p>
                  <p>
                    <strong>Method:</strong> {booking.payment.method}
                  </p>

                  <div className="mt-3 flex gap-3">
                    {booking.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAccept(booking._id)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(booking._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {booking.status === "confirmed" && (
                      <span className="text-green-600 font-semibold">
                        Accepted
                      </span>
                    )}
                    {booking.status === "cancelled" && (
                      <span className="text-red-600 font-semibold">
                        Cancelled
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PethouseDashboard;
