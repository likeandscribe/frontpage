# frontpage-atproto-client

Generated schemas and API clients for the Frontpage lexicon.

## Building

After an update to a lexicon (in the root of this monorepo) run:

```sh
pnpm exec lex gen-api ./src ../../lexicons/**/*.json && pnpm run format:write
```

Note: This requires a shell with glob support.

## Fetching latest lexicons

This is not needed often, only when the dependent lexicons are updated.

```sh
pnpm run fetch-lexicons
```
