#!/usr/bin/env node

import { Command } from "commander";
import fs from "fs";
import { OpenAPISpec } from "@open-api-poc/open-api-validator";
import yaml from "js-yaml";

const program = new Command();

program
  .name("open-api-poc")
  .description("CLI to some Open API Stuff")
  .version("0.0.0");

program
  .command("build")
  .description("Output generated code")
  .option("-s, --spec <file>", "OpenAPI spec file", "")
  .option("-o, --out <dir>", "output directory", "")
  .option(
    "-p, --plugins <items>",
    "Plugins (can pass multiple as separate flags)",
    (value, previous) => previous.concat([value]),
    [] as string[]
  )
  .action(async (options) => {
    const specS = fs.readFileSync(options.spec, "utf-8");

    const specPojo = yaml.load(specS) as Map<string, any>;

    const validateSpecResponse = OpenAPISpec.safeParse(specPojo);

    if (!validateSpecResponse.success) {
      console.error(validateSpecResponse.error.errors);
      return;
    }

    const plugins: string[] = options.plugins;

    const genPromises = plugins.map(async (pkg) => {
      const genGn = await import(pkg);
      genGn.gen(validateSpecResponse.data, options.out);
    });

    await Promise.all(genPromises);
  });

program.parse();
