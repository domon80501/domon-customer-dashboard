import {successMsg} from '../constants/systemMsg';

class ResultInfo {
  resultCode: string;
  result: string;

  constructor(resultCode?: string, result?: string) {
    this.resultCode = resultCode ?? '0';
    this.result = result ?? successMsg.processedSuccessfully;
  }
}

export default ResultInfo;
