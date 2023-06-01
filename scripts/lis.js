const sqlite3 = require('sqlite3').verbose();
// console.log(sqlite3)
const db = new sqlite3.Database(context.dbPath);

db.serialize(() => {
  db.each("SELECT * from orders", (err, row) => {
    console.log(row + ": " + JSON.stringify(row));
  });
});

db.close();

const run = async () => {

}
run()
