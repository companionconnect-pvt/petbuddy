import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="bg-[#F27781] w-64 p-4 text-white h-full fixed">
      <div className="text-2xl font-extrabold mb-6">Driver Dashboard</div>
      <ul>
        <li className="mb-4">
          <Link to="/find-bookings" className="text-white hover:text-[#F27781]">
            Find Bookings
          </Link>
        </li>
        {/* Add other sidebar items here */}
      </ul>
    </div>
  );
};

export default Sidebar;
