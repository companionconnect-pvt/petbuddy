import React from 'react';

const CurrentTrip = ({ activeTrip, progress, remainingTime, handleComplete }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow border border-gray-800 col-span-1 sm:col-span-2 lg:col-span-1">
      <h3 className="font-extrabold text-[#222222] mb-4">Current Trip</h3>
      {activeTrip ? (
        <>
          <p className="text-gray-800 font-extrabold">{activeTrip.from} → {activeTrip.to}</p>
          <p className="text-xs text-gray-500">{activeTrip.startTime} – {activeTrip.endTime}</p>

          <div className="w-full bg-gray-300 rounded-full mt-4">
            <div
              className="bg-gray-800 h-2 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <p className="mt-2 text-gray-800 font-extrabold">
            Estimated Time Left: {remainingTime} min
          </p>

          <button
            onClick={() => handleComplete(activeTrip._id || 1)}
            className="mt-4 px-4 py-2 border border-gray-800 font-extrabold text-gray-800 rounded hover:bg-gray-700 hover:text-white transition"
          >
            Mark Completed
          </button>
        </>
      ) : (
        <p className="text-gray-500">No active trip</p>
      )}
    </div>
  );
};

export default CurrentTrip;
