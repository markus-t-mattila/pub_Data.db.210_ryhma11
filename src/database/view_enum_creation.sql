CREATE TYPE book_condition AS ENUM ('new', 'used', 'damaged');
CREATE TYPE book_type AS ENUM ('novel', 'picture_book', 'comic', 'guide', 'nonfiction');
CREATE TYPE book_class AS ENUM ('romance', 'adventure', 'humor', 'history', 'detective', 'manual');

CREATE VIEW search_result AS
SELECT 
    b.isbn,
    t.name,
    t.writer,
    t.year,
    b.weight,
    t.type,
    t.class,
    b.sale_price
FROM book b
JOIN title t ON b.isbn = t.isbn;


CREATE VIEW titles_by_class AS
SELECT 
    t.class,
    COUNT(b.id) AS count,
    SUM(b.sale_price) AS total_price,
    AVG(b.sale_price) AS average_price
FROM book b
JOIN title t ON b.isbn = t.isbn
GROUP BY t.class;

CREATE VIEW customer_stats AS
SELECT 
    c.id,
    c.name,
    c.email,
    COUNT(p.id) AS bought_books_count
FROM customer c
LEFT JOIN purchase p ON c.id = p.customer_id
GROUP BY c.id, c.name, c.email;


CREATE VIEW search_result_relevance AS
SELECT 
    b.isbn,
    t.name,
    t.writer,
    t.year,
    b.weight,
    t.type,
    t.class,
    b.sale_price,
    -- Lasketaan kuinka monta kertaa hakusana esiintyy nimessä
    LENGTH(LOWER(t.name)) - LENGTH(REPLACE(LOWER(t.name), 'hakusana', '')) AS matches_full_word,
    -- Osittainen täsmäys
    CASE 
        WHEN t.name ILIKE '%hakusana%' THEN 1
        ELSE 0
    END AS matches_partial
FROM book b
JOIN title t ON b.isbn = t.isbn;


CREATE VIEW shipping_cost AS
SELECT 
    b.id AS book_id,
    b.isbn,
    b.weight,
    s.price AS shipping_price
FROM book b
JOIN shipping s ON b.weight <= s.max_weight
ORDER BY s.max_weight ASC
LIMIT 1;
