-- Creation statements for external divari, only includes title and book data

-- book type
CREATE TABLE IF NOT EXISTS d1_divari.book_type (
    name TEXT UNIQUE NOT NULL
);

INSERT INTO d1_divari.book_type (name) VALUES
    ('HARDCOVER'),
    ('PAPERBACK'),
    ('CARTOON'),
    ('OTHER');

-- book genre / class
CREATE TABLE IF NOT EXISTS d1_divari.book_class (
    name TEXT UNIQUE NOT NULL
);

INSERT INTO d1_divari.book_class (name) VALUES
    ('FICTION'),
    ('NONFICTION'),
    ('COMIC'),
    ('OTHER');

CREATE TABLE IF NOT EXISTS d1_divari.title (
    id          UUID            PRIMARY KEY DEFAULT uuid_generate_v4 (),
    isbn        VARCHAR(13),
    name        TEXT            NOT NULL,
    writer      TEXT            NOT NULL,
    publisher   TEXT            NOT NULL,
    year        NUMERIC(4),
    weight      NUMERIC(6)      NOT NULL,
    type        TEXT            NOT NULL,
    class       TEXT            NOT NULL,
    created_at  TIMESTAMP       NOT NULL,
    modified_at TIMESTAMP       NOT NULL,
    
    CONSTRAINT fk_type_id
        FOREIGN KEY (type)
        REFERENCES d1_divari.book_type (name)
        ON DELETE RESTRICT,
        
    CONSTRAINT fk_class_id
        FOREIGN KEY (class)
        REFERENCES d1_divari.book_class (name)
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS d1_divari.book (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4 (),
    title_id        UUID            NOT NULL,
    purchase_id     UUID,
    store_id        UUID            NOT NULL,
    condition       condition_enum  NOT NULL,
    purchase_price  NUMERIC(10, 2)  NOT NULL,
    sale_price      NUMERIC(10, 2)  NOT NULL,
    status          status_enum     NOT NULL,
    created_at      TIMESTAMP       NOT NULL,
    modified_at     TIMESTAMP       NOT NULL,
    
    CONSTRAINT fk_book_title
        FOREIGN KEY (title_id)
        REFERENCES d1_divari.title (id)
        ON DELETE RESTRICT
);

-- lisäys tehostamaan varauten vapautusta
CREATE INDEX IF NOT EXISTS idx_d1_reserved_books_modified_at
ON d1_divari.book (modified_at)
WHERE status = 'RESERVED';