export const resolvers = {
  Query: {
    hello: (_: any, { name }: GQL.IHelloOnQueryArguments) =>
      `Hello ${name || "World"}`,
  },
};
