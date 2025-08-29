import { JsonController, Res, Post, Get, HttpCode, Authorized, Body, CurrentUser } from 'routing-controllers'
import { EmployeeReqFormService } from '../services/employeeReqForm.service';
import { JwtPayload } from '../auth/authorizationChecker';
import { IEmployeeReqForm } from '../models/EmployeeReqForm.model';
import { Response } from 'express';
import { UUID } from 'crypto';


const authorizedUsers = ['global', 'manager', 'supervisor'];
const employeeService = new EmployeeReqFormService();
const initialCreateEmployeeReqFormTemplate = ['reportTo', 'jobNumber', 'jobLocation', 'projectedLength', 'applicants'];

@JsonController('/employereqform')
export default class EmployeeReqForm {
    @HttpCode(201)
    @Post("/newEmployeeReqForm")
    @Authorized(authorizedUsers)
    async createNewEmployeeReqForm(@Body() body: IEmployeeReqForm, @CurrentUser() user:JwtPayload, @Res() res:Response){
        try {
            let validData = true;
            initialCreateEmployeeReqFormTemplate.forEach(k => {if( !Object.keys(body).includes(k)) validData = false; })
            if(!validData) {
                return res.status(500).json({message:'Unable to create Form', state:false, error: 'Missing fields'})
            }
            const newForm = await employeeService.createNewEmployeeReqForm(body, user.sub as UUID)
            if(newForm) {
                return {message: 'new Employee Req form craete', state: true, data: body.formId }
            }
            else {
                return res.status(500).json({message:'There was an error creating the ER form', state:false, error: 'no error'})
            }
        } catch (error:any) {
            return res.status(500).json({message:'There was an error creating the ER form', state:false, error: error.message})
        }
    }
}


