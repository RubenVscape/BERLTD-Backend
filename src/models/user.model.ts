import mongoose, { Schema, Document} from "mongoose";

export interface IUser extends Document {
    fullname: string;
    email: string;
    phone: string;
    userType: string;
    divisionType:number;
    password: string;
    location: string[];
    active: boolean;
    authenticated: boolean;
    userId: string;
    createdAt: Date;
    responsibleLocations?: string[]
}

const UserSchema = new Schema<IUser> (
    {
        fullname: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        userType: { type: String, required: true },
        password: { type: String, required: true, minlength:4 },
        location: { type: [String], required: true },
        active: { type: Boolean, required: false, default:false },
        authenticated: { type: Boolean,required: false, default: false},
        userId: { type: String, require: false },
        createdAt: { type: Date, default: Date.now},
        divisionType: { type: Number, required:false},
        responsibleLocations: { type: [String], required: false}
    },
    { timestamps: true}
);

export const UserModel = mongoose.model<IUser>("users", UserSchema);


