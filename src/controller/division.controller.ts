import { Body, CurrentUser, Get, JsonController, Post, Authorized, HttpCode, Res } from "routing-controllers";
import { DivisionModel, IDivision } from "../models/divisionTypes.model";
import { JwtPayload } from "../auth/authorizationChecker";
import { DivisionService } from "../services/division.service";
import { Response } from 'express'

const divisionService = new DivisionService();

interface ServiceResponse {
    state: boolean,
    data: string[],
    message:string
}

@JsonController('/division')
export class DivisionController {
    @HttpCode(201)
    @Authorized(['global'])
    @Post('/newDivision')
    async NewDivision(@Body() body: IDivision, @CurrentUser() user: JwtPayload, @Res() res:Response) {
        body.createdBy = user.sub;
        if(!body?.divisionType){
            const data = await DivisionModel.countDocuments()
            body.divisionType = data + 1;
        }
        const newDivision = new DivisionModel(body);
        const save = await divisionService.createDivision(newDivision) as ServiceResponse;
        if (save.state) {
            return res.status(201).json(save);
        }
        else {
            return res.status(400).json(save);
        }
    }

}