import { useState, useEffect } from "react";
import { addStore, searchAllStores } from "../services/api"; // Oletetaan, että getStores hakee saatavilla olevat divarit

const AddStore = () => {
  // Tilat saataville divareille
  const [availableStores, setAvailableStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState("new");

  // Divarin perustietojen tilat
  const [storeName, setStoreName] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [ownDatabase, setOwnDatabase] = useState(false);

  // XML-tiedoston tilat ja viestit
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Haetaan saatavilla olevat divarit, kun komponentti ladataan
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const stores = await searchAllStores();
        setAvailableStores(stores);
      } catch (err) {
        console.error("Virhe divarien haussa:", err);
      }
    };
    fetchStores();
  }, []);

  // Käsitellään dropdownin valinta
  const handleStoreSelection = (value) => {
    setSelectedStoreId(value);
    if (value === "new") {
      // Jos valitaan "Uusi divari", tyhjennetään kentät
      setStoreName("");
      setStreetAddress("");
      setPostcode("");
      setCity("");
      setEmail("");
      setPhoneNum("");
    } else {
      // Jos valitaan olemassa oleva divari, täytetään kentät valitun divarin tiedoilla
      const selStore = availableStores.find((store) => store.id === value);
      if (selStore) {
        setStoreName(selStore.name || "");
        setStreetAddress(selStore.street_address || "");
        setPostcode(selStore.postcode || "");
        setCity(selStore.city || "");
        setEmail(selStore.email || "");
        setPhoneNum(selStore.phone_num || "");
      }
    }
  };

  // Tiedoston valinnan käsittelijä
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  // Lomakkeen lähetyksen käsittelijä
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Valitse XML-tiedosto (.xml)");
      return;
    }

    // Kokoamme lomakkeen tiedot
    const formData = new FormData();
    formData.append("xmlData", file);
    formData.append("name", storeName);
    formData.append("street_address", streetAddress);
    formData.append("postcode", postcode);
    formData.append("city", city);
    formData.append("email", email);
    formData.append("phone_num", phoneNum);
    formData.append("ownDatabase", ownDatabase);

    try {
      await addStore(formData);
      setSuccess("Tiedot lisätty onnistuneesti!");
      setError("");
    } catch (err) {
      setError("Virhe lisättäessä tietoja.");
      setSuccess("");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Liity tai lisää aineistoa KESKUSDIVARIIN
        </h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}
        <form onSubmit={handleSubmit}>
          {/* Dropdown valitsemaan olemassa olevat divarit */}
          <div className="mb-4">
            <label className="block mb-2">Valitse divari</label>
            <select
              value={selectedStoreId}
              onChange={(e) => handleStoreSelection(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            >
              <option value="new">– Uusi divari –</option>
              {availableStores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>

          {/* Jos valittu "Uusi divari" tai ei ole saatavilla tietoja, näytetään lomakkeen kentät */}
          {(selectedStoreId === "new" || !selectedStoreId) && (
            <div className="mb-4">
              <label className="block mb-2">Divarin tiedot</label>
              <input
                type="text"
                placeholder="Nimi"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full p-2 border rounded mb-2"
                required
              />
              <input
                type="text"
                placeholder="Katuosoite"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                className="w-full p-2 border rounded mb-2"
                required
              />
              <input
                type="text"
                placeholder="Postinumero"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className="w-full p-2 border rounded mb-2"
                required
              />
              <input
                type="text"
                placeholder="Kaupunki"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2 border rounded mb-2"
                required
              />
              <input
                type="email"
                placeholder="Sähköposti"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded mb-2"
                required
              />
              <input
                type="text"
                placeholder="Puhelinnumero"
                value={phoneNum}
                onChange={(e) => setPhoneNum(e.target.value)}
                className="w-full p-2 border rounded mb-2"
                required
              />
            </div>
          )}

          {/* Checkbox oman tietokannan valinnalle */}
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="ownDatabase"
              checked={ownDatabase}
              onChange={(e) => setOwnDatabase(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="ownDatabase">Haluatko oman tietokannan?</label>
          </div>

          {/* XML-tiedoston latauskenttä */}
          <div className="mb-4">
            <label className="block mb-2">
              Lataa XML-tiedosto, joka sisältää ainoastaan teosten tiedot
            </label>
            <input
              type="file"
              accept=".xml"
              onChange={handleFileChange}
              className="w-full p-2 border rounded mb-4"
              required
            />
            <div className="text-sm text-gray-500">
              <a
                href="https://tie-tkannat.it.tuni.fi/~ksmama/example.xml"
                download
                className="hover:underline"
              >
                Lataa esimerkkitiedosto
              </a>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
          >
            Lähetä tiedot
          </button>
        </form>
        <div className="mt-4 text-sm text-gray-600">
          XML-tiedoston tulee sisältää vain teosten tiedot seuraavassa rakenteessa:
          <pre>
            {`
<teokset>
  <teos>
    <ttiedot>
      <nimi>Teoksen nimi</nimi>
      <tekija>Tekijä</tekija>
      <isbn>ISBN-numero</isbn>
    </ttiedot>
    <nide>
      <hinta>Hinta</hinta>
      <paino>Paino (valinnainen)</paino>
    </nide>
    <nide>
      <hinta>Hinta</hinta>
      <paino>Paino (valinnainen)</paino>
    </nide>
  </teos>
  <!-- Vähintään toinen teos samassa rakenteessa -->
</teokset>
            `}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default AddStore;
