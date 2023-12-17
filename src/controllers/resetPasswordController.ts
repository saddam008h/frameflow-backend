import express from 'express';
import bcrypt from 'bcrypt';
import { getUserByEmail, getUserById } from '../db/users';
import { generateToken } from '../utils/generateToken';
import { createToken, deleteTokenByTokenValue } from '../db/tokens';
import { resetPasswordEmailTemplate } from '../utils/resetPasswordEmailTemplate';
import { sendEmail } from '../utils/sendEmail';
import { resetPasswordSuccessEmailTemplate } from '../utils/resetPasswordSuccessEmailTemplate';

//develpment or production
let client_path = ''
if(process.env.NODE_ENV === 'production'){
  const client_path = process.env.CLIENT_PATH_PROD;
}else{
  const client_path = process.env.CLIENT_PATH_DEV;
}

export const forgotPassword = async (req: express.Request, res: express.Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({status:false, msg: 'Missing required fields' });
    }

    const user = await getUserByEmail(email)
    if (!user) {
      return res.status(400).json({status:false, msg: 'Email is not registered' });
    }

    const token = generateToken({email, _id: user._id});
    await createToken({token, userId: user._id});

    
    const send_to = email;
    const sent_from = process.env.EMAIL_USER;
    const subject = "FrameFlow - Password reset request";
    const resetPasswordLink = `${client_path}/forgot-password/reset-password?token=${token}`;
    const message = resetPasswordEmailTemplate(resetPasswordLink, user.name);
    const result = await sendEmail(subject, message, send_to, sent_from);
    if(!result){
      await deleteTokenByTokenValue(token);
      return res.status(400).json({status:false, msg: 'Email is unable to send' });
    }

    return res.status(200).json({status:true, msg: 'Reset password link is sent successfully. Please check your email.'});

  } catch (error) {
    console.log(error);
    return res.status(400).json({status:false, msg: 'Something went wrong' });
  }
}

export const newPassword = async (req: express.Request, res: express.Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({status:false, msg: 'Missing required fields' });
    }

    const tokenData:any = await deleteTokenByTokenValue(token);
    if(!tokenData){
      return res.status(400).json({status:false, msg: 'invalid access' });
    }
    console.log(tokenData);
    const user = await getUserById(tokenData.userId);
    if (!user) {
      return res.status(400).json({status:false, msg: 'Email is not registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await user.updateOne({password: hashedPassword});

    const send_to = user.email
    const sent_from = process.env.EMAIL_USER;
    const subject = "FrameFlow - Successful reset password";
    const message = resetPasswordSuccessEmailTemplate(user.name);
    const result = await sendEmail(subject, message, send_to, sent_from);
 
    const newToken = generateToken({email: user.email, _id: user._id});
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      verified: user.verified,
      image: user.image,
      token: newToken
    };

    return res.status(200).json({status:true, msg: 'Password is reset successfully.', user: userResponse});

  } catch (error) {
    console.log(error);
    return res.status(400).json({status:false, msg: 'Something went wrong' });
  }
}