import { randomUUID, UUID } from "crypto";
import { UserModel, IUser } from "../models/user.model";
import bcrypt from 'bcryptjs'
import { DivisionModel } from "../models/divisionTypes.model";
import { IsUUID } from "class-validator";
import { ILocation, LocationModel } from "../models/location.model";
import { LocationService } from "./locations.service";

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
    responsibleLocations: 1
};

export class UserService {
    async createUser(data: IUser) {
        const exist = await UserModel.findOne({ email: data.email });
        if (exist) throw new Error('User already registered');
        if (data.divisionType) {
            const checkIfDivisionExists = await DivisionModel.findOne({ divisionType: data.divisionType })
            if (!checkIfDivisionExists) {
                throw new Error('The division does not exists')
            }
        }
        const hashPassword = await bcrypt.hash(data.password, 10);
        const newUser = new UserModel({
            ...data,
            password: hashPassword,
            userId: randomUUID()
        });

        return await newUser.save();
    }

    async getAllUsers(skip: number = 0, limit: number = 10) {
        //const users = await UserModel.find({}, {"_id":0, "password":0}).skip(skip).limit(limit).lean();
        const users = await UserModel.aggregate([
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
        ])
        return users;
    }


    async getUserById(id: UUID) {
        const user = await UserModel.aggregate([
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
        ]) as IUser | string[];
        return user;
    }
    async updateUserById(userId: UUID, data: IUser) {
        const updateUser = await UserModel.updateOne({ userId }, {
            $set: data
        })
        if (!updateUser.acknowledged) {
            return null;
        }
        return userId;
    }
    async deleteUserById(userId: UUID) {
        const updateUser = await UserModel.deleteOne({ userId })
        if (!updateUser.acknowledged) {
            return null;
        }
        return userId;
    }
    async addLocationToUser(userId: UUID, location: string) {
        return await UserModel.updateOne({ userId }, { $push: { responsibleLocations:location } })
    }
}

