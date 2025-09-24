import { JsonController, Post, Get, HttpCode, Body, Authorized, CurrentUser, Res, Patch, Param, QueryParam, Delete } from "routing-controllers";
import { LocationService } from "../services/locations.service";
import { ILocation } from "../models/location.model";
import { JwtPayload } from "../auth/authorizationChecker";
import { UserService } from "../services/user.service";
import { UUID } from "crypto";
import { Response } from "express";
import { IUser } from "../models/user.model";

const locationService = new LocationService();
const userService = new UserService();

const locationTemplate = ["locationName", "address", "active", 'responsible']
const authorizedPeople = ['manager', 'global', 'Division leader'];

// API LIST 
// root route /locations
// get locations GET /getLocations
// create random location POST /createRandomLocation
// update location by id  PATCH /updateLocationById/:locationId
// get location by id  GET /getLocationById/:locationId
//  check if location has users assigned GET /checkIfLocationHasData/:locationId
// delete location by id DELETE /deleteLocationById/:locationId

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
        const checkIfResponsibleExists = await userService.getUserById(body.responsible) as IUser;
        if (!checkIfResponsibleExists) {
            return res.status(400).json({ message: 'Responsible does not exist', data: [] })
        }
        const location = await locationService.createLocation(newLocation);
        await userService.addLocationToUser(body.responsible as UUID, location.locationId)
        return { message: 'location created', data: [location.locationId] }
    }

    @Authorized(authorizedPeople)
    @HttpCode(200)
    @Get("/getLocations")
    async getLocations(@QueryParam('page') page: number = 1, @QueryParam('limit') limit: number = 5, @Res() res: Response) {
        try {
            const skip = (page - 1) * limit;
            const locations = await locationService.getLocations(skip, limit);
            return { status: 'ok', data: locations, total: locations.length, page, limit}
        } catch (error) {
            return res.status(500).json({ message: 'There was an error', error })
        }
    }

    @Authorized(authorizedPeople)
    @HttpCode(200)
    @Get('/getLocationById/:locationId')
    async getLocationById(@Param('locationId') locationId: UUID, @Res() res: Response) {
        try {
            const request = await locationService.getLocationById(locationId) as ILocation[] | string[];
            if (request.length === 0) {
                return res.status(400).json({ message: 'location not found', data: [] })
            }
            return { message: 'request ok', data: request }
        } catch (error) {
            return res.status(500).json({ message: 'There was an error', error })
        }
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
    async updateLocationById(@Res() res: Response, @Body() data: ILocation, @Param('locationId') locationId: UUID) {
        try {
            const keys = Object.keys(data);
            let hasInvalidValues = false;
            keys.forEach(k => {
                if (!locationTemplate.includes(k)) hasInvalidValues = true;
            }
            )
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

        } catch (error) {
            res.status(500).json({ message: 'there was an error', error })
        }
    }

    @HttpCode(200)
    @Authorized(authorizedPeople)
    @Get('/checkIfLocationHasData/:locationId')
    async checkIfLocationHasData(@Res() res: Response, @Param('locationId') locationId: UUID) {
        try {
            const request = await userService.checkIfUserHasLocation(locationId) as string[] | any;
            if (request == null) {
                return { hasUsers: false, message: 'Location has no users, able to delete' }
            }
            return { hasUsers: true, message: 'This locations has users, are you sure you want delete it?' }

        } catch (error) {
            res.status(500).json({ message: 'there was an error', error })

        }

    }
    @HttpCode(200)
    @Authorized(authorizedPeople)
    @Delete('/deleteLocationById/:locationId')
    async deleteLocationById(@Res() res: Response, @Param('locationId') locationId: UUID) {
        try {
            const checkIfLocationExists = await locationService.getLocationById(locationId);
         if(checkIfLocationExists.length == 0) {
               return res.status(400).json({message:'Unable to delete, location does not exist', state:false, data:[]} )
          }
            const removeLocationFromUsers = await userService.removeLocationToUserById(locationId) as string[] | any;
            console.log(removeLocationFromUsers)
            if (removeLocationFromUsers) {
                const deleteLocation = await locationService.deleteLocationById(locationId)
                if (deleteLocation) {
                    return res.status(500).json({ state: false, message: 'There was an issue deleting the location', data: [] });
                }
                return { state: true, message: 'There was an issue deleting the location', data: [] };
            }

        } catch (err) {
            console.log(err)
            res.status(500).json({ message: 'there was an error', error:err })
        }

    }

}

