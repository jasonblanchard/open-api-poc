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

  const serverFile = project.createSourceFile(
    `${outdir}/server.ts`,
    (writer) => {
      writer.writeLine(`// This file is auto-generated by <your tool name>.
        // Changes to this file may be overwritten.`);

      writer.blankLine();

      writer.writeLine(`import z from "zod";`);
      writer.writeLine('import * as types from "./types";');

      writer.blankLine();

      // Service interface
      for (const [path, methods] of Object.entries(spec.paths)) {
        writer.writeLine("export interface APIService {");

        for (const [_method, { operationId }] of Object.entries(methods)) {
          writer.writeLine(
            `${operationId}: (params: z.infer<typeof types.${operationId}_Parameters>) => Promise<z.infer<typeof types.${operationId}_ResponseBody>>;`
          );
        }

        writer.writeLine("}");

        writer.blankLine();
      }

      // registerService
      writer.writeLine(
        `export function registerService(service: APIService) {`
      );
      writer.writeLine("return [");
      for (const [path, methods] of Object.entries(spec.paths)) {
        for (const [method, { operationId }] of Object.entries(methods)) {
          writer.writeLine("{");
          writer.writeLine(`path: "${path}",`);
          writer.writeLine(`method: "${method}" as const,`);
          writer.writeLine(`paramType: types.${operationId}_Parameters,`);
          writer.writeLine(`responseType: types.${operationId}_ResponseBody,`);
          writer.writeLine(`handler: service.${operationId},`);
          writer.writeLine("},");
        }
        writer.writeLine("];");
        writer.writeLine("}");
      }
    },
    { overwrite: true }
  );
  serverFile.formatText(formatOptions);
  serverFile.saveSync();
}
