
import {  IDivision, DivisionModel } from "../models/divisionTypes.model";

export class DivisionService {
    async createDivision(data: IDivision) {
        const DivisionExists = await  DivisionModel.findOne({ $or: [{label: data.label}, {divisionType: data.divisionType}]})
        if (DivisionExists) {
            return {
                state: false, 
                message: 'type or division already exists'
            }
        }
        const newDivision = new DivisionModel(data);
        const save = await newDivision.save();
        if(save.isNew) {
            return { state: false, date: newDivision.divisionId, message: 'There was an error creating the Division'}
        } else {
            return { state: true, date: newDivision.divisionId, message: 'New division created'}
        }
    }
}