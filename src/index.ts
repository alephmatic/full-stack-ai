import "dotenv/config";
import { Command } from "commander";
import { generateCode } from "./ai";

const program = new Command();

program
  .command("gen <prompt>")
  .description("Generate a full-stack app.")
  .action(generateCode);

program.parse(process.argv);

// so it can be used as a package too
export { generateCode };
export * from "./types";
