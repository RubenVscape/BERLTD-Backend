"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../index"));
const serverless_express_1 = __importDefault(require("@vendia/serverless-express"));
// Vercel needs a function handler, not just an express app
exports.default = (0, serverless_express_1.default)({ app: index_1.default });
