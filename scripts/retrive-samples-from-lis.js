process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const run = async () => {
  console.log("TEST");
  try {
    const basicAuthToken = "YWRtaW46QWRtaW4xMjM=";
    // 1. Get samples
    // 2. Save samples to the database
    const headersList = {
      Accept: "*/*",
      Origin: "https://lis.dhis2.udsm.ac.tz",
      Referer: "https://lis.dhis2.udsm.ac.tz",
      "Access-Control-Allow-Origin": "https://lis.dhis2.udsm.ac.tz",
      "Content-Type": "application/json",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    };
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
    const BASE_URL = "https://lis.dhis2.udsm.ac.tz/openmrs/ws/rest/v1/";
    // Get sample by sample (filter API)
    const sampleId = "NPHL/23/0000369";
    const url = BASE_URL + `lab/samples?q=${sampleId}&excludeAllocations=false`;
    let filteredSamplesDetails = await context.http.get(url, {
      auth: {
        username: "admin",
        password: "Admin123",
      },
      headers: headersList,
    });
    filteredSamplesDetails = {
      pager: {
        pageCount: 1,
        total: 1,
        pageSize: 50,
        page: 1,
      },
      results: [
        {
          creator: {
            display: "LIS Admin (admin)",
            uuid: "84ee6acb-1e75-11eb-8bc7-0242c0a85003",
          },
          created: 1683795255000,
          concept: {
            display: "LAB_DEPARTMENT:Emerging and Re_Emerging",
            shortName: "LAB_DEPARTMENT:E&R",
            uuid: "3f515105-5ba5-4ebd-9ca5-657e2a1a5f59",
          },
          label: "NPHL/23/0000369",
          uuid: "fc7e74a0-2aba-4fbd-aeee-084b7ed0ff21",
          dateTimeCreated: 1683795255000,
          dateCreated: 1683795255000,
          specimenSource: {
            display: "SPECIMEN_SOURCE:Nasopharengial and Oralpharegial Swab",
            uuid: "ac29ca8a-f929-4f55-b9e6-29af9db7f2da",
          },
          patient: {
            addresses: [
              {
                country: null,
                address3: "Unknown",
                address2: "Unknown",
                address1: "Unknown",
                address4: null,
                cityVillage: null,
              },
            ],
            gender: "U",
            familyName2: null,
            dob: null,
            identifiers: [
              {
                name: "File No.",
                id: "120731-5/2023/00360",
              },
            ],
            familyName: "Sample",
            givenName: "EQA",
            allergy: "Unknown",
            middleName: null,
            attributes: [],
            uuid: "49c52985-f33b-43ca-b05f-de291f125571",
            age: null,
          },
          statuses: [
            {
              category: "RECEIVED_BY",
              user: {
                name: "LIS Admin (admin)",
                uuid: "84ee6acb-1e75-11eb-8bc7-0242c0a85003",
              },
              remarks: "RECEIVED_BY",
              status: "RECEIVED_BY",
              timestamp: 1683795256000,
            },
            {
              category: "PRIORITY",
              user: {
                name: "LIS Admin (admin)",
                uuid: "84ee6acb-1e75-11eb-8bc7-0242c0a85003",
              },
              remarks: "Urgent",
              status: "PRIORITY",
              timestamp: 1683795256000,
            },
            {
              category: "CONDITION",
              user: {
                name: "LIS Admin (admin)",
                uuid: "84ee6acb-1e75-11eb-8bc7-0242c0a85003",
              },
              remarks: "29925a5f-8089-4cd1-9c11-5f4eece0711c",
              status: "29925a5f-8089-4cd1-9c11-5f4eece0711c",
              timestamp: 1683795256000,
            },
            {
              category: "SAMPLE_REGISTRATION_CATEGORY",
              user: {
                name: "LIS Admin (admin)",
                uuid: "84ee6acb-1e75-11eb-8bc7-0242c0a85003",
              },
              remarks: "Sample registration form type reference",
              status: "EQA",
              timestamp: 1683795256000,
            },
            {
              category: "ACCEPTED",
              user: {
                name: "LIS Admin (admin)",
                uuid: "84ee6acb-1e75-11eb-8bc7-0242c0a85003",
              },
              remarks: "accepted",
              status: "ACCEPTED",
              timestamp: 1683809135000,
            },
          ],
          location: {
            display: "NPH Laboratory - Mabibo",
            attributes: [
              {
                attributeType: {
                  uuid: "iCARE101-UDSM-451f-8efe-a0db56f09676",
                },
                value: "laboratory",
              },
              {
                attributeType: {
                  uuid: "iCARE101-UDSM-451f-8efe-a0db56f09676",
                },
                value: "store",
              },
              {
                attributeType: {
                  uuid: "iCARE101-UDSM-451f-8efe-a0db56f09676",
                },
                value: "reports",
              },
              {
                attributeType: {
                  uuid: "iCARE101-UDSM-451f-8efe-a0db56f09676",
                },
                value: "store",
              },
            ],
            uuid: "7fdfa2cb-bc95-405a-88c6-32b7673c0453",
          },
          voided: false,
          orders: [
            {
              testAllocations: [
                {
                  container: {
                    display: "Other container",
                    uuid: "eb21ff23-a627-4a62-8bd0-efdc1db2ebb5",
                  },
                  testAllocationAssociatedFields: [],
                  concept: {
                    mappings: null,
                    datatype: {
                      display: "Coded",
                      name: "Coded",
                      description:
                        "Value determined by term dictionary lookup (i.e., term identifier)",
                      uuid: "8d4a48b6-c2cc-11de-8d13-0010c6dffd0f",
                    },
                    display: "COVID-19",
                    uuid: "9c657ac6-deed-4167-b7ea-a2d794c3c66e",
                  },
                  parameter: {
                    mappings: null,
                    datatype: {
                      display: "Coded",
                      name: "Coded",
                      description:
                        "Value determined by term dictionary lookup (i.e., term identifier)",
                      uuid: "8d4a48b6-c2cc-11de-8d13-0010c6dffd0f",
                    },
                    display: "COVID-19",
                    uuid: "9c657ac6-deed-4167-b7ea-a2d794c3c66e",
                  },
                  statuses: [],
                  label: "ORD-89898",
                  uuid: "0a9f8c3a-d19d-41d1-87e7-fd8375e0c165",
                  results: [],
                  sample: {
                    label: "NPHL/23/0000369",
                    uuid: "fc7e74a0-2aba-4fbd-aeee-084b7ed0ff21",
                  },
                  isSetMember: true,
                  order: {
                    orderNumber: "ORD-89898",
                    careSetting: "Outpatient",
                    dateCreated: 1683795254000,
                    orderer: {
                      display: "LIS Admin",
                      name: "LIS Admin",
                      uuid: "f9badd80-ab76-11e2-9e96-0800200c9a66",
                    },
                    concept: {
                      display: "TEST_ORDERS:Corona Virus PCR Test",
                      setMembers: [
                        {
                          display: "COVID-19",
                          uuid: "9c657ac6-deed-4167-b7ea-a2d794c3c66e",
                        },
                      ],
                      uuid: "818caf3e-13b5-47f2-9a9a-7d823495fb5e",
                    },
                    dateActivated: 1683795254000,
                    uuid: "111034a2-cd10-43b9-85da-9a509d842e7f",
                    orderDate: 1683795254000,
                  },
                },
              ],
              sample: {
                label: "NPHL/23/0000369",
                uuid: "fc7e74a0-2aba-4fbd-aeee-084b7ed0ff21",
              },
              order: {
                orderNumber: "ORD-89898",
                voidReason: null,
                concept: {
                  relatedMetadataAttribute: {
                    testMethod: {
                      testMethodMap: {
                        code: "CORONA19",
                        source: "Unified LIS Standard Coding Reference",
                        relationship: "SAME-AS",
                      },
                      display: "TEST_METHODS:Corona Virus PCR",
                      uuid: "6ee878a7-e2d9-4939-a129-23c59e9c54e7",
                    },
                    uuid: "fdb69dfd-cf50-4d80-b8c0-ca2935d2a162",
                    value: "6ee878a7-e2d9-4939-a129-23c59e9c54e7",
                  },
                  display: "TEST_ORDERS:Corona Virus PCR Test",
                  uuid: "818caf3e-13b5-47f2-9a9a-7d823495fb5e",
                },
                orderer: {
                  name: "LIS Admin",
                  uuid: "f9badd80-ab76-11e2-9e96-0800200c9a66",
                },
                voided: false,
                shortName: "TEST_ORDERS:PCRCV",
                uuid: "111034a2-cd10-43b9-85da-9a509d842e7f",
              },
            },
            {
              testAllocations: [
                {
                  container: {
                    display: "Other container",
                    uuid: "eb21ff23-a627-4a62-8bd0-efdc1db2ebb5",
                  },
                  testAllocationAssociatedFields: [],
                  concept: {
                    mappings: null,
                    datatype: {
                      display: "Coded",
                      name: "Coded",
                      description:
                        "Value determined by term dictionary lookup (i.e., term identifier)",
                      uuid: "8d4a48b6-c2cc-11de-8d13-0010c6dffd0f",
                    },
                    display: "COVID-19",
                    uuid: "9c657ac6-deed-4167-b7ea-a2d794c3c66e",
                  },
                  parameter: {
                    mappings: null,
                    datatype: {
                      display: "Coded",
                      name: "Coded",
                      description:
                        "Value determined by term dictionary lookup (i.e., term identifier)",
                      uuid: "8d4a48b6-c2cc-11de-8d13-0010c6dffd0f",
                    },
                    display: "COVID-19",
                    uuid: "9c657ac6-deed-4167-b7ea-a2d794c3c66e",
                  },
                  statuses: [],
                  label: "ORD-89899",
                  uuid: "4c3e4103-6c1c-4121-a377-177a1d023657",
                  results: [],
                  sample: {
                    label: "NPHL/23/0000369",
                    uuid: "fc7e74a0-2aba-4fbd-aeee-084b7ed0ff21",
                  },
                  isSetMember: true,
                  order: {
                    orderNumber: "ORD-89899",
                    careSetting: "Outpatient",
                    dateCreated: 1683795254000,
                    orderer: {
                      display: "LIS Admin",
                      name: "LIS Admin",
                      uuid: "f9badd80-ab76-11e2-9e96-0800200c9a66",
                    },
                    concept: {
                      display: "TEST_ORDERS:Corona Virus PCR Test",
                      setMembers: [
                        {
                          display: "COVID-19",
                          uuid: "9c657ac6-deed-4167-b7ea-a2d794c3c66e",
                        },
                      ],
                      uuid: "818caf3e-13b5-47f2-9a9a-7d823495fb5e",
                    },
                    dateActivated: 1683795254000,
                    uuid: "c243d080-5b12-4c63-a9e1-1f51c6acece9",
                    orderDate: 1683795254000,
                  },
                },
              ],
              sample: {
                label: "NPHL/23/0000369",
                uuid: "fc7e74a0-2aba-4fbd-aeee-084b7ed0ff21",
              },
              order: {
                orderNumber: "ORD-89899",
                voidReason: null,
                concept: {
                  relatedMetadataAttribute: {
                    testMethod: {
                      testMethodMap: {
                        code: "CORONA19",
                        source: "Unified LIS Standard Coding Reference",
                        relationship: "SAME-AS",
                      },
                      display: "TEST_METHODS:Corona Virus PCR",
                      uuid: "6ee878a7-e2d9-4939-a129-23c59e9c54e7",
                    },
                    uuid: "fdb69dfd-cf50-4d80-b8c0-ca2935d2a162",
                    value: "6ee878a7-e2d9-4939-a129-23c59e9c54e7",
                  },
                  display: "TEST_ORDERS:Corona Virus PCR Test",
                  uuid: "818caf3e-13b5-47f2-9a9a-7d823495fb5e",
                },
                orderer: {
                  name: "LIS Admin",
                  uuid: "f9badd80-ab76-11e2-9e96-0800200c9a66",
                },
                voided: false,
                shortName: "TEST_ORDERS:PCRCV",
                uuid: "c243d080-5b12-4c63-a9e1-1f51c6acece9",
              },
            },
            {
              testAllocations: [
                {
                  container: {
                    display: "Other container",
                    uuid: "eb21ff23-a627-4a62-8bd0-efdc1db2ebb5",
                  },
                  testAllocationAssociatedFields: [],
                  concept: {
                    mappings: null,
                    datatype: {
                      display: "Coded",
                      name: "Coded",
                      description:
                        "Value determined by term dictionary lookup (i.e., term identifier)",
                      uuid: "8d4a48b6-c2cc-11de-8d13-0010c6dffd0f",
                    },
                    display: "COVID-19",
                    uuid: "9c657ac6-deed-4167-b7ea-a2d794c3c66e",
                  },
                  parameter: {
                    mappings: null,
                    datatype: {
                      display: "Coded",
                      name: "Coded",
                      description:
                        "Value determined by term dictionary lookup (i.e., term identifier)",
                      uuid: "8d4a48b6-c2cc-11de-8d13-0010c6dffd0f",
                    },
                    display: "COVID-19",
                    uuid: "9c657ac6-deed-4167-b7ea-a2d794c3c66e",
                  },
                  statuses: [],
                  label: "ORD-89900",
                  uuid: "e2d4a488-35fe-44b8-9112-e6f5d664718a",
                  results: [],
                  sample: {
                    label: "NPHL/23/0000369",
                    uuid: "fc7e74a0-2aba-4fbd-aeee-084b7ed0ff21",
                  },
                  isSetMember: true,
                  order: {
                    orderNumber: "ORD-89900",
                    careSetting: "Outpatient",
                    dateCreated: 1683795254000,
                    orderer: {
                      display: "LIS Admin",
                      name: "LIS Admin",
                      uuid: "f9badd80-ab76-11e2-9e96-0800200c9a66",
                    },
                    concept: {
                      display: "TEST_ORDERS:Corona Virus PCR Test",
                      setMembers: [
                        {
                          display: "COVID-19",
                          uuid: "9c657ac6-deed-4167-b7ea-a2d794c3c66e",
                        },
                      ],
                      uuid: "818caf3e-13b5-47f2-9a9a-7d823495fb5e",
                    },
                    dateActivated: 1683795254000,
                    uuid: "3aae8059-31ed-4926-8aee-5c310446ae52",
                    orderDate: 1683795254000,
                  },
                },
              ],
              sample: {
                label: "NPHL/23/0000369",
                uuid: "fc7e74a0-2aba-4fbd-aeee-084b7ed0ff21",
              },
              order: {
                orderNumber: "ORD-89900",
                voidReason: null,
                concept: {
                  relatedMetadataAttribute: {
                    testMethod: {
                      testMethodMap: {
                        code: "CORONA19",
                        source: "Unified LIS Standard Coding Reference",
                        relationship: "SAME-AS",
                      },
                      display: "TEST_METHODS:Corona Virus PCR",
                      uuid: "6ee878a7-e2d9-4939-a129-23c59e9c54e7",
                    },
                    uuid: "fdb69dfd-cf50-4d80-b8c0-ca2935d2a162",
                    value: "6ee878a7-e2d9-4939-a129-23c59e9c54e7",
                  },
                  display: "TEST_ORDERS:Corona Virus PCR Test",
                  uuid: "818caf3e-13b5-47f2-9a9a-7d823495fb5e",
                },
                orderer: {
                  name: "LIS Admin",
                  uuid: "f9badd80-ab76-11e2-9e96-0800200c9a66",
                },
                voided: false,
                shortName: "TEST_ORDERS:PCRCV",
                uuid: "3aae8059-31ed-4926-8aee-5c310446ae52",
              },
            },
            {
              testAllocations: [
                {
                  container: {
                    display: "Other container",
                    uuid: "eb21ff23-a627-4a62-8bd0-efdc1db2ebb5",
                  },
                  testAllocationAssociatedFields: [],
                  concept: {
                    mappings: null,
                    datatype: {
                      display: "Coded",
                      name: "Coded",
                      description:
                        "Value determined by term dictionary lookup (i.e., term identifier)",
                      uuid: "8d4a48b6-c2cc-11de-8d13-0010c6dffd0f",
                    },
                    display: "COVID-19",
                    uuid: "9c657ac6-deed-4167-b7ea-a2d794c3c66e",
                  },
                  parameter: {
                    mappings: null,
                    datatype: {
                      display: "Coded",
                      name: "Coded",
                      description:
                        "Value determined by term dictionary lookup (i.e., term identifier)",
                      uuid: "8d4a48b6-c2cc-11de-8d13-0010c6dffd0f",
                    },
                    display: "COVID-19",
                    uuid: "9c657ac6-deed-4167-b7ea-a2d794c3c66e",
                  },
                  statuses: [],
                  label: "ORD-89901",
                  uuid: "c531c02f-caa4-4d0e-aada-2a414a1af2ac",
                  results: [],
                  sample: {
                    label: "NPHL/23/0000369",
                    uuid: "fc7e74a0-2aba-4fbd-aeee-084b7ed0ff21",
                  },
                  isSetMember: true,
                  order: {
                    orderNumber: "ORD-89901",
                    careSetting: "Outpatient",
                    dateCreated: 1683795254000,
                    orderer: {
                      display: "LIS Admin",
                      name: "LIS Admin",
                      uuid: "f9badd80-ab76-11e2-9e96-0800200c9a66",
                    },
                    concept: {
                      display: "TEST_ORDERS:Corona Virus PCR Test",
                      setMembers: [
                        {
                          display: "COVID-19",
                          uuid: "9c657ac6-deed-4167-b7ea-a2d794c3c66e",
                        },
                      ],
                      uuid: "818caf3e-13b5-47f2-9a9a-7d823495fb5e",
                    },
                    dateActivated: 1683795254000,
                    uuid: "f43ea406-d2dd-4da0-8078-a0c9e129eebe",
                    orderDate: 1683795254000,
                  },
                },
              ],
              sample: {
                label: "NPHL/23/0000369",
                uuid: "fc7e74a0-2aba-4fbd-aeee-084b7ed0ff21",
              },
              order: {
                orderNumber: "ORD-89901",
                voidReason: null,
                concept: {
                  relatedMetadataAttribute: {
                    testMethod: {
                      testMethodMap: {
                        code: "CORONA19",
                        source: "Unified LIS Standard Coding Reference",
                        relationship: "SAME-AS",
                      },
                      display: "TEST_METHODS:Corona Virus PCR",
                      uuid: "6ee878a7-e2d9-4939-a129-23c59e9c54e7",
                    },
                    uuid: "fdb69dfd-cf50-4d80-b8c0-ca2935d2a162",
                    value: "6ee878a7-e2d9-4939-a129-23c59e9c54e7",
                  },
                  display: "TEST_ORDERS:Corona Virus PCR Test",
                  uuid: "818caf3e-13b5-47f2-9a9a-7d823495fb5e",
                },
                orderer: {
                  name: "LIS Admin",
                  uuid: "f9badd80-ab76-11e2-9e96-0800200c9a66",
                },
                voided: false,
                shortName: "TEST_ORDERS:PCRCV",
                uuid: "f43ea406-d2dd-4da0-8078-a0c9e129eebe",
              },
            },
          ],
          visit: {
            stopDateTime: 1683882714000,
            startDateTime: 1683795253000,
            attributes: [
              {
                attributeType: {
                  uuid: "PSCHEME0IIIIIIIIIIIIIIIIIIIIIIIATYPE",
                },
                value: "00000102IIIIIIIIIIIIIIIIIIIIIIIIIIII",
              },
              {
                attributeType: {
                  uuid: "66f3825d-1915-4278-8e5d-b045de8a5db9",
                },
                value: "d1063120-26f0-4fbb-9e7d-f74c429de306",
              },
              {
                attributeType: {
                  uuid: "6eb602fc-ae4a-473c-9cfb-f11a60eeb9ac",
                },
                value: "b72ed04a-2c4b-4835-9cd2-ed0e841f4b58",
              },
              {
                attributeType: {
                  uuid: "SERVICE0IIIIIIIIIIIIIIIIIIIIIIIATYPE",
                },
                value: "30fe16ed-7514-4e93-a021-50024fe82bdd",
              },
              {
                attributeType: {
                  uuid: "PTYPE000IIIIIIIIIIIIIIIIIIIIIIIATYPE",
                },
                value: "00000100IIIIIIIIIIIIIIIIIIIIIIIIIIII",
              },
            ],
            uuid: "19e21968-e55c-4720-a8ad-4786eae03fd0",
          },
          department: {
            display: "LAB_DEPARTMENT:Emerging and Re_Emerging",
            shortName: "LAB_DEPARTMENT:E&R",
            uuid: "3f515105-5ba5-4ebd-9ca5-657e2a1a5f59",
          },
        },
      ],
    };
    /**
     * TIPS
     * 1. Order is the test order
     * 2. Allocations map to test parameter as one to one
     */
    const orders = filteredSamplesDetails?.results[0]?.orders;
    const testOrders =
      orders?.map((sampleOrder) => sampleOrder?.order?.concept) || [];
    // The UUID of the test orders is the one on on the mapping
    // Each order has test allocations who concept is a parameter
    orders?.forEach((order) => {
      const allocations = order?.testAllocations;
      // Create result payload, if allocation has results the one of allocation status has to be of AMENDMENT category
      // Follow up the APIs on results entry
    });

    console.log("filteredSamplesDetails", filteredSamplesDetails);
  } catch (e) {
    console.log(e);
  }
};

return run();
