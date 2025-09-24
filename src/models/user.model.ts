import mongoose, { Schema, Document} from "mongoose";

export interface IUser extends Document {
    fullname: string;
    email: string;
    phone: number;
    userType: string;
    divisionType:string;
    department: string;
    password: string;
    location: string[];
    active: boolean;
    authenticated: boolean;
    userId: string;
    createdAt: Date;
    responsibleLocations?: string[];
    status: string;
}

const UserSchema = new Schema<IUser> (
    {
        fullname: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: Number, required: true },
        userType: { type: String, required: true },
        password: { type: String, required: false, minlength:4 },
        location: { type: [String], required: true },
        active: { type: Boolean, required: false, default:true },
        authenticated: { type: Boolean,required: false, default: false},
        userId: { type: String, require: false },
        createdAt: { type: Date, default: Date.now},
        divisionType: { type: String, required:false},
        department: { type: String, required:false},
        responsibleLocations: { type: [String], required: false},
        status: { type: String, required: false}
    },
    { timestamps: true}
);

export const UserModel = mongoose.model<IUser>("users", UserSchema);


