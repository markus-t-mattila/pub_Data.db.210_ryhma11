# Muutos- / toimintoloki

**Lisää tiedot merkkittävistä muutoksista aina tämän tiedoston alkuun!**

========================================================================

### MMa 2025-03-22

* bakkiin lisäilty toimintoja suurin ominaisuus postikulujen laskenta ja optimointi
* frontissa ostoskori toteutettu pitää kirjaa sinne tallennetuista tuotteista
  * laskee tuotteiden yhteishinnan
  * toimituskulujen esitys
  * kokonaishinnan esitys
* Mahdollisuus poistaa tuotteita ostokorista
* Ostokorin voi tyhjentää kokonaisuudessaan
* toimitus kulut päivittyvät tuotteiden mukaan
* lisätty linkit kirja sivuille 
  * löytyy ostokorista ja kirjat sivulta
* Kirjat sivun toteutus
  * mahdollisuus lisätä täältä ostoskoriin


### MMa 2025-03-21

* Tietokanta rakennetta muutettu -> tyypin ja luokan takaa kommentoitu ID:t pois ja käytetään suoraan teksti arvoja
* dummy_data tiedosto muokkattu yllä olevan mukaiseksi
* lisätty kysely endpointeja (parametreilla)

#### uusi sivu frontissa http://localhost:5173/books -> tällä saadaan lähetettyä ostokoriin menevien kirjojen ID:t bäkkärille

#### Titlen eli teoksen lisäys onnistuu POST http://localhost:3000/title

```
# example payload
{
  "name": "Turms kuoleematoOon",
  "writer": "Mika Waltari",
  "publisher": "WSOY",
  "year": 1995,
  "weight": 400,
  "type_name": "HARDCOVER",
  "class_name": "COMIC"
}
```
#### Kirjan lisäys onnistuu (lisää myös titlen jos ei löydy) POST http://localhost:3000/books
```
# example payload
{
  "isbn": "9789510396230",
  "name": "Miten saan ystäviä, menestystä, vaikutusvaltaa",
  "writer": "Dale Carnegie",
  "publisher": "WSOY",
  "year": 1939,
  "weight": 400,
  "type_name": "cartoon",
  "class_name": "NONFICTION",
  "store_name": "Kirjakauppa Keskus",
  "condition": "GOOD",
  "purchase_price": 3.50,
  "sale_price": 9.90
}
```


### MMa 2025-03-19
Tietokannan luotilausessa uusi admin taulu -> ajatuksena että vain adminit voivat lisätä ja poistaa kirjoja, omista kannoistaan ja tästä bridge storeihin

Adminin lisäykselle endpoint: http://localhost:3000/admin/register

Tähän kelpaa payload yksinkertaisimmillaan 
```
{
  "email": "matti@example.com",
  "password": "salainen123",
  "is_central": true
}
```

Kun käyttäjä luotu niin päästään käsiksi frontin admin sivuille johon oma ajatukseni
toteuttaa kirjojen lisäys / kannan hallinta yleisesti samaten kun uusien adminien lisäys täältä toki olemassa olevien rajoitteiden mukaan

admin puolelle frontissa: http://localhost:5173/admin/
