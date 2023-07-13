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


const mappings = {
  mtb: 'ywRl88yte5b',
  inh: 'nPGTzMkULFh',
  linh: 'nPGTzMkULFh',
  ethr: 'GLqRo7AuhJM', //DST Result Ethionamide
  flq: 'o2zbpZDZele', //DST Result Fluoroquinolone
  lflq: 'o2zbpZDZele' //DST Result Fluoroquinolone
}

const assays = ['mtb', 'inh', 'linh', 'flq', 'lflq', 'ethr']

const assayMappings = {
  mtb: 'MTB',
  inh: 'INH Resistance',
  linh: 'LINH Resistance',
  flq: 'FLQ Resistance',
  lflq: 'INH Resistance',
  ethr: 'ETH Resistance'
}

const mapping = {
  ywRl88yte5b: ['mtb'],
  nPGTzMkULFh: ['inh', 'linh'],
  o2zbpZDZele: ['flq', 'lflq'],
  GLqRo7AuhJM: ['ethr']
}

const stageMappings = {
  nPGTzMkULFh: { inh: 'INH Resistance ', linh: 'Low INH Resistance ' },
  ywRl88yte5b: { mtb: 'MTB ' },
  o2zbpZDZele: { flq: 'FLQ Resistance ', lflq: 'Low FLQ Resistance ' },
  GLqRo7AuhJM: { ethr: 'ETH Resistance ', }
}

getMissingResult = (assayData, d, results, assay) => {
  let result = {}
  let detected = ''
  assayData?.forEach(key => {
    assayValue = key?.split('|')[0];
    if (assayValue?.toLowerCase()?.includes('detected')) {
      detected = assayValue?.split('^')?.join('')
    }
  })

  if (detected === '') {
    d = d[1]?.split('|')
    d?.forEach(key => {
      assayValue = key?.split('|')[0];
      if (assayValue?.toLowerCase()?.includes('detected')) {
        detected = assayValue?.split('^')?.join('')
      }
    })
  }
  result = { ...results[0], assayNumber: assay, result: detected }
  return result
}

const saveStatus = ({ id, reason }) => {
  try {
    const query = `UPDATE orders SET reason="${reason}",sync_status="ERROR",lims_sync_status=${3} WHERE id=${id}`;
    db.all(query, [], async (err, _rows) => {
      if (err) {
        console.error('🚫 ERROR WHILE UPDATING SYNC STATUS ', err, ' 🚫')
      }
    });
  } catch (e) {
    console.log('🚫 ERROR WHILE UPDATING SYNC STATUS ', e.message.toUpperCase(), ' 🚫')
  }
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
  assays?.forEach(assay => {
    let assayData = results.find(({ assayNumber, result }) => assayNumber === assay && isNaN(result))
    if (!assayData) {
      console.log('ASSAY', assay)
      assayData = data?.split('5')?.join('').split(`${assayMappings[assay]}^|`)
      const d = data?.toLowerCase()?.split(`${assay} `)
      const result = getMissingResult(assayData, d, results, assay)
      if (result.result && result.result !== '') {
        results = [...results, result]
      }
    }
  })

  return sanitizeResults(results)
}

const syncData = async (rows) => {
  for (const row of rows) {
    try {
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
        program: "tj4u1ip0tTF",
        programStage: "yzu183PkJCH",
        status: "VISITED",
        patient_id: row.patient_id,
        eventDate: new Date(row?.analysed_date_time),
        dataValues: stages.stage1.length > 0 ? stage1DataValues : stage2DataValues
      };
      console.log(JSON.stringify(eventPayload))
    } catch (e) {
      saveStatus({ id: row.id, reason: e.message })
    }
  }
};
const run = async () => {
  try {

    if (context.payload) {
      return await syncData(context.payload)
    }

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
