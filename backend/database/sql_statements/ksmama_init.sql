-- Käytetään pelkästään roolia ksmama, joten ei luoda erillistä käyttäjää
-- CREATE USER divari_user WITH PASSWORD 'password';
-- GRANT ALL PRIVILEGES ON DATABASE ksmama TO divari_user;

\c ksmama;

-- luodaan oma uuid
CREATE OR REPLACE FUNCTION uuid_generate_v4() RETURNS uuid AS $$
  SELECT (
    lpad(to_hex((random()*4294967295)::bigint), 8, '0') || '-' ||
    lpad(to_hex((random()*65535)::bigint), 4, '0') || '-' ||
    lpad(to_hex((floor(random()*4096)::bigint) + 16384), 4, '0') || '-' ||
    lpad(to_hex((floor(random()*16384)::bigint) + 32768), 4, '0') || '-' ||
    lpad(to_hex((random()*281474976710655)::bigint), 12, '0')
  )::uuid;
$$ LANGUAGE SQL IMMUTABLE;

-- Suoritetaan taulujen ja muiden objektien luontikomennot
CREATE SCHEMA d1_divari;

\i /home/ksmama/Data.db.210_ryhma11/backend/database/sql_statements/shared_statements.sql;

\i /home/ksmama/Data.db.210_ryhma11/backend/database/sql_statements/central_creation_statements.sql;

\i /home/ksmama/Data.db.210_ryhma11/backend/database/sql_statements/external_creation_statements.sql;



-- (Tarvittaessa) Myönnetään kaikki oikeudet kaikille tauluille public-skeemassa nykyiselle roolille
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ksmama;

-- Ladataan dummy-data
\i /home/ksmama/Data.db.210_ryhma11/backend/database/sql_statements/dummy_data.sql;