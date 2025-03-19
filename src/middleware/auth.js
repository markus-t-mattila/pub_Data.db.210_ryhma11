
// asiakkaan kirjautuminen
export function requireLogin(req, res, next) {
    // Tarkista onko req.session.user olemassa
    if (req.session && req.session.user) {
      return next(); // Käyttäjä kirjautunut → jatketaan
    }
    // Jos ei, palautetaan 401 Unauthorized
    return res.status(401).json({ error: 'Not authenticated' });
};

// Adminin kirjautumisen tarkistus
export function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) {
      return next(); // Admin kirjautunut → jatketaan
  }
  return res.status(401).json({ error: "Not authenticated" });
};