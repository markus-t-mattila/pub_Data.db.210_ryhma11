import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchBooks } from "../services/api";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const [results, setResults] = useState([]);

  useEffect(() => {
    async function fetchResults() {
      if (query) {
        const data = await searchBooks(query);
        setResults(data);
      }
    }
    fetchResults();
  }, [query]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Hakutulokset: "{query}"</h1>
      {results.length > 0 ? (
        <table className="w-full mt-4 border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">ISBN</th>
              <th className="border p-2">Nimi</th>
              <th className="border p-2">Kirjailija</th>
              <th className="border p-2">Vuosi</th>
              <th className="border p-2">Paino (g)</th>
              <th className="border p-2">Tyyppi</th>
              <th className="border p-2">Luokka</th>
              <th className="border p-2">Hinta (€)</th>
              <th className="border p-2">Täsmäosumat</th>
              <th className="border p-2">Osittaiset osumat</th>
            </tr>
          </thead>
          <tbody>
            {results.map((book, index) => (
              <tr key={index} className="border">
                <td className="border p-2">{book.isbn}</td>
                <td className="border p-2">{book.name}</td>
                <td className="border p-2">{book.writer}</td>
                <td className="border p-2">{book.year}</td>
                <td className="border p-2">{book.weight}</td>
                <td className="border p-2">{book.type}</td>
                <td className="border p-2">{book.class}</td>
                <td className="border p-2">{book.sale_price}€</td>
                <td className="border p-2">{book.matches_full_word}</td>
                <td className="border p-2">{book.matches_partial}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mt-4">Ei tuloksia.</p>
      )}
    </div>
  );
}
