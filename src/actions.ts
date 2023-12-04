import { execa } from "execa";
import consola from "consola";
import { z } from "zod";
import { RunnableFunctionWithParse } from "openai/lib/RunnableFunction";
import { AuthProvider, MiscPackage, ResourceType, DBField } from "./types";

let appName: string;

async function createNextApp(appName_: string) {
  appName = appName_.toLowerCase().replace(" ", "-");
  consola.log("Creating Next.js app in", process.cwd());

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

async function kirimaseInit({
  authProviders,
  miscPackages,
}: {
  authProviders: AuthProvider[];
  miscPackages: MiscPackage[];
}) {
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
        "prisma",
        "--db",
        "pg",
        "--include-example",
        "false",
        "--auth",
        "next-auth",
        "--auth-providers",
        ...authProviders,
        "--misc-packages",
        "trpc", // force trpc for now
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

async function kirimaseGenerate(options: {
  resourceTypes: ResourceType[];
  table: string;
  belongsToUser: boolean;
  index?: string;
  fields: DBField[];
}) {
  const { resourceTypes, table, belongsToUser, index, fields } = options;

  consola.log("Running Kirimase generate", JSON.stringify(options, null, 2));

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

export function getActions(): Record<string, RunnableFunctionWithParse<any>> {
  const actions = {
    createNextApp: {
      function: async (args: { appName: string }) => {
        await createNextApp(args.appName);
        return { success: true };
      },
      name: "createNextApp",
      description: "Create a Next.js app with TypeScript and Tailwind CSS.",
      parse: (args: string) => {
        return z
          .object({
            appName: z.string(),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          appName: {
            type: "string",
            description: "The name of the Next.js app.",
          },
        },
        required: ["appName"],
      },
    },
    kirimaseInit: {
      function: async (args: {
        authProviders: AuthProvider[];
        miscPackages: MiscPackage[];
      }) => {
        await kirimaseInit(args);
        return { success: true };
      },
      name: "kirimaseInit",
      description:
        "Initialize Kirimase. Must be run before using kirimaseGenerate. This adds NextAuth.js, Prisma, and PostgreSQL to the project. It sets up the core of prisma.schema with the models needed for authentication. It adds shadcn/ui component library.",
      parse: (args: string) => {
        return z
          .object({
            authProviders: z.array(
              z.enum(["discord", "google", "github", "apple"])
            ),
            // miscPackages: z.array(z.enum(["trpc", "stripe", "resend"])),
            miscPackages: z.array(z.enum(["stripe", "resend"])),
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          authProviders: {
            type: "array",
            items: {
              type: "string",
              enum: ["discord", "google", "github", "apple"],
            },
            description:
              "The authentication providers to use. Use just one option unless the user requests for more.",
          },
          miscPackages: {
            type: "array",
            items: {
              type: "string",
              // enum: ["trpc", "stripe", "resend"],
              enum: ["stripe", "resend"],
            },
            description:
              "The packages to use. Stripe is used for payments. Resend is used to send emails.",
          },
        },
        required: ["authProviders", "miscPackages"],
      },
    },
    kirimaseGenerate: {
      function: async (args: {
        resourceTypes: ResourceType[];
        table: string;
        belongsToUser: boolean;
        index?: string;
        fields: DBField[];
      }) => {
        await kirimaseGenerate({
          resourceTypes: ["model", "trpc_route", "views_and_components"],
          // resourceTypes: args.resourceTypes,
          table: args.table,
          belongsToUser: args.belongsToUser,
          index: args.index,
          fields: args.fields,
        });
        return { success: true };
      },
      name: "kirimaseGenerate",
      description: "Generate models, api routes, and views with Kirimase.",
      parse: (args: string) => {
        consola.log("args", JSON.stringify(args, null, 2));

        return z
          .object({
            // resourceTypes: z.array(
            //   z.enum(["model", "trpc_route", "api_route", "views_and_components"])
            // ),
            table: z.string(),
            belongsToUser: z.boolean().optional(),
            index: z.string().optional(),
            fields: z
              .array(
                z
                  .object({
                    name: z.string(),
                    type: z.enum([
                      "String",
                      "Boolean",
                      "Int",
                      "BigInt",
                      "Float",
                      "Decimal",
                      "Boolean",
                      "DateTime",
                      "References",
                    ]),
                    references: z.string().default(""),
                    notNull: z.boolean(),
                    cascade: z.boolean(),
                  })
                  .transform((field) => {
                    // `belongsToUser` handles this already
                    const references =
                      field.references === "user" ||
                      field.references === "users" ||
                      field.references === "userId"
                        ? undefined
                        : field.references;

                    // If type is References and references is empty, set type to String.
                    // In all other cases, use the type provided.
                    const type =
                      field.type === "References" && !references
                        ? "String"
                        : field.type;

                    return {
                      ...field,
                      type,
                      references,
                    };
                  })
              )
              .transform((v) => {
                return v.filter((field) => {
                  // `belongsToUser` handles this already
                  return (
                    field.name !== "user" &&
                    field.name !== "users" &&
                    field.name !== "userId"
                  );
                });
              }),
          })
          .transform((v) => {
            const isValidIndex = v.fields.find((f) => f.name === v.index);
            return {
              ...v,
              index: isValidIndex ? v.index : undefined,
            };
          })
          .parse(JSON.parse(args));
      },
      parameters: {
        type: "object",
        properties: {
          // resourceTypes: {
          //   type: "array",
          //   items: {
          //     type: "string",
          //     // enum: ["model", "trpc_route", "api_route", "views_and_components"],
          //     // force `trpc_route` for now as `api_route` does not work with `views_and_components`
          //     enum: ["model", "trpc_route", "views_and_components"],
          //   },
          //   description:
          //     "The types of resources to generate. Can be model, trpc_route, api_route, or views_and_components.",
          // },
          table: {
            type: "string",
            description:
              "The name of the database table. Should be in snake_case and plural.",
          },
          belongsToUser: {
            type: "boolean",
            description:
              "Whether the resource belongs to the user. If true, a userId field will be added to the model.",
          },
          index: {
            type: "string",
            description:
              "The name of an index to add to the database table. Should be in snake_case. Must be a field in the table.",
          },
          fields: {
            type: "array",
            description:
              "The fields of the database table. Do not include user. `belongsToUser` handles this.",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "The name of the field.",
                },
                type: {
                  type: "string",
                  description: "The type of the field.",
                  enum: [
                    "String",
                    "Boolean",
                    "Int",
                    "BigInt",
                    "Float",
                    "Decimal",
                    "Boolean",
                    "DateTime",
                    "References",
                  ],
                },
                references: {
                  type: "string",
                  description:
                    "The name of the table that the field references. Do not set a reference for `userId`. Use `belongsToUser` instead. If type of the field is not `Reference` this field is empty.",
                },
                notNull: {
                  type: "boolean",
                  description:
                    "Whether the field is not null. If true, the field will be required.",
                },
                cascade: {
                  type: "boolean",
                  description:
                    "Whether the field cascades. If true, the field will cascade.",
                },
              },
              required: ["name", "type", "references", "notNull", "cascade"],
            },
          },
        },
        required: ["table", "fields", "belongsToUser"],
      },
    },
  };

  return actions;
}
