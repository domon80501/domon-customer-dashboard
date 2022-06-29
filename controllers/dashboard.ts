import {Request, Response} from 'express';
import session from 'express-session';
import Customer, {SocialType} from '../core/models/customer';
import {customerService} from '../core/services/customerServiceOrm';
import CustomerInfo from '../core/viewmodels/customerInfo';
import {globalInfo} from '../core/services/customerService';

async function guide(req: Request, res: Response) {
  if (req.session.customerInfo) {
    // 有session.
    return await stayLoggedIn(req, res);
  }

  if (req.oidc.isAuthenticated()) {
    // 已登入 & 無 session.
    return await firstLogin(req, res);
  }

  // 未登入狀態.
  res.render('index', {
    title: 'Customer Dashboard',
    isAuthenticated: req.oidc.isAuthenticated(),
  });
}

// 保持登入狀態 (session).
async function stayLoggedIn(req: Request, res: Response) {
  // 給予 session 也表示 db 有數據且驗證 email.

  const customerInfo = req.session.customerInfo;

  const customer = await customerService.findOneByUsername(
    req.session.customerInfo.username
  );

  customerInfo.name = customer?.name; // 讀取最新名稱.

  res.render('pages/dashboard', {
    title: 'Customer-Dashboard',
    customer: customerInfo,
  });
}

async function firstLogin(req: Request, res: Response) {
  /*
    無 session 情況 => 第一次登入、久未登入
    已登入狀態(委託auth0) & 指派數據進 customerInfo.
   */
  let customerInfo = new CustomerInfo();
  Object.assign(customerInfo, req.oidc.idTokenClaims);
  const picture = customerInfo.picture;

  /*
    檢查是否已存在於 db.
    1. 判斷註冊身分.
    2. 用 socialType[auth0-user_id] 當帳號.
   */
  let customer: Customer | null;
  const username = customerInfo.sub;

  customer = await customerService.findOneByUsername(username);

  if (!customer) {
    await customerService.generate(
      username,
      customerInfo.sub.split('|')[0],
      customerInfo.name,
      customerInfo.email
    );

    customer = await customerService.findOneByUsername(username);
  }

  // 驗證註冊方式. 0:個人 1:google 2.fb ==> 0:個人 必須驗證Email. (1./2.不需要)
  if (
    customer?.socialtype === SocialType.Individual &&
    !customer.emailverified
  ) {
    res.render('pages/sendemail', {
      title: '發送驗證信',
      isAuthenticated: req.oidc.isAuthenticated(),
      customer: customerInfo,
    });
    return;
  }

  /* 已驗證,準備進入 Dashboard.
     1. 整理 customerInfo.
     2. 其登入次數 +1 .
     3. 將其輸入 session.
  */
  customerInfo = new CustomerInfo();
  customerInfo.idToken = req.sessionID;
  customerInfo.username = customer?.username.toString() ?? '';
  customerInfo.name = customer?.name.toString() ?? '';
  customerInfo.socialType = customer?.socialtype.toString() ?? '';
  customerInfo.email = customer?.email.toString() ?? '';
  customerInfo.picture = picture;

  await customerService.login(customerInfo.username);

  req.session.customerInfo = customerInfo;

  res.render('pages/dashboard', {
    title: 'Customer-Dashboard',
    customer: customerInfo,
  });
}

async function getGloblaInfo(req: Request, res: Response) {
  const result = await globalInfo();
  console.log(result);
  res.json({total: result[0], current: result[1], rolling: result[2]});
}

export default guide;
export {getGloblaInfo};
