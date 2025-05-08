import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CalendarIcon, ClipboardListIcon, ClockIcon, MapIcon, TruckIcon } from '@heroicons/react/outline';
import { UserCircleIcon, BellIcon } from '@heroicons/react/solid';
import MapComponent from './MapComponent';
import FindBookings from './FindBookings';
import activeTrips from './data/activeTripData.js';
import CurrentTrip from './CurrentTrip';

const DriverDashboard = () => {
  const [currentTrips, setCurrentTrips] = useState([]);
  const [completedTrips, setCompletedTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [progress, setProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(120);
  const [totalTrips, setTotalTrips] = useState(84);
  const [distanceDriven, setDistanceDriven] = useState(1628); // in km
  const [drivingHours, setDrivingHours] = useState(16.2); // hours
  const navigate = useNavigate();

  const dummyBookings = [
    {
      id: '1',
      bookerName: 'Saumya Sharma',
      source: { lat: 28.5708, lng: 77.3261 },
      destination: { lat: 28.6315, lng: 77.2167 },
      from: 'Noida Sector 18',
      to: 'Connaught Place, Delhi',
      startTime: '10:00 AM',
      endTime: '11:00 AM',
    },
    {
      id: '2',
      bookerName: 'Ayush Talan',
      source: { lat: 28.5734, lng: 77.0125 },
      destination: { lat: 28.4941, lng: 77.0888 },
      from: 'Noida Sector 63',
      to: 'Hauz Khas, Delhi',
      startTime: '10:00 AM',
      endTime: '11:00 AM',
    },
  ];

  const [availableBookings, setAvailableBookings] = useState(dummyBookings);

  const handleAcceptBooking = (booking) => {
    localStorage.setItem('currentBooking', JSON.stringify(booking));
    setActiveTrip({
      id: booking.id,
      bookerName: booking.bookerName,
      status: 'active',
      sourceCoordinates: booking.source,
      destCoordinates: booking.destination,
      startTime: booking.startTime,
      endTime: booking.endTime,
      from: booking.from,
      to: booking.to,
    });
  };

  useEffect(() => {
    const trip = activeTrips.find((trip) => trip.status === 'active');
    if (trip) {
      setActiveTrip({
        ...trip,
        startTime: '10:00 AM',
        endTime: '12:00 PM',
        sourceCoordinates: { lat: 28.6, lng: 77.2 },
        destCoordinates: { lat: 28.5, lng: 77.4 },
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
      {/* Sidebar - Enhanced with gradient and better spacing */}
      <aside className="w-20 lg:w-64 bg-gradient-to-b from-indigo-900 to-purple-800 px-4 py-8 flex flex-col justify-between transition-all duration-300">
        <div>
          <div className="flex items-center justify-center lg:justify-start mb-10 px-2">
            <h2 className="text-xl lg:text-2xl font-bold text-white hidden lg:block">Driver Dashboard</h2>
            <h2 className="text-xl font-bold text-white lg:hidden">DD</h2>
          </div>
          <nav className="space-y-2">
            {[
              ['Dashboard', ClipboardListIcon],
              ['Trips', TruckIcon],
              ['Schedule', CalendarIcon],
              ['Analytics', ClockIcon],
              ['Support', MapIcon],
            ].map(([label, Icon]) => (
              <button
                key={label}
                className="flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg hover:bg-indigo-700 text-white transition-all duration-200 group"
              >
                <Icon className="h-5 w-5 text-indigo-200 group-hover:text-white" />
                <span className="font-medium hidden lg:block">{label}</span>
              </button>
            ))}
          </nav>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-indigo-700 text-white transition-all duration-200 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-200 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="font-medium hidden lg:block">Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar - More refined with better shadows */}
        <header className="bg-white px-6 py-4 flex justify-between items-center border-b border-gray-200 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <input
              type="search"
              placeholder="Search anything here..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex items-center space-x-6">
            <button className="relative text-gray-500 hover:text-gray-700">
              <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
              <BellIcon className="h-6 w-6" />
            </button>
            <Link to="/driver-profile" className="flex items-center space-x-3 group">
              <div className="relative">
                <UserCircleIcon className="h-9 w-9 text-indigo-600 group-hover:text-indigo-800 transition-colors" />
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
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600  rounded-xl shadow-lg p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
            <p className="opacity-90">You have {activeTrip ? 'an active trip' : 'no current trips'}. {activeTrip ? 'Safe driving!' : 'Check for available bookings below.'}</p>
          </div>

          {/* Stats - Cards with better design */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total trips', value: totalTrips, meta: '+2.1% this month', icon: ClipboardListIcon, color: 'bg-indigo-100 text-indigo-600' },
              { label: 'Distance driven', value: `${distanceDriven} km`, icon: MapIcon, color: 'bg-purple-100 text-purple-600' },
              { label: 'Driving hours', value: `${drivingHours} hr`, meta: '+1.5 hr this week', icon: ClockIcon, color: 'bg-blue-100 text-blue-600' },
              { label: 'Rating', value: '4.8 ★', meta: 'Based on 68 reviews', icon: TruckIcon, color: 'bg-green-100 text-green-600' },
            ].map(({ label, value, meta, icon: Icon, color }) => (
              <div key={label} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{label}</p>
                    <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>
                    {meta && <p className="text-xs text-gray-500 mt-1">{meta}</p>}
                  </div>
                  <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Conditional Trip Display */}
          {activeTrip ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <CurrentTrip
                  activeTrip={activeTrip}
                  progress={progress}
                  remainingTime={remainingTime}
                  handleComplete={handleComplete}
                />
              </div>
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-full">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Location</h3>
                <div className="rounded-lg overflow-hidden h-96">
                  <MapComponent activeTrip={activeTrip} />
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