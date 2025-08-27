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
const locations_service_1 = require("../services/locations.service");
const locationService = new locations_service_1.LocationService();
let LocationController = class LocationController {
    async createLocation(body, user) {
        const newLocation = {
            ...body,
            createdBy: user.sub
        };
        const location = await locationService.createLocation(newLocation);
        return { message: 'location created', data: [location.locationId] };
    }
    async getLocations() {
        const locations = await locationService.getLocations();
        return { status: 'ok', data: locations, total: locations.length };
    }
    async createRandom() {
        let attempts = 0;
        let errors = 0;
        for (let index = 0; index < 101; index++) {
            const randomLocation = await locationService.createRandomLocation();
            if (randomLocation.isNew) {
                attempts++;
            }
            else {
                errors++;
            }
        }
        return { totalAdded: attempts, errors: errors };
    }
};
__decorate([
    (0, routing_controllers_1.HttpCode)(201),
    (0, routing_controllers_1.Authorized)(["global"]),
    (0, routing_controllers_1.Post)("/createLocation"),
    __param(0, (0, routing_controllers_1.Body)()),
    __param(1, (0, routing_controllers_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "createLocation", null);
__decorate([
    (0, routing_controllers_1.HttpCode)(200),
    (0, routing_controllers_1.Get)("/getLocations"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "getLocations", null);
__decorate([
    (0, routing_controllers_1.HttpCode)(200),
    (0, routing_controllers_1.Authorized)(['global']),
    (0, routing_controllers_1.Post)("/createRandomLocation"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "createRandom", null);
LocationController = __decorate([
    (0, routing_controllers_1.JsonController)("/locations")
], LocationController);
exports.default = LocationController;
