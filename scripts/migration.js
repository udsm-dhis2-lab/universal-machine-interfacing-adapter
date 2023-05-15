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
      sql = 'ALTER TABLE ORDERS ADD COLUMN reason TEXT DEFAULT NULL;'
      db.all(sql, [], async (err, rows) => {

        console.error(err ? err : "No data to sync");

        console.log('rows', rows);

      });
    } catch (e) { }

  } catch (e) { }

};

start();
