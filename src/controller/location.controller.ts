import { JsonController, Post, Get, HttpCode, Body, Authorized, CurrentUser } from "routing-controllers";
import { LocationService } from "../services/locations.service";
import { ILocation } from "../models/location.model";
import { JwtPayload } from "../auth/authorizationChecker";

const locationService = new LocationService();


@JsonController("/locations")
export default class LocationController{
    @HttpCode(201)
    @Authorized(["global"])
    @Post("/createLocation")
    async createLocation(@Body() body: ILocation, @CurrentUser() user: JwtPayload){

        const newLocation = {
            ...body,
            createdBy: user.sub
        } as ILocation;
        const  location = await locationService.createLocation(newLocation);
        return { message:'location created', data: [location.locationId]}
    }

    @HttpCode(200)
    @Get("/getLocations")
    async getLocations(){
        const locations = await locationService.getLocations();
        return { status:'ok', data: locations, total: locations.length}
    }

    @HttpCode(200)
    @Authorized(['global'])
    @Post("/createRandomLocation")
    async createRandom(){
        let attempts = 0;
        let errors = 0;
        for (let index = 0; index < 101; index++) {
            const randomLocation = await  locationService.createRandomLocation();
            if (randomLocation.isNew){
                attempts++;
            } else {
                errors ++
            }
        }
        return {totalAdded: attempts, errors: errors}
    }
}