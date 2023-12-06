import consola from "consola";
import { execa } from "execa";
import { RunnableFunctionWithParse } from "openai/lib/RunnableFunction";
import {
  GenerateOptions,
  InitOptions,
  ZodCreateNextApp,
  createNextAppJsonSchema,
  drizzlePrismaFieldMapping,
  generateJsonSchema,
  initJsonSchema,
  zodCreateNextApp,
  zodGenerate,
  zodInit,
} from "./types";
import { JSONSchema } from "openai/lib/jsonschema.mjs";

let appName: string;
let orm: "prisma" | "drizzle";

async function createNextApp(args: ZodCreateNextApp) {
  appName = args.appName.toLowerCase().replace(" ", "-");
  consola.log("Creating Next.js app", appName, "in", process.cwd());

  try {
    const { stdout, stderr } = await execa(
      "npx",
      [
        "create-next-app@latest",
        appName,
        "--typescript",
        "--eslint",
        "--use-pnpm",
        "--tailwind",
        "--app",
        "--no-src-dir",
        "--import-alias",
        "@/*",
      ],
      {
        stdio: "inherit",
      }
    );

    stdout && consola.log(stdout);
    stderr && consola.error(stderr);

    consola.log("Created Next.js app");
  } catch (error) {
    consola.error("Error creating Next.js app:", error);
    throw error;
  }
}

async function kirimaseInit(options: InitOptions) {
  const { authType, authProviders, miscPackages, db } = options;
  orm = options.orm;

  consola.log("Running Kirimase init");

  try {
    const { stdout, stderr } = await execa(
      "npx",
      [
        "@alephmatic/kirimase@latest",
        "init",
        "--has-src-folder",
        "false",
        "--package-manager",
        "pnpm",
        "--component-lib",
        "shadcn-ui",
        "--orm",
        orm,
        "--db",
        db,
        "--include-example",
        "false",
        "--auth",
        authType,
        "--auth-providers",
        ...authProviders,
        "--misc-packages",
        "trpc", // force trpc for now so we can use views
        ...miscPackages,
      ],
      {
        stdio: "inherit",
        cwd: `./${appName}`,
      }
    );

    stdout && consola.log(stdout);
    stderr && consola.error(stderr);

    consola.log("Completed Kirimase init");
  } catch (error) {
    consola.error("Error for kirimase init:", error);
    throw error;
  }
}

async function kirimaseGenerate(options: GenerateOptions) {
  const { table, belongsToUser, index } = options;
  const resourceTypes = ["model", "trpc_route", "views_and_components"];

  console.log("!!!!🚀 ~ file: actions.ts:109 ~ kirimaseGenerate ~ orm:", orm)
  const fields =
    orm === "drizzle"
      ? options.fields
      : options.fields.map((field) => {
          return {
            ...field,
            type: drizzlePrismaFieldMapping[field.type],
          };
        });

  consola.log("Running Kirimase generate");

  try {
    const { stdout, stderr } = await execa(
      "npx",
      [
        "@alephmatic/kirimase@latest",
        "generate",
        "--resourceTypes",
        resourceTypes.join(","),
        "--table",
        table,
        "--fields",
        JSON.stringify(fields),
        "--belongsToUser",
        belongsToUser ? "yes" : "no",
        "--index",
        index || "",
      ],
      {
        stdio: "inherit",
        cwd: `./${appName}`,
      }
    );

    stdout && consola.log(stdout);
    stderr && consola.error(stderr);

    consola.log("Completed Kirimase generate");
  } catch (error) {
    consola.error("Error for kirimase generate:", error);
    throw error;
  }
}

export function getActions() {
  const actions: Record<string, RunnableFunctionWithParse<any>> = {
    createNextApp: {
      function: async (args: ZodCreateNextApp) => {
        try {
          await createNextApp(args);
          return { success: true };
        } catch (error) {
          consola.error(
            "Error createNextApp app.",
            "Args:",
            JSON.stringify(args, null, 2),
            "Error:",
            error
          );
          throw error;
        }
      },
      name: "createNextApp",
      description: "Create a Next.js app with TypeScript and Tailwind CSS.",
      parse: (args: string) => zodCreateNextApp.parse(JSON.parse(args)),
      parameters: createNextAppJsonSchema as JSONSchema,
    },
    kirimaseInit: {
      function: async (args: InitOptions) => {
        try {
          await kirimaseInit(args);
          return { success: true };
        } catch (error) {
          consola.error(
            "Error kirimaseInit app.",
            "Args:",
            JSON.stringify(args, null, 2),
            "Error:",
            error
          );
          throw error;
        }
      },
      name: "kirimaseInit",
      description:
        "Initialize Kirimase. Must be run before using kirimaseGenerate. This adds authentication, shadcn/ui components and other functionality to the project.",
      parse: (args: string) => zodInit.parse(JSON.parse(args)),
      parameters: initJsonSchema as JSONSchema,
    },
    kirimaseGenerate: {
      function: async (args: GenerateOptions) => {
        try {
          await kirimaseGenerate(args);
          return { success: true };
        } catch (error) {
          consola.error(
            "Error kirimaseGenerate.",
            "Args:",
            JSON.stringify(args, null, 2),
            "Error:",
            error
          );
          throw error;
        }
      },
      name: "kirimaseGenerate",
      description: "Generate models, api routes, and views with Kirimase.",
      parse: (args: string) => zodGenerate.parse(JSON.parse(args)),
      parameters: generateJsonSchema as JSONSchema,
    },
  };

  return actions;
}
