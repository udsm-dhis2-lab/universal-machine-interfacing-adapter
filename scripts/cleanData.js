const db = new context.sqlite.Database(
  context.dbPath,
  context.sqlite.OPEN_READWRITE,
  (err) => {
    if (err) {
      console.error(err.message);
    }
  }
);


const deleteData = (rows) => {
  const sortedData = rows.sort((a, b) => Number(b.id) - Number(a.id))
  const latest = sortedData[0];
  const synced = sortedData.find(row => row.reference_uuid)

  if (!synced) {
    rows = rows.filter(row => row.id !== latest.id)
  }

  for (const data of rows) {
    if (!data.reference_uuid) {
      try {
        const sql = `DELETE FROM orders WHERE order_id='${data.order_id}';`
        console.log(sql)
        db.all(sql, [], async (_err, _rows) => {
          if (_err) {
            console.error('ERROR DELETING', _err)
          }
        });
      } catch (e) {
        console.log('AN ERROR OCCURRED[DELETING]', e.message)
      }
    }
    const diffTime = new Date().getTime() - new Date(data.added_on).getTime();
    const days = Math.round(diffTime / (1000 * 3600 * 24));
    if (!data.reference_uuid && days > 10) {
      try {
        const sql = `DELETE FROM orders WHERE order_id='${data.order_id}';`
        db.all(sql, [], async (_err, _rows) => {
          if (_err) {
            console.error('ERROR DELETING', _err)
          }
        });
      } catch (e) {
        console.log('AN ERROR OCCURRED[DELETING]', e.message)
      }
    }

  }
  if (synced) {
    try {
      const sql = `UPDATE orders SET raw_text='${latest.raw_text}' WHERE id=${synced.id};`
      db.all(sql, [], async (_err, _rows) => {
        if (_err) {
          console.error('ERROR UPDATING', _err)
        }
      });
    } catch (e) {
      console.log('AN ERROR OCCURRED[UPDATING]', e.message)
    }
  }
}

const deleteOldData = (rows) => {
  for (const data of rows) {
    const diffTime = new Date().getTime() - new Date(data.added_on).getTime();
    const days = Math.round(diffTime / (1000 * 3600 * 24));
    if (!data.reference_uuid && days > 10) {
      try {
        const sql = `DELETE FROM orders WHERE order_id='${data.order_id}';`
        db.all(sql, [], async (_err, _rows) => {
          if (_err) {
            console.error('ERROR DELETING', _err)
          }
        });
      } catch (e) {
        console.log('AN ERROR OCCURRED[DELETING]', e.message)
      }
    }

  }
}


const cleanData = (rows) => {
  for (const row of rows) {
    const data = rows.filter(data => data.order_id === row.order_id)
    if (data.length > 1) {
      deleteData(data)
    }
  }

  deleteOldData(rows)
}




const run = async () => {
  try {
    const sql = `SELECT * FROM orders;`;
    db.all(sql, [], async (err, rows) => {
      if (err || rows.length === 0) {
        console.error(err ? err : "No data to sync");
      } else {
        cleanData(rows);
      }
    });
  } catch (e) { }
};

return run();
