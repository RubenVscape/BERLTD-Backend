"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const crypto_1 = require("crypto");
const user_model_1 = require("../models/user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const divisionTypes_model_1 = require("../models/divisionTypes.model");
const UserProjection = {
    _id: 0,
    fullname: 1,
    email: 1,
    phone: 1,
    userType: 1,
    divisionType: 1,
    location: 1,
    active: 1,
    authenticated: 1,
    userId: 1,
    createdAt: 1
};
class UserService {
    async createUser(data) {
        const exist = await user_model_1.UserModel.findOne({ email: data.email });
        if (exist)
            throw new Error('User already registered');
        if (data.divisionType) {
            const checkIfDivisionExists = await divisionTypes_model_1.DivisionModel.findOne({ divisionType: data.divisionType });
            if (!checkIfDivisionExists) {
                throw new Error('The division does not exists');
            }
        }
        const hashPassword = await bcryptjs_1.default.hash(data.password, 10);
        const newUser = new user_model_1.UserModel({
            ...data,
            password: hashPassword,
            userId: (0, crypto_1.randomUUID)()
        });
        return await newUser.save();
    }
    async getAllUsers(skip = 0, limit = 10) {
        //const users = await UserModel.find({}, {"_id":0, "password":0}).skip(skip).limit(limit).lean();
        const users = await user_model_1.UserModel.aggregate([
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
            { $skip: skip },
            { $limit: limit }
        ]);
        return users;
    }
}
exports.UserService = UserService;
