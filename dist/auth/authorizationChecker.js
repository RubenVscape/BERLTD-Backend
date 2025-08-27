"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentUserChecker = exports.authorizationChecker = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authorizationChecker = async (action) => {
    try {
        const auth = action.request.headers.authorization;
        if (!auth || !auth.startsWith("Bearer "))
            return false;
        const token = auth.split(" ")[1];
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        action.request.user = payload;
        return true;
    }
    catch {
        return false;
    }
};
exports.authorizationChecker = authorizationChecker;
const currentUserChecker = async (action) => {
    return action.request.user;
};
exports.currentUserChecker = currentUserChecker;
