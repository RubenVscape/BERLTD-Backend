import 'reflect-metadata';
import { createExpressServer, RoutingControllersOptions } from 'routing-controllers';
import { connectDB } from './config/db';
import { authorizationChecker, currentUserChecker } from './auth/authorizationChecker';
import path from 'path';
require("dotenv").config();


connectDB();
const controllersPath =
  process.env.NODE_ENV === "production"
    ? path.join(__dirname, "controller/*.js")
    : path.join(__dirname, "controller/*.ts");

const routingControllersOptions: RoutingControllersOptions = {
  routePrefix: "/api",
  controllers: [controllersPath],
  validation: true,
  classTransformer: true,
  cors: true,
  defaultErrorHandler: false,
  authorizationChecker,
  currentUserChecker
};


const app = createExpressServer(routingControllersOptions);

if (process.env.NODE_ENV !== 'production') {
  app.listen(3001, () => {
    console.log("[Server] running at http://localhost:3001");
  });
}

export default app;


