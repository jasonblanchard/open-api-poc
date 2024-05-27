export default class Service {
  async hello(params: { name: string }) {
    return {
      status: "200" as const,
      content: {
        "application/json": {
          message: `Hello, ${params.name}!`,
        },
      },
    };
  }
}
