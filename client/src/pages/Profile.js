import React, { useState, useEffect, useContext } from "react";
import { getMyInfo, getMyOrders } from "../services/api";
import { AuthContext } from "../context/AuthContext";



export default function Profile() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const { isLoggedIn, login, setForceLogin, userInfo } = useContext(AuthContext);


  useEffect(() => {
    if (!isLoggedIn || !userInfo) {
      setForceLogin(true);
      return;
    }
    fetchUserOrders(userInfo.data.id);
  }, [isLoggedIn]);



  const fetchUserData = async () => {
    if (!isLoggedIn) {
      console.warn("Käyttäjä ei ole kirjautunut. Avataan popup...");
      setForceLogin(true);
      return;
    }
    //console.log("userInfo tässä:", id);
    fetchUserOrders(userInfo.data.id);
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
        <p><strong>Nimi:</strong> {userInfo.data.name}</p>
        <p><strong>Sähköposti:</strong> {userInfo.data.email}</p>
        <p><strong>Puhelin:</strong> {userInfo.data.phone}</p>
        <p><strong>Osoite:</strong> {userInfo.data.street_address}, {userInfo.data.postcode} {userInfo.data.city}</p>
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
