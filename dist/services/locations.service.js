"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationService = void 0;
const crypto_1 = require("crypto");
const location_model_1 = require("../models/location.model");
const faker_1 = require("@faker-js/faker");
class LocationService {
    async createLocation(data) {
        const newLocation = new location_model_1.LocationModel({
            ...data,
            locationId: (0, crypto_1.randomUUID)()
        });
        return await newLocation.save();
    }
    async getLocations() {
        const locations = await location_model_1.LocationModel.find().select("-_id").lean();
        return (locations);
    }
    async createRandomLocation() {
        const randomUserIds = ['29ffd4ed-577b-47b8-b1a9-36922e8766a0', 'ed3b44ec-9645-4e44-91a2-379f7348572e', 'b8be28d5-d014-4283-811c-e3a4d4b32cd4'];
        const active = [true, false, true];
        const random = Math.floor(Math.random() * 3);
        const fakeLocation = {
            locationName: faker_1.faker.company.name(),
            address: faker_1.faker.location.city() + " " + faker_1.faker.location.secondaryAddress(),
            active: active[random]
        };
        const newL = new location_model_1.LocationModel({
            ...fakeLocation,
            locationId: (0, crypto_1.randomUUID)(),
            responsible: randomUserIds[random],
            createdBy: randomUserIds[random]
        });
        return await newL.save();
    }
}
exports.LocationService = LocationService;
