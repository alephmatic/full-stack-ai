# Full stack AI

Build a full stack Next.js app with a prompt.

Example:

```bash
export OPENAI_API_KEY=...
fasi gen "Build a clone of Twitter called Warpcast where people cast instead of tweet. Use GitHub for log in."
```

Under the hood this project uses [Kirimase](https://github.com/nicoalbanese/kirimase).

## Run locally

```bash
pnpm i
# set OPENAI_API_KEY in .env
npx tsx src/index.ts gen "Build a clone of Twitter called Warpcast where people cast instead of tweet. Use GitHub for log in."
```
