import { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import z from "zod";

export type Method = "get" | "post" | "put" | "delete";

interface Route {
  path: string;
  method: Method;
  paramType: z.ZodType; // TODO: refine these to known parts of shape
  responseType: z.ZodType;
  requestBodyType?: z.ZodType;
  handler: (arg0: { params: any; requestBody?: any }) => Promise<any>;
}

export function expressMiddleware({
  app,
  routes,
}: {
  app: Express;
  routes: Route[];
}) {
  // TODO: Should the caller be responsible for setting up middleware?
  app.use(bodyParser.json());

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

        let result;

        if (route.requestBodyType) {
          // TODO: Select the type based on content type

          const { data: requestBody, error: requestBodyParseErr } =
            route.requestBodyType.safeParse({
              content: {
                "application/json": req.body,
              },
            });

          if (requestBodyParseErr) {
            res.status(400).json({ error: requestBodyParseErr.errors });
            return;
          }

          result = await route.handler({ params, requestBody });
        } else {
          result = await route.handler({ params });
        }

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
