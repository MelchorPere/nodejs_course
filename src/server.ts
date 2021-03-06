import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import "reflect-metadata";
import { BookResolver } from "./resolvers/book.resolvers";
import { AuthorResolver } from "./resolvers/author.resolvers";
import { AuthResolver } from "./resolvers/auth.resolver";

export async function startServer() {
  const app = express();
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [BookResolver, AuthorResolver, AuthResolver],
    }),
    context: ({ req, res }) => ({ req, res }),
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: "/graphql" });
  return app;
}
