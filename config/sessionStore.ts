// eslint-disable-next-line @typescript-eslint/no-unused-vars
import session from 'express-session';
import CustomerInfo from '../core/viewmodels/customerInfo';

declare module 'express-session' {
  export interface SessionData {
    customerInfo: CustomerInfo | any;
  }
}
