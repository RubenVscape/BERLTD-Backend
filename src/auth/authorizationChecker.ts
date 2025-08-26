import { Action } from "routing-controllers";
import jwt from "jsonwebtoken";

export interface JwtPayload {
    sub: string;
    email?: string;
    userTyp?: string;
}


export const authorizationChecker = async (action: Action) => {
    try {
        const auth = action.request.headers.authorization as string | undefined;
        if (!auth || !auth.startsWith("Bearer ")) return false;
        const token = auth.split(" ")[1];
        const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        (action.request as any).user = payload;
        return true;
    } catch  {
        return false;
    }
}

export const currentUserChecker = async(action: Action) => {
return (action.request as any).user as JwtPayload | undefined
}