const closeDB = (sql, db) => {
  db.all(sql, [], async (err, rows) => {
    console.log('HERE', sql)
    console.error(err);

    console.log(rows);

  });
  db.close()
}

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

    let sql = `ALTER TABLE PROCESS ADD COLUMN running BOOLEAN;`;
    db.all(sql, [], async (err, rows) => {
      sql = `UPDATE PROCESS SET RUNNING=${false} WHERE ID=${context.id}`
      // closeDB(sql, db)
      console.error(err ? err : "No data to sync");

      console.log('rows', rows);

    });
  } catch (e) { }
};

start();
