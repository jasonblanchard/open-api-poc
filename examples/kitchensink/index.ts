import express from "express";
import { registerService } from "./gen/server";
import { expressMiddleware } from "../../packages/express/middleware";
import Service from "./service";

const app = express();
const port = 8080;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const routes = registerService(new Service());

expressMiddleware({ app, routes });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
