import { UUID } from "crypto";
import { EmployeeRequisitionFormModel, IEmployeeReqForm } from "../models/EmployeeReqForm.model";
import { LocationModel } from "../models/location.model";
import { UserModel } from "../models/user.model";
import { ApplicantModel, IApplicantModel } from "../models/applicants.model";
import { da } from "@faker-js/faker/.";


export class EmployeeReqFormService {
    async createNewEmployeeReqForm(data: IEmployeeReqForm, createdBy: UUID) {
        const checkIfLocationExists = await LocationModel.findOne({ locationId: data.jobLocation });
        if (!checkIfLocationExists) {
            throw new Error('The location does not exits')
        }

        const reportsTo = await UserModel.findOne({ userId: data.reportTo });
        if (!reportsTo) {
            throw new Error('The supervisor does not exits')
        }
        if (reportsTo.userType == 'employee') {
            throw new Error('The user to report to is not a supervisor/manager')
        }
        const newForm = new EmployeeRequisitionFormModel({
            ...data,
            createdBy
        }
        )
        return await newForm.save()
    }

    async getEmployeeReqForm(skip: number = 0, limit: number = 5) {
        const forms = await EmployeeRequisitionFormModel.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: 'userId',
                    as: 'userInfoCreatedBy'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'reportTo',
                    foreignField: 'userId',
                    as: 'userInfoReportTo'
                }
            },
            {
                $addFields: {
                    createdBy: {
                        $cond: [
                            { $gt: [{ $size: '$userInfoCreatedBy' }, 0] },
                            { $arrayElemAt: ['$userInfoCreatedBy.fullname', 0] },
                            'Unknown user'
                        ]
                    },
                    // applicants: { $size: "$applicants" }

                }
            }, {
                $project: {
                    _id: 0,
                    userInfoReportTo: 0,
                    userInfoCreatedBy: 0,
                }
            },

            { $skip: skip },
            { $limit: limit }
        ])

        return forms;
    }
    async getEmployeeReqFormById(formId: string) {
        const forms = await EmployeeRequisitionFormModel.aggregate([
            {
                $match: { formId }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'createdBy',
                    foreignField: 'userId',
                    as: 'userInfoCreatedBy'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'reportTo',
                    foreignField: 'userId',
                    as: 'userInfoReportTo'
                }
            },
            {
                $addFields: {
                    _id: 0,
                    createdBy: {
                        $cond: [
                            { $gt: [{ $size: '$userInfoCreatedBy' }, 0] },
                            { $arrayElemAt: ['$userInfoCreatedBy.fullname', 0] },
                            'Unknown user'
                        ]
                    },

                }
            }, {
                $project: {
                    _id: 0,
                    userInfoReportTo: 0,
                    userInfoCreatedBy: 0,
                    applicants: {
                        _id: 0
                    }
                }
            }
        ])

        return forms;
    }

    async getApplicantInfoById(applicantInfoId: string, formId: string) {
        const form = await EmployeeRequisitionFormModel.aggregate([
            {
                $match: {
                    formId,
                    "applicants.applicantId": applicantInfoId
                }
            },
            {
                $project: {
                    _id: 0,
                    applicant: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: "$applicants",
                                    as: 'app',
                                    cond: { $eq: ["$$app.applicantId", applicantInfoId] }
                                }
                            }, 0
                        ]
                    }
                }
            },
            {
                $project: {
                    "applicant._id": 0
                }
            }

        ]);
        return form;
    }
    async updateEmployeeReqFormById(formId: string, data: IEmployeeReqForm, updatedBy: string) {
        console.log(updatedBy);
        const updateForm = await EmployeeRequisitionFormModel.updateOne(
            { formId },
            {
                $set: {
                    ...data,
                    updatedBy: updatedBy
                }
            }
        )
        return updateForm.modifiedCount === 0 ? false : true;
    }

    async updateApplicantInfoByFormIdAndApplicantId(formId: string, data: IEmployeeReqForm, updatedBy: string) {


        const updateApplicantInfo = await EmployeeRequisitionFormModel.updateOne(
            { formId },
            {
                $set: {
                    data,
                    updatedBy,
                    updateAt: new Date()
                }
            }
        )
        return updateApplicantInfo.modifiedCount === 0 ? false : true
    }

    async addApplicant(data: IApplicantModel, createdBy: string, formId: string) {
        const formExists = await EmployeeRequisitionFormModel.findOne({ formId: formId });
        if (!formExists) throw new Error('Form does not exists');

        const addApplicant = new ApplicantModel({
            ...data,
            createdBy,
            formId
        });
        console.log(addApplicant.applicantId);
        await addApplicant.save();
        await EmployeeRequisitionFormModel.updateOne(
            {
                formId: formId
            },
            { $push: { applicants: addApplicant.applicantId } }
        )
        return data.applicantId;
    }
    
    async updateApplicantInfo(applicantId:string, data:IApplicantModel, updatedBy:string) {
        function flattenObject (obj:any, parentKey = '', res: Record<string,any> = {}): Record <string, any> {
            for(const [key, value] of Object.entries(obj)) {
                const newKey = parentKey ?  `${parentKey}.${key}` : key;
                if(value && typeof value === 'object' && !Array.isArray(value)) {
                    flattenObject(value, newKey, res);
                } else {
                    res[newKey] = value;
                }
            }
            return res;

        }
        const flattened = flattenObject(data);
        console.log(flattened);
        const update = await ApplicantModel.updateOne({applicantId }, { $set: { ...flattened, updatedBy, updatedAt: new Date()}})
        if(update.modifiedCount === 0)  throw new Error('Application does not exists');
    }
}
