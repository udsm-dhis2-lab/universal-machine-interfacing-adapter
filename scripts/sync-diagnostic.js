// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const db = new context.sqlite.Database(
  context.dbPath,
  context.sqlite.OPEN_READWRITE,
  (err) => {
    if (err) {
      console.error(err.message);
    }
  }
);

const BASE_URL = "https://etl.dhis2.udsm.ac.tz";
const machineCodeAttribute = "T0JBJuVOBri";

const eventDate = (row) => {
  try {
    const date =
      new Date(row?.authorised_date_time).toISOString() ||
      new Date(row?.result_accepted_date_time).toISOString() ||
      new Date().toISOString();
    return date.toLowerCase().includes("invalid date")
      ? new Date().toISOString()
      : date;
  } catch (e) {
    return new Date().toISOString();
  }
};

const syncData = async (rows) => {
  const auth = {
    username: "josephatjulius",
    password: "Etl@2023",
  };
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Credentials": "true",
    Accept: "*",
  };
  for (const row of rows) {
    // console.log("row::::::::::::", row);
    try {
      const url = `${BASE_URL}/api/trackedEntityInstances.json?filter=${machineCodeAttribute}:EQ:MBEYA_10_COLOR_MODULE&ou=gQWcAtCpYvS&ouMode=DESCENDANTS&program=dcbSXfS4ssz&fields=attributes[attribute,code,value],enrollments[*],orgUnit,trackedEntityInstance&paging=false`;
      const res = await context.http.get(url, {
        auth,
        headers,
      });
      //   console.log("res", res);
      console.log(row?.raw_text);
      const formattedJSON = context.hl7V2(row?.raw_text);
      console.log("JSON", formattedJSON);
      const trackedEntityInstanceData = res.data?.trackedEntityInstances[0];
      if (trackedEntityInstanceData) {
        const diagnosticData = {
          orgUnit: trackedEntityInstanceData?.orgUnit,
          program: "dcbSXfS4ssz",
          programStage: "eNl4GohAGAc",
          status: "VISITED",
          eventDate: eventDate(row),
          enrollment: trackedEntityInstanceData?.enrollments[0]?.enrollment,
          trackedEntityInstance:
            trackedEntityInstanceData?.trackedEntityInstance,
          dataValues:
            [
              {
                dataElement: "Le4gIqe6HS9", // Patient ID
                value: row["order_id"],
              },
              {
                dataElement: "Yqu6r3Y6lW0", // Sample ID
                value: row["order_id"],
              },
              {
                dataElement: "Ax31I2cirux", // SEX
                value: "",
              },
              {
                dataElement: "Ekql3GItQIU", // Age
                value: "",
              },
              {
                dataElement: "apIQslIaxIN", // Age type
                value: "",
              },
              {
                dataElement: "eH7nXzg77OY", // DoB
                value: "",
              },
              {
                dataElement: "W11mfeyYWyN", // Machine message
                value: "",
              },
              {
                dataElement: "d5O74OWh5hO", // Test reference
                value: "HIV Viral Load",
              },
              {
                dataElement: "uJrv2BYbr1R", // Specimen type
                value: "",
              },
              {
                dataElement: "TYDiy76Tre4", // Message location
                value: row["test_location"],
              },
              {
                dataElement: "DSOVDqDcfSR", // Observation date time
                value: new Date(row["result_accepted_date_time"]),
              },
              {
                dataElement: "PAgCZYJTL07",
                value: row["tested_by"],
              },
            ]?.filter((dataValue) => dataValue?.value) || [],
        };
        // console.log("diagnosticData", diagnosticData);
        const eventUrl = `${BASE_URL}/api/events.json`;
        // await context.http.post(eventUrl, diagnosticData, {
        //   auth,
        //   headers,
        // });
      }
    } catch (e) {}
  }
};
const assays = ["mtb", "inh", "linh", "flq", "lflq", "ethr", "eth"];

const run = async () => {
  try {
    const sql = `SELECT * FROM orders WHERE tested_by IS NOT 'AUTO' LIMIT 10;`;
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
