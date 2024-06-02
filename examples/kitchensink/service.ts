import { updateHello_RequestBody } from "./gen/types";

export default class Service {
  async healthz() {
    return {
      status: "200" as const,
      content: {
        "application/json": {
          status: "OK",
        },
      },
    };
  }

  async hello({ params }: { params?: { name: string } }) {
    return {
      status: "200" as const,
      content: {
        "application/json": {
          message: `Hello, ${params?.name}!`,
        },
      },
    };
  }

  async updateHello({
    params,
    requestBody,
  }: {
    params?: { name: string };
    requestBody?: updateHello_RequestBody;
  }) {
    return {
      status: "200" as const,
      content: {
        "application/json": {
          envelope: {
            echo: requestBody?.content["application/json"]?.greeting || "",
          },
        },
      },
    };
  }
}
