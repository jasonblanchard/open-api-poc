import z from "zod";
import { Method } from "../../lib/expressMiddleware";

export const HelloParams = z.object({
  name: z.coerce.string(),
});

export const HelloResponseBody = z.object({
  message: z.coerce.string(),
});

type HelloHandler = (
  params: z.infer<typeof HelloParams>
) => Promise<z.infer<typeof HelloResponseBody>>;

export interface APIService {
  hello: HelloHandler;
}

export function registerService(service: APIService) {
  // Build this up from the open api spec routes
  return [
    {
      path: "/hello/:name",
      method: "GET" as Method,
      paramType: HelloParams,
      responseType: HelloResponseBody,
      handler: service.hello,
    },
  ];
}
