// This file is auto-generated by <your tool name>.
// Changes to this file may be overwritten.

import z from "zod";

export const hello_Parameters = z.object({
  name: z.coerce.string(),
});

export type hello_Parameters = z.infer<typeof hello_Parameters>;

export const updateHello_Parameters = z.object({
  name: z.coerce.string(),
});

export type updateHello_Parameters = z.infer<typeof updateHello_Parameters>;

export const updateHello_RequestBody = z.object({
  content: z.record(
    z.literal("application/json"),
    z.object({
      greeting: z.coerce.string(),
    })
  )
});

export type updateHello_RequestBody = z.infer<typeof updateHello_RequestBody>;

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
]);

export type hello_ResponseBody = z.infer<typeof hello_ResponseBody>;

export const updateHello_ResponseBody = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("200"),
    content: z.record(
      z.literal("application/json"),
      z.object({
        echo: z.coerce.string(),
      })
    ),
  }),
]);

export type updateHello_ResponseBody = z.infer<typeof updateHello_ResponseBody>;
