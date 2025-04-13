import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout"; // asiakkaan / peruskayttaja layout
import AdminLayout from "./components/AdminLayout"; // Adminin sivujen layout
import PopupLayout from "./components/PopupLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Books from "./pages/Books";
import SearchResults from "./pages/SearchResults";
import Profile from "./pages/Profile";
import Classes from "./pages/Classes";
import CustomersStats from "./pages/CustomersStats";
import AdminLogin from "./pages/AdminLogin"; // Admin-kirjautumissivu
import AdminDashboard from "./pages/AdminDashboard";
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { CartProvider } from './context/cartContext';
import ShoppingCart from "./pages/ShoppingCart";
import SingleBook from "./pages/SingleBook";
import BookForm from "./pages/BooksForm";
import AddStore from "./pages/AddStore"

const BASENAME =  ""  // tie kannat -> kommentoi tämä pois
//const BASENAME=/~ksmama // tie.tkannat deploymentissa

export default function App() {

  return (
    <Router basename = {BASENAME}>
      <Routes>
        {/* Käyttäjän reitit wrappaamalla ne `AuthProvider`:iin */}
        <Route
          path="/*"
          element={
            <AuthProvider>
              <CartProvider>
                <Layout />
              </CartProvider>
            </AuthProvider>
          }
        >
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          {/* Search handled by /books route */}
          {/* <Route path="search" element={<SearchResults />} /> */}
          <Route path="classes" element={<Classes />} />
          <Route path="profile" element={<Profile />} />
          <Route path="books" element={<Books />} />
          <Route path="shopping-cart" element={<ShoppingCart />} />
          <Route path="book/:id" element={<SingleBook />} />

        </Route>

        {/* Popup-käytössä ilman navbaria */}
        <Route
          path="/popup/*"
          element={
            <AuthProvider>
              <CartProvider>
                <PopupLayout />
              </CartProvider>
            </AuthProvider>
          }
        >
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
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
          <Route path="customers-stats" element={<CustomersStats />} />
          <Route path="add-book" element={<BookForm />} />
          <Route path="add-store" element={<AddStore />} />
        </Route>
      </Routes>
    </Router>
  );
}
