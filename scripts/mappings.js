const filterResults = (results, value) => {
  return results.find(({ assayNumber }) => assayNumber === value)?.result
}

const syncPatientResults = async (results) => {
  const data = {
    mtb: filterResults(results, 'mtb')
  }
  console.log(JSON.stringify(results))
}

const sanitizeResults = async (results) => {
  results = results.map(result => {
    const cleanResult = {}
    Object.keys(result).forEach(key => {
      cleanResult[key] = isNaN(result[key]) ? (result[key] || '').replace(/^\^+|\^+$/g, '') : result[key]
    })
    return cleanResult
  })

  await syncPatientResults(results)
}
const cleanData = async (datas) => {
  const dataArrays = context.raw(datas).filter(d => d.resultData.length > 0)
  let results = []
  for (const dataArray of dataArrays) {
    const testedResults = dataArray.resultData.filter(d => d.testedBy && d.testedBy !== '')
    results = [...results, ...testedResults]
  }
  await sanitizeResults(results)
}

cleanData()
