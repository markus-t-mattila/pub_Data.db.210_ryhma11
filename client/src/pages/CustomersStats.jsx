import { useState } from "react";
import { getCustomersStats } from "../services/api";
import { BASE_URL } from "../services/api";

const CustomersStats = () => {
  const [status, setStatus] = useState(null);

  const downloadReport = async () => {

    try {
      setStatus('Luodaan raporttia...');
      const { path: filename } = await getCustomersStats();
      if (!filename) {
        throw Error;
      }
      const fileUrl = `${BASE_URL}/uploads/${filename}`;
  
      setStatus('Ladataan raporttia...');

      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setStatus('Raportti ladattu!')
      setTimeout(() => {
        setStatus(null);
      }, 2000);

    } catch (error) {
      setStatus('Raportin luonti epäonnistui!');
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Käyttäjätilastot</h1>
      <p className="text-lg text-gray-600 mt-3 mb-3">
        {status ? status : 'Luo CSV-raportti, jossa on listattuna kaikki asiakkaat ja heidän viime vuonna ostamiensa teosten lukumäärä.'}
      </p>
      <button type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded-r-md rounded-l-md hover:bg-blue-700 transition"
        onClick={downloadReport}
        disabled={status !== null && status !== 'Raportti ladattu!'}
      >
        Luo raportti
      </button>
    </div>
  );
};

export default CustomersStats;