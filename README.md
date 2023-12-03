# Full stack AI

Build a full stack Next.js app with an AI prompt.

Example:

```bash
pnpm i -g @alephmatic/kirimase
pnpm i -g @alephmatic/full-stack-ai
export OPENAI_API_KEY=...
fsai gen "Build a clone of Twitter called Warpcast where people cast instead of tweet. Use GitHub for log in."
```

Under the hood this project uses [Kirimase](https://github.com/nicoalbanese/kirimase).

## Run locally

```bash
pnpm i -g @alephmatic/kirimase
pnpm i
export OPENAI_API_KEY=...
npx tsx src/index.ts gen "Build a clone of Twitter called Warpcast where people cast instead of tweet. Use GitHub for log in."
```
