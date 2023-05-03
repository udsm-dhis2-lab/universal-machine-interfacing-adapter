const mappings = {
  mtb: 'ywRl88yte5b',
  inh: 'nPGTzMkULFh',
  linh: 'nPGTzMkULFh',
  'GLqRo7AuhJM': 'GLqRo7AuhJM', //DST Result Ethionamide
  flq: 'o2zbpZDZele', //DST Result Fluoroquinolone
  lflq: 'o2zbpZDZele' //DST Result Fluoroquinolone
}

const mapping = {
  ywRl88yte5b: ['mtb'],
  nPGTzMkULFh: ['inh', 'linh'],
  o2zbpZDZele: ['flq', 'lflq'],
  GLqRo7AuhJM: ['eth']
}

const stageMappings = {
  nPGTzMkULFh: { inh: 'INH Resistance ', linh: 'INH Resistance ' },
  ywRl88yte5b: { mtb: 'MTB ' },
  o2zbpZDZele: { flq: 'FLQ Resistance ', lflq: 'FLQ Resistance ' },
  GLqRo7AuhJM: { eth: 'ETH Resistance ' }
}

const capitalizeFirstLetter = (sentence) => {
  try {
    return sentence.replace(/\b(\w)/g, (_match, word) => {
      return word.toUpperCase();
    });
  } catch (e) {
    return sentence?.toUpperCase() ?? null
  }
}

const parseSecret = (value) => {
  try {
    return JSON.parse(value)
  } catch (e) {
    return {}
  }
}

const finalResults = (results) => {
  let stage1 = []
  let stage2 = []
  Object.keys(results).forEach(dataElement => {
    if (results[dataElement].length === 2) {
      stage1 = [...stage1, { dataElement, value: stageMappings[dataElement][results[dataElement][0]?.assayNumber] + results[dataElement][0]?.result }]
      stage2 = [...stage2, { dataElement, value: stageMappings[dataElement][results[dataElement][1]?.assayNumber] + results[dataElement][1]?.result }]
    } else {
      stage1 = [...stage1, { dataElement, value: stageMappings[dataElement][results[dataElement][0]?.assayNumber] + results[dataElement][0]?.result }]
    }
  })
  return { stage1, stage2 }
}

const filterResults = (results, value) => {
  return results.find(({ assayNumber }) => assayNumber === value)?.result
}

const patientResults = (results) => {
  const result = {}
  Object.keys(mapping).forEach(key => {
    const data = mapping[key].map(d => results.find(({ assayNumber, result }) => assayNumber === d && result !== '')).filter(d => Boolean(d))
    if (data.length > 0) {
      result[key] = data
    }

  })
  return finalResults(result)
}

const sanitizeResults = (results) => {
  results = results.map(result => {
    const cleanResult = {}
    Object.keys(result).forEach(key => {
      cleanResult[key] = isNaN(result[key]) ? (result[key] || '').replace(/^\^+|\^+$/g, '') : result[key]
    })
    return cleanResult
  }).filter(result => Boolean(result))

  return patientResults(results)
}
const cleanData = (data) => {
  const dataArrays = context.raw(data).filter(d => d.resultData.length > 0)
  let results = []
  for (const dataArray of dataArrays) {
    const testedResults = dataArray.resultData.filter(d => d.testedBy && d.testedBy !== '')
    results = [...results, ...testedResults]
  }
  let ethr = data.split('ETH Resistance^|')
  let d = data.toLowerCase().split('eth ')
  let ethrData = {}
  if (ethr.length <= 1 && d.length > 1) {
    d = d[1]?.split('|')
    d = d.length > 0 ? d[1] : null
    ethrData = { ...results[0], assayNumber: 'eth', result: d ? d?.split('^')?.join('')?.toUpperCase() : null }
  } else {
    ethrData = { ...results[0], assayNumber: 'eth', result: ethr.length > 0 ? ethr[1]?.split('|')[0] : null }
  }
  if (ethrData.result) {
    results = [...results, ethrData]
  }
  return sanitizeResults(results)
}

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
  for (const row of rows) {
    if (!row?.patient_id) continue;
    const url = `${context.secret.url}/api/trackedEntityInstances.json?filter=${context.secret.tbAttribute
      }:EQ:${row?.patient_id
        .replace("-", "=")
        .split("-")
        .join("/")
        .replace("=", "-")}&ou=${context.secret.ou}&ouMode=DESCENDANTS&program=${context.secret.program
      }&fields=attributes[attribute,code,value],enrollments[*],orgUnit,trackedEntityInstance&paging=false`;
    const res = await context.http.get(url, {
      auth,
      headers,
    });
    // FOUND CLIENTS
    if (
      res?.data?.trackedEntityInstances?.length > 0
    ) {
      const trackedEntityInstanceData = res.data?.trackedEntityInstances[0];
      let stage1DataValues = []
      let stage2DataValues = []
      let dataValues = [
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
        {
          dataElement: "levlyYdnhws",
          value: "10 Color Module GeneXpert",
        },
      ]
      const stages = cleanData(row?.raw_text)
      if (stages.stage1.length > 0) {
        stage1DataValues = [...stage1DataValues, ...dataValues, ...stages.stage1]
      }

      if (stages.stage2.length > 0) {
        stage2DataValues = [...stage2DataValues, ...dataValues, ...stages.stage2]
      }
      const eventPayload = {
        orgUnit: trackedEntityInstanceData?.orgUnit,
        program: "tj4u1ip0tTF",
        programStage: "yzu183PkJCH",
        status: "VISITED",
        eventDate: new Date(row?.analysed_date_time),
        trackedEntityInstance: trackedEntityInstanceData?.trackedEntityInstance,
        dataValues: stages.stage1.length > 0 ? stage1DataValues : stage2DataValues
      };

      const eventUrl = `${context.secret.url}/api/events${row?.reference_uuid ? "/" + row?.reference_uuid : ""
        }.json`;
      const { data } = !row?.reference_uuid
        ? await context.http.post(eventUrl, eventPayload, {
          auth,
          headers,
        })
        : await context.http.put(eventUrl, eventPayload, {
          auth,
          headers,
        });
      const response = data?.response;

      if (response?.imported || response?.updated) {
        const reference_uuid = response?.importSummaries ? response.importSummaries[0]?.reference : response.reference;
        const sync_status = response?.importSummaries ? response?.importSummaries[0]?.status : response.status;
        //   Update the orders table for sync reference references
        try {
          const db = new context.sqlite.Database(
            context.dbPath,
            context.sqlite.OPEN_READWRITE,
            (err) => {
              if (err) {
              }
            }
          );

          const query = `UPDATE orders SET reference_uuid="${reference_uuid}",sync_status="${sync_status}", lims_sync_date_time="${new Date().toISOString()}" WHERE id=${row?.id}`;
          db.all(query, [], async (err, _rows) => {
            if (err) {
              console.log('🚫 ERROR WHILE UPDATING SYNC STATUS ', err?.toUpperCase(), ' 🚫')
            } else {
            }
          });
        } catch (e) {
          console.log('🚫 ERROR WHILE UPDATING SYNC STATUS ', e.message.toUpperCase(), ' 🚫')
        }
      } else {
      }
    }
    continue;
  }
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

    if (!context.secret || !context?.secret?.id) {
      db.all(`SELECT * FROM SECRET WHERE ID=${context.secret_id}`, [], (_err, rows) => {
        if (rows?.length > 0) {
          context.secret = parseSecret(rows[0].value)
        }
      })
    }

    const sql = `SELECT * FROM orders WHERE CAN_SYNC='true';`;
    db.all(sql, [], async (err, rows) => {
      if (err || rows.length === 0) {
        console.error(err ? err : "No data to sync");
      } else {
        await syncData(rows);
      }
    });
  } catch (e) { }
};

return run();
