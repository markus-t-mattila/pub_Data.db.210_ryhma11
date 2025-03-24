import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import ReservationBar from "./ReservetionBar.js"; // varauspalkki
import LoginModal from "./LoginModal"; // modaalikomponentti

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <LoginModal /> {/* näytetään modaalina tarvittaessa */}
      <ReservationBar />
      <Navbar />
      <main className="container mx-auto p-6 flex-grow">
        <Outlet />
      </main>
    </div>
  );
}
