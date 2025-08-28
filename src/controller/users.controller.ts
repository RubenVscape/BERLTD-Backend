import { JsonController, Get, Post, Body, HttpCode, Param, Authorized, QueryParam, Res, Patch, Delete } from 'routing-controllers';
import { UserService } from '../services/user.service';
import { IUser } from '../models/user.model';
import { Response } from 'express';
import { UUID } from 'crypto';

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

@JsonController("/users")
export default class UserController {
    @HttpCode(201)
    @Post("/create")
    async createUser(@Body() body: IUser) {
        const user = await userService.createUser(body);
        return { data: user.userId, message: 'User created' }
    }
    @HttpCode(200)
    @Authorized(['global', 'manager'])
    @Get("/getUsers")
    async getUsers(@QueryParam('page') page: number, @QueryParam('limit') limit: number, @Res() res: Response) {
        try {
            const skip = (page - 1) * limit
            const data = await userService.getAllUsers(skip, limit);
            return { data, total: data.length, message: 'Request ok' }

        } catch (error) {
            return res.status(500).json({ message: 'there was an error', error: error })
        }
    }

    @Authorized(['global', ' manager'])
    @HttpCode(200)
    @Get("/getUserById/:id")
    async getUserById(@Res() res: Response, @Param('id') id: UUID) {
        try {
            const request = await userService.getUserById(id) as string[]
            if (request.length === 0) {
                return res.status(404).json({
                    message: 'User not found',
                    data: []
                })
            }
            return res.status(200).json({ data: request })

        } catch (err) {
            return res.status(500).json({ message: 'there was an error', error: err })
        }
    }

    @Authorized(['manager', 'global'])
    @HttpCode(200)
    @Patch('/updateUserById/:userId')
    async updateUserById(@Res() res: Response, @Param('userId') userId: UUID, @Body() body: IUser) {
        try {
            const keys = Object.keys(body);
            let hasInvalidFields = false;
            keys.forEach(k => {if (invalidKeysForUser.includes(k)) hasInvalidFields = true;  })
            if (hasInvalidFields) {
                return res.status(400).json({ message: 'invalid fields for update', data: [] })
            }
            const updateReq = await userService.updateUserById(userId, body);
            if (updateReq) {
                return res.status(200).json({ message: 'User updated Correctly', data: userId })
            }
            return res.status(400).json({ message: 'unable to update users', data: [] })

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
                return res.status(200).json({ message: 'User Delete Correctly', data: userId })
            }
            return res.status(400).json({ message: 'unable to delete user', data: [] })

        } catch (err) {
            return res.status(500).json({ message: 'there was an error', error: err })
        }
    }

}
