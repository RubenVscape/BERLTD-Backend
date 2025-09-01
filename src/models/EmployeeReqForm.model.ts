import { randomUUID, UUID } from "crypto";
import mongoose, { Schema, Document, Date } from "mongoose";

export interface Approval {
    state: boolean;
    issuedAt: Date;
    issuedBy: string;
    comment: string;
}

type Department = "hr" | "it" | "security";
export type ApprovalsModel = {
 [key in Department]: Approval
}

export interface IEmployeeReqForm extends Document {
  updatedBy: string;
  updatedAt: Date;
  formId: string;
  createdAt: Date;
  createdBy: string;
  reportTo: string;
  jobNumber: string;
  jobLocation: string;
  projectedLength: string | number;
  applicants: string[];
  approvals: ApprovalsModel;
}

const ApprovalSchema = new Schema (
  {
    state: {type: Boolean, required: true },
    issuedAt: {type: Date, required: true },
    issuedBy: {type: String, required: true },
    comment: {type: String, required: false }
  }, 
  { _id: false, strict: "throw"}
);

const ApprovalsSchema = new Schema (
  {
    hr: {type: ApprovalSchema, required: false},
    it: {type: ApprovalSchema, required: false},
    security: {type: ApprovalSchema, required: false}
  },
  { _id: false, strict: 'throw'}
)


const EmployeeRequisitionFormSchema = new Schema<IEmployeeReqForm>(
  {
    formId: { type: String, default: randomUUID },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String, required: true },
    reportTo: { type: String, required: true },
    jobNumber: { type: String, required: true },
    jobLocation: { type: String, required: true },
    projectedLength: { type: Schema.Types.Mixed, required: true },
    updatedBy: { type: String, required: false },
    updatedAt: { type: Date, required: false },
    applicants: { type: [String], required: false },
    approvals: { type: ApprovalsSchema, required: false },
  },
  { timestamps: true, strict: "throw" }
);

export const EmployeeRequisitionFormModel = mongoose.model<IEmployeeReqForm>(
  "employeeRequisitionForms",
  EmployeeRequisitionFormSchema
);
