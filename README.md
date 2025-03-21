# Muutos- / toimintoloki

**Lisää tiedot merkkittävistä muutoksista aina tämän tiedoston alkuun!**

========================================================================

### MMa 2025-03-19
Tietokannan luotilausessa uusi admin taulu -> ajatuksena että vain adminit voivat lisätä ja poistaa kirjoja, omista kannoistaan ja tästä bridge storeihin

Adminin lisäykselle endpoint: http://localhost:3000/admin/register

Tähän kelpaa payload yksinkertaisimmillaan 

{
  "email": "matti@example.com",
  "password": "salainen123",
  "is_central": true
}

Kun käyttäjä luotu niin päästään käsiksi frontin admin sivuille johon oma ajatukseni
toteuttaa kirjojen lisäys / kannan hallinta yleisesti samaten kun uusien adminien lisäys täältä toki olemassa olevien rajoitteiden mukaan

admin puolelle frontissa: http://localhost:5173/admin/
