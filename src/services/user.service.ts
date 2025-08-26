import { randomUUID } from "crypto";
import { UserModel, IUser } from "../models/user.model";
import bcrypt from 'bcryptjs'
import { DivisionModel } from "../models/divisionTypes.model";

const UserProjection = {
    _id:0,
    fullname: 1,
    email: 1,
    phone: 1,
    userType: 1,
    divisionType:1,
    location: 1,
    active: 1,
    authenticated: 1,
    userId: 1,
    createdAt: 1
}

export class UserService {
    async createUser(data: IUser) {
        const exist = await UserModel.findOne({ email: data.email });
        if (exist) throw new Error('User already registered');
        if (data.divisionType) {
            const checkIfDivisionExists = await DivisionModel.findOne({ divisionType: data.divisionType })
            if (!checkIfDivisionExists) {
                throw new Error('The division does not exists')
            }
        }
        const hashPassword = await bcrypt.hash(data.password, 10);
        const newUser = new UserModel({
            ...data,
            password: hashPassword,
            userId: randomUUID()
        });

        return await newUser.save();
    }

    async getAllUsers(skip: number = 0, limit: number = 10) {
        //const users = await UserModel.find({}, {"_id":0, "password":0}).skip(skip).limit(limit).lean();
        const users = await UserModel.aggregate([
            {
                $lookup: {
                    from: 'divisions',
                    localField: 'divisionType',
                    foreignField: 'divisionType',
                    as: 'divisionInfo'
                }
            },
            {
                $unwind: {
                    path: "$divisionInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    ...UserProjection,
                    divisionType: "$divisionInfo.label"
                }
            },
            { $skip: skip},
            { $limit: limit}
        ])
        return users;
    }
}