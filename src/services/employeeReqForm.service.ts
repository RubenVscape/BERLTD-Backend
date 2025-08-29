import { UUID } from "crypto";
import { EmployeeRequisitionFormModel, IEmployeeReqForm } from "../models/EmployeeReqForm.model";
import { LocationModel } from "../models/location.model";
import { UserModel } from "../models/user.model";


export class EmployeeReqFormService {
    async createNewEmployeeReqForm(data:IEmployeeReqForm, createdBy:UUID) {
        const checkIfLocationExists = await LocationModel.findOne({locationId: data.jobLocation});
        if (!checkIfLocationExists){
            throw new Error('The location does not exits')
        }
        
        const reportsTo = await UserModel.findOne({userId: data.reportTo});
        if(!reportsTo) {
            throw new Error('The supervisor does not exits')
        }
        if (reportsTo.userType == 'employee') {
            throw new Error('The user to report to is not a supervisor/manager')
        }
        if (!data?.applicants) {
            throw new Error ('You must add employees ')
        }

        const newForm = new EmployeeRequisitionFormModel({
            ...data,
            createdBy}
        )
        return await newForm.save()
    }
}
