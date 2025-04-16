# frontpage

Frontpage AppView and frontend client.

## Running locally

If you just need to work on the app in a logged-out state, then you just need to run the following:

```bash
# Build all local dependencies, only needs to be done once until you change the code in one of the packages
pnpm exec turbo run build --filter=frontpage... --filter=!frontpage
# Start the dev server
pnpm run dev
```

If you need to login, you need to setup some additional env vars and serve your dev server over the public internet. You can do this with `cloudflared` although other options are available eg. `ngrok` or `tailscale`:

```bash
pnpm exec tsx ./scripts/generate-jwk.mts # Copy this output into .env.local
```

You'll now need to follow the documentation [here](https://github.com/likeandscribe/frontpage/blob/main/packages/frontpage/local-infra/README.md)
