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
exports.DivisionController = void 0;
const routing_controllers_1 = require("routing-controllers");
const divisionTypes_model_1 = require("../models/divisionTypes.model");
const division_service_1 = require("../services/division.service");
const divisionService = new division_service_1.DivisionService();
let DivisionController = class DivisionController {
    async NewDivision(body, user, res) {
        body.createdBy = user.sub;
        if (!body?.divisionType) {
            const data = await divisionTypes_model_1.DivisionModel.countDocuments();
            body.divisionType = data + 1;
        }
        const newDivision = new divisionTypes_model_1.DivisionModel(body);
        const save = await divisionService.createDivision(newDivision);
        if (save.state) {
            return res.status(201).json(save);
        }
        else {
            return res.status(400).json(save);
        }
    }
};
exports.DivisionController = DivisionController;
__decorate([
    (0, routing_controllers_1.HttpCode)(201),
    (0, routing_controllers_1.Authorized)(['global']),
    (0, routing_controllers_1.Post)('/newDivision'),
    __param(0, (0, routing_controllers_1.Body)()),
    __param(1, (0, routing_controllers_1.CurrentUser)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], DivisionController.prototype, "NewDivision", null);
exports.DivisionController = DivisionController = __decorate([
    (0, routing_controllers_1.JsonController)('/division')
], DivisionController);
