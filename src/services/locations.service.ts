import { randomUUID, UUID } from "crypto";
import { LocationModel, ILocation } from "../models/location.model";
import { faker } from "@faker-js/faker";
import { UserModel } from "../models/user.model";


const locationProjection = {
        _id:0,
        locationName: 1,
        locationId: 1,
        address: 1,
        active: 1,
        createdAt: 1,
        createdBy: 1,
        responsible: 1
}
export class LocationService {
    async createLocation(data: ILocation) {
        const newLocation = new LocationModel({
            ...data,
            locationId: randomUUID()
        })
        return await newLocation.save();
    }

    async createRandomLocation() {
        const randomUserIds = ['29ffd4ed-577b-47b8-b1a9-36922e8766a0', 'ed3b44ec-9645-4e44-91a2-379f7348572e', 'b8be28d5-d014-4283-811c-e3a4d4b32cd4']
        const active = [true, false, true];
        const random = Math.floor(Math.random() * 3);
        const fakeLocation = {
            locationName: faker.company.name(),
            address: faker.location.city() + " " + faker.location.secondaryAddress(),
            active: active[random]
        } as ILocation

        const newL = new LocationModel({
            ...fakeLocation,
            locationId: randomUUID(),
            responsible: randomUserIds[random],
            createdBy: randomUserIds[random]
        })
        return await newL.save();
    }

    async updateLocationById(locationId: UUID, data: ILocation) {
        const update = await LocationModel.updateOne({ locationId: locationId }, { $set: data }, {runValidators:true });
        if (update.modifiedCount === 0) return false;
        if(data.responsible) {
            const userData = await UserModel.findOne({responsibleLocations: locationId})
            if (userData && userData?.userId !== data.responsible) {
                 await UserModel.updateOne({ userId: userData?.userId}, {
                    $pull: {
                        responsibleLocations: locationId
                    }
                })

            }
            await UserModel.updateOne({userId:data.responsible}, {
                $push:{
                    responsibleLocations: data.responsible
                }
            })
        }
        return true;
    }
    async getLocations(skip: number = 0, limit:number=10) {
        const locations = LocationModel.aggregate([
            {
                $lookup:{
                    from:'users',
                    localField:'responsible',
                    foreignField:'userId',
                    as:'userInfo'
                }
            }, 
            {
                $lookup: {
                    from:'users',
                    localField:'createdBy',
                    foreignField:'userId',
                    as:'userInfoCreatedBy'
                }
            },
            {
                $project: {
                    ...locationProjection,
                    responsible: {
                        $cond :[
                            { $gt: [{$size: '$userInfo'},0]},
                           {$arrayElemAt: ['$userInfo.fullname',0]},
                            'Unknown User'
                        ]
                    },
                    createdBy:{
                        $cond: [
                            {$gt:[{$size:'$userInfoCreatedBy'},0]},
                            {$arrayElemAt: ["$userInfoCreatedBy.fullname",0]},
                            'Unknown User'
                        ]
                    }
                }
            },
            { $skip: skip},
            {$limit: limit}
        ]);
        return locations
    }
    async getLocationById(locationId: UUID) {
        const locations = LocationModel.aggregate([
            {
                $match: { locationId}
            },
            {
                $lookup:{
                    from:'users',
                    localField:'responsible',
                    foreignField:'userId',
                    as:'userInfo'
                }
            }, 
            {
                $lookup: {
                    from:'users',
                    localField:'createdBy',
                    foreignField:'userId',
                    as:'userInfoCreatedBy'
                }
            },
            {
                $project: {
                    ...locationProjection,
                    responsible: {
                        $cond :[
                            { $gt: [{$size: '$userInfo'},0]},
                           {$arrayElemAt: ['$userInfo.fullname',0]},
                            'Unknown User'
                        ]
                    },
                    createdBy:{
                        $cond: [
                            {$gt:[{$size:'$userInfoCreatedBy'},0]},
                            {$arrayElemAt: ["$userInfoCreatedBy.fullname",0]},
                            'Unknown User'
                        ]
                    }
                }
            }
        ]);
        return locations
    }
    async deleteLocationById(locationId:UUID) {
        const req = await LocationModel.deleteOne({locationId});
        if (req.deletedCount === 0) {
            return false;
        }
        return true;
    }
}