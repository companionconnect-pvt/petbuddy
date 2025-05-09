import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CalendarIcon, ClipboardListIcon, ClockIcon, MapIcon, TruckIcon } from '@heroicons/react/outline';
import { UserCircleIcon, BellIcon } from '@heroicons/react/solid';
import MapComponent from './MapComponent';
import FindBookings from './FindBookings';
import activeTrips from './data/activeTripData.js';
import CurrentTrip from './CurrentTrip';
import { jwtDecode } from "jwt-decode";
import API from '../api.js';

const DriverDashboard = () => {
  const [currentTrips, setCurrentTrips] = useState([]);
  const [completedTrips, setCompletedTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [progress, setProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(120);
  const [totalTrips, setTotalTrips] = useState(0);
  const [distanceDriven, setDistanceDriven] = useState(0); // in km
  const [drivingHours, setDrivingHours] = useState(0); // hours
  const navigate = useNavigate();

  function getRandomLat() {
    return (Math.random() * 180 - 90).toFixed(6); // -90 to 90
  }

  function getRandomLng() {
    return (Math.random() * 360 - 180).toFixed(6); // -180 to 180
  }

  const [availableBookings, setAvailableBookings] = useState("");
const handleAcceptBooking = async (booking) => {
  localStorage.setItem('currentBooking', JSON.stringify(booking));

  const token = localStorage.getItem('token');
  const decodedToken = jwtDecode(token);

  const sourceCoordinates = booking.source.latitude != null && booking.source.longitude != null
    ? { lat: booking.source.latitude, lng: booking.source.longitude }
    : { lat: 24.9, lng: 74.8 };

  const destCoordinates = booking.destination.latitude != null && booking.destination.longitude != null
    ? { lat: booking.destination.latitude, lng: booking.destination.longitude }
    : { lat: 24.8, lng: 74.9 };

  setActiveTrip({
    id: booking._id,
    bookerName: booking.bookerName,
    status: 'active',
    sourceCoordinates,
    destCoordinates,
    startTime: booking.startTime,
    endTime: booking.endTime,
    from: booking.source?.address?.city || "N/A",
    to: booking.destination?.address?.city || "N/A",
  });
  console.log("frontend");
  try {
    const response = await API.put(
      `/consultation/${booking._id}/assign-driver`,
      { isDriverAssigned: true },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    console.log("Consultation updated with driver:", response.data);
  } catch (error) {
    console.error("Error assigning driver to consultation:", error);
  }
};


  useEffect(() => {
    const trip = activeTrips.find((trip) => trip.status === 'active');
    if (trip) {
      setActiveTrip({
        ...trip,
        startTime: '10:00 AM',
        endTime: '12:00 PM',
        sourceCoordinates: { latitude: 28.6, longitude: 77.2 },
        destCoordinates: { latitude: 28.5, longitude: 77.4 },
      });
    }

    const interval = setInterval(() => {
      if (activeTrip) {
        setProgress((prev) => (prev < 100 ? prev + 1 : 100));
        setRemainingTime((prev) => (prev > 0 ? prev - 1 : 0));
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [activeTrip]);

  const handleComplete = (id) => {
    if (!activeTrip) return;

    const newTotalTrips = totalTrips + 1;
    const newDistanceDriven = distanceDriven + 10;
    const newDrivingHours = (drivingHours + 1) % 24;

    setCompletedTrips((prev) => [...prev, { ...activeTrip, status: 'completed' }]);
    setCurrentTrips((prev) => prev.filter((t) => t.id !== id));
    setTotalTrips(newTotalTrips);
    setDistanceDriven(newDistanceDriven);
    setDrivingHours(newDrivingHours);

    // Reset active trip
    setActiveTrip(null);
    setProgress(0);
    setRemainingTime(120);
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Sleek dark theme with subtle animations */}
      <aside className="w-20 lg:w-64 bg-gray-900 px-4 py-8 flex flex-col justify-between transition-all duration-300 border-r border-gray-800">
        <div>
          <div className="flex items-center justify-center lg:justify-start mb-10 px-2">
            <h2 className="text-xl lg:text-2xl font-bold text-white hidden lg:block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Driver Dashboard
            </h2>
            <h2 className="text-xl font-bold text-white lg:hidden">DD</h2>
          </div>
          <nav className="space-y-1">
            {[
              ['Dashboard', ClipboardListIcon, '/driver-dashboard'],
              ['Trips', TruckIcon, '/trips'],
              ['Schedule', CalendarIcon, '/schedule'],
              ['Analytics', ClockIcon, '/analytics'],
              ['Support', MapIcon, '/support'],
            ].map(([label, Icon, path]) => (
              <Link
                key={label}
                to={path}
                className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-all duration-200 group"
              >
                <Icon className="h-5 w-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                <span className="font-medium hidden lg:block">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-all duration-200 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-red-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-medium hidden lg:block">Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar - Modern with glass effect */}
        <header className="bg-white/80 backdrop-blur-sm px-6 py-4 flex justify-between items-center border-b border-gray-200/50 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <input
              type="search"
              placeholder="Search anything here..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex items-center space-x-6">
            <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
              <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
              <BellIcon className="h-6 w-6" />
            </button>
            <Link to="/driver-profile" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  DP
                </div>
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white"></span>
              </div>
              <div className="text-right hidden md:block">
                <div className="font-medium text-gray-900">Driver Profile</div>
                <div className="text-xs text-gray-500">Premium Member</div>
              </div>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 space-y-6 overflow-auto bg-gray-50">
          {/* Welcome Header - Glass effect with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
              <p className="opacity-90">
                {activeTrip ? (
                  <>
                    You have an active trip to <span className="font-semibold">{activeTrip.to}</span>. Safe driving!
                  </>
                ) : (
                  'You have no current trips. Check for available bookings below.'
                )}
              </p>
            </div>
          </div>

          {/* Stats - Modern cards with hover effects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                label: 'Total trips', 
                value: totalTrips, 
                meta: '+2.1% this month', 
                icon: ClipboardListIcon, 
                color: 'from-blue-500 to-blue-600',
                trend: 'up'
              },
              { 
                label: 'Distance driven', 
                value: `${distanceDriven} km`, 
                icon: MapIcon, 
                color: 'from-purple-500 to-purple-600',
                trend: 'up'
              },
              { 
                label: 'Driving hours', 
                value: `${drivingHours} hr`, 
                meta: '+1.5 hr this week', 
                icon: ClockIcon, 
                color: 'from-cyan-500 to-cyan-600',
                trend: 'up'
              },
              { 
                label: 'Rating', 
                value: '4.8 ★', 
                meta: 'Based on 68 reviews', 
                icon: TruckIcon, 
                color: 'from-green-500 to-green-600',
                trend: 'steady'
              },
            ].map(({ label, value, meta, icon: Icon, color, trend }) => (
              <div 
                key={label} 
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>
                    {meta && (
                      <div className="flex items-center mt-1">
                        {trend === 'up' && (
                          <svg className="h-4 w-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        )}
                        {trend === 'down' && (
                          <svg className="h-4 w-4 text-red-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        )}
                        <p className="text-xs text-gray-500">{meta}</p>
                      </div>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Conditional Trip Display */}
          {activeTrip ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <MapComponent activeTrip={activeTrip} />
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Live Location</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Live
                  </span>
                </div>
                <div className="rounded-lg overflow-hidden h-96 border border-gray-200">
                  <CurrentTrip
                  activeTrip={activeTrip}
                  progress={progress}
                  remainingTime={remainingTime}
                  handleComplete={handleComplete}
                />
                  
                </div>
                <div className="mt-4 flex justify-between text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <span>Current Location</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span>Destination</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <FindBookings
              availableBookings={availableBookings}
              handleAcceptBooking={handleAcceptBooking}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default DriverDashboard;