import { useEffect, useState } from "react";
import { getClasses } from "../services/api";

const Classes = () => {
  const [results, setResults] = useState(null);
  const [refresh, setRefresh] = useState(false);
  
  useEffect(() => {
    async function fetchResults() {
      const data = await getClasses();
      setResults(data);
    }
    fetchResults();
  }, [refresh]);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Myynnissä olevat teokset luokittain:</h1>
      {results === null && <div>Ladataan...</div>}
      {results?.length > 0 && (
        <table className="w-full mt-4 border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Teosluokka</th>
              <th className="border p-2">Määrä</th>
              <th className="border p-2">Teosten kokonaishinta</th>
              <th className="border p-2">Keskihinta</th>
            </tr>
          </thead>
          <tbody>
            {results.map((book, index) => (
              <tr key={index} className="border">
                <td className="border p-2">{book.class}</td>
                <td className="border p-2">{book.count}</td>
                <td className="border p-2">{Number(book.total_price).toFixed(2)}</td>
                <td className="border p-2">{Number(book.average_price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {results?.length === 0 && <p className="mt-4">Ei tuloksia.</p>}
    </div>
  );
}

export default Classes;