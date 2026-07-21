# dispatch-newsletter — agent notes

Dispatch — a newsletter archive + subscribe on Hanzo, forked from the canonical
`hanzo-starter`. Vite + React 19 + `@hanzo/gui` (UI) + `@hanzo/iam` (auth) +
`@hanzo/base` (data). Keep it minimal and REAL — every surface must build and
run, no fabricated UI.

## The app

- Three views: **Landing** (public masthead + subscribe), **Archive → Issue**
  (signed-in reading), **Studio** (signed-in compose + subscriber list).
- Two Base collections from `schema.sql`: `issues`
  (subject/preview/body/sent_at/published) and `subscribers`
  (email/name/subscribed_at/status).
- Design: newsprint minimalism — off-white paper, one hairline ink rule under
  the wordmark, a single narrow column (`measure` = 640), a boxed subscribe field
  with a solid black button. The palette lives in ONE place, `src/theme.ts`, and
  is passed as explicit color values to `@hanzo/gui` primitives.

## One way, decomplected

- **Providers** (`src/providers.tsx`) mount in the canonical order:
  `GuiProvider` → `IamProvider` → `BaseProvider`. `BaseProvider` gets a
  `BaseClient` carrying the IAM access token, rebuilt when the token changes
  (`src/lib/base.ts` `baseAs`). That single seam makes every
  `useQuery`/`useMutation` org-scoped to the signed-in user.
- **Env is one place** (`src/env.ts`). Client id reads
  `import.meta.env.VITE_IAM_CLIENT_ID` (fallback `hanzo-app`).
- **Palette is one place** (`src/theme.ts`). **UI is one system** — `@hanzo/gui`
  primitives only (no second kit, no Tailwind).
- **Subscribe is one flow**: the landing stashes the email in `localStorage`
  (`PENDING_KEY`) and starts PKCE; `shell.tsx` finalizes it into a `subscribers`
  row on return (a `useRef` guard + immediate `removeItem` claim it once, so
  StrictMode's double-invoke can't create a duplicate).

## Gotchas (do not regress)

- **`@hanzo/gui` under Vite** needs three things in `vite.config.ts` (it is the
  Tamagui line): (1) alias `react-native` → `react-native-web`, (2) `define`
  `process.env.TAMAGUI_TARGET` / `NODE_ENV` / `__DEV__`, (3) `dedupe`
  react/react-dom/react-native-web. No Tamagui compiler, no `one`, no Expo.
- **`@hanzo/gui` props are Tamagui LONGHAND**: `alignItems`/`justifyContent`/
  `backgroundColor`/`padding`/`alignSelf`/`borderRadius`/`textAlign` — NOT the
  `items`/`justify`/`bg`/`p`/`self`/`rounded`/`text` shorthands. Shorthands pass
  at runtime but FAIL `tsc`. `Button` uses `onPress`; `Input`/`TextArea` use
  `value`/`onChangeText`.
- **`Button` is a Stack frame** — it does NOT accept text props (`color`/
  `fontSize`/`fontWeight`). Style the label with a `<SizableText>` child; set the
  fill via `backgroundColor` on the Button. **`TextArea` rejects `lineHeight`**
  (use `fontSize`/`padding`/`minHeight`).
- **PKCE storage is `localStorage`** so the verifier/state survive the round-trip
  to hanzo.id.
- **`schema.sql` is the data contract** (`databaseSchema` → `provisionBaseFromDDL`
  → Base collections). Keep it in lockstep with `archive.tsx`/`issue.tsx`/
  `studio.tsx`.

## Deploy contract (Hanzo Cloud)

- Static SPA: `npm run build` → `dist/`, served at `<slug>.hanzo.app`. No server.
- On publish, `schema.sql` → `provisionBaseFromDDL` creates the collections
  (org-scoped, IAM-native, rule effectively `@request.auth.org_id = org`).
- **IAM redirect registration** is the one external requirement: the IAM client
  (`VITE_IAM_CLIENT_ID`, default `hanzo-app`) must allow this origin's
  `/auth/callback` (per-app `hanzo-dispatch` client provisioned at deploy, or a
  `https://*.hanzo.app/auth/callback` wildcard on the shared client).

## Build

CI (`.github/workflows/ci.yml`) runs `npm ci && npm run typecheck && npm run
build` — build-verification only, NEVER a container image (Hanzo Cloud owns
deploys; do not build images locally).
