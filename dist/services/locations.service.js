"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationService = void 0;
const crypto_1 = require("crypto");
const location_model_1 = require("../models/location.model");
const faker_1 = require("@faker-js/faker");
const user_model_1 = require("../models/user.model");
const locationProjection = {
    _id: 0,
    locationName: 1,
    locationId: 1,
    address: 1,
    active: 1,
    createdAt: 1,
    createdBy: 1,
    responsible: 1
};
class LocationService {
    async createLocation(data) {
        const newLocation = new location_model_1.LocationModel({
            ...data,
            locationId: (0, crypto_1.randomUUID)()
        });
        return await newLocation.save();
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
    async updateLocationById(locationId, data) {
        const update = await location_model_1.LocationModel.updateOne({ locationId: locationId }, { $set: data }, { runValidators: true });
        if (update.modifiedCount === 0)
            return false;
        if (data.responsible) {
            const userData = await user_model_1.UserModel.findOne({ responsibleLocations: locationId });
            if (userData && userData?.userId !== data.responsible) {
                await user_model_1.UserModel.updateOne({ userId: userData?.userId }, {
                    $pull: {
                        responsibleLocations: locationId
                    }
                });
            }
            await user_model_1.UserModel.updateOne({ userId: data.responsible }, {
                $push: {
                    responsibleLocations: data.responsible
                }
            });
        }
        return true;
    }
    async getLocations(skip = 0, limit = 10) {
        const locations = location_model_1.LocationModel.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'responsible',
                    foreignField: 'userId',
                    as: 'userInfo'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: 'userId',
                    as: 'userInfoCreatedBy'
                }
            },
            {
                $project: {
                    ...locationProjection,
                    responsible: {
                        $cond: [
                            { $gt: [{ $size: '$userInfo' }, 0] },
                            { $arrayElemAt: ['$userInfo.fullname', 0] },
                            'Unknown User'
                        ]
                    },
                    createdBy: {
                        $cond: [
                            { $gt: [{ $size: '$userInfoCreatedBy' }, 0] },
                            { $arrayElemAt: ["$userInfoCreatedBy.fullname", 0] },
                            'Unknown User'
                        ]
                    }
                }
            },
            { $skip: skip },
            { $limit: limit }
        ]);
        return locations;
    }
    async getLocationById(locationId) {
        const locations = location_model_1.LocationModel.aggregate([
            {
                $match: { locationId }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'responsible',
                    foreignField: 'userId',
                    as: 'userInfo'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: 'userId',
                    as: 'userInfoCreatedBy'
                }
            },
            {
                $project: {
                    ...locationProjection,
                    responsible: {
                        $cond: [
                            { $gt: [{ $size: '$userInfo' }, 0] },
                            { $arrayElemAt: ['$userInfo.fullname', 0] },
                            'Unknown User'
                        ]
                    },
                    createdBy: {
                        $cond: [
                            { $gt: [{ $size: '$userInfoCreatedBy' }, 0] },
                            { $arrayElemAt: ["$userInfoCreatedBy.fullname", 0] },
                            'Unknown User'
                        ]
                    }
                }
            }
        ]);
        return locations;
    }
    async deleteLocationById(locationId) {
        const req = await location_model_1.LocationModel.deleteOne({ locationId });
        if (req.deletedCount === 0) {
            return false;
        }
        return true;
    }
}
exports.LocationService = LocationService;
