import 'reflect-metadata';
require("dotenv").config();
import { createExpressServer, RoutingControllersOptions } from 'routing-controllers';
import { connectDB } from './config/db';
import { authorizationChecker, currentUserChecker } from './auth/authorizationChecker';

const routingControllersOptions: RoutingControllersOptions = {
  routePrefix: "/api",
  controllers: [`${__dirname}/controller/*.controller.*`],
  validation: true,
  classTransformer: true,
  cors: true,
  defaultErrorHandler: false,
  authorizationChecker,
  currentUserChecker
};

connectDB();

const app = createExpressServer(routingControllersOptions);
if (process.env.NODE_ENV !== 'production'){
    app.listen(3001, () => {
        console.log("[Server] running at:" + 3000)
    })
}


// ✅ this is the key: make it a serverless handler
export default app;
