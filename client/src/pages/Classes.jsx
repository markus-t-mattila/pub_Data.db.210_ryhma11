import { useEffect, useState } from "react";
import { getClasses } from "../services/api";
import Table from "./Table";

const Classes = () => {
  const [results, setResults] = useState(null);

  useEffect(() => {
    async function fetchResults() {
      const data = await getClasses();
      setResults(data);
    }
    fetchResults();
  }, []);

  const headers = ["Teosluokka", "Määrä", "Teosten kokonaishinta", "Keskihinta"];
  const keys = ["class", "count", "total_price", "average_price"];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Myynnissä olevat teokset luokittain:</h1>
      <Table headers={headers} data={results} keys={keys} />
    </div>
  );
};

export default Classes;