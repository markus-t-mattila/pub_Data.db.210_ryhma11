-- shared statements

-- ei oikeutta käyttää tie-kannat palvelussa :(
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
