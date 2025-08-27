"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const routing_controllers_1 = require("routing-controllers");
const db_1 = require("./config/db");
const authorizationChecker_1 = require("./auth/authorizationChecker");
const path_1 = __importDefault(require("path"));
require("dotenv").config();
const controllersPath = process.env.NODE_ENV === "production"
    ? path_1.default.join(__dirname, "controller/*.js")
    : path_1.default.join(__dirname, "controller/*.ts");
console.log(controllersPath);
const routingControllersOptions = {
    routePrefix: "/api",
    controllers: [`${controllersPath}/controller/*.controller.*`],
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
