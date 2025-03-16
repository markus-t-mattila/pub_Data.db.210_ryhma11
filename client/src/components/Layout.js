import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-6">
        <Outlet /> {/* Tämä vaihtuu eri sivujen sisällöksi */}
      </div>
    </div>
  );
}
