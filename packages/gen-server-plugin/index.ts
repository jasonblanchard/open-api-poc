import { Project } from "ts-morph";
import z from "zod";
import { OpenAPISpec } from "@open-api-poc/open-api-validator";

export function gen(spec: z.infer<typeof OpenAPISpec>, outdir: string) {
  const formatOptions = {
    indentMultiLineObjectLiteralBeginningOnBlankLine: true,
    ensureNewLineAtEndOfFile: true,
    indentSize: 2,
  };
  const project = new Project();

  const sourceFile = project.createSourceFile(`${outdir}/server.ts`, "", {
    overwrite: true,
  });

  sourceFile.addImportDeclaration({
    defaultImport: "z",
    moduleSpecifier: "zod",
  });

  sourceFile.addImportDeclaration({
    defaultImport: "* as types",
    moduleSpecifier: "./types",
  });

  for (const [path, methods] of Object.entries(spec.paths)) {
    sourceFile.addInterface({
      name: "APIService",
      isExported: true,
      properties: Object.entries(methods).map(([_method, { operationId }]) => ({
        name: operationId,
        type: `(params: z.infer<typeof types.${operationId}_Parameters>) => Promise<z.infer<typeof types.${operationId}_ResponseBody>>`,
      })),
    });
  }

  for (const [path, methods] of Object.entries(spec.paths)) {
    const registerServiceFn = sourceFile.addFunction({
      name: "registerService",
      isExported: true,
      parameters: [{ name: "service", type: "APIService" }],
    });

    for (const [method, { operationId }] of Object.entries(methods)) {
      registerServiceFn.setBodyText(
        `return [
          {
          path: "${path}",
          method: "${method}" as const,
          paramType: types.${operationId}_Parameters,
          responseType: types.${operationId}_ResponseBody,
          handler: service.${operationId},
        },
      ];`
      );
    }
  }

  sourceFile.insertText(
    0,
    `// This file is auto-generated by <your tool name>.
  // Changes to this file may be overwritten.

  `
  );

  sourceFile.formatText(formatOptions);
  sourceFile.saveSync();
}
