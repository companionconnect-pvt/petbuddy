import { useState, useEffect } from "react";
import IMG from "../assets/home_top.png";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the token exists in localStorage
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []); // Run this only once when the component mounts

  useEffect(() => {
    console.log("isLoggedIn state:", isLoggedIn); // Logs the updated state
  }, [isLoggedIn]); // This will run every time isLoggedIn changes

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen font-sans text-[#222222]">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-5xl font-extrabold text-[#222222] leading-tight mb-6">
            Welcome to <span className="text-[#F27781]">PetBuddy</span>
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Your one-stop solution for trusted pet care, boarding, and veterinary services.
          </p>
          
          {/* Conditionally Render Buttons */}
          {!isLoggedIn ? (
            <div>
              <button
                onClick={handleLogin}
                className="bg-[#F27781] hover:bg-[#e76872] text-white px-6 py-3 rounded-lg text-lg transition mr-4"
              >
                Login
              </button>
              <button
                onClick={handleSignup}
                className="bg-[#F27781] hover:bg-[#e76872] text-white px-6 py-3 rounded-lg text-lg transition"
              >
                Sign Up
              </button>
            </div>
          ) : (
            <button
              onClick={handleProfile}
              className="bg-[#F27781] hover:bg-[#e76872] text-white px-6 py-3 rounded-lg text-lg transition"
            >
              Your Profile
            </button>
          )}
        </div>
        <div className="flex justify-center">
          <img src={IMG} alt="Pet" className="rounded-xl shadow-2xl w-4/5" />
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-[#222222] mb-8">Our Services</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Pet Boarding", icon: "🐾" },
              { title: "Veterinary Care", icon: "🩺" },
              { title: "Pet Pickup & Drop", icon: "🚕" },
              { title: "Live Video Updates", icon: "📹" },
              { title: "Chat with Caretakers", icon: "💬" },
              { title: "Vet Appointment Booking", icon: "📅" },
            ].map((service, idx) => (
              <div key={idx} className="bg-[#FAF9F6] p-6 rounded-xl shadow hover:shadow-lg transition">
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-[#222222]">{service.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-[#FAF9F6] py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-[#222222] mb-10">Happy Pet Parents</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-md text-left">
                <p className="text-gray-600 italic">"PetBuddy took great care of Bruno while I was away. The video calls made me feel so connected!"</p>
                <div className="mt-4 font-semibold text-[#222222]">— A Happy Customer</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-10 border-t">
        <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-2 md:grid-cols-4 gap-6 text-gray-600">
          <div>
            <h3 className="font-bold text-[#222222] mb-2">PetBuddy</h3>
            <p>Trusted care for your furry friends.</p>
          </div>
          <div>
            <h4 className="font-semibold text-[#222222] mb-2">Company</h4>
            <ul className="space-y-1">
              <li>About</li>
              <li>Careers</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[#222222] mb-2">Services</h4>
            <ul className="space-y-1">
              <li>Boarding</li>
              <li>Vet Care</li>
              <li>Transport</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[#222222] mb-2">Stay Updated</h4>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border p-2 rounded"
            />
            <button className="bg-[#F27781] text-white px-4 py-2 mt-2 rounded">Subscribe</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
