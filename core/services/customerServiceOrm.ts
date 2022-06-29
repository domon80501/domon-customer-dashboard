import AppDataSource from './dborm';
import Customer from '../models/customer';
import {SocialType} from '../models/customer';
import {errorMsg, successMsg} from '../constants/systemMsg';
import ResultInfo from '../viewmodels/resultInfo';
const fetch = require('node-fetch'); // node-fetch 預計3.3版本才會完全支援ESM 目前得使用 commonjs 的注入方法.

// 查詢單一客戶.
async function findOneByUsername(username: string): Promise<Customer | null> {
  const customerEntity = AppDataSource.getRepository(Customer);

  const customer = await customerEntity.findOneBy({username: username});

  return customer;
}

// 註冊客戶.
async function generate(
  username: string,
  socialType: string,
  name: string,
  email?: string
) {
  const customer = new Customer();
  customer.username = username;
  customer.email = email ?? '';
  customer.name = name;
  customer.socialtype =
    socialType === 'google-oauth2'
      ? SocialType.Google
      : socialType === 'facebook'
      ? SocialType.Facebook
      : SocialType.Individual;
  customer.createdat = new Date();

  const customerRepository = AppDataSource.getRepository(Customer);

  await customerRepository.save(customer);
}

// 驗證 email.
async function verifyEmail(email: string): Promise<ResultInfo> {
  const resultInfo = new ResultInfo();

  const customerEntity = AppDataSource.getRepository(Customer);
  const customer = await customerEntity.findOneBy({email: email});

  try {
    if (!customer) {
      throw new Error(errorMsg.emailNotExist);
    }

    if (customer.emailverified) {
      // 已驗證過 mail. (直接轉向 dashboard)
      return resultInfo;
    }

    await customerEntity.update(
      {id: customer.id},
      {
        emailverified: true,
        emailverifiedat: new Date(),
      }
    );
  } catch (error: any) {
    resultInfo.resultCode = '1';
    resultInfo.result = error?.toString();
  }

  return resultInfo;
}

// 修改名稱.
async function changeName(username: string, name: string): Promise<ResultInfo> {
  const resultInfo = new ResultInfo();

  try {
    const customerEntity = AppDataSource.getRepository(Customer);
    const customer = await customerEntity.findOneBy({username: username});

    if (!customer) {
      throw new Error(errorMsg.systemError);
    }

    await customerEntity.update(
      {id: customer.id},
      {
        name: name,
      }
    );
  } catch (error) {
    resultInfo.resultCode = '1';
    resultInfo.result = errorMsg.systemError;
  }

  return resultInfo;
}

/*
  修改密碼.
  1. 註冊/登入資訊委任於 auth0 , 數據庫不保存客戶密碼.
  2. 向 auth0 進行密碼驗證.
*/
async function changePassword(
  username: string,
  oldPwd: string,
  newPwd: string,
  checkPwd: string,
  email: string
): Promise<ResultInfo> {
  let resultInfo = new ResultInfo();

  /*
    密碼規則:
    contains at least one lower character
    contains at least one upper character
    contains at least one digit character
    contains at least one special character
    contains at least 8 character
  */
  const rules = new RegExp(
    '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
  );

  if (newPwd !== checkPwd) {
    // 密碼二次驗證.
    resultInfo.resultCode = '1';
    resultInfo.result = errorMsg.passwordCheckError;
    return resultInfo;
  }

  if (!rules.test(newPwd)) {
    // 密碼規則驗證.
    resultInfo.resultCode = '1';
    resultInfo.result = errorMsg.passwordChangeFailedByRule;
    return resultInfo;
  }

  const customerEntity = AppDataSource.getRepository(Customer);
  const customer = await customerEntity.findOneBy({username: username});

  if (!customer) {
    resultInfo.resultCode = '1';
    resultInfo.result = errorMsg.systemError;
    return resultInfo;
  }

  if (customer?.socialtype !== SocialType.Individual) {
    // 前端已封鎖管道.
    // 後端防呆,僅有非第三方註冊才可修改密碼. (第三方用戶交由第三方平台管控).
    resultInfo.resultCode = '1';
    resultInfo.result = errorMsg.passwordChangeFailedBySocialType;
    return resultInfo;
  }

  try {
    /* 進行舊密碼驗證 (密碼保存於 auth0 )*/
    resultInfo = await checkOldPassword(email, oldPwd);

    if (resultInfo.resultCode === '1') {
      return resultInfo;
    }

    /* 進行修改密碼 */
    resultInfo = await handleChangePassword(username, newPwd);

    if (resultInfo.resultCode === '1') {
      return resultInfo;
    }
  } catch (error) {
    resultInfo.resultCode = '1';
    resultInfo.result = errorMsg.systemError;

    return resultInfo;
  }

  resultInfo.result = successMsg.passwordChangeSuccessfully;
  return resultInfo;
}

async function checkOldPassword(
  email: string,
  oldPwd: string
): Promise<ResultInfo> {
  const resultInfo = new ResultInfo();

  const bodyContent = {
    grant_type: 'password',
    username: email,
    password: oldPwd,
    audience: process.env.AUTH0_AUDIENCE,
    scope: 'read:current_user',
    client_id: process.env.AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
  };

  const requestSettings = {
    method: 'POST',
    body: JSON.stringify(bodyContent),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

  const fetchResponse = await fetch(
    `${process.env.AUTH0_OAUTH_TOKEN}`,
    requestSettings
  );

  const data = await fetchResponse.json();

  if (data.error) {
    resultInfo.resultCode = '1';
    resultInfo.result = errorMsg.oldPasswordError;
  }

  return resultInfo;
}

async function handleChangePassword(
  username: string,
  newPwd: string
): Promise<ResultInfo> {
  const resultInfo = new ResultInfo();

  /* 取得 auth0 token.start */
  const bodyContentByGetToken = {
    grant_type: 'client_credentials',
    client_id: process.env.AUTH0_CLIENT_ID,
    client_secret: process.env.AUTH0_CLIENT_SECRET,
    audience: process.env.AUTH0_AUDIENCE,
  };

  const requestSettingsByGetToken = {
    method: 'POST',
    body: JSON.stringify(bodyContentByGetToken),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  };

  let fetchResponse = await fetch(
    `${process.env.AUTH0_OAUTH_TOKEN}`,
    requestSettingsByGetToken
  );

  let data = await fetchResponse.json();

  if (data.error) {
    resultInfo.resultCode = '1';
    resultInfo.result = data.error;
    return resultInfo;
  }
  const accessToken = data.access_token;

  /* 取得 auth0 token.end */

  /* 進行修改密碼 */
  const bodyContent = {
    password: newPwd,
    connection: process.env.AUTH0_CONNECTION,
  };

  const requestSettings = {
    method: 'PATCH',
    body: JSON.stringify(bodyContent),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  };

  fetchResponse = await fetch(
    `${process.env.AUTH0_USERS_URL}/${username}`,
    requestSettings
  );

  data = await fetchResponse.json();

  if (data.error) {
    resultInfo.resultCode = '1';
    resultInfo.result = data.error;
    return resultInfo;
  }

  return resultInfo;
}

/*
  登入作業
  1. logincount +1.
  2. update lastloginAt.
*/
async function login(username: string) {
  const resultInfo = new ResultInfo();

  const customerEntity = AppDataSource.getRepository(Customer);
  const customer = await customerEntity.findOneBy({username: username});

  try {
    if (!customer) {
      throw new Error(errorMsg.systemError);
    }

    await customerEntity.update(
      {id: customer.id},
      {
        logincount: customer.logincount + 1,
        lastloginat: new Date(),
      }
    );
  } catch (error) {
    resultInfo.resultCode = '1';
    resultInfo.result = errorMsg.systemError;
  }

  return resultInfo;
}

export const customerService = {
  findOneByUsername,
  generate,
  verifyEmail,
  changeName,
  changePassword,
  login,
};
