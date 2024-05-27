// This file is auto-generated by <your tool name>.
// Changes to this file may be overwritten.

import z from "zod";

export const hello_Parameters = z.object({
  name: z.coerce.string(),
});

export const hello_ResponseBody = z.object({
  status: z.literal("200"),
  content: z.record(z.object({
    message: z.coerce.string(),
  })),
});

export interface APIService {
  hello: (params: z.infer<typeof hello_Parameters>) => Promise<z.infer<typeof hello_ResponseBody>>;
}

export function registerService(service: APIService) {
  return [
    {
      path: "/hello/{greeting}",
      method: "get" as const,
      paramType: hello_Parameters,
      responseType: hello_ResponseBody,
      handler: service.hello,
    },
  ];
}
