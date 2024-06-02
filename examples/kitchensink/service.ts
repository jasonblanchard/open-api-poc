import { updateHello_RequestBody } from "./gen/types";

export default class Service {
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
          echo: requestBody?.content["application/json"]?.greeting || "",
        },
      },
    };
  }
}
