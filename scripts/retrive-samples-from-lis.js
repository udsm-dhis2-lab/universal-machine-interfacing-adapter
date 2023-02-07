const run = async () => {
  console.log("TEST");
  try {
    const basicAuthToken = "YWRtaW46QWRtaW4xMjM=";
    // 1. Get samples
    // 2. Save samples to the database
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
      "access-control-expose-headers": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Credentials": "true",
      Accept: "*",
      Authorization: "Basic " + basicAuthToken,
      crossDomain: true,
      crossOrigin: true,
    };
    const BASE_URL = "https://icare-main.dhis2.udsm.ac.tz/openmrs/ws/rest/v1/";
    const url = BASE_URL + "lab/samples";
    const samplesByTest = await context.http.get(url, {
      auth: {
        username: "admin",
        password: "Admin123",
      },
      headers,
    });
    console.log("samplesByTest", samplesByTest);
  } catch (e) {
    console.log(e);
  }
};

return run();
