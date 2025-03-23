import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import ReservationBar from "./ReservetionBar";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ReservationBar />
      <Navbar />
      <div className="container mx-auto p-6 flex-grow">
        <Outlet />
      </div>
    </div>
  );
}
