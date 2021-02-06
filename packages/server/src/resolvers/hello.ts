export const HelloResolver = {
  Query: {
    hello: (_: any, { name }: GQL.IHelloOnQueryArguments) =>
      `Hello ${name || "World"}`,
  },
};
