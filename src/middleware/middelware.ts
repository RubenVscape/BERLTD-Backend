import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";


@Middleware({type: 'before'})
export class LoggingMiddleware implements ExpressMiddlewareInterface {
    use(req:any, res:any, next: (err?:any) => any):void {
        console.log(`[${req.method}] ${req.url} - body: `, req.body);
        const oldSend = res.send;
        res.send = function (body: any) {
            console.log(`[ ${req.method}] ${req.url} - repsonse: `, 'Response ok')
            return oldSend.call(this, body);
        }
        next();
    }
}