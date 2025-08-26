import { Body, CurrentUser, Get, JsonController, Post, Authorized } from "routing-controllers";
import { IsEmail, IsString, MinLength } from "class-validator";
import jwt from 'jsonwebtoken';
import { UserModel } from "../models/user.model";
import bcrypt from 'bcryptjs';
import { JwtPayload } from "../auth/authorizationChecker";


class LoginDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(4)
    password!:string;
}

@JsonController()
export class AuthController{
    @Post('/auth/login')
    async login(@Body() body: LoginDto){
        const user = await UserModel.findOne({email: body.email}).lean();
        if(!user) {
            return { state: false, message: 'invalid credentials', data: []};
        }
        
        const passwordOk = await bcrypt.compare(body.password, user.password);
        if (!passwordOk) {
            return { state: false, message: 'invalid credentials', data: []};
        }
        const token = jwt.sign(
            { sub: String(user.userId), email: user.email, userType: user.userType},
            process.env.JWT_SECRET as string,
            { expiresIn: process.env.JWT_EXPIRES || '1h' as any}
        );
        return {
            state: true, 
            token,
            tokenType: "Bearer",
            expiresIn: 3600,
            user: {id: user?.userId, email: user?.email, userType: user?.userType}
        }
    }
    @Get("/auth/validateToken")
    @Authorized()
    async validateToken(@CurrentUser() user: JwtPayload) {
        return { status: true, userInfo: user}
    }
}