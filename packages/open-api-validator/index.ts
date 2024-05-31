import z from "zod";

export const OpenAPISpec = z.object({
  openapi: z.string(),
  info: z.object({
    title: z.string(),
    version: z.string(),
  }),
  paths: z.record(
    z.record(
      z.object({
        summary: z.string().optional(),
        operationId: z.string(),
        parameters: z
          .array(
            z.object({
              name: z.string(),
              in: z.string(),
              required: z.boolean(),
              schema: z.object({
                type: z.string(),
              }),
            })
          )
          .optional(),
        responses: z.record(
          z.object({
            description: z.string().optional(),
            content: z.record(
              z.object({
                schema: z.object({
                  type: z.string(),
                  properties: z.record(
                    z.object({
                      type: z.string(),
                    })
                  ),
                }),
              })
            ),
          })
        ),
      })
    )
  ),
});
