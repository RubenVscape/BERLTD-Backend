"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const routing_controllers_1 = require("routing-controllers");
const db_1 = require("./config/db");
const authorizationChecker_1 = require("./auth/authorizationChecker");
require("dotenv").config();
(0, db_1.connectDB)();
const controllersPath = `${__dirname}/controller/*.{js,ts}`;
const localHtlmPath = `${__dirname}/public/index.html`;
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
const PORT = process.env.PORT || 3001;
app.get("/", (req, res) => {
    res.sendFile(localHtlmPath);
});
app.listen(PORT, () => {
    console.log(`[Server] running at http://localhost:${PORT}`);
});
exports.default = app;
