import "reflect-metadata";
import { GraphQLServer } from "graphql-yoga";
import { importSchema } from "graphql-import";
import { UserResolver } from "./resolvers/user";
import { createConnection } from "typeorm";
import * as path from "path";
import { HelloResolver } from "./resolvers/hello";
import session from "express-session";
import { __prod__, COOKIE_NAME } from "./contsants";
import redis = require("redis");
import connectRedis from "connect-redis";

const main = async () => {
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  const typeDefs = importSchema(path.join(__dirname, "schema.graphql"));

  const server = new GraphQLServer({
    context: ({ request }) => ({
      redis,
      url: request.protocol + "://" + request.get("host"),
      session: request.session,
    }),
    typeDefs,
    resolvers: [HelloResolver, UserResolver],
  });

  server.express.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax",
        secure: __prod__, // coookie only works in hhtps
      },
      saveUninitialized: false,
      secret: "aaksdljfaklsdfdsafhgjkl",
      resave: false,
    })
  );

  const cors = {
    origin: "http://localhost:3000",
    credentials: true,
  };

  await createConnection();
  await server.start({
    cors,
    port: 4000,
  });
  console.log("Server is running on localhost:4000");
};

main();

// export const startServer = async () => {
//   const typeDefs = importSchema(path.join(__dirname, "schema.graphql"));

//   const server = new GraphQLServer({
//     context: redis,
//     typeDefs,
//     resolvers: [HelloResolver, UserResolver],
//   });

//   server.express.use(
//     session({
//       name: COOKIE_NAME,
//       secret: "kadjfasjdfahgfjadhkslf",
//       saveUninitialized: false,
//       cookie: {
//         maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
//         httpOnly: true,
//         sameSite: "lax",
//         secure: __prod__, // cookie only works in https
//       },
//       resave: false,
//     })
//   );

//   await createConnection();
//   await server.start();
//   console.log("Server is running on localhost:4000");
// };

// startServer();
