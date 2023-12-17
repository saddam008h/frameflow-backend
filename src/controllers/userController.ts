import { UserModel, getUserById } from "../db/users";
import express from "express";
import bcrypt from 'bcrypt';

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
})


export const getUsers = async (req: express.Request, res: express.Response) => {
  try {
    const users = await UserModel.find();
    return res.status(200).json({ status: true, msg: 'Users fetched', users: users })
  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, msg: 'Something went wrong' });
  }
}

export const updateUser = async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userImage: any = req.file;
    console.log(userImage)
    
    if (!id || !name) {
      return res.status(400).json({ status: false, msg: 'Missing required fields' });
    }
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ status: false, msg: 'User not found' });
    }

    //if user just updated name
    if(!userImage){
      await user.updateOne({ name: name })
      console.log('uppp')
      return res.status(200).json({ status: true, msg: 'Profile Updated Successfully', name: name })
    }

    //delete previous image from cloudinary
    if(user.imagePublicId){
      cloudinary.uploader.destroy(user.imagePublicId)
      console.log('deleted')
    }

    const b64 = Buffer.from(userImage.buffer).toString('base64'); 

    const dataURI = "data:"+userImage.mimetype+";base64,"+b64;
    //upload image on cloudinary
    cloudinary.uploader.upload(dataURI, { folder: "Recapeo/user-profiles" })
      .then(async (result: any) => {
        //save image url and public id in db

        try {
          await user.updateOne({ name: name, image: result.url, imagePublicId: result.public_id });
          return res.status(200).json({ status: true, msg: 'Profile Updated Successfully', name, image: result.url })

        } catch (error) {
          console.log(error);
          return res.status(500).json({ status: false, msg: 'Something went wrong' });
        }
      })
      .catch((error: any) => {
        console.log(error)
        return res.status(500).json({ status: false, msg: 'Something went wrong' });
      })


  } catch (error) {
    console.log(error);
    return res.status(400).json({ status: false, msg: 'Something went wrong' });
  }
}

// change user password
export const changePassword = async (req: express.Request, res: express.Response) => {
  try{

    const { id } = req.params;
    const {newPassword, currentPassword} = req.body;
    if(!id || !newPassword || !currentPassword){
      return res.status(400).json({ status: false, msg: 'Missing required fields' });
    }
    const user = await getUserById(id);
    if(!user){
      return res.status(404).json({ status: false, msg: 'User not found' });
    }
    const validPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!validPassword) {
      return res
        .status(401)
        .json({ status: false, msg: "Invalid current password." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await user.updateOne({password: hashedPassword})
    return res.status(200).json({ status: true, msg: 'Password Changed Successfully' });

  }catch(error){
    console.log(error);
    return res.status(400).json({ status: false, msg: 'Something went wrong' });
  }
}