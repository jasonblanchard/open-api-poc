export default class Service {
  async hello(params: { name: string }) {
    return { message: `Hello, ${params.name}!` };
  }
}
