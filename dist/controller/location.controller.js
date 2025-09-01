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
const user_service_1 = require("../services/user.service");
const locationService = new locations_service_1.LocationService();
const userService = new user_service_1.UserService();
const locationTemplate = ["locationName", "address", "active", 'responsible'];
const authorizedPeople = ['manager', 'global', 'Division leader'];
// API LIST 
// root route /locations
// get locations GET /getLocations
// create random location POST /createRandomLocation
// update location by id  PATCH /updateLocationById/:locationId
// get location by id  GET /getLocationById/:locationId
//  check if location has users assigned GET /checkIfLocationHasData/:locationId
// delete location by id DELETE /deleteLocationById/:locationId
let LocationController = class LocationController {
    async createLocation(body, user, res) {
        const newLocation = {
            ...body,
            createdBy: user.sub
        };
        const checkIfResponsibleExists = await userService.getUserById(body.responsible);
        if (checkIfResponsibleExists.length === 0) {
            return res.status(400).json({ message: 'Responsible does not exist', data: [] });
        }
        const location = await locationService.createLocation(newLocation);
        await userService.addLocationToUser(body.responsible, location.locationId);
        return { message: 'location created', data: [location.locationId] };
    }
    async getLocations(page = 1, limit = 5, res) {
        try {
            const skip = (page - 1) * limit;
            const locations = await locationService.getLocations(skip, limit);
            return { status: 'ok', data: locations, total: locations.length };
        }
        catch (error) {
            return res.status(500).json({ message: 'There was an error', error });
        }
    }
    async getLocationById(locationId, res) {
        try {
            const request = await locationService.getLocationById(locationId);
            if (request.length === 0) {
                return res.status(400).json({ message: 'location not found', data: [] });
            }
            return { message: 'request ok', data: request };
        }
        catch (error) {
            return res.status(500).json({ message: 'There was an error', error });
        }
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
    async updateLocationById(res, data, locationId) {
        try {
            const keys = Object.keys(data);
            let hasInvalidValues = false;
            keys.forEach(k => {
                if (!locationTemplate.includes(k))
                    hasInvalidValues = true;
            });
            if (hasInvalidValues) {
                return res.status(400).json({
                    message: 'Invalid update request, invalid inputs',
                    status: false,
                    data: []
                });
            }
            const updateRequest = await locationService.updateLocationById(locationId, data);
            return updateRequest ? res.status(200).json({ message: 'Location updated Correctly', data: locationId, status: true }) :
                res.status(400).json({ message: 'unable to updated location', data: [], status: false });
        }
        catch (error) {
            res.status(500).json({ message: 'there was an error', error });
        }
    }
    async checkIfLocationHasData(res, locationId) {
        try {
            const request = await userService.checkIfUserHasLocation(locationId);
            if (request == null) {
                return { hasUsers: false, message: 'Location has no users, able to delete' };
            }
            return { hasUsers: true, message: 'This locations has users, are you sure you want delete it?' };
        }
        catch (error) {
            res.status(500).json({ message: 'there was an error', error });
        }
    }
    async deleteLocationById(res, locationId) {
        try {
            const checkIfLocationExists = await locationService.getLocationById(locationId);
            if (checkIfLocationExists.length == 0) {
                return res.status(400).json({ message: 'Unable to delete, location does not exist', state: false, data: [] });
            }
            const removeLocationFromUsers = await userService.removeLocationToUserById(locationId);
            console.log(removeLocationFromUsers);
            if (removeLocationFromUsers) {
                const deleteLocation = await locationService.deleteLocationById(locationId);
                if (deleteLocation) {
                    return res.status(500).json({ state: false, message: 'There was an issue deleting the location', data: [] });
                }
                return { state: true, message: 'There was an issue deleting the location', data: [] };
            }
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ message: 'there was an error', error: err });
        }
    }
};
__decorate([
    (0, routing_controllers_1.HttpCode)(201),
    (0, routing_controllers_1.Authorized)(authorizedPeople),
    (0, routing_controllers_1.Post)("/createLocation"),
    __param(0, (0, routing_controllers_1.Body)()),
    __param(1, (0, routing_controllers_1.CurrentUser)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "createLocation", null);
__decorate([
    (0, routing_controllers_1.Authorized)(authorizedPeople),
    (0, routing_controllers_1.HttpCode)(200),
    (0, routing_controllers_1.Get)("/getLocations"),
    __param(0, (0, routing_controllers_1.QueryParam)('page')),
    __param(1, (0, routing_controllers_1.QueryParam)('limit')),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "getLocations", null);
__decorate([
    (0, routing_controllers_1.Authorized)(authorizedPeople),
    (0, routing_controllers_1.HttpCode)(200),
    (0, routing_controllers_1.Get)('/getLocationById/:locationId'),
    __param(0, (0, routing_controllers_1.Param)('locationId')),
    __param(1, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "getLocationById", null);
__decorate([
    (0, routing_controllers_1.HttpCode)(200),
    (0, routing_controllers_1.Authorized)(authorizedPeople),
    (0, routing_controllers_1.Post)("/createRandomLocation"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "createRandom", null);
__decorate([
    (0, routing_controllers_1.HttpCode)(200),
    (0, routing_controllers_1.Authorized)(authorizedPeople),
    (0, routing_controllers_1.Patch)('/updateLocationById/:locationId'),
    __param(0, (0, routing_controllers_1.Res)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.Param)('locationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "updateLocationById", null);
__decorate([
    (0, routing_controllers_1.HttpCode)(200),
    (0, routing_controllers_1.Authorized)(authorizedPeople),
    (0, routing_controllers_1.Get)('/checkIfLocationHasData/:locationId'),
    __param(0, (0, routing_controllers_1.Res)()),
    __param(1, (0, routing_controllers_1.Param)('locationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "checkIfLocationHasData", null);
__decorate([
    (0, routing_controllers_1.HttpCode)(200),
    (0, routing_controllers_1.Authorized)(authorizedPeople),
    (0, routing_controllers_1.Delete)('/deleteLocationById/:locationId'),
    __param(0, (0, routing_controllers_1.Res)()),
    __param(1, (0, routing_controllers_1.Param)('locationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LocationController.prototype, "deleteLocationById", null);
LocationController = __decorate([
    (0, routing_controllers_1.JsonController)("/locations")
], LocationController);
exports.default = LocationController;
