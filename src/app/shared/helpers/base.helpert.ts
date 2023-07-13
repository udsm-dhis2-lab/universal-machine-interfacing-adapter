// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

export const BASICAUTH = ({ username, password }) => {
  const authorizationValue = Buffer.from(`${username}:${password}`).toString(
    "base64"
  );
  return `Basic ${authorizationValue}`;
};

export const TOKENAUTH = ({ token, key }) => {
  return `${key} ${token}`;
};

export const BASICHEADERS = ({ username, password }): HeadersInit => {
  return {
    Authorization: BASICAUTH({ username, password }),
  };
};
