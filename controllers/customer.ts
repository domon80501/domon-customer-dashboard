import {Request, Response} from 'express';
import {emailUtilities} from '../core/utilities/sendEmail';
import {customerService} from '../core/services/customerServiceOrm';

async function changeName(req: Request, res: Response) {
  const username = req.session.customerInfo.username;
  const name = req.body.name;

  const resultInfo = await customerService.changeName(username, name);

  res.json(JSON.stringify(resultInfo));
}

async function changePassword(req: Request, res: Response) {
  const username = req.session.customerInfo.username;
  const email = req.session.customerInfo.email;
  const oldPwd = req.body.oldPwd;
  const newPwd = req.body.newPwd;
  const checkPwd = req.body.checkPwd;

  const resultInfo = await customerService.changePassword(
    username,
    oldPwd,
    newPwd,
    checkPwd,
    email
  );

  res.json(JSON.stringify(resultInfo));
}

async function sendEmail(req: Request, res: Response) {
  const email = req.params.email;

  await emailUtilities.sendEmail(email);

  res.status(200).send(`發送成功 , 請至 ${email} 進行驗證後即可進入系統`);
}

async function verifyEmail(req: Request, res: Response) {
  const email = req.params.email;

  const resultInfo = await customerService.verifyEmail(email);

  if (resultInfo.resultCode === '0') {
    res
      .status(200)
      .send("<script>alert('驗證完成'); location.href='/'</script>");
  } else {
    res.status(500).send(`${resultInfo.result}`);
  }
}

async function logout(req: Request, res: Response) {
  /*
    需求書未表示要一併清除各裝置對應的 session.
    故此處僅針對當前裝置清除 session. (使用不同瀏覽器或私密瀏覽將會有多組 session 為正常情形.)
  */
  req.session.destroy((err: any) => {
    console.log(err);
  });

  res.redirect('/logout'); // 轉 auth0 logout.
}
export {changeName, changePassword, sendEmail, verifyEmail, logout};
