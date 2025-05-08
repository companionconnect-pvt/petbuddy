import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import PetClinicSignup from "./components/PetClinicSignup";
import Profile from "./components/UserProfile";
import PetRegister from "./components/PetRegister";
import EditUserProfile from "./components/EditUserProfile";
import EditPet from "./components/EditPet";
import UserDashboard from "./components/UserDashboard";
import Layout from "./components/Layout";
import Home from "./components/Home";
import VideoCallRoom from "./components/VideoCallRoom";
import VideoCall from "./components/VideoCall";
import Chat from "./components/Chat";
import DriverLogin from "./components/DriverLogin";
import DriverDashboard from "./components/DriverDashboard";
import DriverProfile from "./components/DriverProfile";

import PethouseLogin from "./components/Pethouse/PethouseLogin";
import PethouseSignup from "./components/Pethouse/PethouseSignup";
import PethouseDashboard from "./components/Pethouse/PethouseDashboard";
import PethouseProfile from "./components/Pethouse/PethouseProfile";

import PetClinicDashboard from "./components/PetClinic/PetClinicDashboard";
import PetClinicLogin from "./components/PetClinic/PetClinicLogin";
import PrivateRoute from "./components/PrivateRoute"; // Import PrivateRoute

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes without Navbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/clinic-signup" element={<PetClinicSignup />} />
        <Route path="/driver-login" element={<DriverLogin />} />

        {/* PetHouse Routes */}
        <Route path="pethouse/signup" element={<PethouseSignup />} />
        <Route path="pethouse/login" element={<PethouseLogin />} />

        {/* PetClinic Routes */}
        <Route path="/petclinic/login" element={<PetClinicLogin />} />

        {/* Routes with Navbar inside Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />

          {/* Private Routes */}
          <Route
            path="/profile"
            element={
              <PrivateRoute allowedRoles={["user", "pethouse", "petclinic"]}>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/petRegister"
            element={
              <PrivateRoute allowedRoles={["user"]}>
                <PetRegister />
              </PrivateRoute>
            }
          />
          <Route
            path="/edituserprofile"
            element={
              <PrivateRoute allowedRoles={["user"]}>
                <EditUserProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="/editpet/:petId"
            element={
              <PrivateRoute allowedRoles={["user", "pethouse"]}>
                <EditPet />
              </PrivateRoute>
            }
          />
          <Route
            path="/userDashboard"
            element={
              <PrivateRoute allowedRoles={["user"]}>
                <UserDashboard />
              </PrivateRoute>
            }
          />

          {/* PetHouse Routes */}
          <Route
            path="pethouse/dashboard"
            element={
              <PrivateRoute allowedRoles={["pethouse"]}>
                <PethouseDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="pethouse/profile"
            element={
              <PrivateRoute allowedRoles={["pethouse"]}>
                <PethouseProfile />
              </PrivateRoute>
            }
          />

          {/* PetClinic Routes */}
          <Route
            path="/petclinic/dashboard"
            element={
              <PrivateRoute allowedRoles={["petclinic"]}>
                <PetClinicDashboard />
              </PrivateRoute>
            }
          />

          {/* Video Call and Chat Routes */}
          <Route path="/video-call/:roomId" element={<VideoCall />} />
          <Route path="/chat/:ticketId" element={<Chat />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
