const Sib = require('sib-api-v3-sdk');
import dotenv from 'dotenv';

dotenv.config(); // 初始化與載入環境值.

// SendInBlue基本設定.
const client = Sib.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;
const tranEmailApi = new Sib.TransactionalEmailsApi();
const sender = {
  email: 'forbs80501@gmail.com',
  name: 'Domon',
};

async function sendEmail(email?: string) {
  // 設定接收 mail.
  const recipient = [{email: email}];

  tranEmailApi
    .sendTransacEmail({
      sender,
      to: recipient,
      subject: '[Domon-CustomerDashboard] Email verification',
      htmlContent: `
      <div>即將可使用 CustomerDashboard 請<a href="${process.env.DOMAIN_URL}/customer/verifyEmail/${email}">進行驗證</a></div>
      <div><H3>此為系統發送，請勿直接回覆。</H3></div>
      `,
    })
    .then(console.log)
    .catch(console.log);
}

export const emailUtilities = {sendEmail};
