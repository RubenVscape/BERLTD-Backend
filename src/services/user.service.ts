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
    responsibleLocations: 1,
    department:1,
    division:1,
    status: 1
};

export class UserService {
    async createUser(data: IUser) {
        const exist = await UserModel.findOne({ email: data.email });
        if (exist) throw new Error('User already registered');
        // if (data.divisionType) {
        //     const checkIfDivisionExists = await DivisionModel.findOne({ divisionType: data.divisionType })
        //     if (!checkIfDivisionExists) {
        //         throw new Error('The division does not exists')
        //     }
        // }
        if(data.password) {
            const hashPassword = await bcrypt.hash(data.password, 10);
            const newUser = new UserModel({
                ...data,
                password: hashPassword,
                userId: randomUUID()
            });
            return await newUser.save()
        }
        const user = new UserModel({
            ...data,
            userId: randomUUID()
        })

        return await user.save();
    }

    async getAllUsers(skip: number = 0, limit: number = 10, filter:string) {
        //const users = await UserModel.find({}, {"_id":0, "password":0}).skip(skip).limit(limit).lean();
        let match = {
            $match: {}
        }
        if (filter) {
           match =  {
                $match:  { 'department' : filter }
            }
        }
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
            { $limit: limit },
            match
        ])
        return users;
    }


    async getUserById(id: string) {
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
                    // divisionType: {
                    //     $cond: [
                    //         {
                    //             $ifNull: ['$divisionInfo', false]
                    //         },
                    //         "$divisionInfo.label",
                    //         "$$REMOVE"
                    //     ]
                    // },
                    location: {
                        $map: {
                            input: '$locationInfo',
                            as: 'loc',
                            in: {
                                locationId: '$$loc.locationId',
                                name: '$$loc.locationName'
                            }
                        }
                    },
                    locationId: '$location'
                }
            }
        ]) as IUser[];
        return user[0];
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
    async checkIfUserHasLocation(locationId:String) {
        return await UserModel.findOne({location:locationId}, {_id:0}).lean();
    }
    async removeLocationToUserById(locationId:UUID) {
        const removeLocationFromUser = await UserModel.updateMany({location: locationId}, {
            $pull: {
                location: locationId
            }
        })
        if(removeLocationFromUser.modifiedCount === 0) {
            return new Error('There was an error please try later')
        }
        const removeResPonsible = await UserModel.updateOne({responsibleLocations: locationId}, {
                $pull:{ responsibleLocations: locationId}
        })
        if(removeResPonsible.modifiedCount === 0) {
            return new Error('There was an error removing the responsible, please try again')
        }
        return true;
    }
}

