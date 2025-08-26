import { randomUUID } from "crypto";
import { LocationModel,ILocation } from "../models/location.model";
import { faker } from "@faker-js/faker";


export class LocationService {
    async createLocation(data: ILocation){
        const newLocation = new LocationModel({
            ...data,
            locationId: randomUUID()
        })
        return await newLocation.save();
    }
    
    async getLocations(){
        const locations =  await LocationModel.find().select("-_id").lean()
        return (locations);
    }

    async  createRandomLocation() {
        const randomUserIds = ['29ffd4ed-577b-47b8-b1a9-36922e8766a0', 'ed3b44ec-9645-4e44-91a2-379f7348572e', 'b8be28d5-d014-4283-811c-e3a4d4b32cd4']
        const active= [true, false, true];
        const random = Math.floor(Math.random()*3);
        const fakeLocation = {
            locationName: faker.company.name(),
            address: faker.location.city() + " " + faker.location.secondaryAddress(),
            active:active[random]
        } as ILocation

        const newL = new LocationModel({
            ...fakeLocation,
            locationId: randomUUID(),
            responsible: randomUserIds[random],
            createdBy: randomUserIds[random]
        })
        return await newL.save();
    }
}