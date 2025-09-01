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
Object.defineProperty(exports, "__esModule", { value: true });
const routing_controllers_1 = require("routing-controllers");
const user_service_1 = require("../services/user.service");
// api  list ROOT /users
// create user POST /create
// get users GET /getUsers
// get user by id GET /getUserById/:id 
// update user by ID PATCH /updateUserById 
// delete user by id DELETE /deleteUserById/:userId
const userService = new user_service_1.UserService();
const invalidKeysForUser = [
    "_id",
    "email",
    "password",
    "active",
    "userId",
    "createdAt",
    "updatedAt",
    'divisionType',
    'responsibleLocations'
];
const authorizedUsers = ['global', 'manager'];
let UserController = class UserController {
    async createUser(body) {
        const user = await userService.createUser(body);
        return { data: user.userId, message: 'User created' };
    }
    async getUsers(page = 1, limit = 10, res) {
        try {
            const skip = (page - 1) * limit;
            const data = await userService.getAllUsers(skip, limit);
            return { data, total: data.length, message: 'Request ok' };
        }
        catch (error) {
            return res.status(500).json({ message: 'there was an error', error: error });
        }
    }
    async getUserById(res, id) {
        try {
            const request = await userService.getUserById(id);
            if (request.length === 0) {
                return res.status(404).json({
                    message: 'User not found',
                    data: []
                });
            }
            return res.status(200).json({ data: request });
        }
        catch (err) {
            return res.status(500).json({ message: 'there was an error', error: err });
        }
    }
    async updateUserById(res, userId, body) {
        try {
            const keys = Object.keys(body);
            let hasInvalidFields = false;
            keys.forEach(k => { if (invalidKeysForUser.includes(k))
                hasInvalidFields = true; });
            if (hasInvalidFields) {
                return res.status(400).json({ message: 'invalid fields for update', data: [] });
            }
            const updateReq = await userService.updateUserById(userId, body);
            if (updateReq) {
                return res.status(200).json({ message: 'User updated Correctly', data: userId });
            }
            return res.status(400).json({ message: 'unable to update users', data: [] });
        }
        catch (err) {
            return res.status(500).json({ message: 'there was an error', error: err });
        }
    }
    async deleteUserById(res, userId) {
        try {
            const updateReq = await userService.deleteUserById(userId);
            if (updateReq) {
                return res.status(200).json({ message: 'User Delete Correctly', data: userId });
            }
            return res.status(400).json({ message: 'unable to delete user', data: [] });
        }
        catch (err) {
            return res.status(500).json({ message: 'there was an error', error: err });
        }
    }
};
__decorate([
    (0, routing_controllers_1.HttpCode)(201),
    (0, routing_controllers_1.Post)("/create"),
    (0, routing_controllers_1.Authorized)(authorizedUsers),
    __param(0, (0, routing_controllers_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createUser", null);
__decorate([
    (0, routing_controllers_1.HttpCode)(200),
    (0, routing_controllers_1.Authorized)(authorizedUsers),
    (0, routing_controllers_1.Get)("/getUsers"),
    __param(0, (0, routing_controllers_1.QueryParam)('page')),
    __param(1, (0, routing_controllers_1.QueryParam)('limit')),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUsers", null);
__decorate([
    (0, routing_controllers_1.Authorized)(authorizedUsers),
    (0, routing_controllers_1.HttpCode)(200),
    (0, routing_controllers_1.Get)("/getUserById/:id"),
    __param(0, (0, routing_controllers_1.Res)()),
    __param(1, (0, routing_controllers_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserById", null);
__decorate([
    (0, routing_controllers_1.Authorized)(authorizedUsers),
    (0, routing_controllers_1.HttpCode)(200),
    (0, routing_controllers_1.Patch)('/updateUserById/:userId'),
    __param(0, (0, routing_controllers_1.Res)()),
    __param(1, (0, routing_controllers_1.Param)('userId')),
    __param(2, (0, routing_controllers_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateUserById", null);
__decorate([
    (0, routing_controllers_1.Authorized)(['manager', 'global']),
    (0, routing_controllers_1.HttpCode)(200),
    (0, routing_controllers_1.Delete)('/deleteUserById/:userId'),
    __param(0, (0, routing_controllers_1.Res)()),
    __param(1, (0, routing_controllers_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteUserById", null);
UserController = __decorate([
    (0, routing_controllers_1.JsonController)("/users")
], UserController);
exports.default = UserController;
