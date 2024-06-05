import { Project, VariableDeclarationKind } from "ts-morph";
import { OpenAPISpec, Schema } from "@open-api-poc/open-api-validator";

export function gen(spec: OpenAPISpec, outdir: string) {
  const formatOptions = {
    indentMultiLineObjectLiteralBeginningOnBlankLine: true,
    ensureNewLineAtEndOfFile: true,
    indentSize: 2,
  };
  const project = new Project();

  const sourceFile = project.createSourceFile(`${outdir}/types.ts`, "", {
    overwrite: true,
  });

  sourceFile.addImportDeclaration({
    defaultImport: "z",
    moduleSpecifier: "zod",
  });

  // parameters
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [
      _method,
      { operationId, parameters, requestBody },
    ] of Object.entries(methods)) {
      if (!parameters || parameters.length === 0) {
        continue;
      }

      let paramBuffer = "";

      parameters?.forEach((param) => {
        // TODO: Recursively build up the parameter types from  param.schema
        // TODO: Respect "required"
        paramBuffer = paramBuffer + `\n${param.name}: z.coerce.string(),`;
      });

      sourceFile
        .addVariableStatement({
          declarationKind: VariableDeclarationKind.Const,
          declarations: [
            {
              name: `${operationId}_Parameters`,
              initializer: `z.object({${paramBuffer}})`,
            },
          ],
        })
        .setIsExported(true);

      sourceFile.addTypeAlias({
        name: `${operationId}_Parameters`,
        type: `z.infer<typeof ${operationId}_Parameters>`,
        isExported: true,
      });

      if (requestBody) {
        for (const [contentType, { schema }] of Object.entries(
          requestBody.content
        )) {
          const contentBuffer = schemaToTypeString({ schema });

          sourceFile
            .addVariableStatement({
              declarationKind: VariableDeclarationKind.Const,
              declarations: [
                {
                  name: `${operationId}_RequestBody`,
                  initializer: `z.object({
                  content: z.record(
                    z.literal("${contentType}"),
                    ${contentBuffer}
                  )
                })`,
                },
              ],
            })
            .setIsExported(true);

          sourceFile.addTypeAlias({
            name: `${operationId}_RequestBody`,
            type: `z.infer<typeof ${operationId}_RequestBody>`,
            isExported: true,
          });
        }
      }
    }

    // responses
    for (const [_method, { operationId, responses }] of Object.entries(
      methods
    )) {
      for (const [status, { content }] of Object.entries(responses)) {
        for (const [contentType, { schema }] of Object.entries(content)) {
          const contentBuffer = schemaToTypeString({ schema });

          sourceFile
            .addVariableStatement({
              declarationKind: VariableDeclarationKind.Const,
              declarations: [
                {
                  name: `${operationId}_ResponseBody`,
                  initializer: `z.discriminatedUnion("status", [
                    z.object({
                      status: z.literal("${status}"),
                      content: z.record(
                        z.literal("${contentType}"),
                        ${contentBuffer}
                      ),
                    }),
                  ])`,
                },
              ],
            })
            .setIsExported(true);

          sourceFile.addTypeAlias({
            name: `${operationId}_ResponseBody`,
            type: `z.infer<typeof ${operationId}_ResponseBody>`,
            isExported: true,
          });
        }
      }
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

function walkSchemaProp({
  prop,
  schema,
  required,
}: {
  prop: string;
  schema: Schema;
  required?: string[];
}): string {
  let buffer = "";

  // TODO: Array
  // TODO: Ref
  // TODO: oneOf, anyOf, allOf, not
  // TODO: enum

  if (schema.type === "object") {
    buffer = `${prop}: z.object({`;
    for (const [innerProp, propSchema] of Object.entries(
      schema?.properties || {}
    )) {
      buffer += walkSchemaProp({
        prop: innerProp,
        schema: propSchema,
        required: schema.required,
      });
    }
    buffer += "\n}),";
    return buffer;
  }

  buffer +=
    `${prop}: ${scalarToZodType({
      type: schema.type || "",
      required: required?.includes(prop) || false,
    })}` + ",";

  return buffer;
}

function schemaToTypeString({ schema }: { schema: Schema }): string {
  let buffer = "z.object({\n";
  for (const [prop, propSchema] of Object.entries(schema?.properties || {})) {
    if (schema.properties) {
      buffer += walkSchemaProp({
        prop,
        schema: propSchema,
        required: schema.required,
      });
      continue;
    }

    buffer += scalarToZodType({
      type: propSchema.type || "",
      required: propSchema.required?.includes(prop) || false,
    });
  }

  buffer += "\n})";

  return buffer;
}

function scalarToZodType({
  type,
  required,
}: {
  type: string;
  required: boolean;
}): string {
  switch (type) {
    case "string":
      return `z.coerce.string()${required ? "" : ".optional()"}`;
    case "number":
      return `z.coerce.number()${required ? "" : ".optional()"}`;
    case "integer":
      return `z.coerce.number()${required ? "" : ".optional()"}`;
    case "boolean":
      return `z.coerce.boolean()${required ? "" : ".optional()"}`;
    case "null":
      return "z.null()";
    default:
      return "unknown()";
  }
}