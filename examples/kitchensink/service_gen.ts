import z from "zod";

export const HelloParams = z.object({
  name: z.coerce.string(),
});

export const HelloResponse = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("200"),
    content: z.record(z.object({ message: z.coerce.string() })),
  }),
]);

type HelloHandler = (
  params: z.infer<typeof HelloParams>
) => Promise<z.infer<typeof HelloResponse>>;

export interface APIService {
  hello: HelloHandler;
}

export function registerService(service: APIService) {
  // Build this up from the open api spec routes
  return [
    {
      path: "/hello/:name",
      method: "get" as const,
      paramType: HelloParams,
      responseType: HelloResponse,
      handler: service.hello,
    },
  ];
}
