//https://lis.dhis2.udsm.ac.tz/openmrs/ws/rest/v1/session?v=custom:(authenticated,user:(privileges:(uuid,name,roles),roles:(uuid,name)))

const run = async () => {
  const dabs = { data: { yooh: "BaharaJr", hi: "Bennett" }, success: false, message: '✅', params: context.externalParams }
  const Authorization = "Basic YWRtaW46QWRtaW4xMjM=";
  const headers = {
    Accept: "*",
    Authorization,
  };
  const auth = {
    username: context.externalParams.identifier,
    password: context.externalParams.password,
  }

  const url = context.externalParams.url
  console.log(auth, url)

  const loggin = await context.http.post(url,
    { ...auth },
    headers,
  )
  if (loggin.status === 200 || loggin.status === 201 || loggin.status === 304) {
    return {
      success: true,
      message: `Successfully logged in with ${context.externalParams.systemName}`,
      token: Authorization,
      code: loggin.status,
    }
  }
  return {
    success: false,
    message: loggin.response.data.message || loggin.response.data.error || loggin.message,
    token: Authorization,
    code: loggin.status,
  }
}
return run()
