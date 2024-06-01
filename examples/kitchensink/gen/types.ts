// This file is auto-generated by <your tool name>.
// Changes to this file may be overwritten.

import z from "zod";

export const hello_Parameters = z.object({
  name: z.coerce.string(),
});
export const hello_ResponseBody = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("200"),
    content: z.record(
      z.literal("application/json"),
      z.object({
        message: z.coerce.string(),
      })
    ),
  }),
]);;
