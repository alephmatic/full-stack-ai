import "dotenv/config";
import consola from "consola";
import OpenAI from "openai";
import { getActions } from "./actions";

export async function generateCode(prompt: string) {
  consola.log("Generating code with AI...");

  const openai = new OpenAI();

  const runner = openai.beta.chat.completions
    .runFunctions({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: `You are an AI that builds full-stack apps for users.
You are able to call functions to build the app.
Build what you can with the functions.
After you've done your work scafolding the app as much as you can, the user will take over and complete the work.`,
        },
        { role: "user", content: prompt },
      ],
      functions: Object.values(getActions()),
      temperature: 0,
      frequency_penalty: 0,
    })
    .on("message", (message) => {
      consola.log("> message", message);
    });

  const finalContent = await runner.finalContent();

  consola.log("> finalContent", finalContent);
  consola.log("Done");
}
