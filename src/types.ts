type PrismaColumnType =
  | "String"
  | "Boolean"
  | "Int"
  | "BigInt"
  | "Float"
  | "Decimal"
  | "Boolean"
  | "DateTime"
  | "References";

// type ColumnType = DrizzleColumnType | PrismaColumnType;
type ColumnType = PrismaColumnType;

export type DBField<T extends ColumnType = ColumnType> = {
  name: string;
  type: T;
  references?: string;
  notNull?: boolean;
  cascade?: boolean;
};

export type ResourceType =
  | "model"
  | "trpc_route"
  | "api_route"
  | "views_and_components";
export type AuthProvider = "discord" | "google" | "github" | "apple";
export type MiscPackage = "trpc" | "stripe" | "resend";
