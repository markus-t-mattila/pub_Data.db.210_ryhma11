import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addBookWithTitle } from "../services/api.js";

const BookForm = () => {
  const [isbn, setIsbn] = useState("");
  const [name, setName] = useState("");
  const [writer, setWriter] = useState("");
  const [publisher, setPublisher] = useState("");
  const [year, setYear] = useState("");
  const [weight, setWeight] = useState("");
  const [typeName, setTypeName] = useState("");
  const [className, setClassName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [condition, setCondition] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const response = await addBookWithTitle({
        isbn,
        name,
        writer,
        publisher,
        year,
        weight,
        type_name: typeName,
        class_name: className,
        store_name: storeName,
        condition,
        purchase_price: purchasePrice,
        sale_price: salePrice,
      });
      if (response.status === 201) {
        setSuccess("Book added successfully");
        setIsbn("");
        setName("");
        setWriter("");
        setPublisher("");
        setYear("");
        setWeight("");
        setTypeName("");
        setClassName("");
        setStoreName("");
        setCondition("");
        setPurchasePrice("");
        setSalePrice("");
      } else {
        setError(response.data.error || "Kirjan lisääminen epäonnistui.");
      }
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        console.error(err);
        setError("Kirjan lisääminen epäonnistui.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Add Book</h2>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">ISBN</label>
          <input
            type="text"
            className="w-full p-2 border rounded mb-4"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            required
          />
          <label className="block mb-2">Title</label>
          <input
            type="text"
            className="w-full p-2 border rounded mb-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <label className="block mb-2">Writer</label>
          <input
            type="text"
            className="w-full p-2 border rounded mb-4"
            value={writer}
            onChange={(e) => setWriter(e.target.value)}
            required
          />
          <label className="block mb-2">Publisher</label>
          <input
            type="text"
            className="w-full p-2 border rounded mb-4"
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            required
          />
          <label className="block mb-2">Year</label>
          <input
            type="number"
            className="w-full p-2 border rounded mb-4"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
          />
          <label className="block mb-2">Weight</label>
          <input
            type="number"
            step="any"
            className="w-full p-2 border rounded mb-4"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
          <label className="block mb-2">Type</label>
          <input
            type="text"
            className="w-full p-2 border rounded mb-4"
            value={typeName}
            onChange={(e) => setTypeName(e.target.value)}
            required
          />
          <label className="block mb-2">Class</label>
          <input
            type="text"
            className="w-full p-2 border rounded mb-4"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            required
          />
          <label className="block mb-2">Store Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded mb-4"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
          />
          <label className="block mb-2">Condition</label>
          <input
            type="text"
            className="w-full p-2 border rounded mb-4"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            required
          />
          <label className="block mb-2">Purchase Price</label>
          <input
            type="number"
            step="any"
            className="w-full p-2 border rounded mb-4"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            required
          />
          <label className="block mb-2">Sale Price</label>
          <input
            type="number"
            step="any"
            className="w-full p-2 border rounded mb-4"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
          >
            Add Book
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookForm;
