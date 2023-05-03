const db = new context.sqlite.Database(
  context.dbPath,
  context.sqlite.OPEN_READWRITE,
  (err) => {
    if (err) {
      console.error(err.message);
    }
  }
);


const run = async () => {
  try {
    const sql = `DELETE FROM orders;`;
    db.all(sql, [], async (err, rows) => {
      console.log(err);
      console.log(rows);
    });
  } catch (e) { }

  try {
    const sql = `DELETE FROM app_log;`;
    db.all(sql, [], async (err, rows) => {
    });
  } catch (e) { }

  try {
    const sql = `DELETE FROM raw_data;`;
    db.all(sql, [], async (err, rows) => {
    });
  } catch (e) { }
};

return run();
