const syncData = async (rows) => {
  const auth = {
    username: context.secret.username,
    password: context.secret.password,
  };
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Credentials": "true",
    Accept: "*",
  };
  const mappingReferences = {
    ywRl88yte5b: {
      Detected: "Detected",
      "Not Detected": "Not Detected",
      Invalid: "Invalid",
      Errors: "Errors",
      "Not Results": "Not Results",
    },
    nPGTzMkULFh: {
      "Resistance Not Detected": "Resistance Not Detected",
      "Low Resistance Detected": "Low Resistance Detected",
      "Resistance Detected": "Resistance Detected",
      "Resistance Indeterminate": "Resistance Indeterminate",
    },
    GLqRo7AuhJM: {
      "Resistance Not Detected": "Resistance Not Detected",
      "Low Resistance Detected": "Low Resistance Detected",
      "Resistance Detected": "Resistance Detected",
      "Resistance Indeterminate": "Resistance Indeterminate",
    },
    o2zbpZDZele: {
      "Resistance Not Detected": "Resistance Not Detected",
      "Low Resistance Detected": "Low Resistance Detected",
      "Resistance Detected": "Resistance Detected",
      "Resistance Indeterminate": "Resistance Indeterminate",
    },
  };
  for (const row of rows) {
    console.log(row);
    const url = `${context.secret.url}/api/trackedEntityInstances.json?filter=${
      context.secret.tbAttribute
    }:EQ:${row?.patient_id
      .replace("-", "=")
      .split("-")
      .join("/")
      .replace("=", "-")}&ou=${context.secret.ou}&ouMode=DESCENDANTS&program=${
      context.secret.program
    }&fields=attributes[attribute,code,value],enrollments[*],orgUnit,trackedEntityInstance&paging=false`;
    const res = await context.http.get(url, {
      auth,
      headers,
    });
    // FOUND CLIENTS
    if (
      res?.data?.trackedEntityInstances &&
      res?.data?.trackedEntityInstances?.length > 0
    ) {
      const trackedEntityInstanceData = res?.data?.trackedEntityInstances[0];
      const eventPayload = {
        orgUnit: trackedEntityInstanceData?.orgUnit,
        program: "tj4u1ip0tTF",
        programStage: "yzu183PkJCH",
        status: "VISITED",
        eventDate: new Date(row?.analysed_date_time),
        trackedEntityInstance: trackedEntityInstanceData?.trackedEntityInstance,
        dataValues: [
          {
            dataElement: "LV7d7aBw0fn",
            value: "true",
            providedElsewhere: false,
          },
          {
            dataElement: "jYKFZdR99Tz",
            value: row?.order_id,
            providedElsewhere: false,
          },
          // {
          //   dataElement: "i5OvzWAY8AK",
          //   value: new Date(row?.analysed_date_time),
          //   providedElsewhere: false,
          // },
          {
            dataElement: "levlyYdnhws",
            value: "10 Color Module GeneXpert",
          },
          {
            dataElement: "ywRl88yte5b",
            value: "",
          },
          {
            dataElement: "nPGTzMkULFh",
            value: "",
          },
          {
            dataElement: "GLqRo7AuhJM",
            value: "",
          },
          {
            dataElement: "o2zbpZDZele",
            value: "",
          },
        ],
      };

      const eventUrl = `${context.secret.url}/api/events${
        row?.reference_uuid ? "/" + row?.reference_uuid : ""
      }.json`;
      const eventRes = !row?.reference_uuid
        ? context.http.post(eventUrl, eventPayload, {
            auth,
            headers,
          })
        : context.http.put(eventUrl, eventPayload, {
            auth,
            headers,
          });
      const response = eventRes?.data?.response;
      if (response?.imported === 1 || response?.updated === 1) {
        const reference_uuid = response?.importSummaries[0]?.reference;
        const sync_status = response?.importSummaries[0]?.status;
        //   Update the orders table for sync reference references
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

          const query = `UPDATE orders SET reference_uuid="${reference_uuid}",sync_status="${sync_status}" WHERE id=${row?.id}`;
          db.all(query, [], async (err, rows) => {
            if (!err) {
              console.log(rows);
            } else {
              console.error(err);
            }
          });
        } catch (e) {}
      } else {
        // window.alert(`NO client Found`);
      }
    }
    // console.log(eventRes);
  }

  const query = `UPDATE PROCESS SET RUNNING=${0} WHERE ID=${context.id}`;
  db.all(query, [], async (err, rows) => {
    if (!err) {
      console.log(rows);
    } else {
      console.error(err);
    }
  });

  db.close();
};
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

    const sql = `SELECT * FROM orders WHERE CAN_SYNC='true';`;
    db.all(sql, [], async (err, rows) => {
      if (err || rows.length === 0) {
        console.error(err ? err : "No data to sync");
      } else {
        await syncData(rows);
      }
    });
  } catch (e) {}
};

return run();
