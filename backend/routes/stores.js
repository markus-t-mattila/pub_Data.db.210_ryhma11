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
    // Muutetaan XML-tiedoston data merkkijonoksi
    const xmlData = req.file.buffer.toString("utf-8");

    // Kerätään divarin perustiedot lomakkeesta
    const storeDetails = {
      name: req.body.name,
      street_address: req.body.street_address,
      postcode: req.body.postcode,
      city: req.body.city,
      email: req.body.email,
      phone_num: req.body.phone_num,
      website: req.body.website || ""
    };

    // Muunnetaan ownDatabase kenttä boolean-muotoon
    const ownDatabase = req.body.ownDatabase === "true" || req.body.ownDatabase === true;

    // Kutsutaan controlleria kaikilla tarvittavilla parametreilla
    const result = await addStoreFromXml(xmlData, storeDetails, ownDatabase);

    res.status(201).json(result);
  } catch (error) {
    console.error("Virhe divaria lisättäessä:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
