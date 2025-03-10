-- kommentti ja testi commit

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- book condition
CREATE TYPE condition_enum AS ENUM (
  'NEW',
  'GOOD',
  'FAIR',
  'POOR'
);

-- sale status
CREATE TYPE status_enum AS ENUM (
  'AVAILABLE',
  'RESERVED',
  'SOLD'
);

-- book type
CREATE TYPE type_enum AS ENUM (
  'HARDCOVER',
  'PAPERBACK',
  'CARTOON'
  'OTHER'
);

-- book genre / class
CREATE TYPE class_enum AS ENUM (
  'FICTION',
  'NONFICTION',
  'COMIC',
  'OTHER'
);


-- central_db

CREATE TABLE IF NOT EXISTS customer (
  id              UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(30)       NOT NULL,
  email           VARCHAR(100),
  passwrd         TEXT              NOT NULL,
  phone           VARCHAR(20)       NOT NULL,
  street_address  VARCHAR(50)       NOT NULL,
  postcode        NUMERIC           NOT NULL,
  city            VARCHAR(50)       NOT NULL,
  created_at      TIMESTAMP         NOT NULL,
  modified_at     TIMESTAMP         NOT NULL
);

CREATE TABLE IF NOT EXISTS store (
  id              UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(50)       NOT NULL,
  street_address  VARCHAR(50)       NOT NULL,
  postcode        NUMERIC(5)        NOT NULL,
  city            VARCHAR(50)       NOT NULL,
  email           VARCHAR(50),
  phone_num       VARCHAR(15),
  website         TEXT,
  created_at      TIMESTAMP         NOT NULL,
  modified_at     TIMESTAMP         NOT NULL
);

CREATE TABLE IF NOT EXISTS purchase (
  id                UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  date              TIMESTAMP       NOT NULL,
  total_price       NUMERIC(6,2)    NOT NULL,
  shipping_price    NUMERIC(6,2),
  customer_id       UUID            NOT NULL,
  created_at        TIMESTAMP       NOT NULL,
  modified_at       TIMESTAMP       NOT NULL

  CONSTRAINT fk_purchase_customer
    FOREIGN KEY (customer_id)
    REFERENCES customer (id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS title (
  isbn          VARCHAR(13)     PRIMARY KEY,
  name          TEXT            NOT NULL,
  writer        TEXT            NOT NULL,
  publisher     TEXT            NOT NULL,
  year          NUMERIC(4),
  type          type_enum       NOT NULL,
  class         class_enum      NOT NULL,
  created_at    TIMESTAMP       NOT NULL,
  modified_at   TIMESTAMP       NOT NULL
);

CREATE TABLE IF NOT EXISTS book (
  id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  isbn            VARCHAR(13)     NOT NULL,
  purchase_id     UUID,
  store_id        UUID            NOT NULL,
  weight          NUMERIC(6)      NOT NULL,
  condition       condition_enum  NOT NULL,
  purchase_price  NUMERIC(10,2)   NOT NULL,
  sale_price      NUMERIC(10,2)   NOT NULL,
  status          status_enum     NOT NULL,
  created_at      TIMESTAMP       NOT NULL,
  modified_at     TIMESTAMP       NOT NULL,

  CONSTRAINT fk_book_isbn
    FOREIGN KEY (isbn)
    REFERENCES title (isbn)
    ON DELETE RESTRICT,

  CONSTRAINT fk_book_purchase
    FOREIGN KEY (purchase_id)
    REFERENCES purchase (id)
    ON DELETE SET NULL,

  CONSTRAINT fk_book_store
    FOREIGN KEY (store_id)
    REFERENCES store (id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shipping (
  max_weight   NUMERIC(6)      PRIMARY KEY,
  price        NUMERIC(4,2)    NOT NULL
);


-- single_db

CREATE TABLE IF NOT EXISTS title (
  isbn          VARCHAR(13)     PRIMARY KEY,
  name          TEXT            NOT NULL,
  writer        TEXT            NOT NULL,
  publisher     TEXT            NOT NULL,
  year          NUMERIC(4),
  type          type_enum       NOT NULL,
  class         class_enum      NOT NULL,
  created_at    TIMESTAMP       NOT NULL,
  modified_at   TIMESTAMP       NOT NULL
);

CREATE TABLE IF NOT EXISTS book (
  id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  isbn            VARCHAR(13)     NOT NULL,
  condition       condition_enum  NOT NULL,
  weight          NUMERIC(6)      NOT NULL,
  purchase_price  NUMERIC(10,2)   NOT NULL,
  sale_price      NUMERIC(10,2)   NOT NULL,
  status          status_enum     NOT NULL,
  created_at      TIMESTAMP       NOT NULL,
  modified_at     TIMESTAMP       NOT NULL,

  CONSTRAINT fk_book_isbn
    FOREIGN KEY (isbn)
    REFERENCES title (isbn)
    ON DELETE RESTRICT
);