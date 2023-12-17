import { getStorageByUserId } from '../db/storage';
import express from 'express';

// GET storage by user ID
export const storageByUserId = async (req: express.Request, res: express.Response) => {
    const userId = req.params.userId;
  
    try {
      const userStorage = await getStorageByUserId(userId);
      if (!userStorage) {
        return res.status(404).json({ status: false, msg: 'No Storage found' });
      }
  
      return res.status(200).json({ status: true, msg: 'Storage retrieved successfully', data: userStorage });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: false, msg: 'Something went wrong' });
    }
  }