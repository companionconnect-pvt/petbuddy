import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import API from "../api";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if the token exists in localStorage on initial render
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Handle signout
  const handleSignout = async () => {
    console.log('Signout request called');
    const token = localStorage.getItem("token"); // Get token once
    console.log("Token before signout:", token); // Log the token you are sending

    try {
        // Correct way to send headers with a POST request (assuming Axios or similar)
        // The second argument is the request body (null if no body needed for logout)
        // The third argument is the config object, where headers go
        const res = await API.post("/auth/logout", null, {
             headers: {
                 Authorization: `Bearer ${token}`
             }
         });

        console.log("Backend response:", res.data); // Log the response data

    } catch (error) {
        console.error("Signout failed:", error.response ? error.response.data : error.message);
        // Handle errors, maybe show a message to the user
    } finally {
        // Always remove token and update state regardless of backend success/failure for a client-side "logout"
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        console.log("Token removed from localStorage");
    }
};

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-extrabold text-[#F27781]">
          PetBuddy
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-8 text-[#222222] font-medium">
          <Link to="/about" className="hover:text-[#F27781] transition">About</Link>
          <Link to="/userDashboard" className="hover:text-[#F27781] transition">Services</Link>
          <Link to="/contact" className="hover:text-[#F27781] transition">Contact</Link>
        </nav>

        {/* Auth/Profile/Signout Buttons */}
        <div className="hidden md:flex space-x-4">
          {isLoggedIn ? (
            <>
              <Link
                to="/profile"
                className="text-[#F27781] font-semibold border border-[#F27781] px-4 py-2 rounded-lg hover:bg-[#F27781] hover:text-white transition"
              >
                Profile
              </Link>
              <button
                onClick={handleSignout}
                className="text-[#F27781] font-semibold border border-[#F27781] px-4 py-2 rounded-lg hover:bg-[#F27781] hover:text-white transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[#F27781] font-semibold border border-[#F27781] px-4 py-2 rounded-lg hover:bg-[#F27781] hover:text-white transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-[#F27781] text-white px-4 py-2 rounded-lg hover:bg-[#e76872] transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-[#F27781]"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white px-6 pb-4 space-y-3 text-[#222222]">
          <Link to="/about" onClick={() => setMenuOpen(false)} className="block hover:text-[#F27781]">About</Link>
          <Link to="/userDashboard" onClick={() => setMenuOpen(false)} className="block hover:text-[#F27781]">Services</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)} className="block hover:text-[#F27781]">Contact</Link>
          <hr />
          {isLoggedIn ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="block text-[#F27781] font-semibold">Profile</Link>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleSignout();
                }}
                className="block text-[#F27781] font-semibold"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block text-[#F27781] font-semibold">Login</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)} className="block bg-[#F27781] text-white text-center py-2 rounded-lg">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
