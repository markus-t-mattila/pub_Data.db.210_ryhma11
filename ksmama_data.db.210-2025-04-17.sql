--
-- PostgreSQL database dump
--

-- Dumped from database version 13.20
-- Dumped by pg_dump version 13.20

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: d1_divari; Type: SCHEMA; Schema: -; Owner: ksmama
--

CREATE SCHEMA d1_divari;


ALTER SCHEMA d1_divari OWNER TO ksmama;

--
-- Name: condition_enum; Type: TYPE; Schema: public; Owner: ksmama
--

CREATE TYPE public.condition_enum AS ENUM (
    'NEW',
    'GOOD',
    'FAIR',
    'POOR'
);


ALTER TYPE public.condition_enum OWNER TO ksmama;

--
-- Name: status_enum; Type: TYPE; Schema: public; Owner: ksmama
--

CREATE TYPE public.status_enum AS ENUM (
    'AVAILABLE',
    'RESERVED',
    'SOLD'
);


ALTER TYPE public.status_enum OWNER TO ksmama;

--
-- Name: uuid_generate_v4(); Type: FUNCTION; Schema: public; Owner: ksmama
--

CREATE FUNCTION public.uuid_generate_v4() RETURNS uuid
    LANGUAGE sql IMMUTABLE
    AS $$
  SELECT (
    lpad(to_hex((random()*4294967295)::bigint), 8, '0') || '-' ||
    lpad(to_hex((random()*65535)::bigint), 4, '0') || '-' ||
    lpad(to_hex((floor(random()*4096)::bigint) + 16384), 4, '0') || '-' ||
    lpad(to_hex((floor(random()*16384)::bigint) + 32768), 4, '0') || '-' ||
    lpad(to_hex((random()*281474976710655)::bigint), 12, '0')
  )::uuid;
$$;


ALTER FUNCTION public.uuid_generate_v4() OWNER TO ksmama;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: book; Type: TABLE; Schema: d1_divari; Owner: ksmama
--

CREATE TABLE d1_divari.book (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title_id uuid NOT NULL,
    purchase_id uuid,
    store_id uuid NOT NULL,
    condition public.condition_enum NOT NULL,
    purchase_price numeric(10,2) NOT NULL,
    sale_price numeric(10,2) NOT NULL,
    status public.status_enum NOT NULL,
    created_at timestamp without time zone NOT NULL,
    modified_at timestamp without time zone NOT NULL
);


ALTER TABLE d1_divari.book OWNER TO ksmama;

--
-- Name: book_class; Type: TABLE; Schema: d1_divari; Owner: ksmama
--

CREATE TABLE d1_divari.book_class (
    name text NOT NULL
);


ALTER TABLE d1_divari.book_class OWNER TO ksmama;

--
-- Name: book_type; Type: TABLE; Schema: d1_divari; Owner: ksmama
--

CREATE TABLE d1_divari.book_type (
    name text NOT NULL
);


ALTER TABLE d1_divari.book_type OWNER TO ksmama;

--
-- Name: title; Type: TABLE; Schema: d1_divari; Owner: ksmama
--

CREATE TABLE d1_divari.title (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    isbn character varying(13),
    name text NOT NULL,
    writer text NOT NULL,
    publisher text NOT NULL,
    year numeric(4,0),
    weight numeric(6,0) NOT NULL,
    type text NOT NULL,
    class text NOT NULL,
    created_at timestamp without time zone NOT NULL,
    modified_at timestamp without time zone NOT NULL
);


ALTER TABLE d1_divari.title OWNER TO ksmama;

--
-- Name: admin; Type: TABLE; Schema: public; Owner: ksmama
--

CREATE TABLE public.admin (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(100) NOT NULL,
    passwrd text NOT NULL,
    is_central boolean DEFAULT false NOT NULL
);


ALTER TABLE public.admin OWNER TO ksmama;

--
-- Name: admin_store; Type: TABLE; Schema: public; Owner: ksmama
--

CREATE TABLE public.admin_store (
    admin_id uuid NOT NULL,
    store_id uuid NOT NULL
);


ALTER TABLE public.admin_store OWNER TO ksmama;

--
-- Name: book; Type: TABLE; Schema: public; Owner: ksmama
--

CREATE TABLE public.book (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title_id uuid NOT NULL,
    purchase_id uuid,
    store_id uuid NOT NULL,
    condition public.condition_enum NOT NULL,
    purchase_price numeric(10,2) NOT NULL,
    sale_price numeric(10,2) NOT NULL,
    status public.status_enum NOT NULL,
    created_at timestamp without time zone NOT NULL,
    modified_at timestamp without time zone NOT NULL
);


ALTER TABLE public.book OWNER TO ksmama;

--
-- Name: book_class; Type: TABLE; Schema: public; Owner: ksmama
--

CREATE TABLE public.book_class (
    name text NOT NULL
);


ALTER TABLE public.book_class OWNER TO ksmama;

--
-- Name: book_type; Type: TABLE; Schema: public; Owner: ksmama
--

CREATE TABLE public.book_type (
    name text NOT NULL
);


ALTER TABLE public.book_type OWNER TO ksmama;

--
-- Name: customer; Type: TABLE; Schema: public; Owner: ksmama
--

CREATE TABLE public.customer (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(30) NOT NULL,
    email character varying(100) NOT NULL,
    passwrd text NOT NULL,
    phone character varying(20) NOT NULL,
    street_address character varying(50) NOT NULL,
    postcode numeric NOT NULL,
    city character varying(50) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    modified_at timestamp without time zone NOT NULL
);


ALTER TABLE public.customer OWNER TO ksmama;

--
-- Name: purchase; Type: TABLE; Schema: public; Owner: ksmama
--

CREATE TABLE public.purchase (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    date timestamp without time zone NOT NULL,
    total_price numeric(6,2) NOT NULL,
    shipping_price numeric(6,2),
    customer_id uuid NOT NULL,
    created_at timestamp without time zone NOT NULL,
    modified_at timestamp without time zone NOT NULL
);


ALTER TABLE public.purchase OWNER TO ksmama;

--
-- Name: shipment; Type: TABLE; Schema: public; Owner: ksmama
--

CREATE TABLE public.shipment (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    purchase_id uuid NOT NULL,
    shipping_id numeric(6,0) NOT NULL,
    tracking_number text,
    created_at timestamp without time zone NOT NULL,
    modified_at timestamp without time zone NOT NULL
);


ALTER TABLE public.shipment OWNER TO ksmama;

--
-- Name: shipment_item; Type: TABLE; Schema: public; Owner: ksmama
--

CREATE TABLE public.shipment_item (
    shipment_id uuid NOT NULL,
    book_id uuid NOT NULL
);


ALTER TABLE public.shipment_item OWNER TO ksmama;

--
-- Name: shipping; Type: TABLE; Schema: public; Owner: ksmama
--

CREATE TABLE public.shipping (
    max_weight numeric(6,0) NOT NULL,
    price numeric(4,2) NOT NULL
);


ALTER TABLE public.shipping OWNER TO ksmama;

--
-- Name: store; Type: TABLE; Schema: public; Owner: ksmama
--

CREATE TABLE public.store (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(50) NOT NULL,
    street_address character varying(50) NOT NULL,
    postcode numeric(5,0) NOT NULL,
    city character varying(50) NOT NULL,
    email character varying(50),
    phone_num character varying(15),
    website text,
    created_at timestamp without time zone NOT NULL,
    modified_at timestamp without time zone NOT NULL
);


ALTER TABLE public.store OWNER TO ksmama;

--
-- Name: store_schema_mapping; Type: TABLE; Schema: public; Owner: ksmama
--

CREATE TABLE public.store_schema_mapping (
    store_id uuid NOT NULL,
    schema_name text NOT NULL
);


ALTER TABLE public.store_schema_mapping OWNER TO ksmama;

--
-- Name: title; Type: TABLE; Schema: public; Owner: ksmama
--

CREATE TABLE public.title (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    isbn character varying(13),
    name text NOT NULL,
    writer text NOT NULL,
    publisher text NOT NULL,
    year numeric(4,0),
    weight numeric(6,0) NOT NULL,
    type text NOT NULL,
    class text NOT NULL,
    created_at timestamp without time zone NOT NULL,
    modified_at timestamp without time zone NOT NULL
);


ALTER TABLE public.title OWNER TO ksmama;

--
-- Data for Name: book; Type: TABLE DATA; Schema: d1_divari; Owner: ksmama
--

COPY d1_divari.book (id, title_id, purchase_id, store_id, condition, purchase_price, sale_price, status, created_at, modified_at) FROM stdin;
e1111111-1111-1111-1111-111111111111	d1111111-1111-1111-1111-111111111111	b1111111-1111-1111-1111-111111111111	a1111111-1111-1111-1111-111111111111	GOOD	20.00	30.00	SOLD	2025-04-17 17:56:02.434091	2025-04-17 17:56:02.434091
e3333333-3333-3333-3333-333333333333	d3333333-3333-3333-3333-333333333333	\N	a1111111-1111-1111-1111-111111111111	FAIR	10.00	20.00	AVAILABLE	2025-04-17 17:56:02.434091	2025-04-17 17:56:02.434091
e4444444-4444-4444-4444-444444444444	d4444444-4444-4444-4444-444444444444	\N	a1111111-1111-1111-1111-111111111111	NEW	18.00	28.00	AVAILABLE	2025-04-17 17:56:02.434091	2025-04-17 17:56:02.434091
e6666666-6666-6666-6666-666666666666	d6666666-6666-6666-6666-666666666666	\N	a1111111-1111-1111-1111-111111111111	NEW	17.00	27.00	AVAILABLE	2025-04-17 17:56:02.434091	2025-04-17 17:56:02.434091
e7777777-7777-7777-7777-777777777777	d1111111-1111-1111-1111-111111111111	b1111111-1111-1111-1111-111111111111	a1111111-1111-1111-1111-111111111111	NEW	21.00	31.00	SOLD	2025-04-17 17:56:02.434091	2025-04-17 17:56:02.434091
eaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	d9999999-9999-9999-9999-999999999999	\N	a1111111-1111-1111-1111-111111111111	FAIR	9.00	19.00	AVAILABLE	2025-04-17 17:56:02.434091	2025-04-17 17:56:02.434091
ed111111-1111-1111-1111-111111111111	d5555555-5555-5555-5555-555555555555	\N	a1111111-1111-1111-1111-111111111111	GOOD	11.00	21.00	AVAILABLE	2025-04-17 17:56:02.434091	2025-04-17 17:56:02.434091
ed222222-2222-2222-2222-222222222222	d2222222-2222-2222-2222-222222222222	\N	a1111111-1111-1111-1111-111111111111	POOR	8.00	15.00	AVAILABLE	2025-04-17 17:56:02.434091	2025-04-17 17:56:02.434091
ed444444-4444-4444-4444-444444444444	d4444444-4444-4444-4444-444444444444	b1111111-1111-1111-1111-111111111111	a1111111-1111-1111-1111-111111111111	NEW	19.00	29.00	SOLD	2025-04-17 17:56:02.434091	2025-04-17 17:56:02.434091
ed555555-5555-5555-5555-555555555555	d7777777-7777-7777-7777-777777777777	\N	a1111111-1111-1111-1111-111111111111	GOOD	20.00	30.00	AVAILABLE	2025-04-17 17:56:02.434091	2025-04-17 17:56:02.434091
ee111111-1111-1111-1111-111111111111	dd111111-1111-1111-1111-111111111111	\N	a1111111-1111-1111-1111-111111111111	GOOD	20.00	25.25	AVAILABLE	2025-04-17 17:56:02.434091	2025-04-17 17:56:02.434091
ee222222-2222-2222-2222-222222222222	dd222222-2222-2222-2222-222222222222	\N	a1111111-1111-1111-1111-111111111111	FAIR	20.00	29.00	AVAILABLE	2025-04-17 17:56:02.434091	2025-04-17 17:56:02.434091
ee333333-3333-3333-3333-333333333333	dd333333-3333-3333-3333-333333333333	\N	a1111111-1111-1111-1111-111111111111	NEW	20.00	31.50	AVAILABLE	2025-04-17 17:56:02.434091	2025-04-17 17:56:02.434091
\.


--
-- Data for Name: book_class; Type: TABLE DATA; Schema: d1_divari; Owner: ksmama
--

COPY d1_divari.book_class (name) FROM stdin;
FICTION
NONFICTION
COMIC
OTHER
NOVEL
\.


--
-- Data for Name: book_type; Type: TABLE DATA; Schema: d1_divari; Owner: ksmama
--

COPY d1_divari.book_type (name) FROM stdin;
HARDCOVER
PAPERBACK
CARTOON
OTHER
ROMANCE
HISTORY
CRIME
HUMOR
GUIDE
\.


--
-- Data for Name: title; Type: TABLE DATA; Schema: d1_divari; Owner: ksmama
--

COPY d1_divari.title (id, isbn, name, writer, publisher, year, weight, type, class, created_at, modified_at) FROM stdin;
d1111111-1111-1111-1111-111111111111	9789510000001	Suden ja Karhun Tarina	Mika Miettinen	Suomen Kustannus	2010	500	HARDCOVER	FICTION	2025-04-17 17:56:02.431017	2025-04-17 17:56:02.431017
d2222222-2222-2222-2222-222222222222	9789510000002	Kettu ja Rähmä	Laura Laine	Otava	2015	350	PAPERBACK	NONFICTION	2025-04-17 17:56:02.431017	2025-04-17 17:56:02.431017
d3333333-3333-3333-3333-333333333333	9789510000003	Taikojen Aika	Jussi Järvinen	WSOY	2018	400	CARTOON	COMIC	2025-04-17 17:56:02.431017	2025-04-17 17:56:02.431017
d4444444-4444-4444-4444-444444444444	9789510000004	Yön Salaisuudet	Anniina Aalto	Tammi	2020	450	HARDCOVER	OTHER	2025-04-17 17:56:02.431017	2025-04-17 17:56:02.431017
d5555555-5555-5555-5555-555555555555	9789510000005	Kesän Lumous	Kari Kallio	WSOY	2012	380	PAPERBACK	FICTION	2025-04-17 17:56:02.431017	2025-04-17 17:56:02.431017
d6666666-6666-6666-6666-666666666666	9789510000006	Talven Tarina	Sanna Salmi	Otava	2016	420	OTHER	NONFICTION	2025-04-17 17:56:02.431017	2025-04-17 17:56:02.431017
d7777777-7777-7777-7777-777777777777	9789510000007	Koodarin Kosto	Saku Salminen	Suomen Kustannus	2016	380	HARDCOVER	OTHER	2025-04-17 17:56:02.431017	2025-04-17 17:56:02.431017
d9999999-9999-9999-9999-999999999999	9789510000009	Yhden Rivin Elämä	Jussi Järvinen	WSOY	2020	190	CARTOON	COMIC	2025-04-17 17:56:02.431017	2025-04-17 17:56:02.431017
dd111111-1111-1111-1111-111111111111	9155430674	Elektran tytär	Madeleine Brent	Suomen Kustannus	1986	500	ROMANCE	NOVEL	2025-04-17 17:56:02.431017	2025-04-17 17:56:02.431017
dd222222-2222-2222-2222-222222222222	9156381451	Tuulentavoittelijan morsian	Madeleine Brent	Otava	1978	350	ROMANCE	NOVEL	2025-04-17 17:56:02.431017	2025-04-17 17:56:02.431017
dd333333-3333-3333-3333-333333333333	\N	Turms kuolematon	Mika Waltari	WSOY	1995	400	HISTORY	NOVEL	2025-04-17 17:56:02.431017	2025-04-17 17:56:02.431017
\.


--
-- Data for Name: admin; Type: TABLE DATA; Schema: public; Owner: ksmama
--

COPY public.admin (id, email, passwrd, is_central) FROM stdin;
0d3a69cb-8503-4189-b69c-79a94f543f90	central@admin.dev	$2b$10$Scez9yTsOHOd6099pYhyg.z6PECgrPtNVTOchPKQSbnIqis10LVEm	t
ef85c3cf-6421-426b-b7c0-b78a3232f5ca	external@admin.dev	$2b$10$YSzopzs5PwGmuZdJPNDhxOjyfNbdk0n3rVI2iva/sDs8kmFwd47CK	f
\.


--
-- Data for Name: admin_store; Type: TABLE DATA; Schema: public; Owner: ksmama
--

COPY public.admin_store (admin_id, store_id) FROM stdin;
ef85c3cf-6421-426b-b7c0-b78a3232f5ca	a1111111-1111-1111-1111-111111111111
ef85c3cf-6421-426b-b7c0-b78a3232f5ca	a2222222-2222-2222-2222-222222222222
\.


--
-- Data for Name: book; Type: TABLE DATA; Schema: public; Owner: ksmama
--

COPY public.book (id, title_id, purchase_id, store_id, condition, purchase_price, sale_price, status, created_at, modified_at) FROM stdin;
e2222222-2222-2222-2222-222222222222	d2222222-2222-2222-2222-222222222222	b2222222-2222-2222-2222-222222222222	a2222222-2222-2222-2222-222222222222	NEW	15.00	25.00	SOLD	2025-04-17 17:56:02.418422	2025-04-17 17:56:02.418422
e8888888-8888-8888-8888-888888888888	d7777777-7777-7777-7777-777777777777	\N	a2222222-2222-2222-2222-222222222222	NEW	25.00	35.00	AVAILABLE	2025-04-17 17:56:02.418422	2025-04-17 17:56:02.418422
e9999999-9999-9999-9999-999999999999	d8888888-8888-8888-8888-888888888888	\N	a2222222-2222-2222-2222-222222222222	GOOD	14.00	24.00	AVAILABLE	2025-04-17 17:56:02.418422	2025-04-17 17:56:02.418422
ebbfbfbf-bfbf-bfbf-bfbf-bfbfbfbfbfbf	d1111111-1111-1111-1111-111111111111	\N	a2222222-2222-2222-2222-222222222222	FAIR	13.00	23.00	AVAILABLE	2025-04-17 17:56:02.418422	2025-04-17 17:56:02.418422
ee444444-4444-4444-4444-444444444444	dd444444-4444-4444-4444-444444444444	\N	a2222222-2222-2222-2222-222222222222	GOOD	20.00	25.75	AVAILABLE	2025-04-17 17:56:02.418422	2025-04-17 17:56:02.418422
ee555555-5555-5555-5555-555555555555	dd555555-5555-5555-5555-555555555555	\N	a2222222-2222-2222-2222-222222222222	FAIR	2.90	9.00	AVAILABLE	2025-04-17 17:56:02.418422	2025-04-17 17:56:02.418422
ee666666-6666-6666-6666-666666666666	dd666666-6666-6666-6666-666666666666	\N	a2222222-2222-2222-2222-222222222222	POOR	10.00	14.50	AVAILABLE	2025-04-17 17:56:02.418422	2025-04-17 17:56:02.418422
e1111111-1111-1111-1111-111111111111	d1111111-1111-1111-1111-111111111111	b1111111-1111-1111-1111-111111111111	a1111111-1111-1111-1111-111111111111	GOOD	20.00	30.00	SOLD	2025-04-17 17:56:02.418422	2025-04-17 17:56:02.434091
e3333333-3333-3333-3333-333333333333	d3333333-3333-3333-3333-333333333333	\N	a1111111-1111-1111-1111-111111111111	FAIR	10.00	20.00	AVAILABLE	2025-04-17 17:56:02.418422	2025-04-17 17:56:02.434091
e4444444-4444-4444-4444-444444444444	d4444444-4444-4444-4444-444444444444	\N	a1111111-1111-1111-1111-111111111111	NEW	18.00	28.00	AVAILABLE	2025-04-17 17:56:02.418422	2025-04-17 17:56:02.434091
e6666666-6666-6666-6666-666666666666	d6666666-6666-6666-6666-666666666666	\N	a1111111-1111-1111-1111-111111111111	NEW	17.00	27.00	AVAILABLE	2025-04-17 17:56:02.418422	2025-04-17 17:56:02.434091
e7777777-7777-7777-7777-777777777777	d1111111-1111-1111-1111-111111111111	b1111111-1111-1111-1111-111111111111	a1111111-1111-1111-1111-111111111111	NEW	21.00	31.00	SOLD	2025-04-17 17:56:02.418422	2025-04-17 17:56:02.434091
eaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa	d9999999-9999-9999-9999-999999999999	\N	a1111111-1111-1111-1111-111111111111	FAIR	9.00	19.00	AVAILABLE	2025-04-17 17:56:02.418422	2025-04-17 17:56:02.434091
ed111111-1111-1111-1111-111111111111	d5555555-5555-5555-5555-555555555555	\N	a1111111-1111-1111-1111-111111111111	GOOD	11.00	21.00	AVAILABLE	2025-04-17 17:56:02.418422	2025-04-17 17:56:02.434091
ed222222-2222-2222-2222-222222222222	d2222222-2222-2222-2222-222222222222	\N	a1111111-1111-1111-1111-111111111111	POOR	8.00	15.00	AVAILABLE	2025-04-17 17:56:02.418422	2025-04-17 17:56:02.434091
ed444444-4444-4444-4444-444444444444	d4444444-4444-4444-4444-444444444444	b1111111-1111-1111-1111-111111111111	a1111111-1111-1111-1111-111111111111	NEW	19.00	29.00	SOLD	2025-04-17 17:56:02.418422	2025-04-17 17:56:02.434091
ed555555-5555-5555-5555-555555555555	d7777777-7777-7777-7777-777777777777	\N	a1111111-1111-1111-1111-111111111111	GOOD	20.00	30.00	AVAILABLE	2025-04-17 17:56:02.418422	2025-04-17 17:56:02.434091
ee111111-1111-1111-1111-111111111111	dd111111-1111-1111-1111-111111111111	\N	a1111111-1111-1111-1111-111111111111	GOOD	20.00	25.25	AVAILABLE	2025-04-17 17:56:02.418422	2025-04-17 17:56:02.434091
ee222222-2222-2222-2222-222222222222	dd222222-2222-2222-2222-222222222222	\N	a1111111-1111-1111-1111-111111111111	FAIR	20.00	29.00	AVAILABLE	2025-04-17 17:56:02.418422	2025-04-17 17:56:02.434091
ee333333-3333-3333-3333-333333333333	dd333333-3333-3333-3333-333333333333	\N	a1111111-1111-1111-1111-111111111111	NEW	20.00	31.50	AVAILABLE	2025-04-17 17:56:02.418422	2025-04-17 17:56:02.434091
e5555555-5555-5555-5555-555555555555	d5555555-5555-5555-5555-555555555555	\N	a2222222-2222-2222-2222-222222222222	POOR	12.00	22.00	AVAILABLE	2025-04-17 17:56:02.418422	2025-04-17 18:02:00.243616
ecccccce-cccc-cccc-cccc-cccccccccccc	d3333333-3333-3333-3333-333333333333	\N	a2222222-2222-2222-2222-222222222222	NEW	16.00	26.00	AVAILABLE	2025-04-17 17:56:02.418422	2025-04-17 18:02:00.243616
ed333333-3333-3333-3333-333333333333	d8888888-8888-8888-8888-888888888888	\N	a2222222-2222-2222-2222-222222222222	FAIR	12.00	20.00	AVAILABLE	2025-04-17 17:56:02.418422	2025-04-17 18:02:00.243616
\.


--
-- Data for Name: book_class; Type: TABLE DATA; Schema: public; Owner: ksmama
--

COPY public.book_class (name) FROM stdin;
FICTION
NONFICTION
COMIC
OTHER
NOVEL
\.


--
-- Data for Name: book_type; Type: TABLE DATA; Schema: public; Owner: ksmama
--

COPY public.book_type (name) FROM stdin;
HARDCOVER
PAPERBACK
CARTOON
OTHER
ROMANCE
HISTORY
CRIME
HUMOR
GUIDE
\.


--
-- Data for Name: customer; Type: TABLE DATA; Schema: public; Owner: ksmama
--

COPY public.customer (id, name, email, passwrd, phone, street_address, postcode, city, created_at, modified_at) FROM stdin;
11111111-1111-1111-1111-111111111111	Matti Meikäläinen	matti.meikalainen@example.com	salasana1	0401234567	Keskuskatu 1	100	Helsinki	2025-04-17 17:56:02.392417	2025-04-17 17:56:02.392417
22222222-2222-2222-2222-222222222222	Liisa Virtanen	liisa.virtanen@example.com	salasana2	0502345678	Mannerheimintie 10	100	Helsinki	2025-04-17 17:56:02.392417	2025-04-17 17:56:02.392417
33333333-3333-3333-3333-333333333333	Pekka Peloton	pekka.peloton@example.com	salasana3	0413456789	Aleksanterinkatu 5	100	Helsinki	2025-04-17 17:56:02.392417	2025-04-17 17:56:02.392417
44444444-4444-4444-4444-444444444444	Anna Aalto	anna.aalto@example.com	salasana4	0445566778	Puistokatu 3	90100	Oulu	2025-04-17 17:56:02.392417	2025-04-17 17:56:02.392417
55555555-5555-5555-5555-555555555555	Kari Kivinen	kari.kivinen@example.com	salasana5	0456677889	Torikatu 7	90100	Oulu	2025-04-17 17:56:02.392417	2025-04-17 17:56:02.392417
\.


--
-- Data for Name: purchase; Type: TABLE DATA; Schema: public; Owner: ksmama
--

COPY public.purchase (id, date, total_price, shipping_price, customer_id, created_at, modified_at) FROM stdin;
b1111111-1111-1111-1111-111111111111	2025-04-02 17:56:02.4109	90.00	10.00	11111111-1111-1111-1111-111111111111	2025-04-02 17:56:02.4109	2025-04-10 17:56:02.4109
b2222222-2222-2222-2222-222222222222	2025-04-07 17:56:02.4109	25.00	5.00	22222222-2222-2222-2222-222222222222	2025-04-07 17:56:02.4109	2025-04-15 17:56:02.4109
\.


--
-- Data for Name: shipment; Type: TABLE DATA; Schema: public; Owner: ksmama
--

COPY public.shipment (id, purchase_id, shipping_id, tracking_number, created_at, modified_at) FROM stdin;
f1111111-1111-1111-1111-111111111111	b1111111-1111-1111-1111-111111111111	1000	TRACK123456	2025-04-17 17:56:02.42439	2025-04-17 17:56:02.42439
f2222222-2222-2222-2222-222222222222	b2222222-2222-2222-2222-222222222222	250	TRACK654321	2025-04-17 17:56:02.42439	2025-04-17 17:56:02.42439
\.


--
-- Data for Name: shipment_item; Type: TABLE DATA; Schema: public; Owner: ksmama
--

COPY public.shipment_item (shipment_id, book_id) FROM stdin;
f1111111-1111-1111-1111-111111111111	e1111111-1111-1111-1111-111111111111
f1111111-1111-1111-1111-111111111111	e7777777-7777-7777-7777-777777777777
f1111111-1111-1111-1111-111111111111	ed444444-4444-4444-4444-444444444444
f2222222-2222-2222-2222-222222222222	e2222222-2222-2222-2222-222222222222
\.


--
-- Data for Name: shipping; Type: TABLE DATA; Schema: public; Owner: ksmama
--

COPY public.shipping (max_weight, price) FROM stdin;
50	2.50
250	5.00
1000	10.00
2000	15.00
\.


--
-- Data for Name: store; Type: TABLE DATA; Schema: public; Owner: ksmama
--

COPY public.store (id, name, street_address, postcode, city, email, phone_num, website, created_at, modified_at) FROM stdin;
a1111111-1111-1111-1111-111111111111	Lassen lehti	Keskuskatu 2	100	Helsinki	lassen@lehti.fi	0911122233	http://kirjakauppakeskus.fi	2025-04-17 17:56:02.408866	2025-04-17 17:56:02.408866
a2222222-2222-2222-2222-222222222222	Galleinn Galle	Itäkatu 5	200	Helsinki	galleinn@galle.fi	0911222333	http://kirjakauppaite.fi	2025-04-17 17:56:02.408866	2025-04-17 17:56:02.408866
\.


--
-- Data for Name: store_schema_mapping; Type: TABLE DATA; Schema: public; Owner: ksmama
--

COPY public.store_schema_mapping (store_id, schema_name) FROM stdin;
a1111111-1111-1111-1111-111111111111	d1_divari
\.


--
-- Data for Name: title; Type: TABLE DATA; Schema: public; Owner: ksmama
--

COPY public.title (id, isbn, name, writer, publisher, year, weight, type, class, created_at, modified_at) FROM stdin;
d8888888-8888-8888-8888-888888888888	\N	Tietokanta Tarinoita	Saku Salminen	Suomen Kustannus	2020	310	HARDCOVER	NONFICTION	2025-04-17 17:56:02.413402	2025-04-17 17:56:02.413402
dd444444-4444-4444-4444-444444444444	\N	Komisario Palmun erehdys	Mika Waltari	Tammi	1940	450	CRIME	NOVEL	2025-04-17 17:56:02.413402	2025-04-17 17:56:02.413402
dd555555-5555-5555-5555-555555555555	\N	Friikkilän pojat Mexicossa	Shelton Gilbert	WSOY	1989	380	HUMOR	COMIC	2025-04-17 17:56:02.413402	2025-04-17 17:56:02.413402
dd666666-6666-6666-6666-666666666666	9789510396230	Miten saan ystäviä, menestystä, vaikutusvaltaa	Dale Carnegien	Otava	1939	420	GUIDE	NONFICTION	2025-04-17 17:56:02.413402	2025-04-17 17:56:02.413402
d1111111-1111-1111-1111-111111111111	9789510000001	Suden ja Karhun Tarina	Mika Miettinen	Suomen Kustannus	2010	500	HARDCOVER	FICTION	2025-04-17 17:56:02.413402	2025-04-17 17:56:02.431017
d2222222-2222-2222-2222-222222222222	9789510000002	Kettu ja Rähmä	Laura Laine	Otava	2015	350	PAPERBACK	NONFICTION	2025-04-17 17:56:02.413402	2025-04-17 17:56:02.431017
d3333333-3333-3333-3333-333333333333	9789510000003	Taikojen Aika	Jussi Järvinen	WSOY	2018	400	CARTOON	COMIC	2025-04-17 17:56:02.413402	2025-04-17 17:56:02.431017
d4444444-4444-4444-4444-444444444444	9789510000004	Yön Salaisuudet	Anniina Aalto	Tammi	2020	450	HARDCOVER	OTHER	2025-04-17 17:56:02.413402	2025-04-17 17:56:02.431017
d5555555-5555-5555-5555-555555555555	9789510000005	Kesän Lumous	Kari Kallio	WSOY	2012	380	PAPERBACK	FICTION	2025-04-17 17:56:02.413402	2025-04-17 17:56:02.431017
d6666666-6666-6666-6666-666666666666	9789510000006	Talven Tarina	Sanna Salmi	Otava	2016	420	OTHER	NONFICTION	2025-04-17 17:56:02.413402	2025-04-17 17:56:02.431017
d7777777-7777-7777-7777-777777777777	9789510000007	Koodarin Kosto	Saku Salminen	Suomen Kustannus	2016	380	HARDCOVER	OTHER	2025-04-17 17:56:02.413402	2025-04-17 17:56:02.431017
d9999999-9999-9999-9999-999999999999	9789510000009	Yhden Rivin Elämä	Jussi Järvinen	WSOY	2020	190	CARTOON	COMIC	2025-04-17 17:56:02.413402	2025-04-17 17:56:02.431017
dd111111-1111-1111-1111-111111111111	9155430674	Elektran tytär	Madeleine Brent	Suomen Kustannus	1986	500	ROMANCE	NOVEL	2025-04-17 17:56:02.413402	2025-04-17 17:56:02.431017
dd222222-2222-2222-2222-222222222222	9156381451	Tuulentavoittelijan morsian	Madeleine Brent	Otava	1978	350	ROMANCE	NOVEL	2025-04-17 17:56:02.413402	2025-04-17 17:56:02.431017
dd333333-3333-3333-3333-333333333333	\N	Turms kuolematon	Mika Waltari	WSOY	1995	400	HISTORY	NOVEL	2025-04-17 17:56:02.413402	2025-04-17 17:56:02.431017
\.


--
-- Name: book_class book_class_name_key; Type: CONSTRAINT; Schema: d1_divari; Owner: ksmama
--

ALTER TABLE ONLY d1_divari.book_class
    ADD CONSTRAINT book_class_name_key UNIQUE (name);


--
-- Name: book book_pkey; Type: CONSTRAINT; Schema: d1_divari; Owner: ksmama
--

ALTER TABLE ONLY d1_divari.book
    ADD CONSTRAINT book_pkey PRIMARY KEY (id);


--
-- Name: book_type book_type_name_key; Type: CONSTRAINT; Schema: d1_divari; Owner: ksmama
--

ALTER TABLE ONLY d1_divari.book_type
    ADD CONSTRAINT book_type_name_key UNIQUE (name);


--
-- Name: title title_pkey; Type: CONSTRAINT; Schema: d1_divari; Owner: ksmama
--

ALTER TABLE ONLY d1_divari.title
    ADD CONSTRAINT title_pkey PRIMARY KEY (id);


--
-- Name: admin admin_pkey; Type: CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_pkey PRIMARY KEY (id);


--
-- Name: admin_store admin_store_pkey; Type: CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.admin_store
    ADD CONSTRAINT admin_store_pkey PRIMARY KEY (admin_id, store_id);


--
-- Name: book_class book_class_name_key; Type: CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.book_class
    ADD CONSTRAINT book_class_name_key UNIQUE (name);


--
-- Name: book book_pkey; Type: CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.book
    ADD CONSTRAINT book_pkey PRIMARY KEY (id);


--
-- Name: book_type book_type_name_key; Type: CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.book_type
    ADD CONSTRAINT book_type_name_key UNIQUE (name);


--
-- Name: customer customer_email_key; Type: CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_email_key UNIQUE (email);


--
-- Name: customer customer_pkey; Type: CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_pkey PRIMARY KEY (id);


--
-- Name: purchase purchase_pkey; Type: CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.purchase
    ADD CONSTRAINT purchase_pkey PRIMARY KEY (id);


--
-- Name: shipment_item shipment_item_pkey; Type: CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.shipment_item
    ADD CONSTRAINT shipment_item_pkey PRIMARY KEY (shipment_id, book_id);


--
-- Name: shipment shipment_pkey; Type: CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.shipment
    ADD CONSTRAINT shipment_pkey PRIMARY KEY (id);


--
-- Name: shipment shipment_tracking_number_key; Type: CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.shipment
    ADD CONSTRAINT shipment_tracking_number_key UNIQUE (tracking_number);


--
-- Name: shipping shipping_pkey; Type: CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.shipping
    ADD CONSTRAINT shipping_pkey PRIMARY KEY (max_weight);


--
-- Name: store store_pkey; Type: CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.store
    ADD CONSTRAINT store_pkey PRIMARY KEY (id);


--
-- Name: store_schema_mapping store_schema_mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.store_schema_mapping
    ADD CONSTRAINT store_schema_mapping_pkey PRIMARY KEY (store_id);


--
-- Name: store_schema_mapping store_schema_mapping_schema_name_key; Type: CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.store_schema_mapping
    ADD CONSTRAINT store_schema_mapping_schema_name_key UNIQUE (schema_name);


--
-- Name: title title_pkey; Type: CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.title
    ADD CONSTRAINT title_pkey PRIMARY KEY (id);


--
-- Name: idx_d1_reserved_books_modified_at; Type: INDEX; Schema: d1_divari; Owner: ksmama
--

CREATE INDEX idx_d1_reserved_books_modified_at ON d1_divari.book USING btree (modified_at) WHERE (status = 'RESERVED'::public.status_enum);


--
-- Name: idx_d1_reserved_books_modified_at; Type: INDEX; Schema: public; Owner: ksmama
--

CREATE INDEX idx_d1_reserved_books_modified_at ON public.book USING btree (modified_at) WHERE (status = 'RESERVED'::public.status_enum);


--
-- Name: book fk_book_title; Type: FK CONSTRAINT; Schema: d1_divari; Owner: ksmama
--

ALTER TABLE ONLY d1_divari.book
    ADD CONSTRAINT fk_book_title FOREIGN KEY (title_id) REFERENCES d1_divari.title(id) ON DELETE RESTRICT;


--
-- Name: title fk_class_id; Type: FK CONSTRAINT; Schema: d1_divari; Owner: ksmama
--

ALTER TABLE ONLY d1_divari.title
    ADD CONSTRAINT fk_class_id FOREIGN KEY (class) REFERENCES d1_divari.book_class(name) ON DELETE RESTRICT;


--
-- Name: title fk_type_id; Type: FK CONSTRAINT; Schema: d1_divari; Owner: ksmama
--

ALTER TABLE ONLY d1_divari.title
    ADD CONSTRAINT fk_type_id FOREIGN KEY (type) REFERENCES d1_divari.book_type(name) ON DELETE RESTRICT;


--
-- Name: admin_store fk_admin_store_admin; Type: FK CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.admin_store
    ADD CONSTRAINT fk_admin_store_admin FOREIGN KEY (admin_id) REFERENCES public.admin(id) ON DELETE CASCADE;


--
-- Name: admin_store fk_admin_store_store; Type: FK CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.admin_store
    ADD CONSTRAINT fk_admin_store_store FOREIGN KEY (store_id) REFERENCES public.store(id) ON DELETE CASCADE;


--
-- Name: book fk_book_purchase; Type: FK CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.book
    ADD CONSTRAINT fk_book_purchase FOREIGN KEY (purchase_id) REFERENCES public.purchase(id) ON DELETE SET NULL;


--
-- Name: book fk_book_store; Type: FK CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.book
    ADD CONSTRAINT fk_book_store FOREIGN KEY (store_id) REFERENCES public.store(id) ON DELETE CASCADE;


--
-- Name: book fk_book_title; Type: FK CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.book
    ADD CONSTRAINT fk_book_title FOREIGN KEY (title_id) REFERENCES public.title(id) ON DELETE RESTRICT;


--
-- Name: title fk_class; Type: FK CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.title
    ADD CONSTRAINT fk_class FOREIGN KEY (class) REFERENCES public.book_class(name) ON DELETE RESTRICT;


--
-- Name: purchase fk_purchase_customer; Type: FK CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.purchase
    ADD CONSTRAINT fk_purchase_customer FOREIGN KEY (customer_id) REFERENCES public.customer(id) ON DELETE CASCADE;


--
-- Name: shipment_item fk_shipment_item_book; Type: FK CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.shipment_item
    ADD CONSTRAINT fk_shipment_item_book FOREIGN KEY (book_id) REFERENCES public.book(id) ON DELETE RESTRICT;


--
-- Name: shipment_item fk_shipment_item_shipment; Type: FK CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.shipment_item
    ADD CONSTRAINT fk_shipment_item_shipment FOREIGN KEY (shipment_id) REFERENCES public.shipment(id) ON DELETE CASCADE;


--
-- Name: shipment fk_shipment_purchase; Type: FK CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.shipment
    ADD CONSTRAINT fk_shipment_purchase FOREIGN KEY (purchase_id) REFERENCES public.purchase(id) ON DELETE CASCADE;


--
-- Name: shipment fk_shipment_shipping; Type: FK CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.shipment
    ADD CONSTRAINT fk_shipment_shipping FOREIGN KEY (shipping_id) REFERENCES public.shipping(max_weight) ON DELETE RESTRICT;


--
-- Name: store_schema_mapping fk_store_id; Type: FK CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.store_schema_mapping
    ADD CONSTRAINT fk_store_id FOREIGN KEY (store_id) REFERENCES public.store(id) ON DELETE CASCADE;


--
-- Name: title fk_type; Type: FK CONSTRAINT; Schema: public; Owner: ksmama
--

ALTER TABLE ONLY public.title
    ADD CONSTRAINT fk_type FOREIGN KEY (type) REFERENCES public.book_type(name) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

