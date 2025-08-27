"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DivisionService = void 0;
const divisionTypes_model_1 = require("../models/divisionTypes.model");
class DivisionService {
    async createDivision(data) {
        const DivisionExists = await divisionTypes_model_1.DivisionModel.findOne({ $or: [{ label: data.label }, { divisionType: data.divisionType }] });
        if (DivisionExists) {
            return {
                state: false,
                message: 'type or division already exists'
            };
        }
        const newDivision = new divisionTypes_model_1.DivisionModel(data);
        const save = await newDivision.save();
        if (save.isNew) {
            return { state: false, date: newDivision.divisionId, message: 'There was an error creating the Division' };
        }
        else {
            return { state: true, date: newDivision.divisionId, message: 'New division created' };
        }
    }
}
exports.DivisionService = DivisionService;
