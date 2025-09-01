import { randomUUID, UUID } from "crypto";
import mongoose, {Schema, Document, Date} from "mongoose";

export interface IDivision extends Document {
    divisionId: UUID,
    divisionType?: number, 
    label: string, 
    createdAt: Date,
    createdBy: string,
    responsible:string
}

const DivisionSchema = new Schema<IDivision> (
    {
        createdAt: { type: Date, default: Date.now},
        divisionId: { type: String, required:false, default: randomUUID},
        divisionType: { type:Number, required: false},
        label : {type: String, required: true},
        createdBy: { type: String, required:false },
        responsible: { type:String, required: true}
    },
    { timestamps: true}
)

export const DivisionModel = mongoose.model<IDivision>('Divisions', DivisionSchema);