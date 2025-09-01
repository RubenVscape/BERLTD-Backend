"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const routing_controllers_1 = require("routing-controllers");
const employeeReqForm_service_1 = require("../services/employeeReqForm.service");
const authorizedUsers = ['global', 'manager', 'supervisor'];
const initialCreateEmployeeReqFormTemplate = ['reportTo', 'jobNumber', 'jobLocation', 'projectedLength'];
const validFieldsToUpdate = ['reportTo', 'jobNumber', 'jobLocation', 'projectedLength'];
const employeeService = new employeeReqForm_service_1.EmployeeReqFormService();
let EmployeeReqForm = class EmployeeReqForm {
    async createNewEmployeeReqForm(body, user, res) {
        try {
            let validData = true;
            initialCreateEmployeeReqFormTemplate.forEach(k => { if (!Object.keys(body).includes(k))
                validData = false; });
            if (!validData) {
                return res.status(500).json({ message: 'Unable to create Form', state: false, error: 'Missing fields' });
            }
            const newForm = await employeeService.createNewEmployeeReqForm(body, user.sub);
            if (newForm) {
                return { message: 'new Employee Req form create', state: true, data: newForm.formId };
            }
            else {
                return res.status(500).json({ message: 'There was an error creating the ER form', state: false, error: 'no error' });
            }
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'There was an error creating the ER form', state: false, error: error.message });
        }
    }
    async getEmployeeReqForms(res, page = 1, limit = 5) {
        try {
            const skip = (page - 1) * limit;
            const data = await employeeService.getEmployeeReqForm(skip, limit);
            return { data, page, limit, status: true };
        }
        catch (error) {
            return res.status(500).json({ message: 'There was an error getting the ER forms', state: false, error: error.message });
        }
    }
    async getEmployeeReqById(res, formId) {
        try {
            const data = await employeeService.getEmployeeReqFormById(formId);
            return { data, status: true, total: data.length };
        }
        catch (error) {
            return res.status(500).json({ message: 'There was an error getting the ER forms', state: false, error: error.message });
        }
    }
    async getApplicantInfoById(res, formId, applicantId) {
        try {
            const data = await employeeService.getApplicantInfoById(applicantId, formId);
            return { data, status: true };
        }
        catch (error) {
            return res.status(500).json({ message: 'There was an error getting  the ER form', state: false, error: error.message });
        }
    }
    async updateEmployeeReqFormById(res, data, user, formId) {
        try {
            let validInputs = true;
            Object.keys(data).forEach(k => { if (!validFieldsToUpdate.includes(k))
                validInputs = false; });
            if (!validInputs)
                return res.status(400).json({ message: 'Invalid data for update', state: false, data: [] });
            const update = await employeeService.updateEmployeeReqFormById(formId, data, user.sub);
            if (!update)
                return res.status(400).json({ message: 'Unable to update Form', state: false });
            return { message: 'form updated Correctly', state: true, data: formId };
        }
        catch (error) {
            return res.status(500).json({ message: 'There was an error updating the ER form', state: false, error: error.message });
        }
    }
    async updateApplicantDataFromForm(res, applicantId, data, user) {
        try {
            const updateRequest = await employeeService.updateApplicantInfoByFormIdAndApplicantId(applicantId, data, user.sub);
            if (!updateRequest)
                return res.status(500).json({ message: 'Unable to update applicant info, unknown error', state: false, data: [] });
            return { message: 'Applicant info updated correctly', state: true, data: applicantId };
        }
        catch (error) {
            return res.status(500).json({ message: 'Error while updating applicant form info', error: error.message, state: false, data: applicantId });
        }
    }
    async createApplicant(res, data, user, formId) {
        try {
            const addApplicant = await employeeService.addApplicant(data, user.sub, formId);
            return { message: 'Applicant added correctly', state: true, data: addApplicant };
        }
        catch (error) {
            return res.status(500).json({ message: 'Error while creating applicant to ERF', error: error.message, state: false });
        }
    }
    async updateApplicant(applicantId, user, data, res) {
        try {
            await employeeService.updateApplicantInfo(applicantId, data, user.sub);
            return { message: 'Application updated correctly', state: true, data: applicantId };
        }
        catch (error) {
            return res.status(500).json({ message: 'Error while creating applicant to ERF', error: error.message, state: false });
        }
    }
};
__decorate([
    (0, routing_controllers_1.HttpCode)(201),
    (0, routing_controllers_1.Post)("/newEmployeeReqForm"),
    (0, routing_controllers_1.Authorized)(authorizedUsers),
    __param(0, (0, routing_controllers_1.Body)()),
    __param(1, (0, routing_controllers_1.CurrentUser)()),
    __param(2, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeReqForm.prototype, "createNewEmployeeReqForm", null);
__decorate([
    (0, routing_controllers_1.Authorized)(authorizedUsers),
    (0, routing_controllers_1.HttpCode)(200),
    (0, routing_controllers_1.Get)("/getEmployeeReqForms"),
    __param(0, (0, routing_controllers_1.Res)()),
    __param(1, (0, routing_controllers_1.QueryParam)('page')),
    __param(2, (0, routing_controllers_1.QueryParam)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], EmployeeReqForm.prototype, "getEmployeeReqForms", null);
__decorate([
    (0, routing_controllers_1.HttpCode)(200),
    (0, routing_controllers_1.Authorized)(authorizedUsers),
    (0, routing_controllers_1.Get)("/getEmployeeReqById/:formId"),
    __param(0, (0, routing_controllers_1.Res)()),
    __param(1, (0, routing_controllers_1.Param)('formId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EmployeeReqForm.prototype, "getEmployeeReqById", null);
__decorate([
    (0, routing_controllers_1.HttpCode)(200),
    (0, routing_controllers_1.Authorized)(authorizedUsers),
    (0, routing_controllers_1.Get)("/getApplicantInfoById/:formId/:applicantId"),
    __param(0, (0, routing_controllers_1.Res)()),
    __param(1, (0, routing_controllers_1.Param)('formId')),
    __param(2, (0, routing_controllers_1.Param)('applicantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], EmployeeReqForm.prototype, "getApplicantInfoById", null);
__decorate([
    (0, routing_controllers_1.HttpCode)(200),
    (0, routing_controllers_1.Authorized)(authorizedUsers),
    (0, routing_controllers_1.Patch)("/updateEmployeeReqFormById/:formId"),
    __param(0, (0, routing_controllers_1.Res)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.CurrentUser)()),
    __param(3, (0, routing_controllers_1.Param)('formId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String]),
    __metadata("design:returntype", Promise)
], EmployeeReqForm.prototype, "updateEmployeeReqFormById", null);
__decorate([
    (0, routing_controllers_1.HttpCode)(200),
    (0, routing_controllers_1.Authorized)(authorizedUsers),
    (0, routing_controllers_1.Put)('/updateApplicantDataFromForm/:applicantId'),
    __param(0, (0, routing_controllers_1.Res)()),
    __param(1, (0, routing_controllers_1.Param)('applicantId')),
    __param(2, (0, routing_controllers_1.Body)()),
    __param(3, (0, routing_controllers_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeReqForm.prototype, "updateApplicantDataFromForm", null);
__decorate([
    (0, routing_controllers_1.HttpCode)(200),
    (0, routing_controllers_1.Authorized)(authorizedUsers),
    (0, routing_controllers_1.Post)("/createApplicant/:formId"),
    __param(0, (0, routing_controllers_1.Res)()),
    __param(1, (0, routing_controllers_1.Body)()),
    __param(2, (0, routing_controllers_1.CurrentUser)()),
    __param(3, (0, routing_controllers_1.Param)('formId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String]),
    __metadata("design:returntype", Promise)
], EmployeeReqForm.prototype, "createApplicant", null);
__decorate([
    (0, routing_controllers_1.HttpCode)(200),
    (0, routing_controllers_1.Authorized)(authorizedUsers),
    (0, routing_controllers_1.Put)("/updateApplicant/:applicantId"),
    __param(0, (0, routing_controllers_1.Param)("applicantId")),
    __param(1, (0, routing_controllers_1.CurrentUser)()),
    __param(2, (0, routing_controllers_1.Body)()),
    __param(3, (0, routing_controllers_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], EmployeeReqForm.prototype, "updateApplicant", null);
EmployeeReqForm = __decorate([
    (0, routing_controllers_1.JsonController)('/employereqform')
], EmployeeReqForm);
exports.default = EmployeeReqForm;
