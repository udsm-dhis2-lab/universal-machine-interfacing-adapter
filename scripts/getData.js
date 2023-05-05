const db = new context.sqlite.Database(
  context.dbPath,
  context.sqlite.OPEN_READWRITE,
  (err) => {
    if (err) {
      console.error(err.message);
    }
  }
);

const getData = (text) => {
  console.log(text.data)
  const data = context.hl7V1(context.hl7Parser(text.data))
  console.log(JSON.stringify(data))
}

const start = async () => {
  try {
    sql = 'SELECT * FROM raw_data WHERE ID=60;'
    db.all(sql, [], async (err, rows) => {
      getData(rows[0])
    });
  } catch (e) { }

};

start();
