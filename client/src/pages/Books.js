import { useState, useEffect } from "react";
import { availableBooks, addToCart } from "../services/api"; // 🔹 Tuodaan ostoskori-toiminto

export default function Books() {
  const [books, setBooks] = useState([]);
  const [groupedBooks, setGroupedBooks] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    console.log("Fetching all books...");
    
    const booksData = await availableBooks();
    console.log("Books received from API:", booksData);

    if (Array.isArray(booksData)) {
      setBooks(booksData);
      setGroupedBooks(groupBooksByTitle(booksData));
    } else if (booksData.data && Array.isArray(booksData.data)) {
      setBooks(booksData.data);
      setGroupedBooks(groupBooksByTitle(booksData.data));
    } else {
      console.error("Unexpected API response format:", booksData);
    }
    
    setLoading(false);
  };

  const groupBooksByTitle = (books) => {
    const grouped = {};

    books.forEach((book) => {
      if (!grouped[book.title_id]) {
        grouped[book.title_id] = {
          title_id: book.title_id,
          name: book.name,
          writer: book.writer,
          year: book.year,
          weight: book.weight,
          type: book.type,
          class: book.class,
          isbn: book.isbn,
          count: 1,
          min_price: parseFloat(book.sale_price),
          max_price: parseFloat(book.sale_price),
          books: [book],
        };
      } else {
        grouped[book.title_id].count += 1;
        grouped[book.title_id].min_price = Math.min(grouped[book.title_id].min_price, parseFloat(book.sale_price));
        grouped[book.title_id].max_price = Math.max(grouped[book.title_id].max_price, parseFloat(book.sale_price));
        grouped[book.title_id].books.push(book);
      }
    });

    return Object.values(grouped);
  };

  // Avataan tai suljetaan yksittäiset kirjat
  const toggleRow = (title_id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [title_id]: !prev[title_id],
    }));
  };

  // Lähetetään `book_id` backendille ostoskoriin
  const handleAddToCart = async (book_id) => {
    try {
      await addToCart(book_id);
      alert("Kirja lisätty ostoskoriin!");
    } catch (error) {
      console.error("Virhe lisätessä kirjaa ostoskoriin:", error);
      alert("Virhe lisätessä kirjaa ostoskoriin.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Kaikki kirjat</h1>

      {loading ? (
        <p className="text-lg text-blue-600 font-semibold">🔄 Ladataan tietoja...</p>
      ) : (
        <p>Kirjoja yhteensä: {books.length}</p>
      )}

      {!loading && (
        <table className="w-full mt-4 border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-center">Avaa</th>
              <th className="border p-2">Nimi</th>
              <th className="border p-2">Kirjailija</th>
              <th className="border p-2">Vuosi</th>
              <th className="border p-2">Tyyppi</th>
              <th className="border p-2">Luokka</th>
              <th className="border p-2">Min Hinta (€)</th>
              <th className="border p-2">Max Hinta (€)</th>
              <th className="border p-2">Kpl Määrä</th>
              <th className="border p-2">ISBN</th>
              <th className="border p-2">Paino (g)</th>
            </tr>
          </thead>
          <tbody>
            {groupedBooks.length > 0 ? (
              groupedBooks.map((group) => (
                <>
                  {/* Ryhmitelty pääkirja */}
                  <tr key={group.title_id} className="border">
                    <td className="border p-2 text-center">
                      {group.count > 1 ? (
                        <button
                          onClick={() => toggleRow(group.title_id)}
                          className="text-lg font-bold"
                        >
                          {expandedRows[group.title_id] ? "➖" : "➕"}
                        </button>
                      ) : (
                        <button
                            onClick={() => handleAddToCart(group.books[0].book_id)}
                            className="bg-white text-white px-3 py-1 rounded hover:bg-gray-200"
                          >🛒
                          </button>
                      )}
                    </td>
                    <td className="border p-2">{group.name}</td>
                    <td className="border p-2">{group.writer}</td>
                    <td className="border p-2">{group.year}</td>
                    <td className="border p-2">{group.type}</td>
                    <td className="border p-2">{group.class}</td>
                    <td className="border p-2">{group.min_price.toFixed(2)}€</td>
                    <td className="border p-2">{group.max_price.toFixed(2)}€</td>
                    <td className="border p-2 text-center">{group.count}</td>
                    <td className="border p-2">{group.isbn}</td>
                    <td className="border p-2">{group.weight} g</td>
                  </tr>

                  {/* Yksittäiset kirjat, jos rivi on laajennettu */}
                  {expandedRows[group.title_id] &&
                    group.books.map((book) => (
                      <tr key={book.book_id} className="border bg-gray-100">
                        <td className="border p-2 text-center">
                          <button
                            onClick={() => handleAddToCart(book.book_id)}
                            className="bg-white text-white px-3 py-1 rounded hover:bg-gray-200"
                          >🛒
                          </button>
                        </td>
                        <td className="border p-2 pl-8">{book.name}</td>
                        <td className="border p-2">{book.writer}</td>
                        <td className="border p-2">{book.year}</td>
                        <td className="border p-2">{book.type}</td>
                        <td className="border p-2">{book.class}</td>
                        <td className="border p-2">{parseFloat(book.sale_price).toFixed(2)}€</td>
                        <td className="border p-2"></td>
                        <td className="border p-2"></td>
                        <td className="border p-2">{book.isbn}</td>
                        <td className="border p-2">{book.weight} g</td>
                      </tr>
                    ))}
                </>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="text-center p-4">
                  Ei kirjoja saatavilla.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
