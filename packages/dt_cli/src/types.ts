export type Config = {
  version: Number;
  overrides?: Record<string, string>;
  tables: string[];
  connection_string: string;
  preset: string;
  dashboard?: {
    host?: string;
    port?: number;
  };
};
