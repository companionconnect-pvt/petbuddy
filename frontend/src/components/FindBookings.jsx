import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import geolib from 'geolib';
import { CalendarIcon, ClipboardListIcon, TruckIcon, ClockIcon, MapIcon, UserCircleIcon } from '@heroicons/react/outline';

const FindBookings = ({ activeTrip, handleSignOut }) => {
  const [nearbyBookings, setNearbyBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // You can replace the example data with real data if needed
    const bookings = [
      { id: 1, location: 'Location C', coordinates: { latitude: 28.7042, longitude: 77.1026 } },
      { id: 2, location: 'Location D', coordinates: { latitude: 28.7043, longitude: 77.1027 } },
      { id: 3, location: 'Location E', coordinates: { latitude: 28.7050, longitude: 77.1050 } },
    ];

    const findNearbyBookings = () => {
      setIsLoading(true);
      setTimeout(() => {
        const nearby = bookings.filter((booking) => {
          const distance = geolib.getDistance(
            { latitude: activeTrip.coordinates.latitude, longitude: activeTrip.coordinates.longitude },
            { latitude: booking.coordinates.latitude, longitude: booking.coordinates.longitude }
          );
          return distance <= 5000; // 5km distance filter
        });
        setNearbyBookings(nearby);
        setIsLoading(false);
      }, 1000); // Simulating a delay (for example, network request)
    };

    if (activeTrip) findNearbyBookings();
  }, [activeTrip]);

  return (
    <div className="flex">
      
      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        {/* TOPBAR */}
        
        {/* FIND BOOKINGS SECTION */}
        <main className="bg-white p-4 rounded-xl shadow border border-[#F27781] mt-20">
          <h3 className="font-extrabold text-[#222222] mb-4 flex items-center space-x-2">
            <ClipboardListIcon className="h-6 w-6 text-[#F27781]" />
            <span>Find Bookings to Deliver</span>
          </h3>

          <button
            onClick={() => setNearbyBookings([])} // Clear bookings on button click
            className="px-4 py-2 border border-[#F27781] text-[#F27781] font-extrabold rounded hover:bg-[#F27781] hover:text-white transition mb-4"
          >
            Clear Bookings
          </button>

          <button
            onClick={() => {
              if (activeTrip) {
                setIsLoading(true);
                setNearbyBookings([]); // Optionally clear old bookings before fetching new ones
              }
            }}
            className="px-4 py-2 border border-[#F27781] text-[#F27781] font-extrabold rounded hover:bg-[#F27781] hover:text-white transition mb-4"
          >
            {isLoading ? 'Loading...' : 'Find Nearby Bookings'}
          </button>

          <div className="mt-4">
            {nearbyBookings.length > 0 ? (
              <ul className="space-y-2">
                {nearbyBookings.map((booking) => (
                  <li key={booking.id} className="text-[#F27781] font-extrabold">
                    {booking.location}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">{isLoading ? 'Finding bookings...' : 'No nearby bookings found'}</p>
            )}
          </div>

          <div className="mt-6 border-t border-gray-300 pt-4 text-center text-xs text-gray-500">
            <TruckIcon className="h-4 w-4 inline-block mr-2" />
            <span>Search for deliveries within a 5 km radius</span>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FindBookings;
