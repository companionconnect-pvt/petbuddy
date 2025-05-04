import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import PetClinicSignup from "./components/PetClinicSignup";
import Profile from "./components/UserProfile";
import PetRegister from "./components/PetRegister";
import EditUserProfile from "./components/EditUserProfile";
import EditPet from "./components/EditPet";
import UserDashboard from "./components/UserDashboard";
import Layout from "./components/Layout"; // Layout with Navbar
import Home from "./components/Home"; // Homepage

import VideoCallRoom from "./components/VideoCallRoom"; // update path as needed




function App() {
  return (
    <Router>
      <Routes>
        {/* Routes without Navbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/clinic-signup" element={<PetClinicSignup />} />

        {/* Routes with Navbar inside Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/petRegister" element={<PetRegister />} />
          <Route path="/edituserprofile" element={<EditUserProfile />} />
          <Route path="/editpet/:petId" element={<EditPet />} />
          <Route path="/userDashboard" element={<UserDashboard />} />
          <Route path="/video-call" element={<VideoCallRoom />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
