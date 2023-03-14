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
      sql = 'SELECT * FROM ORDERS;'
      db.all(sql, [], async (err, rows) => {

        console.error(err ? err : "No data to sync");

        console.log(JSON.stringify(JSON.parse(rows[rows.length - 1].raw_json)));

      });
    } catch (e) { }

    db.close()

  } catch (e) { }

};

start();
