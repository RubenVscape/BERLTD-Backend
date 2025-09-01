import {
  Body,
  CurrentUser,
  Get,
  JsonController,
  Post,
  Authorized,
  HttpCode,
  Res,
  Patch,
  Param,
  QueryParam,
} from "routing-controllers";
import { DivisionModel, IDivision } from "../models/divisionTypes.model";
import { JwtPayload } from "../auth/authorizationChecker";
import { DivisionService } from "../services/division.service";
import { Response } from "express";

const divisionService = new DivisionService();

interface ServiceResponse {
  state: boolean;
  data: string[];
  message: string;
}

const authorizedUsers = ["global", "manager"];

@JsonController("/division")
export class DivisionController {
  @HttpCode(201)
  @Authorized(authorizedUsers)
  @Post("/newDivision")
  async NewDivision(
    @Body() body: IDivision,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response
  ) {
    body.createdBy = user.sub;
    if (!body?.divisionType) {
      const data = await DivisionModel.countDocuments();
      body.divisionType = data + 1;
    }
    const newDivision = new DivisionModel(body);
    const save = (await divisionService.createDivision(
      newDivision
    )) as ServiceResponse;
    if (save.state) {
      return res.status(201).json(save);
    } else {
      return res.status(400).json(save);
    }
  }

  @HttpCode(200)
  @Authorized(authorizedUsers)
  @Patch("/updateDivisionById/:divisionId")
  async updateDivisionById(
    @Body() body: IDivision,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
    @Param("divisionId") divisionId: string
  ) {
    try {
      await divisionService.updateDivision(user.sub, body, divisionId);
      return {
        message: "division updated correctly",
        data: divisionId,
        state: true,
      };
    } catch (error: any) {
      return res
        .status(500)
        .json({
          message: "there was an error updating division",
          error: error?.message,
        });
    }
  }

  @HttpCode(200)
  @Authorized(authorizedUsers)
  @Get("/getDivisions")
  async getDivisions(
    @Res() res: Response,
    @QueryParam('page') page:number = 1,
    @QueryParam('limit') limit:number = 5,
  ) {
    try {
        const skip = (page - 1) * limit;
      const data = await divisionService.getDivisions(skip, limit) as [string] | any;
      return {
          state: true,
        data,
        page,
        limit,
        total: data?.length
      };
    } catch (error: any) {
      return res
        .status(500)
        .json({
          message: "there was an error updating division",
          error: error?.message,
        });
    }
  }
}
