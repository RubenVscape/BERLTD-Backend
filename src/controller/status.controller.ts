import { Get, JsonController } from "routing-controllers";

@JsonController()
export class StatusController {
    @Get("/ping") 
        ping(){
            return { status: 'ok', message: 'Server ok'}
        }
}