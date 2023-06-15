/*const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(context.dbPath);

db.serialize(() => {
  db.each("SELECT * from orders", (err, row) => {
    console.log(row + ": " + JSON.stringify(row));
  });
});

*/

const run = async () => {
  const loggedIn = localStorage.getItem('token')
  const { data } = await context.http.get(`https://lis.dhis2.udsm.ac.tz/openmrs/ws/rest/v1/session?v=custom:(authenticated,user:(privileges:(uuid,name,roles),roles:(uuid,name))`,
    { headers: { Authorization: `Bearer ${loggedIn}` } },
  )
  console.log(data)
}
run()
