import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { availableBooks, reserveBook } from "../services/api"; 
import Swal from 'sweetalert2'; // siistimpi popup-ikkuna
import { useCart } from '../context/cartContext';

export default function Books() {
  const [books, setBooks] = useState([]);
  const [groupedBooks, setGroupedBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    name: "",
    writer: "",
    year: "",
    type: "",
    class: "",
    min_price: "",
    max_price: "",
    isbn: "",
    weight: ""
  });
  const { addToCart, cartItems } = useCart();

  useEffect(() => {
    fetchBooks();
  }, [cartItems]);

  const fetchBooks = async () => {
    setLoading(true);
    //console.log("Fetching all books...");

    const booksData = await availableBooks();
    //console.log("Books received from API:", booksData);

    const data = booksData.data && Array.isArray(booksData.data) ? booksData.data : booksData;

    if (Array.isArray(data)) {
      setBooks(data);
      const grouped = groupBooksByTitle(data);
      setGroupedBooks(grouped);
      setFilteredBooks(grouped);
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
          books: [book]
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

  useEffect(() => {
    const filtered = groupedBooks.filter((book) =>
      Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        if (key === "min_price") return book.min_price >= parseFloat(value);
        if (key === "max_price") return book.max_price <= parseFloat(value);
        return book[key]?.toString().toLowerCase().includes(value.toLowerCase());
      })
    );
    setFilteredBooks(filtered);
  }, [filters, groupedBooks]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const toggleRow = (title_id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [title_id]: !prev[title_id],
    }));
  };

  const handleAddToCart = async (book_id) => {
    try {
      const result = await reserveBook(book_id);
      

      addToCart(result.book);
  
      // Kauniimpi SweetAlert2-popup onnistuneelle varaukselle
      await Swal.fire({
        title: '✅ Keskusdivari',
        text: result.message,
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6'
      });
  
      await fetchBooks();
  
    } catch (error) {
      console.error("Backend-virhe:", error.response?.data || error);
  
      // SweetAlert2-popup virhetilanteelle
      await Swal.fire({
        title: '❌ Keskusdivari',
        text: error.response?.data?.error || "Tuntematon virhe",
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d33'
      });
  
      await fetchBooks();
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
              <th className="border p-2">ISBN</th>
              <th className="border p-2">Paino (g)</th>
              <th className="border p-2">Kpl Määrä</th>
            </tr>

            {/* Hakukentät */}
            <tr className="bg-gray-100">
              <td className="border p-1"></td>
              {Object.entries(filters).map(([key, value]) => (
                <td key={key} className="border p-1">
                  <input
                    type="text"
                    name={key}
                    placeholder="Haku..."
                    value={value}
                    onChange={handleFilterChange}
                    className="w-full p-1 border border-gray-300 rounded text-sm"
                  />
                </td>
              ))}
              <td className="border p-1"></td>
            </tr>
          </thead>
          <tbody>
              {filteredBooks.length > 0 ? (
                filteredBooks.map((group) => (
                  <>
                    {/* Pääryhmä (title_id:n mukaan ryhmitelty) */}
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
                      <td className="border p-2">
                        {group.count === 1 ? (
                          <Link
                            to={`/book/${group.books[0].book_id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {group.name}
                          </Link>
                        ) : (
                          group.name
                        )}
                      </td>
                      <td className="border p-2">{group.writer}</td>
                      <td className="border p-2">{group.year}</td>
                      <td className="border p-2">{group.type}</td>
                      <td className="border p-2">{group.class}</td>
                      <td className="border p-2">{group.min_price.toFixed(2)}€</td>
                      <td className="border p-2">{group.max_price.toFixed(2)}€</td>
                      <td className="border p-2">{group.isbn}</td>
                      <td className="border p-2">{group.weight} g</td>
                      <td className="border p-2 text-center">{group.count}</td>
                    </tr>
                    
                    {/* Yksittäiset kirjat laajennettuna */}
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
                          <td className="border p-2">
                            <Link to={`/book/${book.book_id}`} className="text-blue-600 hover:underline">
                              {book.name}
                            </Link>
                          </td>
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
                  <td colSpan="11" className="text-center p-4">Ei kirjoja saatavilla.</td>
                </tr>
              )}
            </tbody>
        </table>
      )}
    </div>
  );
}
