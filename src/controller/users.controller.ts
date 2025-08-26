import { JsonController, Get, Post, Body, HttpCode, Param, NotFoundError, Authorized, QueryParam } from 'routing-controllers';
import { UserService } from '../services/user.service';
import { IUser } from '../models/user.model';

const userService = new UserService();

@JsonController("/users")
export default class UserController {
    @HttpCode(201)
    @Post("/create")
    async createUser(@Body() body: IUser){
        const user = await userService.createUser(body);
        return { data: user.userId, message: 'User created'}
    }
    @HttpCode(200)
    @Authorized(['global', 'manager'])
    @Get("/getUsers")
    async getUsers(@QueryParam('page') page:number, @QueryParam('limit') limit:number ) {
        const skip = (page - 1 ) * limit
        const data = await userService.getAllUsers(skip, limit);
        return { data, total:  data.length, message:'Request ok'}
    }

    
}
