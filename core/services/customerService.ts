import db from './db';

async function globalInfo(): Promise<number[]> {
  const result: Array<number> = [];

  await db.connect();

  const res = await db.query(
    `SELECT tempData FROM (
      SELECT COUNT(id) as tempdata FROM customers
      UNION ALL      
      SELECT COUNT(id) AS tempdata FROM (
        SELECT cust.id , MAX(expire) FROM user_sessions sess 
            LEFT JOIN customers cust ON POSITION( cust.username IN  sess.sess )<>0
        WHERE (expire-INTERVAL '7 day') >= CURRENT_DATE AND (expire-INTERVAL '7 day') < (CURRENT_DATE+INTERVAL '1 day')
        GROUP BY cust.id
      ) subt     
      UNION ALL
      SELECT COUNT(id) AS tempdata FROM (
        SELECT cust.id , MAX(expire) FROM user_sessions sess 
            LEFT JOIN customers cust ON POSITION( cust.username IN  sess.sess )<>0
        GROUP BY cust.id
      ) subt      
) maint`
  );

  if (res.rows.length > 0) {
    res.rows.map((x: number) => {
      result.push(x);
    });
  }

  return result;
}

export {globalInfo};
