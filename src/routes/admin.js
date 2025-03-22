import express from 'express';
import { registerAdmin, loginAdmin } from '../controllers/admin.js';
import { requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// POST /admin/register
router.post('/register', registerAdmin);

// Adminin kirjautuminen
router.post("/login", loginAdmin);

router.get("/me", requireAdmin, (req, res) => {
  res.json({ admin: req.session.admin });
});

// Adminin uloskirjautuminen
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Internal error." });
    }
    res.json({ success: true, message: "Internal Error." });
  });
});


export default router;