
const syncData = async (rows) => {
    const url = `${context.secret.url}/api/trackedEntityInstances.json?filter=${context.secret.tbAttribute}:EQ:${rows[0].order_id}&ou=${context.secret.ou}&ouMode=DESCENDANTS&program=${context.secret.program}&fields=attributes[attribute,code,value],enrollments[*],orgUnit,trackedEntityInstance&paging=false`
    const res = await context.http.get(url, {
        auth: { username: context.secret.username, password: context.secret.password }, headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Credentials': 'true',
            Accept: '*'
        }
    })
    console.log(res.data)
}
const run = async () => {
    try {
        const db = new context.sqlite.Database(context.dbPath, context.sqlite.OPEN_READWRITE, (err) => {
            if (err) {
                console.error(err.message);
            }
        });

        const sql = `SELECT * FROM orders WHERE CAN_SYNC='true';`
        db.all(sql, [], async (err, rows) => {
            if (err || rows.length === 0) {
                console.error(err ? err : 'No data to sync');
            } else {
                await syncData(rows)
            }
        });

        db.close();
    } catch (e) { }
}

return run()