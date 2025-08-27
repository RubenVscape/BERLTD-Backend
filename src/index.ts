import 'reflect-metadata';
import { createExpressServer, RoutingControllersOptions } from 'routing-controllers';
import { connectDB } from './config/db';
import { authorizationChecker, currentUserChecker } from './auth/authorizationChecker';
require("dotenv").config();

connectDB();
const controllersPath =
process.env.NODE_ENV === "production"
? `${__dirname}/controller/*.js`
: `${__dirname}/controller/*.ts`;

console.log(controllersPath);
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

if (process.env.ISLOCAL === 'true') {
  app.listen(3001, () => {
    console.log("[Server] running at http://localhost:3001");
  });
} else {
  console.log(`[server] running in production`)
}

export default app;


