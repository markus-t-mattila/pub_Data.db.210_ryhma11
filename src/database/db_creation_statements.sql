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
CREATE TABLE IF NOT EXISTS book_type (
  id    UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  name  TEXT    UNIQUE NOT NULL
);

INSERT INTO book_type (name) VALUES
  ('HARDCOVER'),
  ('PAPERBACK'),
  ('CARTOON'),
  ('OTHER');

-- book genre / class
CREATE TABLE IF NOT EXISTS book_class (
  id    UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  name  TEXT    UNIQUE NOT NULL
);

INSERT INTO book_class (name) VALUES
  ('FICTION'),
  ('NONFICTION'),
  ('COMIC'),
  ('OTHER');


-- central_db

CREATE TABLE IF NOT EXISTS customer (
  id              UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            VARCHAR(30)       NOT NULL,
  email           VARCHAR(100)      UNIQUE NOT NULL, -- Lisätty vaatimus uniikista sähköpostiosoitteesta
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
  modified_at       TIMESTAMP       NOT NULL,

  CONSTRAINT fk_purchase_customer
    FOREIGN KEY (customer_id)
    REFERENCES customer (id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS title (
  id            UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  isbn          VARCHAR(13),
  name          TEXT            NOT NULL,
  writer        TEXT            NOT NULL,
  publisher     TEXT            NOT NULL,
  year          NUMERIC(4),
  weight        NUMERIC(6)      NOT NULL,
  type_id       UUID            NOT NULL,
  class_id      UUID            NOT NULL,
  created_at    TIMESTAMP       NOT NULL,
  modified_at   TIMESTAMP       NOT NULL,

  CONSTRAINT fk_type_id
    FOREIGN KEY (type_id)
    REFERENCES book_type (id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_class_id
    FOREIGN KEY (class_id)
    REFERENCES book_class (id)
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS book (
  id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_id        UUID            NOT NULL,
  purchase_id     UUID,
  store_id        UUID            NOT NULL,
  condition       condition_enum  NOT NULL,
  purchase_price  NUMERIC(10,2)   NOT NULL,
  sale_price      NUMERIC(10,2)   NOT NULL,
  status          status_enum     NOT NULL,
  created_at      TIMESTAMP       NOT NULL,
  modified_at     TIMESTAMP       NOT NULL,

  CONSTRAINT fk_book_title
    FOREIGN KEY (title_id)
    REFERENCES title (id)
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

CREATE TABLE IF NOT EXISTS shipment (
  id               UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_id      UUID            NOT NULL,
  shipping_id      NUMERIC(6)      NOT NULL,
  tracking_number  TEXT            UNIQUE,
  created_at       TIMESTAMP       NOT NULL,
  modified_at      TIMESTAMP       NOT NULL,

  CONSTRAINT fk_shipment_purchase
    FOREIGN KEY (purchase_id)
    REFERENCES purchase (id)
    ON DELETE CASCADE,

  CONSTRAINT fk_shipment_shipping
    FOREIGN KEY (shipping_id)
    REFERENCES shipping (max_weight)
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS shipment_item (
  shipment_id   UUID  NOT NULL,
  book_id       UUID  NOT NULL,

  PRIMARY KEY (shipment_id, book_id),

  CONSTRAINT fk_shipment_item_shipment
    FOREIGN KEY (shipment_id)
    REFERENCES shipment (id)
    ON DELETE CASCADE,

  CONSTRAINT fk_shipment_item_book
    FOREIGN KEY (book_id)
    REFERENCES book (id)
    ON DELETE RESTRICT
);

-- new table for admins
CREATE TABLE IF NOT EXISTS admin (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       VARCHAR(100)  NOT NULL,
  passwrd     TEXT          NOT NULL,
  is_central  BOOLEAN       NOT NULL DEFAULT FALSE -- central admin has rights to all stores
);

-- bridge table for admins and stores
CREATE TABLE IF NOT EXISTS admin_store (
  admin_id   UUID  NOT NULL,
  store_id   UUID  NOT NULL,

  PRIMARY KEY (admin_id, store_id),

  CONSTRAINT fk_admin_store_admin
    FOREIGN KEY (admin_id)
    REFERENCES admin (id)
    ON DELETE CASCADE,

  CONSTRAINT fk_admin_store_store
    FOREIGN KEY (store_id)
    REFERENCES store (id)
    ON DELETE CASCADE
);

/* -- single_db

CREATE TABLE IF NOT EXISTS title (
  isbn          VARCHAR(13)     PRIMARY KEY,
  name          TEXT            NOT NULL,
  writer        TEXT            NOT NULL,
  publisher     TEXT            NOT NULL,
  year          NUMERIC(4),
  type_id       UUID            NOT NULL,
  class_id      UUID            NOT NULL,
  created_at    TIMESTAMP       NOT NULL,
  modified_at   TIMESTAMP       NOT NULL,

  CONSTRAINT fk_type_id
    FOREIGN KEY (type_id)
    REFERENCES book_type (id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_class_id
    FOREIGN KEY (class_id)
    REFERENCES book_class (id)
    ON DELETE RESTRICT
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
); */