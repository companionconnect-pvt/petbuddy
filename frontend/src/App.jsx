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
import VideoCallRoom from "./components/VideoCallRoom"; // update path as neededX
import Chat from "./components/Chat";
import DriverLogin from "./components/DriverLogin";
import DriverDashboard from "./components/DriverDashboard";
import DriverProfile from "./components/DriverProfile";

import PethouseLogin from "./components/Pethouse/PethouseLogin";
import PethouseSignup from "./components/Pethouse/PethouseSignup";
import PethouseDashboard from "./components/Pethouse/PethouseDashboard";

import PetClinicDashboard from "./components/PetClinic/PetClinicDashboard";
import PetClinicLogin from "./components/PetClinic/PetClinicLogin";

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes without Navbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/clinic-signup" element={<PetClinicSignup />} />
        <Route path="/driver-login" element={<DriverLogin />} />
        <Route path="/driverDashboard" element={<DriverDashboard />} />
        <Route path="/driver-profile" element={<DriverProfile />} />

        {/* PetHouse Routes */}
        <Route path="/pethouse/signup" element={<PethouseSignup />} />
        <Route path="pethouse/login" element={<PethouseLogin />} />
        <Route path="pethouse/dashboard" element={<PethouseDashboard />} />
        
        {/* PetClinic Routes */}
        <Route path="/petclinic/dashboard" element = {<PetClinicDashboard/>}/> 
        <Route path="/petclinic/login" element = {<PetClinicLogin/>}/>

        {/* Routes with Navbar inside Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />

          <Route path="/petRegister" element={<PetRegister />} />
          <Route path="/edituserprofile" element={<EditUserProfile />} />
          <Route path="/editpet/:petId" element={<EditPet />} />
          <Route path="/userDashboard" element={<UserDashboard />} />
          <Route path="/video-call" element={<VideoCallRoom />} />
          <Route path="/chat/:ticketId" element={<Chat />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
