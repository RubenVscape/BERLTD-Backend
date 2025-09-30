import { JsonController, Get, Post, Body, HttpCode, Param, Authorized, QueryParam, Res, Patch, Delete } from 'routing-controllers';
import { UserService } from '../services/user.service';
import { IUser } from '../models/user.model';
import { Response } from 'express';
import { UUID } from 'crypto';


// api  list ROOT /users

// create user POST /create
// get users GET /getUsers
// get user by id GET /getUserById/:id 
// update user by ID PATCH /updateUserById 
// delete user by id DELETE /deleteUserById/:userId


const userService = new UserService();
const invalidKeysForUser = [
    "_id",
    "email",
    "password",
    "active",
    "userId",
    "createdAt",
    "updatedAt",
    'divisionType',
    'responsibleLocations'
];
const authorizedUsers = ['global', 'manager'];
@JsonController("/users")
export default class UserController {
    @HttpCode(201)
    @Post("/create")
    @Authorized(authorizedUsers)
    async createUser(@Body() body: IUser) {
        const user = await userService.createUser(body);
        return { data: user.userId, message: 'User created', state:true }
    }
    @HttpCode(200)
    @Authorized(authorizedUsers)
    @Get("/getUsers")
    async getUsers(@QueryParam('page') page: number = 1, @QueryParam('limit') limit: number = 10, @Res() res: Response, @QueryParam('filter') filter:string) {
        try {
            const skip = (page - 1) * limit
            const data = await userService.getAllUsers(skip, limit, filter);
            return { data, total: data.length, message: 'Request ok', state:true }

        } catch (error) {
            return res.status(500).json({ message: 'there was an error', error: error })
        }
    }

    @Authorized(authorizedUsers)
    @HttpCode(200)
    @Get("/getUserById/:id")
    async getUserById(@Res() res: Response, @Param('id') id: UUID) {
        try {
            const request = await userService.getUserById(id)
            if (!request) {
                return res.status(404).json({
                    message: 'User not found',
                    data: [],
                    state:false
                })
            }
            return res.status(200).json({ data: request, state:true })

        } catch (err) {
            return res.status(500).json({ message: 'there was an error', error: err, state:false })
        }
    }

    @Authorized(authorizedUsers)
    @HttpCode(200)
    @Patch('/updateUserById/:userId')
    async updateUserById(@Res() res: Response, @Param('userId') userId: UUID, @Body() body: IUser) {
        try {
            const keys = Object.keys(body);
            console.log(keys);
            let hasInvalidFields = false;
            keys.forEach(k => {if (invalidKeysForUser.includes(k)) hasInvalidFields = true;  })
            if (!hasInvalidFields) {
                return res.status(400).json({ message: 'invalid fields for update', data: [] })
            }
            const updateReq = await userService.updateUserById(userId, body);
            if (updateReq) {
                return res.status(200).json({ message: 'User updated Correctly', data: userId, state: true})
            }
            return res.status(400).json({ message: 'unable to update users', data: [], state:false })

        } catch (err) {
            return res.status(500).json({ message: 'there was an error', error: err })
        }
    }
    @Authorized(['manager', 'global'])
    @HttpCode(200)
    @Delete('/deleteUserById/:userId')
    async deleteUserById(@Res() res: Response, @Param('userId') userId: UUID) {
        try {
            const updateReq = await userService.deleteUserById(userId);
            if (updateReq) {
                return res.status(200).json({ message: 'User Delete Correctly', data: userId, state:true })
            }
            return res.status(400).json({ message: 'unable to delete user', data: [], state: false })

        } catch (err) {
            return res.status(500).json({ message: 'there was an error', error: err })
        }
    }

}
