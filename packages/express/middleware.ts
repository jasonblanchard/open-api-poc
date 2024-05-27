import { Express, Request, Response } from "express";
import z from "zod";

export type Method = "get" | "post" | "put" | "delete";

interface Route {
  path: string;
  method: Method;
  paramType: z.ZodType; // TODO: refine these to known parts of shape
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
      openAPIPathToExpress(route.path),
      async (req: Request, res: Response) => {
        const { data: params, error: paramParseErr } =
          route.paramType.safeParse(req.params);

        if (paramParseErr) {
          res.status(400).json({ error: paramParseErr.errors });
          return;
        }

        const result = await route.handler(params);

        const { data: response, error: responseParseErr } =
          route.responseType.safeParse(result);

        if (responseParseErr) {
          res.status(400).json({ error: responseParseErr.errors });
          return;
        }

        res.status(Number(response.status));

        const contentType = req.accepts(Object.keys(response.content));

        if (contentType === "application/json") {
          return res.json(response.content["application/json"]);
        }

        // TODO: Other content types
      }
    );
  }
}

function openAPIPathToExpress(path: string) {
  return path.replace(/{([^}]+)}/g, ":$1");
}