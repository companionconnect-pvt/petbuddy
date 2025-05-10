import { useState, useEffect } from "react";
import IMG from "../assets/home_top.png";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, []);

  const handleLogin = () => navigate("/login");
  const handleSignup = () => navigate("/userDashboard");
  const handleProfile = () => navigate("/profile");
  const handlePetClinicLogin = () => navigate("/petclinic/login");
  const handlePetHouseLogin = () => navigate("/pethouse/login");
  const handleDriverLogin = () => navigate("/driver-login");

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-gradient-to-b from-[#FAF9F6] to-white min-h-screen font-sans text-[#222222] overflow-x-hidden">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-28 md:py-36 grid md:grid-cols-2 gap-10 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#222222] leading-tight mb-6">
            Premium Care for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F27781] to-[#8B5CF6]">
              Your Beloved Pets
            </span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-lg">
            Experience unparalleled pet care with our luxury boarding, 
            veterinary services, and personalized attention for your furry family members.
          </p>

          {!isLoggedIn ? (
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignup}
                className="relative overflow-hidden group bg-gradient-to-r from-[#F27781] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#F27781] text-white px-8 py-4 rounded-xl text-lg font-medium transition-all duration-300 shadow-lg"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Book Services <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                </span>
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleProfile}
              className="bg-gradient-to-r from-[#F27781] to-[#8B5CF6] text-white px-8 py-4 rounded-xl text-lg font-medium transition-all duration-300 shadow-lg"
            >
              Your Dashboard
            </motion.button>
          )}

          <div className="mt-10 flex flex-wrap gap-4">
            {["24/7 Care", "Certified Vets", "GPS Tracking"].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 + 0.8 }}
                className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-100"
              >
                <FiCheckCircle className="text-[#F27781]" />
                <span className="text-sm font-medium">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <img 
            src={IMG} 
            alt="Happy pet" 
            className="rounded-2xl shadow-2xl w-full max-w-md mx-auto border-8 border-white transform rotate-1 hover:rotate-0 transition-transform duration-300" 
          />
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100"
          >
            <div className="text-2xl font-bold text-[#F27781]">500+</div>
            <div className="text-sm text-gray-500">Happy Pets</div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100"
          >
            <div className="text-2xl font-bold text-[#8B5CF6]">4.9★</div>
            <div className="text-sm text-gray-500">Customer Rating</div>
          </motion.div>
        </motion.div>
      </div>

      {/* Services Section */}
      <div className="py-24 bg-gradient-to-b from-white to-[#FAF9F6]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#222222] mb-4">Luxury Pet Services</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              We provide exceptional care with premium amenities for your pets
            </p>
          </motion.div>

          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {[
              { 
                title: "Luxury Boarding", 
                icon: "🏰",
                desc: "Private suites with webcam access and daily playtime"
              },
              { 
                title: "Veterinary Spa", 
                icon: "🧖",
                desc: "Therapeutic baths, grooming, and wellness treatments"
              },
              { 
                title: "VIP Transport", 
                icon: "🚙",
                desc: "Climate-controlled vehicles with safety restraints"
              },
              { 
                title: "Live Updates", 
                icon: "📱",
                desc: "Real-time photos and video calls with your pet"
              },
              { 
                title: "Dedicated Care", 
                icon: "💖",
                desc: "24/7 personalized attention from certified staff"
              },
              { 
                title: "Health Plans", 
                icon: "🏥",
                desc: "Comprehensive wellness programs and insurance"
              },
            ].map((service, idx) => (
              <motion.div
                key={idx}
                variants={item}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-50"
              >
                <div className="text-5xl mb-6">{service.icon}</div>
                <h3 className="text-xl font-bold text-[#222222] mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-24 bg-[#FAF9F6] relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gradient-to-r from-[#F27781]/10 to-[#8B5CF6]/10 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-gradient-to-r from-[#8B5CF6]/10 to-[#F27781]/10 blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-[#222222] mb-4">Our Pet Parents Say</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Don't just take our word for it - hear from our happy customers
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "The luxury suite was worth every penny! My dog didn't even want to come home.",
                name: "Sarah J.",
                role: "Dog Mom"
              },
              {
                quote: "The vet spa treatments transformed my cat's coat. She's never looked better!",
                name: "Michael T.",
                role: "Cat Dad"
              },
              {
                quote: "The daily video updates gave me peace of mind during my two-week vacation.",
                name: "Emma R.",
                role: "Pet Parent"
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
              >
                <div className="text-4xl text-[#F27781] mb-4">"</div>
                <p className="text-gray-600 italic mb-6">{testimonial.quote}</p>
                <div>
                  <div className="font-bold text-[#222222]">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Provider Login Section */}
      {!isLoggedIn && (
        <div className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-[#222222] mb-4">Are You a Pet Service Provider?</h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Join our network of premium pet care providers
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-[#F27781]/10 to-[#8B5CF6]/10 p-8 rounded-2xl border border-gray-200 hover:border-[#F27781] transition-all"
              >
                <div className="text-5xl mb-6">🏥</div>
                <h3 className="text-2xl font-bold text-[#222222] mb-4">Pet Clinic</h3>
                <p className="text-gray-600 mb-6">
                  Offer your veterinary services to pet owners looking for premium care.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handlePetClinicLogin}
                  className="w-full bg-gradient-to-r from-[#F27781] to-[#8B5CF6] text-white px-6 py-3 rounded-lg font-medium"
                >
                  Login as Clinic
                </motion.button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-[#8B5CF6]/10 to-[#F27781]/10 p-8 rounded-2xl border border-gray-200 hover:border-[#8B5CF6] transition-all"
              >
                <div className="text-5xl mb-6">🏠</div>
                <h3 className="text-2xl font-bold text-[#222222] mb-4">Pet House</h3>
                <p className="text-gray-600 mb-6">
                  Provide luxury boarding and daycare services for pets in your care.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handlePetHouseLogin}
                  className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#F27781] text-white px-6 py-3 rounded-lg font-medium"
                >
                  Login as Pet House
                </motion.button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-[#F27781]/10 to-[#8B5CF6]/10 p-8 rounded-2xl border border-gray-200 hover:border-[#F27781] transition-all"
              >
                <div className="text-5xl mb-6">🚗</div>
                <h3 className="text-2xl font-bold text-[#222222] mb-4">Driver</h3>
                <p className="text-gray-600 mb-6">
                  Join as a trained driver to help transport pets safely and reliably.
                </p>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDriverLogin}
                  className="w-full bg-gradient-to-r from-[#F27781] to-[#8B5CF6] text-white px-6 py-3 rounded-lg font-medium"
                >
                  Login as Driver
                </motion.button>
              </motion.div>

            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-[#F27781] to-[#8B5CF6] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready for Premium Pet Care?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join hundreds of happy pets enjoying our luxury services today
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isLoggedIn ? handleProfile : handleSignup}
              className="bg-white text-[#8B5CF6] px-8 py-4 rounded-xl text-lg font-bold shadow-lg transition-all"
            >
              {isLoggedIn ? "Go to Dashboard" : "Get Started"}
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-2 md:grid-cols-4 gap-10">
          <div>
            <h3 className="font-bold text-2xl text-[#222222] mb-4">PetBuddy</h3>
            <p className="text-gray-500 mb-4">Redefining pet care with luxury and love</p>
            <div className="flex gap-4">
              {["Twitter", "Instagram", "Facebook"].map((social, i) => (
                <a key={i} href="#" className="text-gray-400 hover:text-[#F27781] transition">
                  {social}
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg text-[#222222] mb-4">Company</h4>
            <ul className="space-y-3">
              {["About Us", "Careers", "Press", "Blog"].map((item, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-500 hover:text-[#F27781] transition">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg text-[#222222] mb-4">Services</h4>
            <ul className="space-y-3">
              {["Boarding", "Grooming", "Training", "Veterinary"].map((item, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-500 hover:text-[#F27781] transition">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg text-[#222222] mb-4">Stay Updated</h4>
            <p className="text-gray-500 mb-4">Subscribe to our newsletter</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 border border-gray-200 px-4 py-3 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#F27781]"
              />
              <button className="bg-[#F27781] text-white px-4 py-3 rounded-r-lg hover:bg-[#e76872] transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-6 mt-16 pt-8 border-t border-gray-100 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} PetBuddy. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;