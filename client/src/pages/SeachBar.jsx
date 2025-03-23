import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const SearchBar = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const [searchQuery, setSearchQuery] = useState(query || "");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/books?q=${searchQuery}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex justify-center md:justify-end">
      <input
        type="text"
        placeholder="Etsi kirjoja..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-l-md text-black text-sm md:text-base"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-green-500 text-white rounded-r-md hover:bg-green-700 transition"
      >
        Hae
      </button>
    </form>
  )

}

export default SearchBar;