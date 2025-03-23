import React, { useState, useEffect, useContext } from "react";
import { getMyInfo, getMyOrders } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [userInfo, setUserInfo] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const { isLoggedIn, login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    fetchUserData();
    fetchUserOrders();
  }, [isLoggedIn, navigate]);

  const fetchUserData = async () => {
    if (!isLoggedIn) {
      console.warn("Käyttäjä ei ole kirjautunut. Avataan popup...");
      window.open("/popup/login", "_blank", "width=600,height=600");
      return;
    }
    
    let info
    try {
      // Haetaan käyttäjän tiedot
      info = await getMyInfo();
      //console.log("userInfo", info.data);
      setUserInfo(info.data);

    } catch (err) {
      // Tarkistetaan: jos 401 -> käyttäjä ei oikeasti ole kirjautunut backendin mielestä
      if (err.response?.status === 401) {
        console.warn("Käyttäjä ei ole kirjautunut (backend). Päivitetään context ja avataan popup...");
        login(false); // tai logout() jos sinulla on sellainen
        window.open("/popup/login", "_blank", "width=600,height=600");
        return;
      } else {
        throw err; // muu virhe
      }
    }
    if (isLoggedIn) {
      info = await getMyInfo();
      setUserInfo(info.data);
      fetchUserOrders(info.data.id);
    }
  };
  
  const fetchUserOrders = async (customerId) => {
    try {
      const result = await getMyOrders({ customer_id: customerId });
      setOrders(result);
    } catch (err) {
      console.error("Virhe tilausten haussa:", err);
      setError("Tilausten haku epäonnistui");
    }
  };

  if (!isLoggedIn) return null;
  if (error) return <p>{error}</p>;
  if (!userInfo) return <p>Ladataan...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Oma sivu</h2>
      <div className="mb-6">
        <p><strong>Nimi:</strong> {userInfo.name}</p>
        <p><strong>Sähköposti:</strong> {userInfo.email}</p>
        <p><strong>Puhelin:</strong> {userInfo.phone}</p>
        <p><strong>Osoite:</strong> {userInfo.street_address}, {userInfo.postcode} {userInfo.city}</p>
      </div>

      <h3 className="text-xl font-semibold mb-2">Tilaukset</h3>
      {orders.length === 0 ? (
        <p>Ei vielä tilauksia.</p>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.purchase_id} className="border border-gray-300 rounded p-4 shadow-sm">
              <h4 className="font-semibold mb-2">Tilaus {new Date(order.date).toLocaleDateString()}</h4>
              <p><strong>Yhteensä:</strong> {order.total_price} € (+{order.shipping_price} € toimitus)</p>
              <p><strong>Liike:</strong> {order.store.name}, {order.store.city}</p>

              {order.shipments.map((shipment, idx) => (
                <div key={shipment.shipment_id} className="mt-4 pl-4 border-l-2 border-gray-300">
                  <p className="font-medium">📦 Toimitus #{idx + 1}</p>
                  <p>Toimitustapa: Posti (max: {shipment.shipping_id}g) {shipment.package_price} €</p>
                  <p>Seurantanumero: {shipment.tracking_number || "ei annettu"}</p>

                  <ul className="list-disc list-inside mt-2">
                    {shipment.books.map(book => (
                      <li key={book.book_id}>
                        {book.title.name} ({book.title.year}) | {book.title.publisher} | ISBN {book.title.isbn} | kunto: {book.condition} | paino: {book.title.weight}g
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
