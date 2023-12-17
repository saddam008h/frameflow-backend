
import express from "express";
import { addImage, deleteImageById, getImagesByUserId, getImagesByUserIdAndFolder } from "../db/images";
import { addNewStorage, getStorageByUserId, updateStorageById } from "../db/storage";
import { addNewUsage, getUsageByUserId, updateUsageById } from "../db/usage";

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
})

// CREATE new Images
export const addNewImages = async (req: express.Request, res: express.Response) => {
  try {
    const { user, folder } = req.body;
    const imagesArray: any = req.files;

    const totalSize = imagesArray.reduce((acc: number, image: any) => acc + image.size, 0);
    
      // Update user's storage
      let userStorage:any;
      userStorage = await getStorageByUserId(user);
      if (!userStorage.length) {
        await addNewStorage({
          totalStorage: 0,
          user,
        });
        userStorage = await getStorageByUserId(user);
      }
  
      if (userStorage[0].totalStorage + totalSize > process.env.STORAGE_LIMIT) {
        return res.status(500).json({ status: false, msg: `Limit Exeeded. Total storage limit is 10MB` });
      } else {
        const newTotalStorage = userStorage[0].totalStorage + totalSize;
        await updateStorageById(userStorage[0]._id, { totalStorage: newTotalStorage });
      }


    // update user's daily usage
    let userDailyUsage:any;
    userDailyUsage = await getUsageByUserId(user);
    if (!userDailyUsage.length) {
      await addNewUsage({
        totalUsage: 0,
        user,
      });
      userDailyUsage = await getUsageByUserId(user);
    }
    if (userDailyUsage[0].totalUsage + totalSize > process.env.DAILY_USAGE_LIMIT) {
      return res.status(500).json({ status: false, msg: `Limit Exeeded. Daily usage limit is 25MB` });
    } else {
      const newTotalUsage = userDailyUsage[0].totalUsage + totalSize;
      await updateUsageById(userDailyUsage[0]._id, { totalUsage: newTotalUsage });
    }


    const uploadPromises = imagesArray.map(async (image: any) => {

      const b64 = Buffer.from(image.buffer).toString('base64');
      const dataURI = "data:" + image.mimetype + ";base64," + b64;

      return cloudinary.uploader.upload(dataURI, { folder: "FlowFrame/user-images" })
        .then(async (result: any) => {
          // Save image URL and public ID in the database
          const newImage = await addImage({
            imageName: image.originalname,
            imageSize: image.size,
            user,
            folder,
            imageUrl: result.url,
            imagePublicId: result.public_id
          });

          return newImage;
        });
    });

    Promise.all(uploadPromises)
      .then((uploadedImages) => {
        return res.status(201).json({ status: true, msg: 'Images added successfully', data: uploadedImages });
      })
      .catch((error) => {
        console.log(error);
        return res.status(500).json({ status: false, msg: 'Something went wrong' });
      });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, msg: 'Something went wrong' });
  }
}



// GET images by user ID
export const imagesByUserId = async (req: express.Request, res: express.Response) => {
  const userId = req.params.userId;

  try {
    const userFolders = await getImagesByUserId(userId);
    if (!userFolders) {
      return res.status(404).json({ status: false, msg: 'No images found' });
    }

    return res.status(200).json({ status: true, msg: 'Images retrieved successfully', data: userFolders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, msg: 'Something went wrong' });
  }
}

// GET images by user ID and parent ID
export const imagesByUserIdAndFolder = async (req: express.Request, res: express.Response) => {
  const userId = req.params.userId;
  const imageId = req.params.parent;

  try {
    const userImages = await getImagesByUserIdAndFolder(userId, imageId);

    if (!userImages) {
      return res.status(404).json({ status: false, msg: 'No images found' });
    }

    return res.status(200).json({ status: true, msg: 'Images retrieved successfully', data: userImages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, msg: 'Something went wrong' });
  }
}


// DELETE multiple images by IDs
export const deleteImages = async (req: express.Request, res: express.Response) => {
  const imageIds: string[] = req.body.imageIds;

  try {
    const deletedImages:any = await Promise.all(imageIds.map(async (imageId) => {
      // Delete from your database
      const deletedImage = await deleteImageById(imageId);

      // Delete from Cloudinary
      if (deletedImage && deletedImage.imagePublicId) {
        await cloudinary.uploader.destroy(deletedImage.imagePublicId);
      }

      return deletedImage;
    }));

    // Check if any image was deleted
    if (deletedImages.every((image:any) => !image)) {
      return res.status(404).json({ status: false, msg: 'Images not found' });
    }

    // Update user's storage
    const userStorage:any = await getStorageByUserId(deletedImages[0].user);
    const totalSize = deletedImages.reduce((acc: number, image: any) => acc + image.imageSize, 0);
    const newTotalStorage = userStorage[0].totalStorage - totalSize;
    await updateStorageById(userStorage[0]._id, { totalStorage: newTotalStorage });

    
    return res.status(200).json({ status: true, msg: 'Images deleted successfully', data: deletedImages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, msg: 'Something went wrong' });
  }
};
