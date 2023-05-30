process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const db = new context.sqlite.Database(
  context.dbPath,
  context.sqlite.OPEN_READWRITE,
  (err) => {
    if (err) {
      console.error(err.message);
    }
  }
);

const username = context.store.identifier ? context.store.identifier : "admin";
const password = context.store.password ? context.store.password : "Admin123";

const syncData = async (
  sampleId,
  instrumentCode,
  obrBlock,
  obxBlock,
  mapping
) => {
  try {
    // 1. Get samples
    // 2. Save samples to the database
    const headersList = {
      Accept: "*/*",
      Origin: "http://192.168.2.132",
      Referer: "http://192.168.2.132",
      "Access-Control-Allow-Origin": "http://192.168.2.132",
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
      crossDomain: true,
      crossOrigin: true,
    };
    const BASE_URL = "http://192.168.2.132/openmrs/ws/rest/v1/";
    // Get sample by sample (filter API)
    // sampleId = "NPHL/23/0000369";
    // console.log("sampleId", sampleId);
    // console.log("mapping", mapping);

    // Get mappings by machine test order code
    const url = BASE_URL + `lab/samples?q=${sampleId}&excludeAllocations=false`;
    let filteredSamplesDetails = await context.http.get(url, {
      auth: {
        username: username,
        password: password,
      },
      headers: headersList,
    });
    // filteredSamplesDetails = {
    //   pager: {
    //     pageCount: 1,
    //     total: 1,
    //     pageSize: 50,
    //     page: 1,
    //   },
    //   results: [
    //     {
    //       creator: {
    //         display: "LIS Admin (admin)",
    //         uuid: "84ee6acb-1e75-11eb-8bc7-0242c0a85003",
    //       },
    //       created: 1683795255000,
    //       concept: {
    //         display: "LAB_DEPARTMENT:Emerging and Re_Emerging",
    //         shortName: "LAB_DEPARTMENT:E&R",
    //         uuid: "3f515105-5ba5-4ebd-9ca5-657e2a1a5f59",
    //       },
    //       label: "NPHL/23/0000369",
    //       uuid: "fc7e74a0-2aba-4fbd-aeee-084b7ed0ff21",
    //       dateTimeCreated: 1683795255000,
    //       dateCreated: 1683795255000,
    //       specimenSource: {
    //         display: "SPECIMEN_SOURCE:Nasopharengial and Oralpharegial Swab",
    //         uuid: "ac29ca8a-f929-4f55-b9e6-29af9db7f2da",
    //       },
    //       patient: {
    //         addresses: [
    //           {
    //             country: null,
    //             address3: "Unknown",
    //             address2: "Unknown",
    //             address1: "Unknown",
    //             address4: null,
    //             cityVillage: null,
    //           },
    //         ],
    //         gender: "U",
    //         familyName2: null,
    //         dob: null,
    //         identifiers: [
    //           {
    //             name: "File No.",
    //             id: "120731-5/2023/00360",
    //           },
    //         ],
    //         familyName: "Sample",
    //         givenName: "EQA",
    //         allergy: "Unknown",
    //         middleName: null,
    //         attributes: [],
    //         uuid: "49c52985-f33b-43ca-b05f-de291f125571",
    //         age: null,
    //       },
    //       statuses: [
    //         {
    //           category: "RECEIVED_BY",
    //           user: {
    //             name: "LIS Admin (admin)",
    //             uuid: "84ee6acb-1e75-11eb-8bc7-0242c0a85003",
    //           },
    //           remarks: "RECEIVED_BY",
    //           status: "RECEIVED_BY",
    //           timestamp: 1683795256000,
    //         },
    //         {
    //           category: "PRIORITY",
    //           user: {
    //             name: "LIS Admin (admin)",
    //             uuid: "84ee6acb-1e75-11eb-8bc7-0242c0a85003",
    //           },
    //           remarks: "Urgent",
    //           status: "PRIORITY",
    //           timestamp: 1683795256000,
    //         },
    //         {
    //           category: "CONDITION",
    //           user: {
    //             name: "LIS Admin (admin)",
    //             uuid: "84ee6acb-1e75-11eb-8bc7-0242c0a85003",
    //           },
    //           remarks: "29925a5f-8089-4cd1-9c11-5f4eece0711c",
    //           status: "29925a5f-8089-4cd1-9c11-5f4eece0711c",
    //           timestamp: 1683795256000,
    //         },
    //         {
    //           category: "SAMPLE_REGISTRATION_CATEGORY",
    //           user: {
    //             name: "LIS Admin (admin)",
    //             uuid: "84ee6acb-1e75-11eb-8bc7-0242c0a85003",
    //           },
    //           remarks: "Sample registration form type reference",
    //           status: "EQA",
    //           timestamp: 1683795256000,
    //         },
    //         {
    //           category: "ACCEPTED",
    //           user: {
    //             name: "LIS Admin (admin)",
    //             uuid: "84ee6acb-1e75-11eb-8bc7-0242c0a85003",
    //           },
    //           remarks: "accepted",
    //           status: "ACCEPTED",
    //           timestamp: 1683809135000,
    //         },
    //       ],
    //       location: {
    //         display: "NPH Laboratory - Mabibo",
    //         attributes: [
    //           {
    //             attributeType: {
    //               uuid: "iCARE101-UDSM-451f-8efe-a0db56f09676",
    //             },
    //             value: "laboratory",
    //           },
    //           {
    //             attributeType: {
    //               uuid: "iCARE101-UDSM-451f-8efe-a0db56f09676",
    //             },
    //             value: "store",
    //           },
    //           {
    //             attributeType: {
    //               uuid: "iCARE101-UDSM-451f-8efe-a0db56f09676",
    //             },
    //             value: "reports",
    //           },
    //           {
    //             attributeType: {
    //               uuid: "iCARE101-UDSM-451f-8efe-a0db56f09676",
    //             },
    //             value: "store",
    //           },
    //         ],
    //         uuid: "7fdfa2cb-bc95-405a-88c6-32b7673c0453",
    //       },
    //       voided: false,
    //       orders: [
    //         {
    //           testAllocations: [
    //             {
    //               container: {
    //                 display: "Other container",
    //                 uuid: "eb21ff23-a627-4a62-8bd0-efdc1db2ebb5",
    //               },
    //               testAllocationAssociatedFields: [],
    //               concept: {
    //                 mappings: null,
    //                 datatype: {
    //                   display: "Coded",
    //                   name: "Coded",
    //                   description:
    //                     "Value determined by term dictionary lookup (i.e., term identifier)",
    //                   uuid: "8d4a48b6-c2cc-11de-8d13-0010c6dffd0f",
    //                 },
    //                 display: "COVID-19",
    //                 uuid: "9c657ac6-deed-4167-b7ea-a2d794c3c66e",
    //               },
    //               parameter: {
    //                 mappings: null,
    //                 datatype: {
    //                   display: "Coded",
    //                   name: "Coded",
    //                   description:
    //                     "Value determined by term dictionary lookup (i.e., term identifier)",
    //                   uuid: "8d4a48b6-c2cc-11de-8d13-0010c6dffd0f",
    //                 },
    //                 display: "COVID-19",
    //                 uuid: "9c657ac6-deed-4167-b7ea-a2d794c3c66e",
    //               },
    //               statuses: [],
    //               label: "ORD-89898",
    //               uuid: "0a9f8c3a-d19d-41d1-87e7-fd8375e0c165",
    //               results: [],
    //               sample: {
    //                 label: "NPHL/23/0000369",
    //                 uuid: "fc7e74a0-2aba-4fbd-aeee-084b7ed0ff21",
    //               },
    //               isSetMember: true,
    //               order: {
    //                 orderNumber: "ORD-89898",
    //                 careSetting: "Outpatient",
    //                 dateCreated: 1683795254000,
    //                 orderer: {
    //                   display: "LIS Admin",
    //                   name: "LIS Admin",
    //                   uuid: "f9badd80-ab76-11e2-9e96-0800200c9a66",
    //                 },
    //                 concept: {
    //                   display: "TEST_ORDERS:Corona Virus PCR Test",
    //                   setMembers: [
    //                     {
    //                       display: "COVID-19",
    //                       uuid: "9c657ac6-deed-4167-b7ea-a2d794c3c66e",
    //                     },
    //                   ],
    //                   uuid: "818caf3e-13b5-47f2-9a9a-7d823495fb5e",
    //                 },
    //                 dateActivated: 1683795254000,
    //                 uuid: "111034a2-cd10-43b9-85da-9a509d842e7f",
    //                 orderDate: 1683795254000,
    //               },
    //             },
    //           ],
    //           sample: {
    //             label: "NPHL/23/0000369",
    //             uuid: "fc7e74a0-2aba-4fbd-aeee-084b7ed0ff21",
    //           },
    //           order: {
    //             orderNumber: "ORD-89898",
    //             voidReason: null,
    //             concept: {
    //               relatedMetadataAttribute: {
    //                 testMethod: {
    //                   testMethodMap: {
    //                     code: "CORONA19",
    //                     source: "Unified LIS Standard Coding Reference",
    //                     relationship: "SAME-AS",
    //                   },
    //                   display: "TEST_METHODS:Corona Virus PCR",
    //                   uuid: "6ee878a7-e2d9-4939-a129-23c59e9c54e7",
    //                 },
    //                 uuid: "fdb69dfd-cf50-4d80-b8c0-ca2935d2a162",
    //                 value: "6ee878a7-e2d9-4939-a129-23c59e9c54e7",
    //               },
    //               display: "TEST_ORDERS:Corona Virus PCR Test",
    //               uuid: "818caf3e-13b5-47f2-9a9a-7d823495fb5e",
    //             },
    //             orderer: {
    //               name: "LIS Admin",
    //               uuid: "f9badd80-ab76-11e2-9e96-0800200c9a66",
    //             },
    //             voided: false,
    //             shortName: "TEST_ORDERS:PCRCV",
    //             uuid: "111034a2-cd10-43b9-85da-9a509d842e7f",
    //           },
    //         },
    //       ],
    //       visit: {
    //         stopDateTime: 1683882714000,
    //         startDateTime: 1683795253000,
    //         attributes: [
    //           {
    //             attributeType: {
    //               uuid: "PSCHEME0IIIIIIIIIIIIIIIIIIIIIIIATYPE",
    //             },
    //             value: "00000102IIIIIIIIIIIIIIIIIIIIIIIIIIII",
    //           },
    //           {
    //             attributeType: {
    //               uuid: "66f3825d-1915-4278-8e5d-b045de8a5db9",
    //             },
    //             value: "d1063120-26f0-4fbb-9e7d-f74c429de306",
    //           },
    //           {
    //             attributeType: {
    //               uuid: "6eb602fc-ae4a-473c-9cfb-f11a60eeb9ac",
    //             },
    //             value: "b72ed04a-2c4b-4835-9cd2-ed0e841f4b58",
    //           },
    //           {
    //             attributeType: {
    //               uuid: "SERVICE0IIIIIIIIIIIIIIIIIIIIIIIATYPE",
    //             },
    //             value: "30fe16ed-7514-4e93-a021-50024fe82bdd",
    //           },
    //           {
    //             attributeType: {
    //               uuid: "PTYPE000IIIIIIIIIIIIIIIIIIIIIIIATYPE",
    //             },
    //             value: "00000100IIIIIIIIIIIIIIIIIIIIIIIIIIII",
    //           },
    //         ],
    //         uuid: "19e21968-e55c-4720-a8ad-4786eae03fd0",
    //       },
    //       department: {
    //         display: "LAB_DEPARTMENT:Emerging and Re_Emerging",
    //         shortName: "LAB_DEPARTMENT:E&R",
    //         uuid: "3f515105-5ba5-4ebd-9ca5-657e2a1a5f59",
    //       },
    //     },
    //   ],
    // };
    if (filteredSamplesDetails) {
      /**
       * TIPS
       * 1. Order is the test order
       * 2. Allocations map to test parameter as one to one
       */
      const testOrders = filteredSamplesDetails?.results[0]?.orders;
      // The UUID of the test orders is the one on on the mapping
      // Each order has test allocations who concept is a parameter
      // TODO: Add support to handle multiple orders
      const testOrder = testOrders[0];
      const allocations = testOrder?.testAllocations;
      // console.log(allocations);
      // Create result payload, if allocation has results the one of allocation status has to be of AMENDMENT category
      // Follow up the APIs on results entry

      const answers = JSON.parse(mapping?.answers);

      const targetOneValue = obxBlock[0]["Observation Value"];
      const targetTwoValue = obxBlock[1]["Observation Value"];
      const mappedItems = Object.keys(answers).map((key) => {
        return {
          id: key,
          ...answers[key],
        };
      });

      let finalResult = "";
      if (targetOneValue === "POS" || targetTwoValue === "POS") {
        finalResult = targetOneValue;
      } else if (targetOneValue != "POS" && targetTwoValue != "POS") {
        finalResult = "NEG";
      }
      const results = allocations?.map((allocation) => {
        // const parameter
        return {
          concept: {
            uuid: allocation?.concept?.uuid,
          },
          testAllocation: {
            uuid: allocation?.uuid,
          },
          valueNumeric: null,
          valueText: null,
          valueCoded: {
            uuid: (mappedItems?.filter((item) => item?.value === finalResult) ||
              [])[0]?.id,
          },
          abnormal: false,
          instrument: {
            code: instrumentCode,
          },
        };
      });

      const resultsUrl = BASE_URL + `lab/multipleresults`;
      const response = await context.http.get(resultsUrl, {
        auth: {
          username: username,
          password: password,
        },
        headers: headersList,
      });
      console.log(response);
    }
  } catch (e) {
    console.log(e);
  }
};

const run = async () => {
  const orderToPush = {
    raw_data: `MSH|^~&|COBAS6800/8800||LIS||20230517161532||OUL^R22|e7618717-5c98-4a9d-a8ac-cb8a6f93a1db|P|2.5||||||ASCII|||LAB-23^ROCHESPM||TBY 7367||CPM^cobas PCR Media^99ROC|||||||P||||||||||||||||SAC|||||||||||||||||||||400|||uL^^UCUMOBR|1|||SARS-COV-2^SARS-COV-2^99ROC|||||||AOBX|1|ST|TGT1^TGT1^99ROC||NEG|||NEG|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171444|||||||||4170_neg^^99ROC~4169_pos^^99ROCTCD|SARS-COV-2^SARS-COV-2^99ROC|^1^:^0INV|SARS-COV-2|OK|MR|||||||||20230731030000||||J16959INV|Tip rack|OK|SC|||||||||20231231030000||||322INV|Processing plate|OK|SC|||||||||20240531030000||||436INV|Amplification plate|OK|SC|||||||||20240630030000||||554INV|Diluent|OK|DI|||||||||20240229030000||||J01946INV|Lysis reagent|OK|LI|||||||||20231231030000||||H34541INV|Wash reagent|OK|LI|||||||||20231031030000||||H29693INV|MGP cassette|OK|SC|||||||||20231130030000||||J00845OBX|2|ST|TGT2^TGT2^99ROC||NEG|||NEG|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171444|||||||||4170_neg^^99ROC~4169_pos^^99ROCTCD|SARS-COV-2^SARS-COV-2^99ROC|^1^:^0INV|SARS-COV-2|OK|MR|||||||||20230731030000||||J16959INV|Tip rack|OK|SC|||||||||20231231030000||||322INV|Processing plate|OK|SC|||||||||20240531030000||||436INV|Amplification plate|OK|SC|||||||||20240630030000||||554INV|Diluent|OK|DI|||||||||20240229030000||||J01946INV|Lysis reagent|OK|LI|||||||||20231231030000||||H34541INV|Wash reagent|OK|LI|||||||||20231031030000||||H29693INV|MGP cassette|OK|SC|||||||||20231130030000||||J00845OBX|3|ST|SARS-COV-2^SARS-COV-2^99ROC|1/1|NEG|||NA|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171444|||||||||4170_neg^^99ROC~4169_pos^^99ROCOBX|4|ST|SARS-COV-2^SARS-COV-2^99ROC|1/2|NA|||"|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171444|||||||||4170_neg^^99ROC~4169_pos^^99ROCTCD|SARS-COV-2^SARS-COV-2^99ROC|^1^:^0MSH|^~&|COBAS6800/8800||LIS||20230517161532||OUL^R22|004db723-f8ce-4956-a0f6-5b35b58a3a49|P|2.5||||||ASCII|||LAB-23^ROCHESPM||TBY 7363||CPM^cobas PCR Media^99ROC|||||||P||||||||||||||||SAC|||||||||||||||||||||400|||uL^^UCUMOBR|1|||SARS-COV-2^SARS-COV-2^99ROC|||||||AOBX|1|ST|TGT1^TGT1^99ROC||NEG|||NEG|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171442|||||||||4170_neg^^99ROC~4169_pos^^99ROCTCD|SARS-COV-2^SARS-COV-2^99ROC|^1^:^0INV|SARS-COV-2|OK|MR|||||||||20230731030000||||J16959INV|Tip rack|OK|SC|||||||||20231231030000||||322INV|Processing plate|OK|SC|||||||||20240531030000||||436INV|Amplification plate|OK|SC|||||||||20240630030000||||554INV|Diluent|OK|DI|||||||||20240229030000||||J01946INV|Lysis reagent|OK|LI|||||||||20231231030000||||H34541INV|Wash reagent|OK|LI|||||||||20231031030000||||H29693INV|MGP cassette|OK|SC|||||||||20231130030000||||J00845OBX|2|ST|TGT2^TGT2^99ROC||NEG|||NEG|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171442|||||||||4170_neg^^99ROC~4169_pos^^99ROCTCD|SARS-COV-2^SARS-COV-2^99ROC|^1^:^0INV|SARS-COV-2|OK|MR|||||||||20230731030000||||J16959INV|Tip rack|OK|SC|||||||||20231231030000||||322INV|Processing plate|OK|SC|||||||||20240531030000||||436INV|Amplification plate|OK|SC|||||||||20240630030000||||554INV|Diluent|OK|DI|||||||||20240229030000||||J01946INV|Lysis reagent|OK|LI|||||||||20231231030000||||H34541INV|Wash reagent|OK|LI|||||||||20231031030000||||H29693INV|MGP cassette|OK|SC|||||||||20231130030000||||J00845OBX|3|ST|SARS-COV-2^SARS-COV-2^99ROC|1/1|NEG|||NA|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171442|||||||||4170_neg^^99ROC~4169_pos^^99ROCOBX|4|ST|SARS-COV-2^SARS-COV-2^99ROC|1/2|NA|||"|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171442|||||||||4170_neg^^99ROC~4169_pos^^99ROCTCD|SARS-COV-2^SARS-COV-2^99ROC|^1^:^0MSH|^~&|COBAS6800/8800||LIS||20230517161532||OUL^R22|5dc47eb9-37a8-4760-834d-a47c547f0d7c|P|2.5||||||ASCII|||LAB-23^ROCHESPM||TBY 7364||CPM^cobas PCR Media^99ROC|||||||P||||||||||||||||SAC|||||||||||||||||||||400|||uL^^UCUMOBR|1|||SARS-COV-2^SARS-COV-2^99ROC|||||||AOBX|1|ST|TGT1^TGT1^99ROC||NEG|||NEG|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171443|||||||||4170_neg^^99ROC~4169_pos^^99ROCTCD|SARS-COV-2^SARS-COV-2^99ROC|^1^:^0INV|SARS-COV-2|OK|MR|||||||||20230731030000||||J16959INV|Tip rack|OK|SC|||||||||20231231030000||||322INV|Processing plate|OK|SC|||||||||20240531030000||||436INV|Amplification plate|OK|SC|||||||||20240630030000||||554INV|Diluent|OK|DI|||||||||20240229030000||||J01946INV|Lysis reagent|OK|LI|||||||||20231231030000||||H34541INV|Wash reagent|OK|LI|||||||||20231031030000||||H29693INV|MGP cassette|OK|SC|||||||||20231130030000||||J00845OBX|2|ST|TGT2^TGT2^99ROC||ValueNotSet|||NEG|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171443|||||||||4170_neg^^99ROC~4169_pos^^99ROCTCD|SARS-COV-2^SARS-COV-2^99ROC|^1^:^0INV|SARS-COV-2|OK|MR|||||||||20230731030000||||J16959INV|Tip rack|OK|SC|||||||||20231231030000||||322INV|Processing plate|OK|SC|||||||||20240531030000||||436INV|Amplification plate|OK|SC|||||||||20240630030000||||554INV|Diluent|OK|DI|||||||||20240229030000||||J01946INV|Lysis reagent|OK|LI|||||||||20231231030000||||H34541INV|Wash reagent|OK|LI|||||||||20231031030000||||H29693INV|MGP cassette|OK|SC|||||||||20231130030000||||J00845OBX|3|ST|SARS-COV-2^SARS-COV-2^99ROC|1/1|ValueNotSet|||NA|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171443|||||||||4170_neg^^99ROC~4169_pos^^99ROCOBX|4|ST|SARS-COV-2^SARS-COV-2^99ROC|1/2|NA|||"|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171443|||||||||4170_neg^^99ROC~4169_pos^^99ROCTCD|SARS-COV-2^SARS-COV-2^99ROC|^1^:^0MSH|^~&|COBAS6800/8800||LIS||20230517161532||OUL^R22|4b6204ec-94a6-4d9a-b5ed-c832268b4cb0|P|2.5||||||ASCII|||LAB-23^ROCHESPM||TBY 7365||CPM^cobas PCR Media^99ROC|||||||P||||||||||||||||SAC|||||||||||||||||||||400|||uL^^UCUMOBR|1|||SARS-COV-2^SARS-COV-2^99ROC|||||||AOBX|1|ST|TGT1^TGT1^99ROC||ValueNotSet|||NEG|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171443|||||||||4170_neg^^99ROC~4169_pos^^99ROCTCD|SARS-COV-2^SARS-COV-2^99ROC|^1^:^0INV|SARS-COV-2|OK|MR|||||||||20230731030000||||J16959INV|Tip rack|OK|SC|||||||||20231231030000||||322INV|Processing plate|OK|SC|||||||||20240531030000||||436INV|Amplification plate|OK|SC|||||||||20240630030000||||554INV|Diluent|OK|DI|||||||||20240229030000||||J01946INV|Lysis reagent|OK|LI|||||||||20231231030000||||H34541INV|Wash reagent|OK|LI|||||||||20231031030000||||H29693INV|MGP cassette|OK|SC|||||||||20231130030000||||J00845OBX|2|ST|TGT2^TGT2^99ROC||ValueNotSet|||NEG|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171443|||||||||4170_neg^^99ROC~4169_pos^^99ROCTCD|SARS-COV-2^SARS-COV-2^99ROC|^1^:^0INV|SARS-COV-2|OK|MR|||||||||20230731030000||||J16959INV|Tip rack|OK|SC|||||||||20231231030000||||322INV|Processing plate|OK|SC|||||||||20240531030000||||436INV|Amplification plate|OK|SC|||||||||20240630030000||||554INV|Diluent|OK|DI|||||||||20240229030000||||J01946INV|Lysis reagent|OK|LI|||||||||20231231030000||||H34541INV|Wash reagent|OK|LI|||||||||20231031030000||||H29693INV|MGP cassette|OK|SC|||||||||20231130030000||||J00845OBX|3|ST|SARS-COV-2^SARS-COV-2^99ROC|1/1|ValueNotSet|||NA|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171443|||||||||4170_neg^^99ROC~4169_pos^^99ROCOBX|4|ST|SARS-COV-2^SARS-COV-2^99ROC|1/2|NA|||"|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171443|||||||||4170_neg^^99ROC~4169_pos^^99ROCTCD|SARS-COV-2^SARS-COV-2^99ROC|^1^:^0`,
  };
  // context.payload;
  if (orderToPush) {
    const formattedJSON = context.hl7V2(orderToPush?.raw_data);
    const mshBlock = formattedJSON["MSH"];
    const obrBlock = formattedJSON["OBR"];
    const obxBlock = formattedJSON["OBX"];
    const sampleId = mshBlock[0]["Receiving Responsible Organization"];
    let instrumentCode = mshBlock[0]["Sending Application"];
    const machineTestOrderCode =
      obrBlock[0]["Universal Service Identifier"].split(" ")[0];

    const sql = `SELECT * FROM code_parameters WHERE test_order='${machineTestOrderCode}';`;
    db.all(sql, [], async (err, rows) => {
      if (err || rows.length === 0) {
        console.error(err ? err : "No data to sync");
      } else {
        await syncData(sampleId, instrumentCode, obrBlock, obxBlock, rows[0]);
      }
    });
  }
};

return run();
