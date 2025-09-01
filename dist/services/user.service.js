"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const crypto_1 = require("crypto");
const user_model_1 = require("../models/user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const divisionTypes_model_1 = require("../models/divisionTypes.model");
const UserProjection = {
    _id: 0,
    fullname: 1,
    email: 1,
    phone: 1,
    userType: 1,
    divisionType: 1,
    location: 1,
    active: 1,
    authenticated: 1,
    userId: 1,
    createdAt: 1,
    responsibleLocations: 1,
    status: 1
};
class UserService {
    async createUser(data) {
        const exist = await user_model_1.UserModel.findOne({ email: data.email });
        if (exist)
            throw new Error('User already registered');
        if (data.divisionType) {
            const checkIfDivisionExists = await divisionTypes_model_1.DivisionModel.findOne({ divisionType: data.divisionType });
            if (!checkIfDivisionExists) {
                throw new Error('The division does not exists');
            }
        }
        if (data.password) {
            const hashPassword = await bcryptjs_1.default.hash(data.password, 10);
            const newUser = new user_model_1.UserModel({
                ...data,
                password: hashPassword,
                userId: (0, crypto_1.randomUUID)()
            });
            return await newUser.save();
        }
        const user = new user_model_1.UserModel({
            ...data,
            userId: (0, crypto_1.randomUUID)()
        });
        return await user.save();
    }
    async getAllUsers(skip = 0, limit = 10) {
        //const users = await UserModel.find({}, {"_id":0, "password":0}).skip(skip).limit(limit).lean();
        const users = await user_model_1.UserModel.aggregate([
            {
                $lookup: {
                    from: 'divisions',
                    localField: 'divisionType',
                    foreignField: 'divisionType',
                    as: 'divisionInfo'
                }
            },
            {
                $lookup: {
                    from: 'locations',
                    localField: 'location',
                    foreignField: 'locationId',
                    as: 'locationInfo'
                }
            },
            {
                $lookup: {
                    from: 'locations',
                    localField: 'responsibleLocations',
                    foreignField: 'locationId',
                    as: 'responsibleLocationsInfo'
                }
            },
            {
                $unwind: {
                    path: "$divisionInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    ...UserProjection,
                    divisionType: {
                        $cond: [
                            {
                                $ifNull: ["$divisionInfo", false]
                            },
                            "$divisionInfo.label",
                            "$$REMOVE"
                        ]
                    },
                    location: {
                        $cond: [
                            { $in: ['all', '$location'] },
                            'all',
                            {
                                $map: {
                                    input: '$locationInfo',
                                    as: 'loc',
                                    in: '$$loc.locationName'
                                }
                            }
                        ]
                    },
                    responsibleLocations: {
                        $cond: [
                            { $gt: [{ $size: { $ifNull: ['$responsibleLocationsInfo', []] } }, 0] },
                            {
                                $map: {
                                    input: '$responsibleLocationsInfo',
                                    as: 'loc',
                                    in: '$$loc.locationName'
                                }
                            },
                            []
                        ]
                    }
                }
            },
            { $skip: skip },
            { $limit: limit }
        ]);
        return users;
    }
    async getUserById(id) {
        const user = await user_model_1.UserModel.aggregate([
            {
                $lookup: {
                    from: 'divisions',
                    localField: 'divisionType',
                    foreignField: 'divisionType',
                    as: 'divisionInfo'
                }
            }, {
                $lookup: {
                    from: 'locations',
                    localField: 'location',
                    foreignField: 'locationId',
                    as: 'locationInfo'
                }
            },
            {
                $match: {
                    userId: id
                }
            }, {
                $unwind: {
                    path: '$divisionInfo',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    ...UserProjection,
                    divisionType: {
                        $cond: [
                            {
                                $ifNull: ['$divisionInfo', false]
                            },
                            "$divisionInfo.label",
                            "$$REMOVE"
                        ]
                    },
                    location: {
                        $map: {
                            input: '$locationInfo',
                            as: 'loc',
                            in: {
                                locationId: '$$loc.locationId',
                                name: '$$loc.locationName'
                            }
                        }
                    }
                }
            }
        ]);
        return user;
    }
    async updateUserById(userId, data) {
        const updateUser = await user_model_1.UserModel.updateOne({ userId }, {
            $set: data
        });
        if (!updateUser.acknowledged) {
            return null;
        }
        return userId;
    }
    async deleteUserById(userId) {
        const updateUser = await user_model_1.UserModel.deleteOne({ userId });
        if (!updateUser.acknowledged) {
            return null;
        }
        return userId;
    }
    async addLocationToUser(userId, location) {
        return await user_model_1.UserModel.updateOne({ userId }, { $push: { responsibleLocations: location } });
    }
    async checkIfUserHasLocation(locationId) {
        return await user_model_1.UserModel.findOne({ location: locationId }, { _id: 0 }).lean();
    }
    async removeLocationToUserById(locationId) {
        const removeLocationFromUser = await user_model_1.UserModel.updateMany({ location: locationId }, {
            $pull: {
                location: locationId
            }
        });
        if (removeLocationFromUser.modifiedCount === 0) {
            return new Error('There was an error please try later');
        }
        const removeResPonsible = await user_model_1.UserModel.updateOne({ responsibleLocations: locationId }, {
            $pull: { responsibleLocations: locationId }
        });
        if (removeResPonsible.modifiedCount === 0) {
            return new Error('There was an error removing the responsible, please try again');
        }
        return true;
    }
}
exports.UserService = UserService;
