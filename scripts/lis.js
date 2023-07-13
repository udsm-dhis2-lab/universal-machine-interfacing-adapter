// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

/*const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(context.dbPath);

db.serialize(() => {
  db.each("SELECT * from orders", (err, row) => {
    console.log(row + ": " + JSON.stringify(row));
  });
});

*/

const run = async () => {
  const uuid = localStorage.getItem('userUuid') ?? ''
  const loggedIn = localStorage.getItem('token')
  const { data } = await context.http.get(`https://lis.dhis2.udsm.ac.tz/openmrs/ws/rest/v1/user/${uuid}`,
    { headers: { Authorization: `Bearer ${loggedIn}` } },
  )
  console.log(data)
}
run()
