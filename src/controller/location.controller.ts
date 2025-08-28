import { JsonController, Post, Get, HttpCode, Body, Authorized, CurrentUser, Res, Patch, Param, QueryParam } from "routing-controllers";
import { LocationService } from "../services/locations.service";
import { ILocation } from "../models/location.model";
import { JwtPayload } from "../auth/authorizationChecker";
import { UserService } from "../services/user.service";
import { UUID } from "crypto";
import { Response } from "express";

const locationTemplate = [ "locationName", "address", "active", 'responsible']
const locationService = new LocationService();
const userService = new UserService();

const authorizedPeople = ['manager', 'global', 'Division leader']

@JsonController("/locations")
export default class LocationController {
    @HttpCode(201)
    @Authorized(authorizedPeople)
    @Post("/createLocation")
    async createLocation(@Body() body: ILocation, @CurrentUser() user: JwtPayload, @Res() res: Response) {
        const newLocation = {
            ...body,
            createdBy: user.sub
        } as ILocation;
        const checkIfResponsibleExists = await userService.getUserById(body.responsible as UUID) as string[];
        if (checkIfResponsibleExists.length === 0) {
            return res.status(400).json({ message: 'Responsible does not exist', data: [] })
        }
        const location = await locationService.createLocation(newLocation);
        await userService.addLocationToUser(body.responsible as UUID, location.locationId)
        return { message: 'location created', data: [location.locationId] }
    }

    @HttpCode(200)
    @Get("/getLocations")
    async getLocations(@QueryParam('page') page:number = 1, @QueryParam('limit') limit:number = 5) {

        const skip = (page -1 ) * limit;


        const locations = await locationService.getLocations(skip, limit);
        return { status: 'ok', data: locations, total: locations.length }
    }

    @HttpCode(200)
    @Authorized(authorizedPeople)
    @Post("/createRandomLocation")
    async createRandom() {
        let attempts = 0;
        let errors = 0;
        for (let index = 0; index < 101; index++) {
            const randomLocation = await locationService.createRandomLocation();
            if (randomLocation.isNew) {
                attempts++;
            } else {
                errors++
            }
        }
        return { totalAdded: attempts, errors: errors }
    }

    @HttpCode(200)
    @Authorized(authorizedPeople)
    @Patch('/updateLocationById/:locationId')
    async updateLocationById(@Res() res:Response, @Body() data: ILocation, @Param('locationId') locationId: UUID ) {
        try {
            const keys = Object.keys(data);
            let hasInvalidValues = false;
            keys.forEach(k => {
                if(!locationTemplate.includes(k)) hasInvalidValues = true;
            }
            )
            if(hasInvalidValues) {
                return res.status(400).json({
                    message: 'Invalid update request, invalid inputs',
                    status: false,
                    data:[]
                });
            }
            const updateRequest = await locationService.updateLocationById(locationId, data);
            return updateRequest ? res.status(200).json({message:'Location updated Correctly', data: locationId, status:true}) :
            res.status(400).json({message:'unable to updated location', data: [], status:false});
            
        } catch (error) {
            res.status(500).json({message: 'there was an error', error})
        }
    }

}

