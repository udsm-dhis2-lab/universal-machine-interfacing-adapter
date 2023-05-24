const data = `1H|@^\|GXM-53214127408||110012723 MMRC TB LAB MBEYA TANZANIA^GeneXpert^6.4|||||ETL-MBEYA||P|1394-97|20230515162212<CR>P|1|||120801104601-0-KK-2023-2|^^^^|||||||||||||||||||||||||||||<CR>O|1|TRT2301141||^^^MTBX|R|20230515144553|||||||||ORH|||||||||2|F<CR>R|1|^MTBX^^inv^Xpert MTB-XDR^1^INVALID^|^|||||F||Ibrahim Mhagama|20230515144553|20230515161609|Cepheid-1F28376^110012723^210055932^499466210^01802^20240204|<CR>R|2|^MTBX^^inv^^^SPC-ahpC^|NA^|||<CR>R|3|^MTBX^^inv^^^SPC-ahpC^Ct|^27.7|||<CR>R|4|^MTB3X^^inv^^^SPC-ahpC^EndPt|^293.0|||<CR>R|5|^MTBX^^inv^^^inhA^|POS^|||<CR>R|6|^MTBX^^inv^^^inhA^Ct|^29.3|||<CR>R|7|^MTBX^^inv^^^inhA^EndPt|^1445.0|||<CR>R|8|^MTBX^^inv^^^katG^|NEG^|||<CR>R|9|^MTBX^^inv^^^katG^Ct|^40.7|||<CR>R|10|^MTBX^^inv^^^katG^EndPt|^341.0||4|<CR>R|11|^MTBX^^inv^^^fabG1^|POS^|||<CR>R|12|^MTBX^^inv^^^fabG1^Ct|^28.9|||<CR>R|13|^MTBX^^inv^^^fabG1^EndPt|^444.0|||<CR>R|14|^MTBX^^inv^^^gyrA1^|POS^|||<CR>R|15|^MTBX^^inv^^^gyrA1^Ct|^33.6|||<CR>R|16|^MTBX^^inv^^^gyrA1^EndPt|^243.0|||<CR>R|17|^MTBX^^inv^^^gy5rA2^|NEG^|||<CR>R|18|^MTBX^^inv^^^gyrA2^Ct|^40.3|||<CR>R|19|^MTBX^^inv^^^gyrA2^EndPt|^137.0|||<CR>R|20|^MTBX^^inv^^^gyrA3^|POS^|||<CR>R|21|^MTBX^^inv^^^gyrA3^Ct|^37.8|||<CR>R|22|^MTBX^^inv^^^gyrA3^EndPt|^208.0|||<CR>R|23|^MTBX^^inv^^^gyrB2^|POS^|||<CR>R|24|^MTB6X^^inv^^^gyrB2^Ct|^29.1|||<CR>R|25|^MTBX^^inv^^^gyrB2^EndPt|^244.0|||<CR>R|26|^MTBX^^inv^^^rrs^|POS^|||<CR>R|27|^MTBX^^inv^^^rrs^Ct|^25.9|||<CR>R|28|^MTBX^^inv^^^rrs^EndPt|^118.0|||<CR>R|29|^MTBX^^inv^^^eis^|POS^|||<CR>R|30|^MTBX^^inv^^^eis^Ct|^28.0|||<CR>R|31|7^MTBX^^inv^^^eis^EndPt|^58.0|||<CR>R|32|^MTBX^^inv^^^inhA-melt^Tm|^76.4|||<CR>R|33|^MTBX^^inv^^^inhA-melt^PkHgt|^206.1|||<CR>R|34|^MTBX^^mtb^Xpert MTB-XDR^1^MTB^|DETECTED^|||||F||Ibrahim Mhagama|20230515144553|20230515161609|Cepheid-1F28376^1100127203^210055932^499466210^01802^20240204|<CR>R|35|^MTBX^^mtb^^^inhA-melt^Tm|^76.4|||<CR>R|36|^MTBX^^mtb^^^inhA-melt^PkHgt|^206.1|||<CR>R|37|^MTBX^^linh^Xpert MTB-XDR^1^Low INH Resistance^|^|||||F||Ibrahim Mhagama|20230515144553|20230515161609|Cepheid-1F128376^110012723^210055932^499466210^01802^20240204|<CR>R|38|^MTBX^^linh^^^inhA-melt^Tm|^76.4|||<CR>R|39|^MTBX^^linh^^^inhA-melt^PkHgt|^206.1|||<CR>R|40|^MTBX^^linh^^^katG-melt^Tm|^73.8|||<CR>R|41|^MTBX^^linh^^^katG-melt^PkHgt|^70.8|||<CR>R|42|^MTBX^^linh^2^^fabG1-melt^Tm|^71.5|||<CR>R|43|^MTBX^^linh^^^fabG1-melt^PkHgt|^218.4|||<CR>R|44|^MTBX^^linh^^^ahpC-melt^Tm|^68.9|||<CR>R|45|^MTBX^^linh^^^ahpC-melt^PkHgt|^41.9|||<CR>R|46|^MTBX^^inh^Xpert MTB-XDR^1^INH Resistance^|NOT DETECTED^|||||F||Ibrahim Mhagama3|20230515144553|20230515161609|Cepheid-1F28376^110012723^210055932^499466210^01802^20240204|<CR>R|47|^MTBX^^inh^^^inhA-melt^Tm|^76.4|||<CR>R|48|^MTBX^^inh^^^inhA-melt^PkHgt|^206.1|||<CR>R|49|^MTBX^^inh^^^katG-melt^Tm|^73.8|||<CR>R|50|^MTBX^^inh^^^katG-4melt^PkHgt|^70.8|||<CR>R|51|^MTBX^^inh^^^fabG1-melt^Tm|^71.5|||<CR>R|52|^MTBX^^inh^^^fabG1-melt^PkHgt|^218.4|||<CR>R|53|^MTBX^^inh^^^ahpC-melt^Tm|^68.9|||<CR>R|54|^MTBX^^inh^^^ahpC-melt^PkHgt|^41.9|||<CR>R|55|^MTBX^^lflq^Xpert MTB-XDR^1^Low FLQ Resistance5^|^|||||F||Ibrahim Mhagama|20230515144553|20230515161609|Cepheid-1F28376^110012723^210055932^499466210^01802^20240204|<CR>R|56|^MTBX^^lflq^^^inhA-melt^Tm|^76.4|||<CR>R|57|^MTBX^^lflq^^^inhA-melt^PkHgt|^206.1|||<CR>R|58|^MTBX^^lflq^^^gyrA2-melt^Tm|^669.9|||<CR>R|59|^MTBX^^lflq^^^gyrA2-melt^PkHgt|^19.0|||<CR>R|60|^MTBX^^lflq^^^gyrB2-melt^Tm|^69.6|||<CR>R|61|^MTBX^^lflq^^^gyrB2-melt^PkHgt|^74.5|||<CR>R|62|^MTBX^^lflq^^^gyrA1-mutC melt^Tm|^69.5|||<CR>R|63|^MTBX^^lflq^^^gyrA1-mutC melt^PkHgt|^27.3|||<CR>R|647|^MTBX^^flq^Xpert MTB-XDR^1^FLQ Resistance^|DETECTED^|||||F||Ibrahim Mhagama|20230515144553|20230515161609|Cepheid-1F28376^110012723^210055932^499466210^01802^20240204|<CR>R|65|^MTBX^^flq^^^inhA-melt^Tm|^76.4|||<CR>R|66|^MTBX^^flq^^^inhA-melt^PkH0gt|^206.1|||<CR>R|67|^MTBX^^flq^^^katG-melt^Tm|^73.8|||<CR>R|68|^MTBX^^flq^^^katG-melt^PkHgt|^70.8|||<CR>R|69|^MTBX^^flq^^^gyrA2-melt^Tm|^69.9|||<CR>R|70|^MTBX^^flq^^^gyrA2-melt^PkHgt|^19.0|||<CR>R|71|^MTBX^^flq^^^gyrB2-melt^Tm|^69.6|||<CR>R|72|^MTBX^^flq^^^1gyrB2-melt^PkHgt|^74.5|||<CR>R|73|^MTBX^^flq^^^rrs-melt^Tm|^75.2|||<CR>R|74|^MTBX^^flq^^^rrs-melt^PkHgt|^28.9|||<CR>R|75|^MTBX^^flq^^^eis-melt^Tm|^68.5|||<CR>R|76|^MTBX^^flq^^^eis-melt^PkHgt|^95.4|||<CR>R|77|^MTBX^^flq^^^gyrA1-mutC melt^Tm|^69.5|||<CR>R|78|^2MTBX^^flq^^^gyrA1-mutC melt^PkHgt|^27.3|||<CR>R|79|^MTBX^^amkr^Xpert MTB-XDR^1^AMK Resistance^|NOT DETECTED^|||||F||Ibrahim Mhagama|20230515144553|20230515161609|Cepheid-1F28376^110012723^210055932^499466210^01802^20240204|<CR>R|80|^MTBX^^amkr^^^3inhA-melt^Tm|^76.4|||<CR>R|81|^MTBX^^amkr^^^inhA-melt^PkHgt|^206.1|||<CR>R|82|^MTBX^^amkr^^^rrs-melt^Tm|^75.2|||<CR>R|83|^MTBX^^amkr^^^rrs-melt^PkHgt|^28.9|||<CR>R|84|^MTBX^^amkr^^^eis-melt^Tm|^68.5|||<CR>R|85|^MTBX^^amkr^^^eis-melt^PkHgt|^95.4|||<CR>R|86|^M4TBX^^kanr^Xpert MTB-XDR^1^KAN Resistance^|NOT DETECTED^|||||F||Ibrahim Mhagama|20230515144553|20230515161609|Cepheid-1F28376^110012723^210055932^499466210^01802^20240204|<CR>R|87|^MTBX^^kanr^^^inhA-melt^Tm|^76.4|||<CR>R|88|^MTBX^^kanr^^^inhA-melt5^PkHgt|^206.1|||<CR>R|89|^MTBX^^kanr^^^rrs-melt^Tm|^75.2|||<CR>R|90|^MTBX^^kanr^^^rrs-melt^PkHgt|^28.9|||<CR>R|91|^MTBX^^kanr^^^eis-melt^Tm|^68.5|||<CR>R|92|^MTBX^^kanr^^^eis-melt^PkHgt|^95.4|||<CR>R|93|^MTBX^^capr^Xpert MTB-XDR^1^CAP Resistance^|NOT DETE6CTED^|||||F||Ibrahim Mhagama|20230515144553|20230515161609|Cepheid-1F28376^110012723^210055932^499466210^01802^20240204|<CR>R|94|^MTBX^^capr^^^inhA-melt^Tm|^76.4|||<CR>R|95|^MTBX^^capr^^^inhA-melt^PkHgt|^206.1|||<CR>R|96|^MTBX^^capr^^^rrs-melt^Tm|^775.2|||<CR>R|97|^MTBX^^capr^^^rrs-melt^PkHgt|^28.9|||<CR>R|98|^MTBX^^ethr^Xpert MTB-XDR^1^ETH Resistance^|NOT DETECTED^|||||F||Ibrahim Mhagama|20230515144553|20230515161609|Cepheid-1F28376^110012723^210055932^499466210^01802^20240204|<CR>R|99|^MTBX^^0ethr^^^inhA-melt^Tm|^76.4|||<CR>R|100|^MTBX^^ethr^^^inhA-melt^PkHgt|^206.1|||<CR>L|1|N<CR><ETX>62<CR><LF>`

const mapping = {
  ywRl88yte5b: ['mtb'],
  nPGTzMkULFh: ['inh', 'linh'],
  o2zbpZDZele: ['flq', 'lflq'],
  GLqRo7AuhJM: ['eth', 'ethr']
}

const stageMappings = {
  nPGTzMkULFh: { inh: 'INH Resistance ', linh: 'INH Resistance ' },
  ywRl88yte5b: { mtb: 'MTB ' },
  o2zbpZDZele: { flq: 'FLQ Resistance ', lflq: 'FLQ Resistance ' },
  GLqRo7AuhJM: { ethr: 'ETH Resistance ' }
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
  console.log(JSON.stringify({ stage1, stage2 }))
}
const patientResults = (results) => {
  const result = {}
  Object.keys(mapping).forEach(key => {
    const data = mapping[key].map(d => results.find(({ assayNumber, result }) => assayNumber === d && result !== '')).filter(d => Boolean(d))
    if (data.length > 0) {
      result[key] = data
    }

  })
  // console.log(JSON.stringify(results))
  return finalResults(result)
}
const start = async () => {
  try {
    const dataArrays = context.raw(data).filter(d => d.resultData.length > 0)
    let results = []
    for (const dataArray of dataArrays) {
      const testedResults = dataArray.resultData.filter(d => isNaN(d?.result?.split('^')[0]))
      results = [...results, ...testedResults]
    }

    patientResults(results)

  } catch (e) { }

};

start();
