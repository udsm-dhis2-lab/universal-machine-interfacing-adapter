// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

const formParams =
  'uuid,name,names:(uuid,name,display,conceptNameType),datatype,conceptClass,answers:(uuid,name,display,names:(uuid,name,display,conceptNameType)),mappings,units';
export function getFormQueryFields(queryLevel: number): string {
  const setMemberParams = getSetMembersParams(queryLevel);
  return `(${formParams}${
    setMemberParams !== '' ? ',' + setMemberParams : ''
  })`;
}

function getSetMembersParams(queryLevel: number): string {
  let setMemberParams = '';
  if (queryLevel > 1) {
    let count = queryLevel - 1;
    let innerSetMembers = '';
    while (count !== 0) {
      innerSetMembers = `setMembers:(${formParams}${
        innerSetMembers !== '' ? ',' + innerSetMembers : ''
      })`;
      count--;
    }

    setMemberParams = innerSetMembers;
  }

  return setMemberParams;
}
