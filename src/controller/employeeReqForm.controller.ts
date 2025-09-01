import { JsonController, Res, Post, Get, HttpCode, Authorized, Body, CurrentUser, Param, QueryParam, Patch, Put } from 'routing-controllers'
import { EmployeeReqFormService } from '../services/employeeReqForm.service';
import { JwtPayload } from '../auth/authorizationChecker';
import { IEmployeeReqForm } from '../models/EmployeeReqForm.model';
import { Response } from 'express';
import { UUID } from 'crypto';
import { IApplicantModel } from '../models/applicants.model';


const authorizedUsers = ['global', 'manager', 'supervisor'];
const initialCreateEmployeeReqFormTemplate = ['reportTo', 'jobNumber', 'jobLocation', 'projectedLength'];
const validFieldsToUpdate = ['reportTo', 'jobNumber', 'jobLocation', 'projectedLength'];

const employeeService = new EmployeeReqFormService();

@JsonController('/employereqform')
export default class EmployeeReqForm {
    @HttpCode(201)
    @Post("/newEmployeeReqForm")
    @Authorized(authorizedUsers)
    async createNewEmployeeReqForm(@Body() body: IEmployeeReqForm, @CurrentUser() user: JwtPayload, @Res() res: Response) {
        try {
            let validData = true;
            initialCreateEmployeeReqFormTemplate.forEach(k => { if (!Object.keys(body).includes(k)) validData = false; })
            if (!validData) {
                return res.status(500).json({ message: 'Unable to create Form', state: false, error: 'Missing fields' })
            }
            const newForm = await employeeService.createNewEmployeeReqForm(body, user.sub as UUID)
            if (newForm) {
                return { message: 'new Employee Req form create', state: true, data: newForm.formId }
            }
            else {
                return res.status(500).json({ message: 'There was an error creating the ER form', state: false, error: 'no error' })
            }
        } catch (error: any) {
            console.log(error);
            return res.status(500).json({ message: 'There was an error creating the ER form', state: false, error: error.message })
        }
    }

    @Authorized(authorizedUsers)
    @HttpCode(200)
    @Get("/getEmployeeReqForms")
    async getEmployeeReqForms(@Res() res: Response, @QueryParam('page') page: number = 1, @QueryParam('limit') limit: number = 5) {
        try {
            const skip = (page - 1) * limit;
            const data = await employeeService.getEmployeeReqForm(skip, limit);
            return { data, page, limit, status: true }
        } catch (error: any) {

            return res.status(500).json({ message: 'There was an error getting the ER forms', state: false, error: error.message });
        }

    }

    @HttpCode(200)
    @Authorized(authorizedUsers)
    @Get("/getEmployeeReqById/:formId")
    async getEmployeeReqById(@Res() res: Response, @Param('formId') formId: string) {
        try {
            const data = await employeeService.getEmployeeReqFormById(formId);
            return { data, status: true, total: data.length }
        } catch (error: any) {
            return res.status(500).json({ message: 'There was an error getting the ER forms', state: false, error: error.message });
        }
    }

    @HttpCode(200)
    @Authorized(authorizedUsers)
    @Get("/getApplicantInfoById/:formId/:applicantId")
    async getApplicantInfoById(@Res() res: Response, @Param('formId') formId: string, @Param('applicantId') applicantId: string) {
        try {
            const data = await employeeService.getApplicantInfoById(applicantId, formId);
            return { data, status: true }

        } catch (error: any) {
            return res.status(500).json({ message: 'There was an error getting  the ER form', state: false, error: error.message });
        }
    }

    @HttpCode(200)
    @Authorized(authorizedUsers)
    @Patch("/updateEmployeeReqFormById/:formId")
    async updateEmployeeReqFormById(@Res() res: Response, @Body() data: IEmployeeReqForm, @CurrentUser() user: JwtPayload, @Param('formId') formId: string) {
        try {
            let validInputs = true;
            Object.keys(data).forEach(k => { if (!validFieldsToUpdate.includes(k)) validInputs = false; })
            if (!validInputs) return res.status(400).json({ message: 'Invalid data for update', state: false, data: [] });
            const update = await employeeService.updateEmployeeReqFormById(formId, data, user.sub as string)
            if (!update) return res.status(400).json({ message: 'Unable to update Form', state: false });
            return { message: 'form updated Correctly', state: true, data: formId }
        } catch (error: any) {
            return res.status(500).json({ message: 'There was an error updating the ER form', state: false, error: error.message });
        }
    }

    @HttpCode(200)
    @Authorized(authorizedUsers)
    @Put('/updateApplicantDataFromForm/:applicantId')
    async updateApplicantDataFromForm(@Res() res: Response, @Param('applicantId') applicantId: string, @Body() data: IEmployeeReqForm, @CurrentUser() user: JwtPayload) {
        try {
            const updateRequest = await employeeService.updateApplicantInfoByFormIdAndApplicantId(applicantId, data, user.sub);
            if (!updateRequest) return res.status(500).json({ message: 'Unable to update applicant info, unknown error', state: false, data: [] });

            return { message: 'Applicant info updated correctly', state: true, data: applicantId }

        } catch (error: any) {
            return res.status(500).json({ message: 'Error while updating applicant form info', error: error.message, state: false, data: applicantId })
        }
    }
    @HttpCode(200)
    @Authorized(authorizedUsers)
    @Post("/createApplicant/:formId")
    async createApplicant(@Res() res: Response, @Body() data: IApplicantModel, @CurrentUser() user: JwtPayload, @Param('formId') formId: string) {
        try {
            const addApplicant = await employeeService.addApplicant(data, user.sub, formId);
            return { message: 'Applicant added correctly', state: true, data: addApplicant }
        } catch (error: any) {
            return res.status(500).json({ message: 'Error while creating applicant to ERF', error: error.message, state: false });
        }
    }

    @HttpCode(200)
    @Authorized(authorizedUsers)
    @Put("/updateApplicant/:applicantId")
    async updateApplicant(@Param("applicantId") applicantId: string, @CurrentUser() user: JwtPayload, @Body() data: IApplicantModel, @Res() res: Response) {
        try {
             await employeeService.updateApplicantInfo(applicantId, data, user.sub);
             return { message:'Application updated correctly', state:true, data:applicantId}

        } catch (error: any) {
            return res.status(500).json({ message: 'Error while creating applicant to ERF', error: error.message, state: false });
        }
    }

}


