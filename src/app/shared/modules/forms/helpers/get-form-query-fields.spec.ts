// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

import { getFormQueryFields } from './get-form-query-field.helper';

describe('Given I want to get level one form query field', () => {
  const queryFields = getFormQueryFields(1);
  it('should return query field matching `(uuid,name,datatype,conceptClass,answers)`', () => {
    expect(queryFields).toEqual('(uuid,name,datatype,conceptClass,answers)');
  });
});

describe('Given I want to get form with level two members', () => {
  const queryFields = getFormQueryFields(2);
  it('should return query field matching `(uuid,name,datatype,conceptClass,answers,setMembers:(uuid,name,datatype,conceptClass,answers))`', () => {
    expect(queryFields).toEqual(
      '(uuid,name,datatype,conceptClass,answers,setMembers:(uuid,name,datatype,conceptClass,answers))'
    );
  });
});

describe('Given I want to get form with level three members', () => {
  const queryFields = getFormQueryFields(3);
  it('should return query field matching `(uuid,name,datatype,conceptClass,answers,setMembers:(uuid,name,datatype,conceptClass,answers,setMembers:(uuid,name,datatype,conceptClass,answers)))`', () => {
    expect(queryFields).toEqual(
      '(uuid,name,datatype,conceptClass,answers,setMembers:(uuid,name,datatype,conceptClass,answers,setMembers:(uuid,name,datatype,conceptClass,answers)))'
    );
  });
});
