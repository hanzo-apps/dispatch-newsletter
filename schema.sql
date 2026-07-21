-- Dispatch — Hanzo Base schema (the `databaseSchema` DDL).
--
-- On publish, Hanzo Cloud translates each CREATE TABLE into a Hanzo Base
-- collection via `provisionBaseFromDDL` (additive + idempotent). Base manages
-- `id`/`created`/`updated`/`owner`/`org` itself, so they are never re-declared
-- here; every row is stamped with the verified IAM `owner`+`org` and is
-- org-scoped — the collection rule is effectively `@request.auth.org_id = org`,
-- so a member of your org reads/writes it and other orgs cannot see it.
--
-- Keep this file in lockstep with what the app reads/writes
-- (src/views/archive.tsx, issue.tsx, studio.tsx).

-- Published + draft issues. The archive lists `published = true` newest-first;
-- the composer in Studio creates rows and stamps `sent_at` on publish.
CREATE TABLE IF NOT EXISTS issues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject   TEXT    NOT NULL,
  preview   TEXT    NOT NULL DEFAULT '',
  body      TEXT    NOT NULL DEFAULT '',
  sent_at   TEXT    NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT FALSE
);

-- The mailing list. A reader who subscribes from the public masthead is signed
-- in with Hanzo and recorded here; the author also adds subscribers from Studio.
CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL,
  name          TEXT NOT NULL DEFAULT '',
  subscribed_at TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'active'
);
