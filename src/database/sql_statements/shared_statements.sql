-- shared statements

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
