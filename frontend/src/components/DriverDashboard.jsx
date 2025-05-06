import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CalendarIcon, ClipboardListIcon, ClockIcon, MapIcon, TruckIcon } from '@heroicons/react/outline';
import { UserCircleIcon } from '@heroicons/react/solid';
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
      {/* Sidebar */}
      <aside className="w-20 lg:w-1/7 bg-white border-r border-[#F27781] px-4 py-6 flex flex-col justify-between">
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
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
            <Link to="/driver-profile" className="flex items-center space-x-2">
              <UserCircleIcon className="h-8 w-8 text-[#F27781]" />
              <div className="text-right">
                <div className="font-extrabold text-[#222222]">Profile</div>
                <div className="text-xs text-gray-500">Driver</div>
              </div>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 space-y-6 overflow-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total trips', value: totalTrips, meta: '+2.1% this month' },
              { label: 'Distance driven', value: `${distanceDriven} km` },
              { label: 'Driving hours', value: `${drivingHours} hr`, meta: '+1.5 hr this week' },
              { label: 'Rating', value: '4.8 ★', meta: 'Based on 68 reviews' },
            ].map(({ label, value, meta }) => (
              <div key={label} className="bg-white p-4 rounded-xl shadow border border-[#F27781]">
                <div className="text-sm font-extrabold text-[#222222]">{label}</div>
                <div className="text-3xl font-extrabold text-[#F27781]">{value}</div>
                {meta && <div className="text-xs text-gray-500 mt-1">{meta}</div>}
              </div>
            ))}
          </div>

          {/* Conditional Trip Display */}
          {activeTrip ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <CurrentTrip
                activeTrip={activeTrip}
                progress={progress}
                remainingTime={remainingTime}
                handleComplete={handleComplete}
              />
              <div className="bg-white p-4 rounded-xl shadow border border-[#F27781]">
                <MapComponent activeTrip={activeTrip} />
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
