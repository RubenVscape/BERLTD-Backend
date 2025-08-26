import 'reflect-metadata'

require("dotenv").config()
import { createExpressServer, RoutingControllersOptions } from 'routing-controllers';
import { connectDB } from './config/db';
import { authorizationChecker, currentUserChecker } from './auth/authorizationChecker';
import express from 'express';

const port = process.env.PORT || "3002";

 connectDB();

 const routingControllersOptions: RoutingControllersOptions = {
    routePrefix: "/api",
    controllers: [`${__dirname}/controller/*.controller.*`],
    validation:true, 
    classTransformer: true,
    cors: true,
    defaultErrorHandler:false,
    authorizationChecker,
    currentUserChecker
 };

const app = createExpressServer(routingControllersOptions);
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(err.httpCode || 500).json({
        name: err.name,
        message: err.message
    })
})
app.listen(port, () => {
    console.log("[Server] running at http://localhost:" + port)
})

export default app;