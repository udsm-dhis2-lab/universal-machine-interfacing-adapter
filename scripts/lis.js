const hl7 = `MSH|^~\&|COBAS6800/8800||LIS||20230412130928||OUL^R22|b450232c-c245-46ab-8399-d330f980b8f7|P|2.5||||||ASCII|||LAB-23^ROCHE
SPM||TBY 5641||CPM^cobas PCR Media^99ROC|||||||P||||||||||||||||
SAC|||||||||||||||||||||400|||uL^^UCUM
OBR|1|||SARS-COV-2^SARS-COV-2^99ROC|||||||A
OBX|1|ST|TGT1^TGT1^99ROC||ValueNotSet|||NEG|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230411190858|||||||||4018_neg^^99ROC~4017_pos^^99ROC
TCD|SARS-COV-2^SARS-COV-2^99ROC|^1^:^0
INV|SARS-COV-2|OK|MR|||||||||20230731030000||||J16959
INV|Tip rack|OK|SC|||||||||20240831030000||||164
INV|Processing plate|OK|SC|||||||||20240531030000||||436
INV|Amplification plate|OK|SC|||||||||20240331030000||||008
INV|Diluent|OK|DI|||||||||20240229030000||||J01945
INV|Lysis reagent|OK|LI|||||||||20231231030000||||H34548
INV|Wash reagent|OK|LI|||||||||20231031030000||||H29693
INV|MGP cassette|OK|SC|||||||||20240229030000||||J01088
OBX|2|ST|TGT2^TGT2^99ROC||ValueNotSet|||NEG|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230411190858|||||||||4018_neg^^99ROC~4017_pos^^99ROC
TCD|SARS-COV-2^SARS-COV-2^99ROC|^1^:^0
INV|SARS-COV-2|OK|MR|||||||||20230731030000||||J16959
INV|Tip rack|OK|SC|||||||||20240831030000||||164
INV|Processing plate|OK|SC|||||||||20240531030000||||436
INV|Amplification plate|OK|SC|||||||||20240331030000||||008
INV|Diluent|OK|DI|||||||||20240229030000||||J01945
INV|Lysis reagent|OK|LI|||||||||20231231030000||||H34548
INV|Wash reagent|OK|LI|||||||||20231031030000||||H29693
INV|MGP cassette|OK|SC|||||||||20240229030000||||J01088
OBX|3|ST|SARS-COV-2^SARS-COV-2^99ROC|1/1|ValueNotSet|||NA|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230411190858|||||||||4018_neg^^99ROC~4017_pos^^99ROC
OBX|4|ST|SARS-COV-2^SARS-COV-2^99ROC|1/2|NA|||""|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230411190858|||||||||4018_neg^^99ROC~4017_pos^^99ROC
TCD|SARS-COV-2^SARS-COV-2^99ROC|^1^:^0`

const BASE_URL = "https://lis.dhis2.udsm.ac.tz/openmrs/ws/rest/v1/";
const url = BASE_URL + "lab/samples";
const headers = new Headers()
headers.append('Authorization', 'Basic ' + Buffer.from('admin:Admin123').toString('base64'));

const run = async () => {
  const hl7Parsed = context.hl7V2(hl7)
  delete hl7Parsed.raw_text
  console.log(JSON.stringify(hl7Parsed))
  try {
    let data = await fetch('https://icare.dhis2.udsm.ac.tz/openmrs/ws/rest/v1/systemsetting?q=iCare.filters.&v=full', {
      headers,
      mode: 'no-cors',
      method: 'GET'
    })
    console.log(data)
    data = await data.json()

    console.log(data)
  } catch (e) {
    console.log(e)
  }
}
run()
