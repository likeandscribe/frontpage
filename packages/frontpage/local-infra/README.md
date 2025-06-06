# Frontpage Dev Environment

Docker compose file that runs the required peices of infrastructure for frontpage locally.

> [!NOTE]
> Does not include the frontpage service itself, you should run that with `pnpm turbo dev`

## What's inside

- ATProto [PLC server](https://github.com/did-method-plc/did-method-plc) (http://localhost:4000 & https://plc.dev.unravel.fyi)
- ATProto [PDS](https://github.com/bluesky-social/pds) (http://localhost:4001 & https://pds.dev.unravel.fyi)
- Jetstream (transforms the event stream from the PDS to JSON)
- [Drainpipe](../../../packages-rs/drainpipe/README.md) (pushes data from the Jetstream to the Frontpage Next.js app)
- Turso sqlite server (http://localhost:4002 && https://turso.dev.unravel.fyi)
- [Caddy](https://caddyserver.com/) reverse proxy (it provides the above services over HTTPS)
- [`cloudflared`](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/do-more-with-tunnels/trycloudflare/) (a public https tunnel to the local Frontpage Next.js app)

![Diagram of the local dev environment architecture](https://github.com/user-attachments/assets/720afae8-c9e8-4648-b22d-ae47daccb599)

## Setup

- `docker-compose up`
- Install the Unravel CA root certificate in your system's trust store. You can find it in the `frontpage-local-infra_caddy_data` volume at `/pki/authorities/unravel/root.crt` in your docker container volumes section.
  - Depending on your browser you may have to import the certificate into your browser profiles too as some have their own certs do not use your system ones
- Create a test account with `./scripts/create-test-account.sh <username>` (username=bob will create a user with handle bob.pds.unravel.dev.fyi)
- Run `pnpm --filter=frontpage run generate-local-env` and update the `packages/frontpage/.env.local` file with the generated values.
- Run `pnpm turbo dev` in the frontpage package folder
- Run `pnpm run db:migrate` in the frontpage package folder
- Grab the auto generated `cloudflared` tunnel URL from the logs of the `cloudflared` container, use this to access the Frontpage dev server
- Go about your business

> [!IMPORTANT]
> When running Node.js based apps make sure you're setting the `NODE_OPTIONS` environment variable to `--use-openssl-ca` to tell Node.js to use the system's trust store. The scripts inside of Frontpage's `package.json` already do this for you.
>
> Also, make sure you stop your docker container when you are done, as Cloudflare exposes port 3000 to the internet.

### Using atproto-browser

You can run a local instance of atproto-browser using this infrastructure. Create `packages/atproto-browser/local.env` and add the following:

```env
PLC_URL=http://localhost:4000
NODE_OPTIONS=--use-openssl-ca
```

Then when you `pnpm turbo dev --filter=atproto-browser` it will use the local PLC and be able to connect to the local PDS instances.

## Troubleshooting

### `docker-compose up` fails with `failed to solve: error from sender: open ~/unravel/packages/frontpage/local-infra/plc/db: permission denied`

Delete the ./plc directory and try again.

TODO: This can probably be fixed by using named volumes instead of bind mounts.

### `docker-compose up` fails with `no match for platform in manifest: not found`

On Mac: `export DOCKER_DEFAULT_PLATFORM=linux/amd64`

### Invalid SSL certificates on pds/plc (dev.unravel.fyi) where it was working before

This can happen when the cert expires and Caddy needs to regenerate a new one. Check the logs, if there are no related errors then often a restart of caddy will fix it:

```
docker-compose restart caddy
```

### 502 Bad Gateway error on the Cloudflare tunnel

Check your next.js dev server is running on port 3000.

On windows this can happen after an update. Try running the following in an admin powershell after quitting docker and anything using WSL:

```powershell
wsl --shutdown
netsh int ip reset all
```

Then restart your machine and try again.
