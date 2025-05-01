import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import PetClinicSignup from "./components/PetClinicSignup";
import Profile from "./components/UserProfile"; 
import PetRegister from "./components/PetRegister";
import EditUserProfile from "./components/EditUserProfile";
import EditPet from "./components/EditPet";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/clinic-signup" element={<PetClinicSignup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/petRegister" element={<PetRegister/>} />
        <Route path="/edituserprofile" element={<EditUserProfile/>} />
        <Route path="/editpet/:petId" element={<EditPet/>} />
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
