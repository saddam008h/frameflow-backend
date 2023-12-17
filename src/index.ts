import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv'; // Import dotenv
import cron from 'node-cron'; //dependency

dotenv.config();
import mongoose from 'mongoose';

//develpment or production
let client_path = ''
if(process.env.NODE_ENV === 'production'){
  client_path = process.env.CLIENT_PATH_PROD;
}else{
  client_path = process.env.CLIENT_PATH_DEV;
}


const app = express();
app.use(cors({
  credentials: true,
  origin: client_path
  
}));

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const server = http.createServer(app);
server.listen(8000, () => {
  console.log('Server running on http://localhost:8000/');
});

const MONGO_URL = process.env.MONGO_URL; // DB URI
mongoose.Promise = Promise;
mongoose.connect(MONGO_URL);
mongoose.connection.on('error', (error: Error) => console.log(error));
mongoose.connection.once('open', () => {
    console.log('Connected to the database');
  });

//test route
app.get('/', (req, res) => {
    res.send('Hello World! From Recapeo');
})

//import routes
import authRoute from './routes/AuthRoute';
import resetPasswordRoute from './routes/ResetPasswordRoute';

import userRoute from './routes/UserRoute';
import folderRoute from './routes/FolderRoute'
import imageRoute from './routes/ImageRoute'
import storageRoute from './routes/StorageRoute'
import usageRoute from './routes/UsageRoute'
import { UsageModel } from './db/usage';
//use routes
app.use('/api/auth', authRoute);
app.use('/api/user', userRoute);
app.use('/api/reset-password', resetPasswordRoute);

app.use('/api/folder',folderRoute)
app.use('/api/image',imageRoute)
app.use('/api/storage',storageRoute)
app.use('/api/usage',usageRoute)


// cron job
// Schedule a task to reset daily usage at midnight (00:00)
cron.schedule('0 0 * * *', async () => {
  try {
    // Reset daily usage for all users to 0
    await UsageModel.updateMany({}, { $set: { usage: 0 } });
    console.log('Daily usage reset successful.');
  } catch (error) {
    console.error('Error resetting daily usage:', error);
  }
}, {
  timezone: 'Asia/Karachi',
});