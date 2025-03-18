import React, { useState, useEffect, useContext } from "react";
import { getMyInfo } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState("");
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      // Jos ei ole kirjautunut, ohjaa kirjautumissivulle (tai minne haluat)
      navigate("/login");
      return;
    }

    // Haetaan oma tieto
    fetchUserData();
  }, [isLoggedIn, navigate]);

  const fetchUserData = async () => {
    try {
      const response = await getMyInfo();
      setUserInfo(response.data); 
    } catch (err) {
      console.error("Virhe haettaessa omaa tietoa:", err);
      setError("Tietojen haku epäonnistui");
    }
  };

  if (!isLoggedIn) {
    // Tai voit vain palauttaa null. Tai 401-viesti. 
    return null;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!userInfo) {
    return <p>Ladataan...</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl">Oma sivu</h2>
      <p>Nimi: {userInfo.name}</p>
      <p>Sähköposti: {userInfo.email}</p>
      <p>Puhelin: {userInfo.phone}</p>
      <p>Osoite: {userInfo.street_address}, {userInfo.postcode} {userInfo.city}</p>
      {/* Jne. */}
    </div>
  );
}
