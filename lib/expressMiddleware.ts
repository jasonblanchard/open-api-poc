import { Express, Request, Response } from "express";
import z from "zod";

export type Method = "GET" | "POST" | "PUT" | "DELETE";

interface Route {
  path: string;
  method: Method;
  paramType: z.ZodType;
  responseType: z.ZodType;
  handler: (params: any) => Promise<any>;
}

export function expressMiddleware({
  app,
  routes,
}: {
  app: Express;
  routes: Route[];
}) {
  for (const route of routes) {
    app[route.method.toLowerCase() as "get" | "post" | "put" | "delete"](
      route.path,
      async (req: Request, res: Response) => {
        const { data: params, error: paramParseErr } =
          route.paramType.safeParse(req.params);

        if (paramParseErr) {
          res.status(400).json({ error: paramParseErr.errors });
          return;
        }

        const result = await route.handler(params);

        const { data: responseBody, error: responseBodyParseErr } =
          route.responseType.safeParse(result);

        if (responseBodyParseErr) {
          res.status(400).json({ error: responseBodyParseErr.errors });
          return;
        }

        res.json(responseBody);
      }
    );
  }
}
