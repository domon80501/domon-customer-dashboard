import express from 'express';
import {
  changeName,
  changePassword,
  sendEmail,
  verifyEmail,
  logout,
} from '../controllers/customer';
import 'express-async-errors';

const customerRouters = express.Router();

customerRouters.get('/sendEmail/:email', sendEmail);
customerRouters.get('/verifyEmail/:email', verifyEmail);
customerRouters.get('/logout', logout);

customerRouters.post('/changeName', changeName);
customerRouters.post('/changePwd', changePassword);

export default customerRouters;
