# Dispatch — Newsletter Archive & Signup

A real, buildable Hanzo app: a public newsletter **archive** with a **subscribe**
capture, and a signed-in **Studio** where the author drafts, publishes, and reads
the list. Fork it on [hanzo.app](https://hanzo.app) and deploy live on Hanzo Cloud.

> Every issue, kept forever.

- **UI** — [`@hanzo/gui`](https://www.npmjs.com/package/@hanzo/gui) (the Hanzo
  design system) under Vite + React 19. Newsprint minimalism: off-white paper, a
  thin rule under the wordmark, one narrow column, a boxed subscribe field with a
  solid black button. No Tailwind, no second kit.
- **Auth** — [`@hanzo/iam`](https://www.npmjs.com/package/@hanzo/iam), OAuth2
  **PKCE** against [hanzo.id](https://hanzo.id). No local passwords — IAM owns
  every credential interaction.
- **Data** — [`@hanzo/base`](https://www.npmjs.com/package/@hanzo/base), the
  IAM-native, org-scoped data plane. `issues` and `subscribers` are real Base
  collections provisioned from [`schema.sql`](./schema.sql).

## The three views

| View | Who | What |
| --- | --- | --- |
| **Masthead** | public | Wordmark, tagline, and a subscribe box. Subscribing (or "open the archive") starts a Hanzo sign-in. |
| **Archive → Issue** | signed in | Every published issue newest-first; open one to read it in a single column. |
| **Studio** | signed in | Compose an issue (draft or publish), and read the subscriber list. |

Because Base is IAM-native and org-scoped, reading the archive and joining the
list both run on a Hanzo identity. A visitor who subscribes from the masthead is
signed in with Hanzo and recorded as a `subscribers` row on return — the public
masthead is the honest pre-auth surface.

## Stack (pinned)

| Package | Version |
| --- | --- |
| `react` / `react-dom` | `^19.2.4` |
| `@hanzo/gui` + `@hanzogui/config` | `7.3.0` |
| `@hanzo/iam` | `^0.13.1` |
| `@hanzo/base` | `^0.2.1` |
| `vite` | `^6` (`@vitejs/plugin-react`) |
| `typescript` | `5.9.3` |

## Run it

```sh
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc --noEmit && vite build  ->  dist/
npm run preview    # serve the production build (SPA fallback on)
```

Out of the box it runs against **live** Hanzo (hanzo.id + api.hanzo.ai) — no
config needed to see the masthead + sign-in flow. Copy `.env.example` to `.env`
to point at a different environment.

## Environment contract

Only `VITE_`-prefixed vars reach the browser (this is a static SPA — there is no
server). Defaults in parentheses.

| Var | Purpose |
| --- | --- |
| `VITE_HANZO_IAM_URL` (`https://hanzo.id`) | OIDC issuer. |
| `VITE_IAM_CLIENT_ID` (`hanzo-app`) | IAM application (`<org>-<app>`). Its redirect-URI list must allow this deploy's `/auth/callback` — see **Ambient IAM**. |
| `VITE_HANZO_REDIRECT_URI` (`${origin}/auth/callback`) | PKCE redirect. |
| `VITE_HANZO_BASE_URL` (`https://api.hanzo.ai`) | Browser-reachable Hanzo Base data plane. Deploy injects the provisioned URL. |

## How auth works — ambient IAM

`login()` starts an OAuth2 **PKCE S256** redirect to hanzo.id; hanzo.id returns
to `/auth/callback`, where `handleCallback()` exchanges the code for tokens
(stored in `localStorage`, refresh-aware via `offline_access`). Every deployed
app is a static site at `<slug>.hanzo.app`; there is **no server token** — the
SPA authenticates the user in the browser and carries the resulting IAM JWT to
Base. "Ambient" means the app just reads the signed-in user via that token.

The one deploy requirement: the IAM client (`VITE_IAM_CLIENT_ID`) must list this
origin's `/auth/callback` as an allowed redirect URI. A per-app `hanzo-dispatch`
client is provisioned at deploy (or use a `https://*.hanzo.app/auth/callback`
wildcard on the shared client).

## How data works — Base from `schema.sql`

[`schema.sql`](./schema.sql) is the app's `databaseSchema` (SQL DDL). On publish,
Hanzo Cloud translates each `CREATE TABLE` into a Hanzo Base collection
(`provisionBaseFromDDL`, additive + idempotent). Base manages
`id`/`created`/`updated`/`owner`/`org`, stamps `owner`+`org` from the verified
IAM principal, and scopes every row to the caller's org (rule effectively
`@request.auth.org_id = org`). At runtime the views read/write those collections
through `@hanzo/base/react` (`useQuery`/`useMutation`) carrying the IAM token.

- `issues` — `subject`, `preview`, `body`, `sent_at`, `published`.
- `subscribers` — `email`, `name`, `subscribed_at`, `status`.

## Deploy — Hanzo Cloud

[`hanzo.yml`](./hanzo.yml) declares a static build (`npm run build` → `dist/`,
served at `<slug>.hanzo.app`) plus the Base schema to provision and the env to
inject. Do **not** build a container image locally — Hanzo Cloud owns builds and
deploys. CI here only proves the template compiles green.

## Layout

```
src/
  main.tsx          entry
  providers.tsx     GuiProvider -> IamProvider -> BaseProvider(client=IAM-token)
  app.tsx           route (/auth/callback) + auth gate
  theme.ts          the newsprint palette, one place
  gui.config.ts     createGui(defaultConfig from @hanzogui/config/v5)
  iam.config.ts     IAM PKCE config
  env.ts            the VITE_ env contract, one place
  lib/base.ts       BaseClient carrying the IAM bearer token
  lib/types.ts      Issue + Subscriber record shapes
  lib/date.ts       newsprint dateline formatter
  auth/callback.tsx PKCE return leg
  views/
    landing.tsx     public masthead + subscribe (pre-auth)
    shell.tsx       signed-in masthead nav + pending-subscribe finalize
    archive.tsx     published issues, newest first
    issue.tsx       one issue, single column
    studio.tsx      compose issue + subscriber list
schema.sql          databaseSchema -> Base collections on publish
hanzo.yml           Hanzo Cloud build/deploy manifest
```
