import { randomUUID, UUID } from "crypto";
import mongoose, { Schema, Document, Date } from "mongoose";

export interface IEmployeeReqForm extends Document {
  updatedBy:string,
  updatedAt: Date,
  formId: UUID;
  createdAt: Date;
  createdBy: UUID;
  reportTo: UUID;
  jobNumber: string;
  jobLocation: UUID;
  projectedLength: string | number;
  applicants: string[]

}
const EmployeeRequisitionFormSchema = new Schema<IEmployeeReqForm>(
  {
    formId: { type: String, default: randomUUID },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, required: true },
    reportTo: { type: String, required: true },
    jobNumber: { type: String, required: true },
    jobLocation: { type: String, required: true },
    projectedLength: { type: Schema.Types.Mixed, required: true }, 
    updatedBy: {type: String, required:false },
    updatedAt: { type: Date, required: false},
    applicants: {type: [String],  require:false}
  },
  { timestamps: true, strict: 'throw' }
  
);

export const EmployeeRequisitionFormModel = mongoose.model<IEmployeeReqForm>('employeeRequisitionForms', EmployeeRequisitionFormSchema);

