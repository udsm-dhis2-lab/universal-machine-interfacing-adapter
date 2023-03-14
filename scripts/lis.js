const BASE_URL = "https://lis.dhis2.udsm.ac.tz/openmrs/ws/rest/v1/";
const url = BASE_URL + "lab/samples";
const headers = new Headers()
headers.append('Authorization', 'Basic ' + Buffer.from('admin:Admin123').toString('base64'));

const run = async () => {
  let data = await fetch(url, {
    headers
  })

  data = await data.json()

  console.log(data)
}
run()

