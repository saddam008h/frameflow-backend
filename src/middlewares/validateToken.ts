import { verify } from 'jsonwebtoken';
import express from 'express';

interface AuthenticatedRequest extends express.Request {
    user: any; // Type this according to your user data structure
    token: string;
  }
const validateToken = (req: AuthenticatedRequest, res: express.Response, next:express.NextFunction ) => {
    try {
        const accessToken = req.header("Authorization").split(" ")[1];
        console.log(accessToken)
        if (!accessToken) {
            
            return res.sendStatus(401);
        }
       
        const payload = verify(accessToken, process.env.JWTPRIVATEKEY);
        req.user = payload;
        req.token = accessToken
        
        return next();
    }
    catch (err) {
        return res.sendStatus(401);
    }
}
export default validateToken;