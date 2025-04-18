# Ohjeet keskusdivari-ohjelman ajamiseen paikallisesti

## Tietokannan alustusohje

Tietokannan alustamista varten tulee varmistaa, että PostgreSQL-palvelin on käynnissä.

Oletuksena projekti käyttää seuraavia arvoja, mutta niitä voi muuttaa luomalla .env-tiedoston backend-kansioon ja vaihtamalla arvot omaa ympäristöä vastaaviksi:


**mikäli käytetään ympäristömuuttujia sijoitetaan .env tiedosto backendin juureen.**
```env
DB_USER=ksmama
DB_PASSWORD=******
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ksmama
PORT=3000
RESET_DB=/home/ksmama/Data.db.210_ryhma11/backend/database/sql_statements/ksmama_reset_db.sql
INIT_DB=/home/ksmama/Data.db.210_ryhma11/backend/database/sql_statements/ksmama_init_db.sql
BACKEND_URL=http://localhost:3000
SESSION_SECRET=oma_sessio_salasana
CENTRAL_ADMIN_PASSWORD=divariadmin
EXTERNAL_ADMIN_PASSWORD=divariadmin2
```

### Alustuskomento

Tietokanta alustetaan navigoimalla projektin juurikansioon ja ajamalla komento:

```
node backend/database/setupDb.js
```

## Frontendin ja backendin buildaus ja käynnistäminen:

frontissa mikäli sovellusta ei ajeta suoraan juuri hakemistosta on muistettava lisätä frontin `package.json` tiedostoon "homepage"


##### deployatussa versiossa tämä määritetty seuraavasti
```
{
  "name": "client",
  "version": "0.1.0",
  "private": true,
  "homepage": "/~ksmama",
  "dependencies": {
    ...
    ...
  }
}
```

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
cd backend
npm install
```

Käynnistä palvelin:

```
npm start
```

### Deployment:
Deployment-versiossa palvelinta ylläpidetään ja hallitaan PM2-kirjastolla, joka vastaa automaattisesta uudelleenkäynnistyksestä, lokien hallinnasta ja prosessien jatkuvasta valvonnasta.