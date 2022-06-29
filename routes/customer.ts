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

customerRouters.get(
  '/sendEmail/:email',
  sendEmail
  /*
    #swagger.description ='發送驗證信. 簡易版,未檢核 email 是否存在於 db 之客戶，**請勿透過本功能亂傳 mail.**'
  */
);
customerRouters.get(
  '/verifyEmail/:email',
  verifyEmail
  /*
    #swagger.description ='驗證 email '
  */
);
customerRouters.get('/logout', logout /* #swagger.ignore = true */);

customerRouters.post(
  '/changeName',
  changeName
  /*
#swagger.description ='修改名稱. 未引入 [token驗證db] 機制,簡易版採用session存放,故本功能目前僅能透過網站使用'
*/
);
customerRouters.post(
  '/changePwd',
  changePassword
  /*
#swagger.description ='修改密碼. 只有個人註冊可以修改,使用第三方註冊之客戶將被禁止使用. 未引入 [token驗證db] 機制,簡易版採用session存放,故本功能目前僅能透過網站使用'
*/
);

export default customerRouters;
