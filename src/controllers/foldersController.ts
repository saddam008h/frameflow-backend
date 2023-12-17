import express from 'express';
import { createFolder, deleteFolderById, getFolderAncestorsById, getFolderById, getFoldersByUserId, getFoldersByUserIdAndParent, getRootFolderByUserId, updateFolderById } from '../db/folders';
import { deleteImagesByFolderId, getImagesByFolderId } from '../db/images'; //TODO: DEpendencies
import { getStorageByUserId, updateStorageById } from '../db/storage'; //dependency
import { getUsageByUserId, updateUsageById } from '../db/usage';

// GET a folder by ID
export const folderById = async (req: express.Request, res: express.Response) => {
  const folderId = req.params.id;
  try {
    const folder = await getFolderById(folderId);
    if (!folder) {
      return res.status(404).json({ status: false, msg: 'Folder not found' });
    }
    return res.status(200).json({ status: true, msg: 'Folder retrieved successfully', data: folder });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, msg: 'Something went wrong' });
  }
}

// get root folder by user id
export const rootFolderByUserId = async (req: express.Request, res: express.Response) => {
  const userId = req.params.userId;
  try {
    const folder = await getRootFolderByUserId(userId);
    
    if (!folder) {
      return res.status(404).json({ status: false, msg: 'Root Folder not found' });
    }
    return res.status(200).json({ status: true, msg: 'Root Folder retrieved successfully', data: folder });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, msg: 'Something went wrong' });
  }
}

// get ancestors of a folder by ID
export const folderAncestorsById = async (req: express.Request, res: express.Response) => {
  const folderId = req.params.id;
  try {
    const ancestors = await getFolderAncestorsById(folderId);
    return res.status(200).json({ status: true, msg: 'Folder ancestors retrieved successfully', data: ancestors });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, msg: 'Something went wrong' });
  }
}


// CREATE a new folder
export const createNewFolder = async (req: express.Request, res: express.Response) => {
  const { name, user, parent } = req.body;
  try {
    const folder:any = await createFolder({ name, user, parent });
    return res.status(201).json({ status: true, msg: 'Folder created successfully', data: folder });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, msg: 'Something went wrong' });
  }
}

// DELETE a folder by ID
export const deleteFolder = async (req: express.Request, res: express.Response) => {
  const folderId = req.params.id;
  try {
    
    const allImages:any = await getImagesByFolderId(folderId);

    // update user storage
    const totalSize = allImages.reduce((acc: number, image: any) => acc + image.imageSize, 0);
    const userStorage:any = await getStorageByUserId(allImages[0].user);
    const newTotalStorage = userStorage[0].totalStorage - totalSize;
    await updateStorageById(userStorage[0]._id, { totalStorage: newTotalStorage });


    // Delete images first
    await deleteImagesByFolderId(folderId);

    // Now, delete the folder
    const deletedFolder = await deleteFolderById(folderId);
    if (!deletedFolder) {
      return res.status(404).json({ status: false, msg: 'Folder not found' });
    }

    return res.status(200).json({ status: true, msg: 'Folder deleted successfully', data: deletedFolder });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, msg: 'Something went wrong' });
  }
}

// UPDATE a folder by ID
export const updateFolder = async (req: express.Request, res: express.Response) => {
  const folderId = req.params.id;
  const { name,user } = req.body;
  try {
    const updatedFolder = await updateFolderById(folderId, { name,user, });
    if (!updatedFolder) {
      return res.status(404).json({ status: false, msg: 'Folder not found' });
    }
    return res.status(200).json({ status: true, msg: 'Folder updated successfully', data: updatedFolder });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, msg: 'Something went wrong' });
  }
}

// GET folderss by user ID
export const foldersByUserId = async (req: express.Request, res: express.Response) => {
  const userId = req.params.userId; // Assuming the parameter name is 'userId'

  try {
    const userFolders = await getFoldersByUserId(userId);
    if (!userFolders) {
      return res.status(404).json({ status: false, msg: 'No folders found' });
    }
    
    return res.status(200).json({ status: true, msg: 'Folders retrieved successfully', data: userFolders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, msg: 'Something went wrong' });
  }
}

// GET folders by user ID and parent ID
export const foldersByUserIdAndParent = async (req: express.Request, res: express.Response) => {
  const userId = req.params.userId;
  const parentId = req.params.parent;

  try {
    const userFolders = await getFoldersByUserIdAndParent(userId, parentId);
    
    if (!userFolders) {
      return res.status(404).json({ status: false, msg: 'No folders found' });
    }
    
    return res.status(200).json({ status: true, msg: 'Folders retrieved successfully', data: userFolders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, msg: 'Something went wrong' });
  }
}


// TODO: dependencies
