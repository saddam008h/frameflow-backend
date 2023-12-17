import { ObjectId } from 'mongodb';

import jwt from 'jsonwebtoken';

const maxAge = parseFloat(process.env.MAX_AGE_JWT_DAYS) * 24 * 60 * 60; //days

interface Idata {
    _id: ObjectId; // Use ObjectId here
    email: string;
  }


export const generateToken = (data:Idata) => {
    return jwt.sign(data , process.env.JWTPRIVATEKEY, {
        expiresIn: maxAge,
      });
}
