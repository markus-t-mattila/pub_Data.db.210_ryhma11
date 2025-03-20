const Table = ({ headers, data, keys }) => {

  return (
    <table className="w-full mt-4 border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-200">
          {headers.map((header, index) => (
            <th key={index} className="border p-2">{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data === null ? (
          <tr>
            <td colSpan={headers.length} className="border p-2 text-center">Ladataan...</td>
          </tr>
        ) : data.length > 0 ? (
          data.map((row, index) => (
            <tr key={index} className="border">
              {keys.map((key, i) => (
                <td key={i} className="border p-2">{row[key]}</td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={headers.length} className="border p-2 text-center">Ei tuloksia.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default Table;