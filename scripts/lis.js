const BASE_URL = "https://lis.dhis2.udsm.ac.tz/openmrs/ws/rest/v1/";
const url = BASE_URL + "lab/samples";
const headers = new Headers()
headers.append('Authorization', 'Basic ' + Buffer.from('admin:Admin123').toString('base64'));

const run = async () => {
  try {
    let data = await fetch('https://icare.dhis2.udsm.ac.tz/openmrs/ws/rest/v1/systemsetting?q=iCare.filters.&v=full', {
      headers,
      mode: 'no-cors'
    })
    console.log(data)
    data = await data.json()

    console.log(data)
  } catch (e) {
    console.log(e)
  }
}
run()

