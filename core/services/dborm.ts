import 'reflect-metadata';
import {DataSource} from 'typeorm';
import {Customer} from '../models/customer';
import dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_PG_HOST,
  port: 5432,
  username: process.env.DB_PG_USERNAME,
  password: process.env.DB_PG_PASSWORD,
  database: process.env.DB_PG_DATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
  entities: [Customer],
  logging: true,
});

AppDataSource.initialize()
  .then(() => {
    console.log('Db connected successfully.');
  })
  .catch(error => {
    return console.log('Db connected unsuccessfully', error);
  });

export default AppDataSource;
