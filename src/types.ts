import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const zodCreateNextApp = z.object({
  appName: z.string().describe("The name of the Next.js app."),
});
export type ZodCreateNextApp = z.infer<typeof zodCreateNextApp>;
export const createNextAppJsonSchema = zodToJsonSchema(zodCreateNextApp);

export const zodInit = z.object({
  authType: z
    .enum(["next-auth", "clerk", "lucia", "kinde"])
    .describe('The authentication type to use. Default to "next-auth".'),
  authProviders: z
    .array(z.enum(["discord", "google", "github", "apple"]))
    .default([])
    .describe(
      "The authentication providers to use. Use just one option unless the user requests for more."
    ),
  // miscPackages: z.array(z.enum(["trpc", "stripe", "resend"])),
  miscPackages: z
    .array(z.enum(["stripe", "resend"]))
    .describe(
      "The packages to use. Stripe is used for payments. Resend is used to send emails."
    ),
  orm: z
    .enum(["prisma", "drizzle"])
    .default("prisma")
    .describe("The ORM to use. Default to 'prisma'."),
  db: z
    .enum(["pg", "mysql", "sqlite"])
    .default("pg")
    .describe('The database to use. Default to "pg".'),
  packageManager: z
    .enum(["npm", "yarn", "pnpm", "bun"])
    .default("pnpm")
    .describe("The package manager to use. Default to 'pnpm'."),
});
export type InitOptions = z.infer<typeof zodInit>;
export const initJsonSchema = zodToJsonSchema(zodInit);

const zodDatabaseRowType = z.enum([
  // Prisma types in comments
  "varchar", // "String",
  "text", // "String",
  "number", // "Int",
  "float", // "Float",
  "boolean", // "Boolean",
  "references", // "References",
  "timestamp", // "DateTime",
  "date", // "DateTime",
  "string", // "String",
]);
type ZodDatabaseRowType = z.infer<typeof zodDatabaseRowType>;

export const zodGenerate = z
  .object({
    // resourceTypes: z
    //   .array(
    //     z.enum(["model", "trpc_route", "views_and_components"]) // force trpc for now to support views
    //     // z.enum(["model", "trpc_route", "api_route", "views_and_components"])
    //   )
    //   .describe("The types of resources to generate."),
    table: z
      .string()
      .describe(
        "The name of the database table. Should be in snake_case and plural."
      ),
    belongsToUser: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "Whether the resource belongs to the user. If true, a userId field will be added to the model."
      ),
    index: z
      .string()
      .optional()
      .describe(
        "The name of an index to add to the database table. Should be in snake_case. Must be a field in the table."
      ),
    fields: z
      .array(
        z
          .object({
            name: z.string().describe("The name of the field."),
            type: zodDatabaseRowType.describe(
              "The type of the field. Choose a type appropriate to the selected database."
            ),
            references: z
              .string()
              .default("")
              .describe(
                "The name of the table that the field references. Do not set a reference for `userId`. Use `belongsToUser` instead. If type of the field is not `Reference` this field is empty."
              ),
            notNull: z
              .boolean()
              .describe(
                "Whether the field is not null. If true, the field will be required."
              ),
            cascade: z
              .boolean()
              .describe(
                "Whether the field cascades. If true, the field will cascade."
              ),
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
              field.type === "references" && !references
                ? "string"
                : field.type;

            return {
              ...field,
              type,
              references,
            };
          })
      )
      .describe(
        "The fields of the database table. Do not include user. `belongsToUser` handles this."
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
  });
export type GenerateOptions = z.infer<typeof zodGenerate>;
export const generateJsonSchema = zodToJsonSchema(zodGenerate);

// { [Drizzle]: Prisma }
export const drizzlePrismaFieldMapping: Record<ZodDatabaseRowType, string> = {
  varchar: "String",
  text: "String",
  number: "Int",
  float: "Float",
  boolean: "Boolean",
  references: "References",
  timestamp: "DateTime",
  date: "DateTime",
  string: "String",
};
