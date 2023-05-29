process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const run = async (username, password) => {
  try {
    const headersList = {
      Accept: "*/*",
      Origin: "https://lis.dhis2.udsm.ac.tz/openmrs",
      Referer: "https://lis.dhis2.udsm.ac.tz/openmrs",
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    };
    const BASE_URL = "https://lis.dhis2.udsm.ac.tz/openmrs/ws/rest/v1/";
    const url = BASE_URL + "session";

    // const { data } = await context.http.get(url, {
    //   auth: {
    //     username: username,
    //     password: password,
    //   },
    //   headers: headersList,
    // });
    return {
      authenticated: true,
      user: {
        uuid: "testing-askhas-aas-asjajsaio-asassas",
      },
    };
  } catch (e) {
    console.log(e);
  }
};

return run();
