import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../utils/socket';
import { CalendarIcon, ClipboardListIcon, ClockIcon, MapIcon, TruckIcon } from '@heroicons/react/outline';
import MapComponent from './MapComponent';
import { Link } from 'react-router-dom';
import { UserCircleIcon } from '@heroicons/react/solid';
import FindBookings from './FindBookings'; // Import the new component

const DriverDashboard = () => {
  const [currentTrips, setCurrentTrips] = useState([]);
  const [completedTrips, setCompletedTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [progress, setProgress] = useState(0);  // Progress of the trip (0 to 100)
  const [remainingTime, setRemainingTime] = useState(120); // Remaining time in minutes for the trip
  const navigate = useNavigate();

  useEffect(() => {
    // Example data for active trip (hardcoded for now)
    setActiveTrip({
      from: 'Location A',
      to: 'Location B',
      startTime: '10:00 AM',
      endTime: '12:00 PM',
      totalDistance: 100, // total distance in km
      distanceCovered: 0, // initially 0 km
      coordinates: { latitude: 28.7041, longitude: 77.1025 }, // Current trip location (Delhi for example)
    });

    // Simulate trip progression (for demo purposes)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) return prev + 1; // Increment progress
        clearInterval(interval);
        return 100;
      });

      setRemainingTime((prev) => {
        if (prev > 0) return prev - 1; // Decrease remaining time
        return 0;
      });
    }, 60000); // Update every 60 seconds

    return () => clearInterval(interval);
  }, []);

  const handleComplete = (id) => {
    setCurrentTrips(ct => ct.filter(t => t._id !== id));
    setCompletedTrips(cp => [...cp, { ...activeTrip, status: 'completed' }]);
    setActiveTrip(null);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside className="w-20 bg-white border-r border-[#F27781] px-4 py-6 flex flex-col justify-between lg:w-1/7">
        <div>
          <h2 className="text-2xl font-extrabold text-[#F27781] mb-8">Driver's Dashboard</h2>
          <nav className="space-y-4 text-[#222222]">
            {[
              ['Dashboard', ClipboardListIcon],
              ['Trips', TruckIcon],
              ['Schedule', CalendarIcon],
              ['Analytics', ClockIcon],
              ['Support', MapIcon],
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
          onClick={handleSignOut}
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
            placeholder="Search anything here…"
            className="flex-1 max-w-md p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#F27781]"
          />
          <div className="flex items-center space-x-4">
            <button className="relative">
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-[#F27781]" />
              🔔
            </button>
            <div className="flex items-center space-x-2">
              <Link to="/driver-profile" className="flex items-center space-x-2">
                <UserCircleIcon className="h-8 w-8 text-[#F27781]" />
                <div className="text-right">
                  <div className="font-extrabold text-[#222222]">Profile</div>
                  <div className="text-xs text-gray-500">Driver</div>
                </div>
              </Link>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6 overflow-auto">
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total trips', value: '84', meta: '+2.1% this month' },
              { label: 'Distance driven', value: '1628 km' },
              { label: 'Driving hours', value: '16 hr 12 m' },
              { label: 'Rating', value: '4.8 ★', meta: 'Based on 68 reviews' },
            ].map(({ label, value, meta }) => (
              <div key={label} className="bg-white p-4 rounded-xl shadow border border-[#F27781]">
                <div className="text-sm font-extrabold text-[#222222]">{label}</div>
                <div className="text-3xl font-extrabold text-[#F27781]">{value}</div>
                {meta && (
                  <div className="text-xs text-gray-500 mt-1">{meta}</div>
                )}
              </div>
            ))}
          </div>

          {/* CURRENT TRIP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Current Trip */}
            <div className="bg-white p-4 rounded-xl shadow border border-[#F27781] col-span-1 sm:col-span-2 lg:col-span-1">
              <h3 className="font-extrabold text-[#222222] mb-4">Current Trip</h3>
              {activeTrip ? (
                <>
                  <p className="text-[#F27781] font-extrabold">{activeTrip.from} → {activeTrip.to}</p>
                  <p className="text-xs text-gray-500">{activeTrip.startTime} – {activeTrip.endTime}</p>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-300 rounded-full mt-4">
                    <div
                      className="bg-[#F27781] h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  {/* Estimated Time */}
                  <p className="mt-2 text-[#F27781] font-extrabold">
                    Estimated Time Left: {remainingTime} min
                  </p>

                  <button
                    onClick={() => handleComplete(activeTrip._id)}
                    className="mt-4 px-4 py-2 border border-[#F27781] font-extrabold text-[#F27781] rounded hover:bg-[#F27781] hover:text-white transition"
                  >
                    Mark Completed
                  </button>
                </>
              ) : (
                <p className="text-gray-500">No active trip</p>
              )}
            </div>

            {/* Find Bookings to Deliver */}
            {/* Use the new component */}
            
            {/* Map */}
            <div className="bg-white p-4 rounded-xl shadow border border-[#F27781]">
              <MapComponent activeTrip={activeTrip} />
            </div>
          </div>
          <FindBookings activeTrip={activeTrip} /> 
        </main>
      </div>
    </div>
  );
};

export default DriverDashboard;
