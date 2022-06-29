import express from 'express';
import guide, {getGloblaInfo} from '../controllers/dashboard';
import 'express-async-errors';

const mainRouters = express.Router();

mainRouters.get('/', guide /* #swagger.ignore = true */);
mainRouters.get('/getGloblaInfo', getGloblaInfo);

export default mainRouters;
