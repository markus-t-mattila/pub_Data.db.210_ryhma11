import { useEffect, useState } from "react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { api } from "../services/api";

const AdminDashboard = () => {
  const { admin } = useAdminAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      if (admin && !admin.is_central && Array.isArray(admin.stores)) {
        try {
          const promises = admin.stores.map((storeId) =>
            api.get("/stores", { params: { id: storeId } })
          );
          const results = await Promise.all(promises);
          const storeData = results.flatMap((res) => res.data); // API palauttaa aina arrayn
          setStores(storeData);
        } catch (error) {
          console.error("Virhe haettaessa kauppoja:", error);
        }
      }
      setLoading(false);
    };
    fetchStores();
  }, [admin]);

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Tervetuloa, {admin?.email}!</h1>

      {loading ? (
        <p>Ladataan kauppoja...</p>
      ) : admin?.is_central ? (
        <p className="text-green-400">Olet keskusadmin – sinulla on täydet oikeudet.</p>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-2">Hallinnoimasi kaupat:</h2>
          {stores.length === 0 ? (
            <p>Sinut ei ole liitetty yhteenkään kauppaan.</p>
          ) : (
            <ul className="grid gap-4 md:grid-cols-2">
              {stores.map((store) => (
                <li key={store.id} className="bg-gray-800 rounded-xl p-4 shadow">
                  <h3 className="text-lg font-bold">{store.name}</h3>
                  <p>{store.street_address}, {store.postcode} {store.city}</p>
                  <p><strong>Sähköposti:</strong> {store.email || "Ei ilmoitettu"}</p>
                  <p><strong>Puhelin:</strong> {store.phone_num || "Ei ilmoitettu"}</p>
                  <p><strong>Verkkosivu:</strong>{" "}
                    {store.website ? (
                      <a href={store.website} className="underline text-blue-400" target="_blank" rel="noreferrer">{store.website}</a>
                    ) : "Ei ilmoitettu"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
