# Ohjeet keskusdivari-ohjelman ajamiseen paikallisesti

## Tietokannan alustusohje

Tietokannan alustamista varten tulee varmistaa, että PostgreSQL-palvelin on käynnissä.

Oletuksena projekti käyttää seuraavia arvoja, mutta niitä voi muuttaa luomalla .env-tiedoston backend-kansioon ja vaihtamalla arvot omaa ympäristöä vastaaviksi:

```env
DB_USER=postgres
DB_HOST=localhost
```

### Alustuskomento

Tietokanta alustetaan navigoimalla projektin juurikansioon ja ajamalla komento:

```
node backend/database/setupDb.js
```

## Frontendin ja backendin buildaus ja käynnistäminen:

### Frontend (React)

Siirry client-kansioon ja asenna riippuvuudet:

```
cd client
npm install
```

Rakenna tuotantoversio:

```
npm run build
```

Käynnistä tuotantoversio paikallisesti:

```
serve -s build
```

### Backend (Node.js)

Siirry backend-kansioon ja asenna riippuvuudet:

```
cd client
npm install
```

Käynnistä palvelin:

```
npm start
```