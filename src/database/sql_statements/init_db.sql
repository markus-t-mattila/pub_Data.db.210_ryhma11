CREATE DATABASE central_divari;

CREATE USER divari_user WITH PASSWORD 'password';

GRANT ALL PRIVILEGES ON DATABASE central_divari TO divari_user;

ALTER USER divari_user WITH CREATEDB;

\c central_divari;

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