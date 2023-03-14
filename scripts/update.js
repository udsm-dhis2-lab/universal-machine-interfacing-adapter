const run = async () => {
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

    const sql =
      "ALTER TABLE `orders` ADD COLUMN added_on DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP)";
    db.all(sql, [], async (err, rows) => {
      if (err || rows.length === 0) {
        console.error(err ? err : "No data to sync");
      } else {
        await syncData(rows);
      }
    });

    const sql2 =
      "ALTER TABLE `app_log` ADD COLUMN added_on DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP)";
    db.all(sql2, [], async (err, rows) => {
      if (err || rows.length === 0) {
        console.error(err ? err : "No data to sync");
      } else {
        await syncData(rows);
      }
    });
  } catch (e) {}
};

return run();
