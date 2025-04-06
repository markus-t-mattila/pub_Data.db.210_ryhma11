/* Tältä sivulta admin voi lisätä uuden divarin
 * tiedot keskusdivarin tietokantaan. Tiedot annetaan
 * xml-tiedostona.
 * */
import { addStore } from "../services/api";
import { useState } from "react";

const AddStore = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Tiedoston valinnan käsittelijä
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  // Lomakkeen lähettämisen käsittelijä
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Sallitut tiedostotyypit: .xml");
      return;
    }

    const formData = new FormData();
    formData.append("xmlData", file);

    try {
      // addStore-funktio api.js tiedostosta
      await addStore(formData);
      setSuccess("Uusi divari lisätty!");
      setError("");
    } catch (err) {
      setError("Virhe divaria lisättäessä.");
      setSuccess("");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Lisää uusi divari
        </h2>
        {/* Virheen / onnistumisen tulostus */}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">
              Alta voit ladata esimerkkitiedoston ja käyttää sitä uuden divarin
              lisäämiseen.
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
                href="path_to_example/example.xml"
                download
                className="hover:underline"
              >
                Esimerkkitiedosto
              </a>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
          >
            Lisää divari
          </button>
        </form>
        <div className="mt-4 text-sm text-gray-600">
          xml-tiedoston on noudatettava seuraavanlaista järjestystä:
          <pre>
            {`
          <store>
            <titles>
              <title>
                <books>
                  <book>
                  </book>
                </books>
              </title>
            </titles>
          </store>
              `}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default AddStore;
