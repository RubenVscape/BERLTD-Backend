"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeReqFormService = void 0;
const EmployeeReqForm_model_1 = require("../models/EmployeeReqForm.model");
const location_model_1 = require("../models/location.model");
const user_model_1 = require("../models/user.model");
const applicants_model_1 = require("../models/applicants.model");
class EmployeeReqFormService {
    async createNewEmployeeReqForm(data, createdBy) {
        const checkIfLocationExists = await location_model_1.LocationModel.findOne({ locationId: data.jobLocation });
        if (!checkIfLocationExists) {
            throw new Error('The location does not exits');
        }
        const reportsTo = await user_model_1.UserModel.findOne({ userId: data.reportTo });
        if (!reportsTo) {
            throw new Error('The supervisor does not exits');
        }
        if (reportsTo.userType == 'employee') {
            throw new Error('The user to report to is not a supervisor/manager');
        }
        const newForm = new EmployeeReqForm_model_1.EmployeeRequisitionFormModel({
            ...data,
            createdBy
        });
        return await newForm.save();
    }
    async getEmployeeReqForm(skip = 0, limit = 5) {
        const forms = await EmployeeReqForm_model_1.EmployeeRequisitionFormModel.aggregate([
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
        ]);
        return forms;
    }
    async getEmployeeReqFormById(formId) {
        const forms = await EmployeeReqForm_model_1.EmployeeRequisitionFormModel.aggregate([
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
        ]);
        return forms;
    }
    async getApplicantInfoById(applicantInfoId, formId) {
        const form = await EmployeeReqForm_model_1.EmployeeRequisitionFormModel.aggregate([
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
    async updateEmployeeReqFormById(formId, data, updatedBy) {
        console.log(updatedBy);
        const updateForm = await EmployeeReqForm_model_1.EmployeeRequisitionFormModel.updateOne({ formId }, {
            $set: {
                ...data,
                updatedBy: updatedBy
            }
        });
        return updateForm.modifiedCount === 0 ? false : true;
    }
    async updateApplicantInfoByFormIdAndApplicantId(formId, data, updatedBy) {
        const updateApplicantInfo = await EmployeeReqForm_model_1.EmployeeRequisitionFormModel.updateOne({ formId }, {
            $set: {
                data,
                updatedBy,
                updateAt: new Date()
            }
        });
        return updateApplicantInfo.modifiedCount === 0 ? false : true;
    }
    async addApplicant(data, createdBy, formId) {
        const formExists = await EmployeeReqForm_model_1.EmployeeRequisitionFormModel.findOne({ formId: formId });
        if (!formExists)
            throw new Error('Form does not exists');
        const addApplicant = new applicants_model_1.ApplicantModel({
            ...data,
            createdBy,
            formId
        });
        console.log(addApplicant.applicantId);
        await addApplicant.save();
        await EmployeeReqForm_model_1.EmployeeRequisitionFormModel.updateOne({
            formId: formId
        }, { $push: { applicants: addApplicant.applicantId } });
        return data.applicantId;
    }
    async updateApplicantInfo(applicantId, data, updatedBy) {
        function flattenObject(obj, parentKey = '', res = {}) {
            for (const [key, value] of Object.entries(obj)) {
                const newKey = parentKey ? `${parentKey}.${key}` : key;
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    flattenObject(value, newKey, res);
                }
                else {
                    res[newKey] = value;
                }
            }
            return res;
        }
        const flattened = flattenObject(data);
        console.log(flattened);
        const update = await applicants_model_1.ApplicantModel.updateOne({ applicantId }, { $set: { ...flattened, updatedBy, updatedAt: new Date() } });
        if (update.modifiedCount === 0)
            throw new Error('Application does not exists');
    }
}
exports.EmployeeReqFormService = EmployeeReqFormService;
