# frontpage

Frontpage AppView and frontend client.

## Running locally

If you just need to work on the app in a logged-out state, then you can run the following:

```bash
pnpm exec turbo dev
```

If you need to login, you need to setup some additional env vars and serve your dev server over the public internet. You can do this with `cloudflared` although other options are available eg. `ngrok` or `tailscale`:

```bash
pnpm exec tsx ./scripts/generate-jwk.mts # Copy this output into .env.local
```

This requires some extra infrastructure though (eg. a database) and will connect to the public/production atproto network. You can spin up an entirely local environment of the whole stack by following the documentation [here](./local-infra/README.md).
