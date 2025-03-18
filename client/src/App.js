import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SearchResults from "./pages/SearchResults";
import Profile from "./pages/Profile";  

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Kaikilla sivuilla on Layout, jossa Navbar */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="search" element={<SearchResults />} />
          {<Route path="profile" element={<Profile />} />} 
        </Route>
      </Routes>
    </Router>
  );
}
