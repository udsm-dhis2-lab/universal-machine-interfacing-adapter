// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const run = async () => {
  const headers = {
    Accept: "*",
  };
  const auth = {
    username: context.externalParams.identifier,
    password: context.externalParams.password,
  }

  const url = context.externalParams.url
  const Authorization = (new Buffer.from(`${auth.username}:${auth.password}`)).toString('base64')
  try {
    const loggin = await context.http.get(`${url}/session?v=custom:(authenticated,user:(privileges:(uuid,name,roles),roles:(uuid,name))`,
      { auth },
      headers,
    )
    if (loggin.status === 200 || loggin.status === 201 || loggin.status === 304) {
      const { data } = await context.http.get(`${url}/user/${loggin?.data?.user?.uuid}`, { auth }, headers)
      localStorage.setItem('userUuid', data.uuid)
      return {
        success: true,
        message: `Successfully logged in with ${context.externalParams.systemName}`,
        token: Authorization,
        code: loggin.status,
        user: data
      }
    }
    return {
      success: false,
      message: loggin?.response?.data?.message || loggin?.response?.data?.error || loggin?.message,
      token: Authorization,
      code: loggin.status,
    }
  } catch (e) {
    return {
      success: false,
      message: e?.response?.data?.message || e?.response?.data?.error?.message || e?.message,
      token: Authorization,
      code: e.response.status,
    }
  }
}
return run()
