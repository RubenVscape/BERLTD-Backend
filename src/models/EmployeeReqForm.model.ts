import { randomUUID, UUID } from "crypto";
import mongoose, { Schema, Document, Date } from "mongoose";

export interface IEmployeeReqForm extends Document {
  formId: UUID;
  createdAt: Date;
  createdBy: UUID;
  reportTo: UUID;
  jobNumber: string;
  jobLocation: UUID;
  projectedLength: string | number;
  applicants: {
    applicantName: string;
    division: string;
    contact: string | number;
    craft: string;
    classification: string;
    shiftSchedule: string;
    shiftStart: Date;
    shiftEnds: Date;
    payRate: string | number;
    reportDate: Date;
    ownVehicle: boolean;
    rehire: Boolean;
    perDiem: boolean;
    perDiemAmount:number
    effectiveDate: Date;
    notes: string;
    siteRequirements: {
      safeCouncil: {
        basicPlus: boolean;
        siteSpecific: boolean;
        bottleWatch: boolean;
        fireWatch: boolean;
        confinedSpace: boolean;
        backgroundCheck: boolean;
        twicCard: boolean;
      };
      disaService: {
        urinalysis_alcohol: boolean;
        oralSwab: boolean;
        hairTest: boolean;
        pft_fitTest: boolean;
        respiratorType: {
          fullFace: {
            state: boolean;
            data: string;
          };
          hallFace: {
            state: boolean;
            data: string;
          };
          freshAirTraining: boolean;
        };
      };
      craftRequirements: {
        nccer: boolean;
        nccco: boolean;
        weldProcedures: {
          structural: {
            state: boolean;
            data: string;
          };
          pipe: {
            state: boolean;
            data: string;
          };
        };
      };
      equipmentTrainingField: string[];
    };
    beResourcesNewHireTechChecklist: {
      checklist: {
        emailNeeded: boolean;
        computerNeeded: {
          state: boolean;
          numeric_keypad_on_laptop: boolean;
        };
        hotspot_needed: boolean;
        amex_needed: boolean;
        fuel_card_needed: {
          state: boolean;
          company_vehicle: boolean;
          personal: boolean;
        };
        sharePointNeeded: boolean;
        dataPointNeeded: boolean;
        businessCard_needed_boolean: boolean;
        sageUser_remoteDesktop_needed: boolean;
        office_phone_needed: boolean;
        printer_needed: boolean;
        networkPrinter_needed: boolean;
        external_monitor_needed: boolean;
        additional_techologySoftware_needed: {
          state: boolean;
          data: string;
        };
        additional_office_needed: {
          state: boolean;
          data: string;
        };
      };
      sharePointGroups: {
        Executive_Team: false;
        HSE_Coordinator: false;
        Sage_Remote_Users: false;
        SP_01_Admin: false;
        SP_01_Estimating: false;
        SP_01_Job_Site_Admin: false;
        SP_01_Project_Management: false;
        SP_02_Admin: false;
        SP_02_Estimating: false;
        SP_02_Job_Site_Admin: false;
        SP_02_Project_Management: false;
        SP_03_Admin: false;
        SP_03_Estimating: false;
        SP_03_Job_Site_Admin: false;
        SP_03_Project_Management: false;
        SP_04_Admin: false;
        SP_04_Estimating: false;
        SP_04_Job_Site_Admin: false;
        SP_04_Project_Management: false;
        SP_06_Admin: false;
        SP_06_Estimating: false;
        SP_06_Job_Site_Admin: false;
        SP_06_Project_Management: false;
        SP_07_Admin_DN: false;
        SP_07_Admin_MD: false;
        SP_07_Admin_UP: false;
        SP_07_Estimating_DN: false;
        SP_07_Estimating_MD: false;
        SP_07_Estimating_UP: false;
        SP_07_Job_Site_Admin_DN: false;
        SP_07_Job_Site_Admin_MD: false;
        SP_07_Job_Site_Admin_UP: false;
        SP_07_Project_Management_DN: false;
        SP_07_Project_Management_MD: false;
        SP_07_Project_Management_UP: false;
        SP_08_Admin: false;
        SP_08_Estimating: false;
        SP_08_Job_Site_Admin: false;
        SP_08_Project_Management: false;
        SP_09_Admin: false;
        SP_09_Estimating: false;
        SP_09_Job_Site_Admin: false;
        SP_09_Project_Management: false;
        SP_Accounting_Admin: false;
        SP_Executive_Team: false;
        SP_Finance_Admin: false;
        SP_HR_Admin: false;
        SP_HSE_Admin: false;
        SP_HSE_Confidential: false;
        SP_Midstream: false;
        SP_MSA_Edit: false;
        SP_QC_Admin: false;
        SP_QC_Field: false;
        SP_QC_Mgmt_Sys_Files: false;
        SP_QC_Pipe: false;
        SP_QC_Structural: false;
        additional_email_distribution_group_needed:string;        
      };
      business_card_data:{
        side1:{
            name:string,
            title:string,
            cell:string,
            email:string,
            add_phone: string,
            fax:string
        },
        side2:{
            location: string
        }
      }
    };
  }[];
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
    applicants:[
      {
        applicantName: { type: String, required: true },
        division: { type: Number, required: true },
        contact: { type: Schema.Types.Mixed, required: true },
        craft: { type: String, required: true },
        classification: { type: String, required: true },
        shiftSchedule: {
          shiftStart: { type: Date, require:true },
          shiftEnds: { type: Date, require:true },
        },
        payRate: { type: Schema.Types.Mixed,  require:true},
        reportDate: { type: Date, require:true  },
        ownVehicle: { type: Boolean, require:true },
        rehire: { type: Boolean, require:true },
        perDiem: { type: Boolean,  require:true },
        perDiemAmount: { type: Number,  require:true },
        effectiveDate: { type: Date, require:true },
        notes: { type: String },
        siteRequirements: {
          safeCouncil: {
            basicPlus: { type: Boolean },
            siteSpecific: { type: Boolean },
            bottleWatch: { type: Boolean },
            fireWatch: { type: Boolean },
            confinedSpace: { type: Boolean },
            backgroundCheck: { type: Boolean },
            twicCard: { type: Boolean },
          },
          disaService: {
            urinalysis_alcohol: { type: Boolean },
            oralSwab: { type: Boolean },
            hairTest: { type: Boolean },
            pft_fitTest: { type: Boolean },
            respiratorType: {
              fullFace: { state: { type: Boolean }, data: { type: String } },
              hallFace: { state: { type: Boolean }, data: { type: String } },
              freshAirTraining: { type: Boolean },
            },
          },
          craftRequirements: {
            nccer: { type: Boolean },
            nccco: { type: Boolean },
            weldProcedures: {
              structural: { state: { type: Boolean }, data: { type: String } },
              pipe: { state: { type: Boolean }, data: { type: String } },
            },
          },
          equipmentTrainingField: [{ type: String }],
        },
        beResourcesNewHireTechChecklist: {
          checklist: {
            emailNeeded: { type: Boolean },
            computerNeeded: { state: { type: Boolean }, numeric_keypad_on_laptop: { type: Boolean } },
            hotspot_needed: { type: Boolean },
            amex_needed: { type: Boolean },
            fuel_card_needed: { state: { type: Boolean }, company_vehicle: { type: Boolean }, personal: { type: Boolean } },
            sharePointNeeded: { type: Boolean },
            dataPointNeeded: { type: Boolean },
            businessCard_needed_boolean: { type: Boolean },
            sageUser_remoteDesktop_needed: { type: Boolean },
            office_phone_needed: { type: Boolean },
            printer_needed: { type: Boolean },
            networkPrinter_needed: { type: Boolean },
            external_monitor_needed: { type: Boolean },
            additional_techologySoftware_needed: { state: { type: Boolean }, data: { type: String } },
            additional_office_needed: { state: { type: Boolean }, data: { type: String } },
          },
          sharePointGroups: { type: Map, of: Schema.Types.Mixed },
          business_card_data: {
            side1: {
              name: { type: String },
              title: { type: String },
              cell: { type: String },
              email: { type: String },
              add_phone: { type: String },
              fax: { type: String },
            },
            side2: { location: { type: String } },
          },
        },
      }
    ] , 
  },
  { timestamps: true }
);

export const EmployeeRequisitionFormModel = mongoose.model<IEmployeeReqForm>('employeeRequisitionForms', EmployeeRequisitionFormSchema);

