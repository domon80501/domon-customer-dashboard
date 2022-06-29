import express, {Express, ErrorRequestHandler} from 'express';
import {auth} from 'express-openid-connect';
import dotenv from 'dotenv';
import mainRoutes from './routes/index';
import customerRoutes from './routes/customer';
import swaggerUi from 'swagger-ui-express';
import swaggerFile from './swagger_output.json';
import session from 'express-session';
import 'express-async-errors';
import './config/sessionStore';
import db from './core/services/db';
import {authConfig} from './config/auth0';

const pgSession = require('express-pg-session')(session);

dotenv.config(); // 初始化與載入環境值.

const app: Express = express();
const port = process.env.PORT || 3000;

app.set('views', 'views');
app.set('view engine', 'ejs');
app.use(express.json());
app.use(auth(authConfig));

app.use(
  session({
    store: new pgSession({
      pool: db,
      tableName: 'user_sessions',
    }),
    secret: 'WCBk4tuxP2', // 隨機簽名值 by vscode random.
    saveUninitialized: false,
    resave: true, // 沒有變動也強制更新當前session. Set true =>只要使用者有在操作系統就反覆更新有效期.
    cookie: {
      maxAge: 1000 * 3600 * 24 * 7, // 有效期，單位毫秒.
    },
  })
);

// 路由委派.
app.use('/', mainRoutes);
app.use('/customer', customerRoutes);

// 設定全局捕捉異常. (簡易版)
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log(err);
  res.send('發生異常，請聯絡系統管理者');
};
app.use(errorHandler);

// 產生swagger api doc.
app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
