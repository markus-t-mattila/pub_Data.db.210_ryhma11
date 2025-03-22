import pool from "../config/db.js";
import { minimizeShipping } from "./utils.js";

export const calculateDeliveryCost = async (req, res) => {
  const { weights } = req.body;

  if (!Array.isArray(weights) || weights.some(w => typeof w !== "number")) {
    return res.status(400).json({ error: "Anna lista painoista (grammoina)." });
  }

  try {
    const result =  await minimizeShipping(weights);
    console.log(result);

    const response = {
        totalCost: result.cost,
        batches: result.batches.map((batch, index) => ({
          batchNumber: index + 1,
          packageMaxWeight: batch.package.max_weight,
          packagePrice: batch.package.price,
          items: batch.items,
          totalWeight: batch.items.reduce((sum, w) => sum + w, 0)
        }))
      };

    // Palauta laskettu result käyttäjälle
    return res.status(200).json(response);

  } catch (error) {
    console.error("Virhe toimituskulujen laskennassa:", error);
    return res.status(500).json({ error: "Internal Error" });
  }
};
