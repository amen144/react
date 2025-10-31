import json from "@eslint/json";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { ignores: ["**/*.js", "**/*.cjs", "**/*.mjs"] },
  { files: ["**/*.json"], plugins: { json }, language: "json/json", extends: ["json/recommended"] },
  
  {extends: ["next/core-web-vitals", "eslint:recommended", "plugin:@typescript-eslint/recommended"],}
{rules: {
    "@typescript-eslint/no-explicit-any": "off"
  }
}

]);
