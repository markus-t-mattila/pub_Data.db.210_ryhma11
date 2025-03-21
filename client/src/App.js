import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout"; // asiakkaan / peruskayttaja layout
import AdminLayout from "./components/AdminLayout"; // Adminin sivujen layout
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Books from "./pages/Books";
import SearchResults from "./pages/SearchResults";
import Profile from "./pages/Profile";
import AdminLogin from "./pages/AdminLogin"; // Admin-kirjautumissivu
import AdminDashboard from "./pages/AdminDashboard";
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from "./context/AdminAuthContext";

export default function App() {

  return (
    <Router>
      <Routes>
        {/* Käyttäjän reitit wrappaamalla ne `AuthProvider`:iin */}
        <Route
          path="/*"
          element={
            <AuthProvider>
              <Layout />
            </AuthProvider>
          }
        >
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="profile" element={<Profile />} />
          <Route path="books" element={<Books />} />
        </Route>


        {/* Admin-reitit käyttävät `AdminAuthProvideria` */}
        <Route
          path="/admin/*"
          element={
            <AdminAuthProvider>
              <AdminLayout />
            </AdminAuthProvider>
          }
        >
          <Route path="login" element={<AdminLogin />} />
          <Route path="dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}
