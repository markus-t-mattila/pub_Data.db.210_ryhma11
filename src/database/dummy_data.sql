
INSERT INTO customer (id, name, email, passwrd, phone, street_address, postcode, city, created_at, modified_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Matti Meikäläinen', 'matti.meikalainen@example.com', 'salasana1', '0401234567', 'Keskuskatu 1', 00100, 'Helsinki', NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'Liisa Virtanen', 'liisa.virtanen@example.com', 'salasana2', '0502345678', 'Mannerheimintie 10', 00100, 'Helsinki', NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'Pekka Peloton', 'pekka.peloton@example.com', 'salasana3', '0413456789', 'Aleksanterinkatu 5', 00100, 'Helsinki', NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', 'Anna Aalto', 'anna.aalto@example.com', 'salasana4', '0445566778', 'Puistokatu 3', 90100, 'Oulu', NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', 'Kari Kivinen', 'kari.kivinen@example.com', 'salasana5', '0456677889', 'Torikatu 7', 90100, 'Oulu', NOW(), NOW());

INSERT INTO store (id, name, street_address, postcode, city, email, phone_num, website, created_at, modified_at) VALUES
('a1111111-1111-1111-1111-111111111111', 'Kirjakauppa Keskus', 'Keskuskatu 2', 00100, 'Helsinki', 'keskus@kauppa.fi', '0911122233', 'http://kirjakauppakeskus.fi', NOW(), NOW()),
('a2222222-2222-2222-2222-222222222222', 'Kirjakauppa Itä', 'Itäkatu 5', 00200, 'Helsinki', 'ita@kauppa.fi', '0911222333', 'http://kirjakauppaite.fi', NOW(), NOW()),
('a3333333-3333-3333-3333-333333333333', 'Kirjakauppa Pohjoinen', 'Pohjoiskatu 3', 90100, 'Oulu', 'pohjoinen@kauppa.fi', '0911333444', 'http://kirjakauppapohjoinen.fi', NOW(), NOW());

INSERT INTO purchase (id, date, total_price, shipping_price, customer_id, created_at, modified_at) VALUES
('b1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '15 days', 55.50, 5.00, '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
('b2222222-2222-2222-2222-222222222222', NOW() - INTERVAL '10 days', 78.90, 10.00, '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
('b3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '7 days', 120.00, 15.00, '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
('b4444444-4444-4444-4444-444444444444', NOW() - INTERVAL '3 days', 65.00, 5.00, '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('b5555555-5555-5555-5555-555555555555', NOW() - INTERVAL '1 days', 95.00, 10.00, '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days');

INSERT INTO title (id, isbn, name, writer, publisher, year, weight, type_id, class_id, created_at, modified_at) VALUES
('d1111111-1111-1111-1111-111111111111', '9789510000001', 'Suden ja Karhun Tarina', 'Mika Miettinen', 'Suomen Kustannus', 2010, 500, (SELECT id FROM book_type WHERE name = 'HARDCOVER'), (SELECT id FROM book_class WHERE name = 'FICTION'), NOW(), NOW()),
('d2222222-2222-2222-2222-222222222222', '9789510000002', 'Kettu ja Rähmä', 'Laura Laine', 'Otava', 2015, 350, (SELECT id FROM book_type WHERE name = 'PAPERBACK'), (SELECT id FROM book_class WHERE name = 'NONFICTION'), NOW(), NOW()),
('d3333333-3333-3333-3333-333333333333', '9789510000003', 'Taikojen Aika', 'Jussi Järvinen', 'WSOY', 2018, 400, (SELECT id FROM book_type WHERE name = 'CARTOON'), (SELECT id FROM book_class WHERE name = 'COMIC'), NOW(), NOW()),
('d4444444-4444-4444-4444-444444444444', '9789510000004', 'Yön Salaisuudet', 'Anniina Aalto', 'Tammi', 2020, 450, (SELECT id FROM book_type WHERE name = 'HARDCOVER'), (SELECT id FROM book_class WHERE name = 'OTHER'), NOW(), NOW()),
('d5555555-5555-5555-5555-555555555555', '9789510000005', 'Kesän Lumous', 'Kari Kallio', 'WSOY', 2012, 380, (SELECT id FROM book_type WHERE name = 'PAPERBACK'), (SELECT id FROM book_class WHERE name = 'FICTION'), NOW(), NOW()),
('d6666666-6666-6666-6666-666666666666', '9789510000006', 'Talven Tarina', 'Sanna Salmi', 'Otava', 2016, 420, (SELECT id FROM book_type WHERE name = 'OTHER'), (SELECT id FROM book_class WHERE name = 'NONFICTION'), NOW(), NOW());

INSERT INTO book (id, title_id, purchase_id, store_id, condition, purchase_price, sale_price, status, created_at, modified_at) VALUES
('e1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'GOOD', 20.00, 30.00, 'SOLD', NOW(), NOW()),
('e2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'NEW', 15.00, 25.00, 'SOLD', NOW(), NOW()),
('e3333333-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'FAIR', 10.00, 20.00, 'AVAILABLE', NOW(), NOW()),
('e4444444-4444-4444-4444-444444444444', 'd4444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111', 'GOOD', 18.00, 28.00, 'AVAILABLE', NOW(), NOW()),
('e5555555-5555-5555-5555-555555555555', 'd5555555-5555-5555-5555-555555555555', 'b1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'POOR', 12.00, 22.00, 'RESERVED', NOW(), NOW()),
('e6666666-6666-6666-6666-666666666666', 'd6666666-6666-6666-6666-666666666666', 'b5555555-5555-5555-5555-555555555555', 'a3333333-3333-3333-3333-333333333333', 'GOOD', 17.00, 27.00, 'AVAILABLE', NOW(), NOW()),
('e7777777-7777-7777-7777-777777777777', 'd1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'NEW', 21.00, 31.00, 'SOLD', NOW(), NOW());

INSERT INTO shipping (max_weight, price)
VALUES
(50, 2.50),
(250, 5.00),
(1000, 10.00),
(2000, 15.00);

INSERT INTO shipment (id, purchase_id, shipping_id, tracking_number, created_at, modified_at) VALUES
('f1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 250, 'TRACK123456', NOW(), NOW()),
('f2222222-2222-2222-2222-222222222222', 'b4444444-4444-4444-4444-444444444444', 50, 'TRACK654321', NOW(), NOW());

INSERT INTO shipment_item (shipment_id, book_id) VALUES
('f1111111-1111-1111-1111-111111111111', 'e2222222-2222-2222-2222-222222222222'),
('f1111111-1111-1111-1111-111111111111', 'e5555555-5555-5555-5555-555555555555'),
('f2222222-2222-2222-2222-222222222222', 'e4444444-4444-4444-4444-444444444444');