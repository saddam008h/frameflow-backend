import { getUsageByUserId } from '../db/usage';
import express from 'express';

// GET usage by user ID
export const usageByUserId = async (req: express.Request, res: express.Response) => {
    const userId = req.params.userId;
  
    try {
      const userUsage = await getUsageByUserId(userId);
      if (!userUsage) {
        return res.status(404).json({ status: false, msg: 'No Usage found' });
      }
  
      return res.status(200).json({ status: true, msg: 'Usage retrieved successfully', data: userUsage });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: false, msg: 'Something went wrong' });
    }
  }