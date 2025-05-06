import React from 'react';

const CurrentTrip = ({ activeTrip, progress, remainingTime, handleComplete }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow border border-[#F27781] col-span-1 sm:col-span-2 lg:col-span-1">
      <h3 className="font-extrabold text-[#222222] mb-4">Current Trip</h3>
      {activeTrip ? (
        <>
          <p className="text-[#F27781] font-extrabold">{activeTrip.from} → {activeTrip.to}</p>
          <p className="text-xs text-gray-500">{activeTrip.startTime} – {activeTrip.endTime}</p>

          <div className="w-full bg-gray-300 rounded-full mt-4">
            <div
              className="bg-[#F27781] h-2 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <p className="mt-2 text-[#F27781] font-extrabold">
            Estimated Time Left: {remainingTime} min
          </p>

          <button
            onClick={() => handleComplete(activeTrip._id || 1)}
            className="mt-4 px-4 py-2 border border-[#F27781] font-extrabold text-[#F27781] rounded hover:bg-[#F27781] hover:text-white transition"
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
