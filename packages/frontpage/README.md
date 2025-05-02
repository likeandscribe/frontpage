# frontpage

Frontpage AppView and frontend client.

## Running locally

Run dependent services by following the instructions in [./local-infra/README.md](./local-infra/README.md).

```bash
pnpm exec turbo dev
```

<details>

<summary>Guide for running against production database for Frontpage team members</summary>

Install 1Password and the 1Password CLI. This will allow you to use the `.env.1pw` env file.

Run Next.js pointing at this env file with `pnpm run dev-1pw`.

You may need to run `op signin` beforehand, although on most systems the CLI should be integrated with your shell and pop up a sign-in window automatically when running `dev-1pw`.

</details>
