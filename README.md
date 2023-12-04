# Full stack AI

Build a full stack Next.js app from an AI prompt.

Example:

```bash
export OPENAI_API_KEY=...
npx fsai gen "Build a clone of Twitter called StackPrompt where people prompt instead of tweet. Allow users to follow one another and to like prompts. Use GitHub for log in. Charge users a monthly fee for premium functionality."
```

Then `cd` into the newly created app folder, set the environment variables and in the `.env` file and run `npm run dev` to see your app live in the browser at [http://localhost:3000](http://localhost:3000).

You can install the package globally and run as follows:

```bash
pnpm i -g fsai
export OPENAI_API_KEY=...
fsai gen "Build a clone of Twitter called StackPrompt where people prompt instead of tweet. Allow users to follow one another and to like prompts. Use GitHub for log in. Charge users a monthly fee for premium functionality."
```

Under the hood this project uses [Kirimase](https://github.com/nicoalbanese/kirimase).

## Run locally

```bash
pnpm i
export OPENAI_API_KEY=...
npx tsx src/index.ts gen "Build a clone of Twitter called StackPrompt where people prompt instead of tweet. Allow users to follow one another and to like prompts. Use GitHub for log in. Charge users a monthly fee for premium functionality."
```
