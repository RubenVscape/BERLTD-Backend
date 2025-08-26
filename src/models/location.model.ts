import mongoose, { Schema, Document, Date} from "mongoose";

export interface ILocation extends Document { 
    locationName: string;
    locationId: string;
    address: string;
    active: boolean;
    createdAt: Date;
    createdBy: string;
    responsible: string
}


const LocationSchema = new Schema<ILocation> (
    {
        locationName: {type: String, required: true},
        locationId: { type: String, required: true}, 
        address: { type: String, required: true},
        active: { type: Boolean, required: false, default: true},
        createdAt: { type: Date, required: false, default:  Date.now},
        createdBy: {type: String, required: true },
        responsible: {type: String, required: true}
    },
    {
        timestamps: true
    }
);


export const LocationModel = mongoose.model<ILocation>("locations", LocationSchema);