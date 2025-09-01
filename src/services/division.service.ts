import { IDivision, DivisionModel } from "../models/divisionTypes.model";
import { UserModel } from "../models/user.model";

export class DivisionService {
  async createDivision(data: IDivision) {
    const DivisionExists = await DivisionModel.findOne({
      $or: [{ label: data.label }, { divisionType: data.divisionType }],
    });
    if (DivisionExists) {
      return {
        state: false,
        message: "type or division already exists",
      };
    }
    const newDivision = new DivisionModel(data);
    const save = await newDivision.save();
    if (save.isNew) {
      return {
        state: false,
        date: newDivision.divisionId,
        message: "There was an error creating the Division",
      };
    } else {
      return {
        state: true,
        date: newDivision.divisionId,
        message: "New division created",
      };
    }
  }
  async getDivisions(skip: number, limit: number) {
    const divisions = await DivisionModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "responsible",
          foreignField: "userId",
          as: "UserInfo",
        },
      },
      {
        $addFields: {
            responsible: {
                $cond : [
                    {$gt: [{ $size: '$UserInfo'}, 0]},
                    {$arrayElemAt: ["$UserInfo.fullname",0]},
                    'Unknown Responsible'
                ]
            }
        }
      },
            {
        $project:{
            _id:0,
            UserInfo:0,
            __v:0
        }
      },
      {$skip:skip},
      {$limit: limit}
    ]);

    return divisions;
  }
  async updateDivision(updatedBy: string, data: IDivision, divisionId: string) {
    const responsibleInfo = await UserModel.findOne({
      userId: data.responsible,
    });
    if (!responsibleInfo) throw new Error("Responsible Not Found");
    const checkIfDivisionExists = await DivisionModel.findOne({
      label: data.label,
    });
    if (checkIfDivisionExists) throw new Error("Division already Exists");
    const update = await DivisionModel.updateOne(
      {
        divisionId: divisionId,
      },
      {
        $set: {
          ...data,
          updatedBy,
          updatedAt: new Date()
        },
      }
    );
    if (update.modifiedCount === 0)
      throw new Error("There was an error updating division");
  }
}
