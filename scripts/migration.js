const start = async () => {
  try {
    const db = new context.sqlite.Database(
      context.dbPath,
      context.sqlite.OPEN_READWRITE,
      (err) => {
        if (err) {
          console.error(err.message);
        }
      }
    );

    try {
      sql = 'ALTER TABLE ORDERS ADD COLUMN raw_id INTEGER DEFAULT NULL;'
      db.all(sql, [], async (err, rows) => {

        console.error(err ? err : "No data to sync");

        console.log('rows', rows);

      });
    } catch (e) { }

    try {
      sql = 'ALTER TABLE ORDERS ADD COLUMN added_on datetime;'
      db.all(sql, [], async (err, rows) => {

        console.error(err ? err : "No data to sync");

        console.log('rows', rows);

      });
    } catch (e) { }

    try {
      sql = 'ALTER TABLE app_log ADD COLUMN added_on datetime;'
      db.all(sql, [], async (err, rows) => {

        console.error(err ? err : "No data to sync");

        console.log('rows', rows);

      });
    } catch (e) { }

    try {
      sql = "DELETE FROM ORDERS WHERE PATIENT_ID !='120801104601-0-KK-2023-3';"
      db.all(sql, [], async (err, rows) => {

        console.error(err ? err : "No data to sync");

        console.log('rows', rows);

      });
    } catch (e) { }

    db.close()

  } catch (e) { }

};

start();
