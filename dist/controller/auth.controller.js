"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const routing_controllers_1 = require("routing-controllers");
const class_validator_1 = require("class-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class LoginDto {
}
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(4),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
let AuthController = class AuthController {
    async login(body) {
        const user = await user_model_1.UserModel.findOne({ email: body.email }).lean();
        if (!user) {
            return { state: false, message: 'invalid credentials', data: [] };
        }
        const passwordOk = await bcryptjs_1.default.compare(body.password, user.password);
        if (!passwordOk) {
            return { state: false, message: 'invalid credentials', data: [] };
        }
        const token = jsonwebtoken_1.default.sign({ sub: String(user.userId), email: user.email, userType: user.userType }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '1h' });
        return {
            state: true,
            token,
            tokenType: "Bearer",
            expiresIn: 3600,
            user: { id: user?.userId, email: user?.email, userType: user?.userType }
        };
    }
    async validateToken(user) {
        return { status: true, userInfo: user };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, routing_controllers_1.Post)('/auth/login'),
    __param(0, (0, routing_controllers_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, routing_controllers_1.Get)("/auth/validateToken"),
    (0, routing_controllers_1.Authorized)(),
    __param(0, (0, routing_controllers_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateToken", null);
exports.AuthController = AuthController = __decorate([
    (0, routing_controllers_1.JsonController)()
], AuthController);
