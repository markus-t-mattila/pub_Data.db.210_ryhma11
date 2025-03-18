export function requireLogin(req, res, next) {
    // Tarkista onko req.session.user olemassa
    if (req.session && req.session.user) {
      return next(); // Käyttäjä kirjautunut → jatketaan
    }
    // Jos ei, palautetaan 401 Unauthorized
    return res.status(401).json({ error: 'Not authenticated' });
};