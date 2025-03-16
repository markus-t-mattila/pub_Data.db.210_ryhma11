CREATE DATABASE central_divari;

CREATE USER divari_user WITH PASSWORD 'password';

GRANT ALL PRIVILEGES ON DATABASE central_divari TO divari_user;

\c central_divari;

ALTER USER divari_user WITH CREATEDB;

\i ./src/database/db_creation_statements.sql;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO divari_user;

\i ./src/database/dummy_data.sql;