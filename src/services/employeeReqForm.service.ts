import { UUID } from "crypto";
import {
  Department,
  EmployeeRequisitionFormModel,
  IEmployeeReqForm,
} from "../models/EmployeeReqForm.model";
import { LocationModel } from "../models/location.model";
import { UserModel } from "../models/user.model";
import { ApplicantModel, IApplicantInterface } from "../models/applicant.model";

export class EmployeeReqFormService {
  async createNewEmployeeReqForm(data: IEmployeeReqForm, createdBy: UUID) {
    const checkIfLocationExists = await LocationModel.findOne({
      locationId: data.jobLocation,
    });
    if (!checkIfLocationExists) {
      throw new Error("The location does not exits");
    }

    const reportsTo = await UserModel.findOne({ userId: data.reportTo });
    if (!reportsTo) {
      throw new Error("The supervisor does not exits");
    }
    if (reportsTo.userType == "employee") {
      throw new Error("The user to report to is not a supervisor/manager");
    }
    const newForm = new EmployeeRequisitionFormModel({
      ...data,
      createdBy,
    });
    return await newForm.save();
  }

  async getEmployeeReqForm(skip: number = 0, limit: number = 5) {
    const forms = await EmployeeRequisitionFormModel.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "userId",
          as: "userInfoCreatedBy",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "reportTo",
          foreignField: "userId",
          as: "userInfoReportTo",
        },
      },
      {
        $addFields: {
          createdBy: {
            $cond: [
              { $gt: [{ $size: "$userInfoCreatedBy" }, 0] },
              { $arrayElemAt: ["$userInfoCreatedBy.fullname", 0] },
              "Unknown user",
            ],
          },
          // applicants: { $size: "$applicants" }
        },
      },
      {
        $project: {
          _id: 0,
          userInfoReportTo: 0,
          userInfoCreatedBy: 0,
        },
      },

      { $skip: skip },
      { $limit: limit },
    ]);

    return forms;
  }
  async getEmployeeReqFormById(formId: string) {
    const forms = await EmployeeRequisitionFormModel.aggregate([
      {
        $match: { formId },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "userId",
          as: "userInfoCreatedBy",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "reportTo",
          foreignField: "userId",
          as: "userInfoReportTo",
        },
      },
      {
        $addFields: {
          _id: 0,
          createdBy: {
            $cond: [
              { $gt: [{ $size: "$userInfoCreatedBy" }, 0] },
              { $arrayElemAt: ["$userInfoCreatedBy.fullname", 0] },
              "Unknown user",
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          userInfoReportTo: 0,
          userInfoCreatedBy: 0,
          applicants: {
            _id: 0,
          },
        },
      },
    ]);

    return forms;
  }

  async getApplicantInfoById(applicantInfoId: string, formId: string) {
    const form = await EmployeeRequisitionFormModel.aggregate([
      {
        $match: {
          formId,
          "applicants.applicantId": applicantInfoId,
        },
      },
      {
        $project: {
          _id: 0,
          applicant: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$applicants",
                  as: "app",
                  cond: { $eq: ["$$app.applicantId", applicantInfoId] },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $project: {
          "applicant._id": 0,
        },
      },
    ]);
    return form;
  }
  async updateEmployeeReqFormById(
    formId: string,
    data: IEmployeeReqForm,
    updatedBy: string
  ) {
    console.log(updatedBy);
    const updateForm = await EmployeeRequisitionFormModel.updateOne(
      { formId },
      {
        $set: {
          ...data,
          updatedBy: updatedBy,
        },
      }
    );
    return updateForm.modifiedCount === 0 ? false : true;
  }

  async updateApplicantInfoByFormIdAndApplicantId(
    formId: string,
    data: IEmployeeReqForm,
    updatedBy: string
  ) {
    const updateApplicantInfo = await EmployeeRequisitionFormModel.updateOne(
      { formId },
      {
        $set: {
          data,
          updatedBy,
          updateAt: new Date(),
        },
      }
    );
    return updateApplicantInfo.modifiedCount === 0 ? false : true;
  }

  async addApplicant(
    data: IApplicantInterface,
    createdBy: string,
    formId: string
  ) {
    const formExists = await EmployeeRequisitionFormModel.findOne({
      formId: formId,
    });
    if (!formExists) throw new Error("Form does not exists");

    const checkIfResponsibleExists = await UserModel.findOne({userId: data.divisionResponsible});
    if (!checkIfResponsibleExists) throw new Error ('responsible does not exists')

    const addApplicant = new ApplicantModel({
      ...data,
      createdBy,
      formId,
    });
    console.log(addApplicant.applicantId);
    await addApplicant.save();
    await EmployeeRequisitionFormModel.updateOne(
      {
        formId: formId,
      },
      { $push: { applicants: addApplicant.applicantId } }
    );
    return addApplicant.applicantId;
  }

  async updateApplicantInfo(
    applicantId: string,
    data: IApplicantInterface,
    updatedBy: string
  ) {
    function flattenObject(
      obj: any,
      parentKey = "",
      res: Record<string, any> = {}
    ): Record<string, any> {
      for (const [key, value] of Object.entries(obj)) {
        const newKey = parentKey ? `${parentKey}.${key}` : key;
        if (value && typeof value === "object" && !Array.isArray(value)) {
          flattenObject(value, newKey, res);
        } else {
          res[newKey] = value;
        }
      }
      return res;
    }
    const flattened = flattenObject(data);
    const update = await ApplicantModel.updateOne(
      { applicantId },
      { $set: { ...flattened, updatedBy, updatedAt: new Date() } }
    );
    if (update.modifiedCount === 0)
      throw new Error("Application does not exists");
  }

  async getApplicantById(applicantId: string) {
    return await ApplicantModel.findOne({ applicantId }, { _id: 0 }).lean();
  }

  async getApplicantsInForm(formId: string, skip: number, limit: number) {
    const data = await ApplicantModel.find({ formId }, { _id: 0 })
      .skip(skip)
      .limit(limit)
      .lean();
    return data;
  }

  async deleteApplicant(applicantId: string) {
    const getData = await ApplicantModel.findOne({ applicantId });
    if (!getData) throw new Error("Applicant does not exists");
    const req = await ApplicantModel.deleteOne({ applicantId });
    if (req.deletedCount === 0) throw new Error("Unable to delete Request");
    const deleteApplicantInForm = await EmployeeRequisitionFormModel.updateOne(
      { formId: getData?.formId },
      { $pull: { applicants: applicantId } }
    );
    if (deleteApplicantInForm.modifiedCount === 0)
      throw new Error("Unable to remove applicant on Form");
  }
  async deleteErfById(formId: string) {
    const checkIfFormExists = await EmployeeRequisitionFormModel.findOne({
      formId,
    });
    if (!checkIfFormExists) throw new Error("Form does not exists");
    const applicants = checkIfFormExists.applicants;
    await ApplicantModel.deleteMany({ applicantId: { $in: applicants } });
    await EmployeeRequisitionFormModel.deleteOne({ formId });
  }

  async handleDepartmentConsent(
    formId: string,
    issuedBy: string,
    data: object,
    department: string
  ) {
    const getFormData = await EmployeeRequisitionFormModel.findOne({ formId });
    if (!getFormData) throw new Error("Form does not Exists");
    if(department === 'rh'  || department === 'it') {
      if (!getFormData.approvals?.dl?.state) throw new Error('Unable to complete consent, Divisional leader has not consent form.')
      }
    if(department === 'it') {
      if (!getFormData.approvals?.rh?.state) throw new Error('Unable to complete consent, HR has not consent form.')
    }
    if(getFormData.status === 'Completed') {
      throw new Error('This Form is complete, unable to handle consent')
    }
    const updateForm = await EmployeeRequisitionFormModel.updateOne(
      { formId },
      {
        $set: {
          [`approvals.${department}`]: {
            ...data,
            issuedBy,
            issuedAt: new Date(),
          },
        },
      }
    );
    if (updateForm.modifiedCount === 0)
      throw new Error("Unable to update Form");
  }

  async removeHandleDepartmentConsent(formId:string, issuedBy:string, department:Department, userType:string) {
    console.log(userType)
    const form = await EmployeeRequisitionFormModel.findOne({formId});

    if (!form) throw new Error ('Form does not exists')
    const deptApproval = form.approvals?.[department]; 
    if(!deptApproval) throw new Error('department approval does not exists')

    if (userType !== "global" || deptApproval.issuedBy !== issuedBy) {
      throw new Error('You are not authorized to remove this approval')
    }
    
      await EmployeeRequisitionFormModel.updateOne(
        {formId },
        {$unset: {[`approvals.${department}`]: ""}}
      )
    
  }
}
