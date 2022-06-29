const swaggerAutogen = require('swagger-autogen')();
const dotenv = require('dotenv');

dotenv.config();

const outputFile = './swagger_output.json'; // 輸出的文件名稱
const endpointsFiles = ['./app.ts']; // 要指向的 API，通常使用 Express 直接指向到 app.js 就可以

const doc = {
  info: {
    version: '1.0.0', // by default: "1.0.0"
    title: 'Customer Dashboard', // by default: "REST API"
    description: '客戶儀表板', // by default: ""
  },
  host: process.env.SWAGGER_DOMAIN_URL,
};

swaggerAutogen(outputFile, endpointsFiles, doc);
