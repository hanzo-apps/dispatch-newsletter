# Agent guide

Canonical instructions for this repo live in [`LLM.md`](./LLM.md) (and its
`CLAUDE.md` symlink). Read it before changing anything.

TL;DR: Dispatch — a newsletter archive + subscribe. Vite + React 19 +
`@hanzo/gui` + `@hanzo/iam` + `@hanzo/base`. Keep it minimal and real.
`@hanzo/gui` needs the react-native-web alias + Tamagui defines in
`vite.config.ts` and uses Tamagui LONGHAND props (tsc enforces this); `Button`
takes no text props (style the label via a `<SizableText>` child). `schema.sql`
(`issues` + `subscribers`) is the Base data contract. Prove changes with
`npm run build` (tsc + vite). Never build a container image locally — Hanzo
Cloud owns deploys.
