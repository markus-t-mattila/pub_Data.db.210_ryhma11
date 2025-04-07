CREATE DATABASE central_divari;

CREATE USER divari_user WITH PASSWORD 'password';

GRANT ALL PRIVILEGES ON DATABASE central_divari TO divari_user;

ALTER USER divari_user WITH CREATEDB;

\c central_divari;

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


CREATE SCHEMA d1_divari;

\i ./src/database/sql_statements/shared_statements.sql;

\i ./src/database/sql_statements/central_creation_statements.sql;

\i ./src/database/sql_statements/external_creation_statements.sql;

\i ./src/database/sql_statements/dummy_data.sql;

GRANT ALL PRIVILEGES ON DATABASE central_divari TO divari_user;
GRANT ALL PRIVILEGES ON SCHEMA d1_divari, public TO divari_user;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA d1_divari, public TO divari_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA d1_divari, public TO divari_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA d1_divari, public TO divari_user;