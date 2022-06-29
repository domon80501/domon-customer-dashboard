import express from 'express';
import guide, {getGloblaInfo} from '../controllers/dashboard';
import 'express-async-errors';

const mainRouters = express.Router();

mainRouters.get('/', guide /* #swagger.ignore = true */);
mainRouters.get(
  '/getGloblaInfo',
  getGloblaInfo
  /*
    #swagger.description ='獲取儀表板頂端資訊. total: 總註冊客戶 | current: 當日活躍客戶 | rolling: 7日內客戶session(滾動)'
  */
);

export default mainRouters;
