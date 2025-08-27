"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const routing_controllers_1 = require("routing-controllers");
const db_1 = require("./config/db");
const authorizationChecker_1 = require("./auth/authorizationChecker");
require("dotenv").config();
const routingControllersOptions = {
    routePrefix: "/api",
    controllers: [`${__dirname}/controller/*.controller.*`],
    validation: true,
    classTransformer: true,
    cors: true,
    defaultErrorHandler: false,
    authorizationChecker: authorizationChecker_1.authorizationChecker,
    currentUserChecker: authorizationChecker_1.currentUserChecker
};
(0, db_1.connectDB)();
const app = (0, routing_controllers_1.createExpressServer)(routingControllersOptions);
if (process.env.NODE_ENV !== 'production') {
    app.listen(3001, () => {
        console.log("[Server] running at http://localhost:3001");
    });
}
exports.default = app;
