import cron from 'node-cron';
import { releaseExpiredReservations } from './purchase.js';
import pool from "../config/db.js";

// Aja joka minuutti
cron.schedule('* * * * *', () => {
  console.log('Tarkistetaan vanhentuneet varaukset...');
  releaseExpiredReservations();
});

export const minimizeShipping = async (weights) =>{
    weights.sort((a, b) => a - b);
    const memo = {};

    const client = await pool.connect();

    const result = await client.query("SELECT max_weight, price FROM shipping ORDER BY max_weight ASC");
    const packages = result.rows.map(r => ({ 
        max_weight: Number(r.max_weight), 
        price: Number(r.price)
    }));
  
    function dp(index) {
      if (index >= weights.length) return { cost: 0, batches: [] };
      if (memo[index]) return memo[index];
  
      let minResult = { cost: Infinity, batches: [] };
  
      for (const pkg of packages) {
        let currentWeight = 0;
        let nextIndex = index;
  
        // Etsitään tuotteet, jotka mahtuvat tähän pakettiin
        while (
          nextIndex < weights.length &&
          currentWeight + weights[nextIndex] <= pkg.max_weight
        ) {
          currentWeight += weights[nextIndex];
          nextIndex++;
        }
  
        if (currentWeight === 0) continue;
  
        const nextResult = dp(nextIndex);
        const totalCost = pkg.price + nextResult.cost;
  
        if (totalCost < minResult.cost) {
          minResult.cost = totalCost;
          minResult.batches = [
            {
              package: pkg,
              items: weights.slice(index, nextIndex)
            },
            ...nextResult.batches
          ];
        }
      }
  
      memo[index] = minResult;
      return minResult;
    }
  
    return dp(0);
  }
  
  export const getEnums = async (req, res) => {
    try {
      const [classResult, typeResult, conditionResult] = await Promise.all([
        pool.query("SELECT name FROM book_class"),
        pool.query("SELECT name FROM book_type"),
        pool.query("SELECT unnest(enum_range(NULL::condition_enum)) AS value"),
      ]);
  
      res.json({
        class: classResult.rows.map((r) => r.name),
        type: typeResult.rows.map((r) => r.name),
        condition: conditionResult.rows.map((r) => r.value),
      });
    } catch (error) {
      console.error("Virhe haettaessa enum-arvoja:", error);
      res.status(500).json({ error: "Tietotyyppien haku epäonnistui" });
    }
  };