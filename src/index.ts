import 'reflect-metadata';
import { createExpressServer, RoutingControllersOptions } from 'routing-controllers';
import { connectDB } from './config/db';
import { authorizationChecker, currentUserChecker } from './auth/authorizationChecker';
import { VercelRequest, VercelResponse } from '@vercel/node';

require("dotenv").config();

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

// local dev server
if (process.env.NODE_ENV !== 'production') {
  app.listen(3001, () => {
    console.log("[Server] running at http://localhost:3001");
  });
}

// ✅ for vercel: export handler
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}
