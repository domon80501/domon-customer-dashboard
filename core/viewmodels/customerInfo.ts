class CustomerInfo {
  idToken: string; //客戶票證用以比對session.
  username: string;
  name: string;
  socialType: string;
  sub: string;
  email?: string;
  picture?: string;

  constructor(
    idToken?: string,
    username?: string,
    name?: string,
    socialType?: string,
    sub?: string,
    email?: string,
    picture?: string
  ) {
    this.idToken = idToken ?? '';
    this.username = username ?? '';
    this.socialType = socialType ?? '';
    this.sub = sub ?? '';
    this.name = name ?? '';
    this.email = email ?? '#';
    this.picture = picture ?? '#';
  }
}

export default CustomerInfo;
