import React from 'react';

const FindBookings = ({ availableBookings, handleAcceptBooking }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {availableBookings.map((booking) => (
        <div key={booking.id} className="bg-white p-4 shadow border border-[#F27781] rounded-xl">
          <div className="font-bold text-[#F27781] mb-2">{booking.bookerName}</div>
          <div className="text-gray-700 mb-1">
            <strong>From:</strong> {booking.from}
          </div>
          <div className="text-gray-700 mb-1">
            <strong>To:</strong> {booking.to}
          </div>
          <div className="text-sm text-gray-500">
            {booking.startTime} - {booking.endTime}
          </div>
          <button
            onClick={() => handleAcceptBooking(booking)}
            className="mt-3 px-4 py-2 bg-[#F27781] text-white rounded-md hover:bg-[#d14d5e]"
          >
            Accept Booking
          </button>
        </div>
      ))}
    </div>
  );
};

export default FindBookings;
