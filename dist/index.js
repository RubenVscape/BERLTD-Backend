"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const routing_controllers_1 = require("routing-controllers");
const db_1 = require("./config/db");
const authorizationChecker_1 = require("./auth/authorizationChecker");
require("dotenv").config();
(0, db_1.connectDB)();
const controllersPath = process.env.NODE_ENV === "production"
    ? `${__dirname}/controller/*.js`
    : `${__dirname}/controller/*.ts`;
console.log(controllersPath);
const routingControllersOptions = {
    routePrefix: "/api",
    controllers: [controllersPath],
    validation: true,
    classTransformer: true,
    cors: true,
    defaultErrorHandler: false,
    authorizationChecker: authorizationChecker_1.authorizationChecker,
    currentUserChecker: authorizationChecker_1.currentUserChecker
};
const app = (0, routing_controllers_1.createExpressServer)(routingControllersOptions);
if (process.env.NODE_ENV !== 'production') {
    app.listen(3001, () => {
        console.log("[Server] running at http://localhost:3001");
    });
}
else {
    console.log('app running production server');
}
exports.default = app;
