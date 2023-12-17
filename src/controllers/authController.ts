import express from 'express';
import bcrypt from 'bcrypt';
import { getUserByEmail, createUser, UserModel, deleteUserById, updateUserById } from '../db/users';
import { generateToken } from '../utils/generateToken';
import { confirmRegisterEmailTemplate } from '../utils/confirmRegisterEmailTemplate';
import { sendEmail } from '../utils/sendEmail';
import { createToken, deleteTokenByTokenValue, getTokenByTokenValue } from '../db/tokens';
import { confirmationSuccessEmailTemplate } from '../utils/confirmationSuccessEmailTemplate';

import { createFolder } from '../db/folders'; //dependency, TODO: remove this in microservice architecture

//google
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

//develpment or production
let client_path = ''
if(process.env.NODE_ENV === 'production'){
  client_path = process.env.CLIENT_PATH_PROD;
}else{
  client_path = process.env.CLIENT_PATH_DEV;
}

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({status:false, msg: 'Missing required fields' });
    }

    const user = await getUserByEmail(email)
    if (!user) {
      return res.status(400).json({status:false, msg: 'Invalid Email and Password.' });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );
    if (!validPassword) {
      return res
        .status(401)
        .json({ status: false, msg: "Invalid Email and Password." });
    }

    const token = generateToken({_id: user._id, email:user.email});

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      verified: user.verified,
      image: user.image,
      token: token
    };

    return res.status(200).json({status:true, msg: 'User logged in', user: userResponse})

  } catch (error) {
    console.log(error);
    return res.status(400).json({status:false, msg: 'Something went wrong' });
  }
};

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({status:false, msg: 'Missing required fields' });
    }

    const existingUser:any = await getUserByEmail(email);
  
    if (existingUser) {

      if(!existingUser.verified){
        await deleteUserById(existingUser._id);

      }else{
        return res.status(400).json({status:false, msg: 'Email already exists' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    const user:any = await createUser({
      name,
      email,
      password: bcryptPassword,
    });

    const token = generateToken({_id: user._id, email:user.email});
    
    // sending confirmation email
    await createToken({ userId: user._id, token: token })
    const send_to = email;
    const sent_from = process.env.EMAIL_USER;
    const subject = "FrameFlow - Please confirm your registration";
    let link = '';
    if(process.env.NODE_ENV === 'production'){
        link = `${process.env.SERVER_PATH_PROD}/api/auth/email-confirmation?token=${token}`;
    }else{
        link = `${process.env.SERVER_PATH_DEV}/api/auth/email-confirmation?token=${token}`;
    }
    const message = confirmRegisterEmailTemplate(link, name);
    const result = await sendEmail(subject, message, send_to, sent_from);
    if (!result) {
      await deleteUserById(user._id);
      return res.status(400).json({status:false, msg: 'Unable to send confirmation email' })
    }

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      verified: user.verified,
      image: user.image,
      token: token
    };

    return res.status(200).json({status:true, msg: 'Confirmation email has been sent to your email.', user: userResponse})
  } catch (error) {
    console.log(error);
    return res.status(400).json({status:false, msg: 'Something went wrong' });
  }
}

//google
export const google = async (req: express.Request, res: express.Response) => {
  const { token } = req.body;
 
  try {
    const response = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const data = await response.payload;
    const email_verified = data.email_verified;
    const email = data.email;
    const jti = data.jti;
    const name = data.name;
    const picture = data.picture;
    if (email_verified) {
      const user = await getUserByEmail(email);

      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const bcryptPassword = await bcrypt.hash(jti, salt);
        
       const user1:any = new UserModel({
          name: name,
          email: email,
          verified: true,
          image: picture,
          password: bcryptPassword
        });
        await user1.save();
        // Create a default root folder for the user
        const defaultRootFolder = await createRootFolder(user1._id);

        if (!defaultRootFolder) {
          return res.status(500).json({ status: false, msg: 'Unable to create default root folder' });
        }
        //sending success confirmation email
        const send_to = email;
        const sent_from = process.env.EMAIL_USER;
        const subject = "FrameFlow - Your registration is successfull";
        const message = confirmationSuccessEmailTemplate(name);
        const result = await sendEmail(subject, message, send_to, sent_from);

        const token = generateToken({_id: user1._id, email:user1.email});
        const userResponse = {
          _id: user1._id,
          name: user1.name,
          email: user1.email,
          verified: user1.verified,
          image: user1.image,
          token: token
        };
        return res.status(200).json({status:true, msg: 'User logged in', user: userResponse})

      } else {
        const token = generateToken({_id: user._id, email:user.email});
        const userResponse = {
          _id: user._id,
          name: user.name,
          email: user.email,
          verified: user.verified,
          image: user.image,
          token: token
        };
        return res.status(200).json({status:true, msg: 'User logged in', user: userResponse})
      }

    }else{
      return res.status(400).json({status:false, msg: 'email is not registered' });
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({status:false, msg: 'Something went wrong' });
  }
};

//verify confirmation email link
export const emailConfirmation = async (req: express.Request, res: express.Response) =>{
  
  try{
    const token = req.query.token as string;
    const verifiedToken = await getTokenByTokenValue(token)
    if(!verifiedToken){return res.redirect(`${client_path}/?invalid=true`);}
    const userId = verifiedToken.userId as any

    // Create a default root folder for the user
    const defaultRootFolder = await createRootFolder(userId);

    if (!defaultRootFolder) {
      return res.status(500).json({ status: false, msg: 'Unable to create default root folder' });
    }

    const verifiedUser = await updateUserById(userId, {verified:true})
    if(!verifiedUser){return res.redirect(`${client_path}/?invalid=true`);}

    await deleteTokenByTokenValue(token)

    const send_to = verifiedUser.email;
    const sent_from = process.env.EMAIL_USER;
    const subject = "FrameFlow - Your registration is successfull";
    const message = confirmationSuccessEmailTemplate(verifiedUser.name);
    const result = await sendEmail(subject, message, send_to, sent_from);
  
    if (!result) {
      return res.status(400).json({status:false, msg: 'Unable to send success confirmation email' })
    }

    const userResponse = {
        _id: verifiedUser._id,
        name: verifiedUser.name,
        email: verifiedUser.email,
        verified: verifiedUser.verified,
        image: verifiedUser.image,
        token: token
    };

    res.redirect(`${client_path}/?verified=true&user=${JSON.stringify(userResponse)}`);

  }catch(error){
    console.log(error)
    return res.status(400).json({status:false, msg: 'Something went wrong' });
  }
}

const createRootFolder = async (userId: string) => {
  try {
    // Implement logic to create a root folder for the user
    const rootFolder = await createFolder({
      name: 'Root',
      parent: 'root itselft', 
      user: userId,
    });

    return rootFolder;
  } catch (error) {
    console.log(error);
    return null;
  }
};