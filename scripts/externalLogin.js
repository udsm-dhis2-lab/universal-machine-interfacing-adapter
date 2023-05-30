//https://lis.dhis2.udsm.ac.tz/openmrs/ws/rest/v1/session?v=custom:(authenticated,user:(privileges:(uuid,name,roles),roles:(uuid,name)))
console.log("CHm");
const run = async () => {
  const auth = {
    username: context.externalParams.identifier,
    password: context.externalParams.password,
  };
  console.log(auth);
  const Authorization = "Basic " + btoa(auth.username + ":" + auth.password);
  const headers = {
    Accept: "*",
    Authorization,
  };

  const url = context.externalParams.url;

  try {
    const data = await context.http.get(url, { headers });
    if (data.data.authenticated) {
      return {
        success: true,
        message: `Successfully logged in with ${context.externalParams.systemName}`,
        token: Authorization,
        user: data.user,
      };
    }
    return {
      success: false,
      message: "User not authenticated",
      token: Authorization,
    };
  } catch (e) {
    console.log(e);
  }
};
return run();
