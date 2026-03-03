-- Core entities
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workers (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by BIGINT NOT NULL REFERENCES users(id),
  updated_by BIGINT NOT NULL REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS cases (
  id BIGSERIAL PRIMARY KEY,
  worker_id BIGINT NOT NULL REFERENCES workers(id),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by BIGINT NOT NULL REFERENCES users(id),
  updated_by BIGINT NOT NULL REFERENCES users(id)
);

-- Keep updated_at in sync on row updates.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS workers_set_updated_at ON workers;
CREATE TRIGGER workers_set_updated_at
BEFORE UPDATE ON workers
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS cases_set_updated_at ON cases;
CREATE TRIGGER cases_set_updated_at
BEFORE UPDATE ON cases
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
