import express from "express";
import multer from "multer";
import { searchStores, addStoreFromXml } from "../controllers/stores.js";

const router = express.Router();

const storage = multer.memoryStorage(); // Tallennetaan tiedosto muistiin
const upload = multer({ storage });

router.get("/", searchStores);

// xml-tiedoston lähetys
router.post("/", upload.single("xmlData"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Hyväksytyt tiedostotyypit: .xml" });
    }

    // Muutetaan xml merkkijonoksi ja välitetään se parametrina
    const xmlData = req.file.buffer.toString("utf-8");
    const result = await addStoreFromXml(xmlData);

    res.status(201).json(result);
  } catch (error) {
    console.error("Virhe divaria lisättäessä:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
