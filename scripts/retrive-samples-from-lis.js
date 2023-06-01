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
const username = context?.store?.get("identifier")
  ? context.store.get("identifier")
  : "admin";
const password = context?.store?.get("password")
  ? context.store.get("password")
  : "Admin123";
const userUuid = "84ee6acb-1e75-11eb-8bc7-0242c0a85003";
//  context?.store?.get("userUuid")
//   ? context.store.get("userUuid")
//   : "84ee6acb-1e75-11eb-8bc7-0242c0a85003";

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
    };
    const BASE_URL = "http://192.168.2.132/openmrs/ws/rest/v1/";
    // Get sample by sample (filter API)
    // sampleId = "NPHL/23/0000369";

    // Get mappings by machine test order code
    const url = BASE_URL + `lab/samples?q=${sampleId}&excludeAllocations=false`;
    const { data } = await context.http.get(url, {
      auth: {
        username: username,
        password: password,
      },
      headers: headersList,
    });

    console.log(data)

    if (data) {
      /**
       * TIPS
       * 1. Order is the test order
       * 2. Allocations map to test parameter as one to one
       */
      console.log("data", data?.results);
      const testOrders = data?.results[0]?.orders;
      // The UUID of the test orders is the one on on the mapping
      // Each order has test allocations who concept is a parameter
      // TODO: Add support to handle multiple orders
      const testOrder = testOrders[0];
      console.log(testOrders);
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

      // console.log("mappedItems", mappedItems);
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
            uuid: "d1217680-41ab-4e5e-bf50-10d780006cf4",
          },
        };
      });
      const resultsUrl = BASE_URL + `lab/multipleresults`;
      const response = await context.http.post(resultsUrl, results, {
        auth: {
          username: username,
          password: password,
        },
        headers: headersList,
      });
      if (response) {
        const status = {
          sample: {
            uuid: data?.results[0]?.uuid,
          },
          user: {
            uuid: userUuid
          },
          remarks: "Has results",
          status: "HAS  RESULTS",
          category: "HAS_RESULTS",
        };
        const statusUrl = BASE_URL + `lab/samplestatus`;
        const response = await context.http.post(statusUrl, status, {
          auth: {
            username: username,
            password: password,
          },
          headers: headersList,
        });

        const syncStatus = {
          sample: {
            uuid: data?.results[0]?.uuid,
          },
          remarks: "Synched from analyser",
          status: "SYNCED_FROM_ANALYSER",
          category: "SYNCED_FROM_ANALYSER",
        };
        const responseForSyncStatus = await context.http.post(
          statusUrl,
          syncStatus,
          {
            auth: {
              username: username,
              password: password,
            },
            headers: headersList,
          }
        );
        console.log(responseForSyncStatus);
      }
    }
  } catch (e) {
    console.log(e);
  }
};

const run = async () => {
  const ordersToPush = context.payload
    ? context?.payload
    : [
      {
        raw_text: `MSH|^~&|COBAS6800/8800||LIS||20230517161532||OUL^R22|e7618717-5c98-4a9d-a8ac-cb8a6f93a1db|P|2.5||||||ASCII|||LAB-23^ROCHESPM||TBY 7367||CPM^cobas PCR Media^99ROC|||||||P||||||||||||||||SAC|||||||||||||||||||||400|||uL^^UCUMOBR|1|||SARS-COV-2^SARS-COV-2^99ROC|||||||AOBX|1|ST|TGT1^TGT1^99ROC||NEG|||NEG|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171444|||||||||4170_neg^^99ROC~4169_pos^^99ROCTCD|SARS-COV-2^SARS-COV-2^99ROC|^1^:^0INV|SARS-COV-2|OK|MR|||||||||20230731030000||||J16959INV|Tip rack|OK|SC|||||||||20231231030000||||322INV|Processing plate|OK|SC|||||||||20240531030000||||436INV|Amplification plate|OK|SC|||||||||20240630030000||||554INV|Diluent|OK|DI|||||||||20240229030000||||J01946INV|Lysis reagent|OK|LI|||||||||20231231030000||||H34541INV|Wash reagent|OK|LI|||||||||20231031030000||||H29693INV|MGP cassette|OK|SC|||||||||20231130030000||||J00845OBX|2|ST|TGT2^TGT2^99ROC||NEG|||NEG|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171444|||||||||4170_neg^^99ROC~4169_pos^^99ROCTCD|SARS-COV-2^SARS-COV-2^99ROC|^1^:^0INV|SARS-COV-2|OK|MR|||||||||20230731030000||||J16959INV|Tip rack|OK|SC|||||||||20231231030000||||322INV|Processing plate|OK|SC|||||||||20240531030000||||436INV|Amplification plate|OK|SC|||||||||20240630030000||||554INV|Diluent|OK|DI|||||||||20240229030000||||J01946INV|Lysis reagent|OK|LI|||||||||20231231030000||||H34541INV|Wash reagent|OK|LI|||||||||20231031030000||||H29693INV|MGP cassette|OK|SC|||||||||20231130030000||||J00845OBX|3|ST|SARS-COV-2^SARS-COV-2^99ROC|1/1|NEG|||NA|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171444|||||||||4170_neg^^99ROC~4169_pos^^99ROCOBX|4|ST|SARS-COV-2^SARS-COV-2^99ROC|1/2|NA|||"|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171444|||||||||4170_neg^^99ROC~4169_pos^^99ROCTCD|SARS-COV-2^SARS-COV-2^99ROC|^1^:^0MSH|^~&|COBAS6800/8800||LIS||20230517161532||OUL^R22|004db723-f8ce-4956-a0f6-5b35b58a3a49|P|2.5||||||ASCII|||LAB-23^ROCHESPM||TBY 7363||CPM^cobas PCR Media^99ROC|||||||P||||||||||||||||SAC|||||||||||||||||||||400|||uL^^UCUMOBR|1|||SARS-COV-2^SARS-COV-2^99ROC|||||||AOBX|1|ST|TGT1^TGT1^99ROC||NEG|||NEG|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171442|||||||||4170_neg^^99ROC~4169_pos^^99ROCTCD|SARS-COV-2^SARS-COV-2^99ROC|^1^:^0INV|SARS-COV-2|OK|MR|||||||||20230731030000||||J16959INV|Tip rack|OK|SC|||||||||20231231030000||||322INV|Processing plate|OK|SC|||||||||20240531030000||||436INV|Amplification plate|OK|SC|||||||||20240630030000||||554INV|Diluent|OK|DI|||||||||20240229030000||||J01946INV|Lysis reagent|OK|LI|||||||||20231231030000||||H34541INV|Wash reagent|OK|LI|||||||||20231031030000||||H29693INV|MGP cassette|OK|SC|||||||||20231130030000||||J00845OBX|2|ST|TGT2^TGT2^99ROC||NEG|||NEG|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171442|||||||||4170_neg^^99ROC~4169_pos^^99ROCTCD|SARS-COV-2^SARS-COV-2^99ROC|^1^:^0INV|SARS-COV-2|OK|MR|||||||||20230731030000||||J16959INV|Tip rack|OK|SC|||||||||20231231030000||||322INV|Processing plate|OK|SC|||||||||20240531030000||||436INV|Amplification plate|OK|SC|||||||||20240630030000||||554INV|Diluent|OK|DI|||||||||20240229030000||||J01946INV|Lysis reagent|OK|LI|||||||||20231231030000||||H34541INV|Wash reagent|OK|LI|||||||||20231031030000||||H29693INV|MGP cassette|OK|SC|||||||||20231130030000||||J00845OBX|3|ST|SARS-COV-2^SARS-COV-2^99ROC|1/1|NEG|||NA|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171442|||||||||4170_neg^^99ROC~4169_pos^^99ROCOBX|4|ST|SARS-COV-2^SARS-COV-2^99ROC|1/2|NA|||"|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171442|||||||||4170_neg^^99ROC~4169_pos^^99ROCTCD|SARS-COV-2^SARS-COV-2^99ROC|^1^:^0MSH|^~&|COBAS6800/8800||LIS||20230517161532||OUL^R22|5dc47eb9-37a8-4760-834d-a47c547f0d7c|P|2.5||||||ASCII|||LAB-23^ROCHESPM||TBY 7364||CPM^cobas PCR Media^99ROC|||||||P||||||||||||||||SAC|||||||||||||||||||||400|||uL^^UCUMOBR|1|||SARS-COV-2^SARS-COV-2^99ROC|||||||AOBX|1|ST|TGT1^TGT1^99ROC||NEG|||NEG|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171443|||||||||4170_neg^^99ROC~4169_pos^^99ROCTCD|SARS-COV-2^SARS-COV-2^99ROC|^1^:^0INV|SARS-COV-2|OK|MR|||||||||20230731030000||||J16959INV|Tip rack|OK|SC|||||||||20231231030000||||322INV|Processing plate|OK|SC|||||||||20240531030000||||436INV|Amplification plate|OK|SC|||||||||20240630030000||||554INV|Diluent|OK|DI|||||||||20240229030000||||J01946INV|Lysis reagent|OK|LI|||||||||20231231030000||||H34541INV|Wash reagent|OK|LI|||||||||20231031030000||||H29693INV|MGP cassette|OK|SC|||||||||20231130030000||||J00845OBX|2|ST|TGT2^TGT2^99ROC||ValueNotSet|||NEG|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171443|||||||||4170_neg^^99ROC~4169_pos^^99ROCTCD|SARS-COV-2^SARS-COV-2^99ROC|^1^:^0INV|SARS-COV-2|OK|MR|||||||||20230731030000||||J16959INV|Tip rack|OK|SC|||||||||20231231030000||||322INV|Processing plate|OK|SC|||||||||20240531030000||||436INV|Amplification plate|OK|SC|||||||||20240630030000||||554INV|Diluent|OK|DI|||||||||20240229030000||||J01946INV|Lysis reagent|OK|LI|||||||||20231231030000||||H34541INV|Wash reagent|OK|LI|||||||||20231031030000||||H29693INV|MGP cassette|OK|SC|||||||||20231130030000||||J00845OBX|3|ST|SARS-COV-2^SARS-COV-2^99ROC|1/1|ValueNotSet|||NA|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171443|||||||||4170_neg^^99ROC~4169_pos^^99ROCOBX|4|ST|SARS-COV-2^SARS-COV-2^99ROC|1/2|NA|||"|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171443|||||||||4170_neg^^99ROC~4169_pos^^99ROCTCD|SARS-COV-2^SARS-COV-2^99ROC|^1^:^0MSH|^~&|COBAS6800/8800||LIS||20230517161532||OUL^R22|4b6204ec-94a6-4d9a-b5ed-c832268b4cb0|P|2.5||||||ASCII|||LAB-23^ROCHESPM||TBY 7365||CPM^cobas PCR Media^99ROC|||||||P||||||||||||||||SAC|||||||||||||||||||||400|||uL^^UCUMOBR|1|||SARS-COV-2^SARS-COV-2^99ROC|||||||AOBX|1|ST|TGT1^TGT1^99ROC||ValueNotSet|||NEG|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171443|||||||||4170_neg^^99ROC~4169_pos^^99ROCTCD|SARS-COV-2^SARS-COV-2^99ROC|^1^:^0INV|SARS-COV-2|OK|MR|||||||||20230731030000||||J16959INV|Tip rack|OK|SC|||||||||20231231030000||||322INV|Processing plate|OK|SC|||||||||20240531030000||||436INV|Amplification plate|OK|SC|||||||||20240630030000||||554INV|Diluent|OK|DI|||||||||20240229030000||||J01946INV|Lysis reagent|OK|LI|||||||||20231231030000||||H34541INV|Wash reagent|OK|LI|||||||||20231031030000||||H29693INV|MGP cassette|OK|SC|||||||||20231130030000||||J00845OBX|2|ST|TGT2^TGT2^99ROC||ValueNotSet|||NEG|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171443|||||||||4170_neg^^99ROC~4169_pos^^99ROCTCD|SARS-COV-2^SARS-COV-2^99ROC|^1^:^0INV|SARS-COV-2|OK|MR|||||||||20230731030000||||J16959INV|Tip rack|OK|SC|||||||||20231231030000||||322INV|Processing plate|OK|SC|||||||||20240531030000||||436INV|Amplification plate|OK|SC|||||||||20240630030000||||554INV|Diluent|OK|DI|||||||||20240229030000||||J01946INV|Lysis reagent|OK|LI|||||||||20231231030000||||H34541INV|Wash reagent|OK|LI|||||||||20231031030000||||H29693INV|MGP cassette|OK|SC|||||||||20231130030000||||J00845OBX|3|ST|SARS-COV-2^SARS-COV-2^99ROC|1/1|ValueNotSet|||NA|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171443|||||||||4170_neg^^99ROC~4169_pos^^99ROCOBX|4|ST|SARS-COV-2^SARS-COV-2^99ROC|1/2|NA|||"|||F|||||FBN||C6800/8800^Roche^^~Unknown^Roche^^~ID_000000000012076380^IM300-001794^^|20230516171443|||||||||4170_neg^^99ROC~4169_pos^^99ROCTCD|SARS-COV-2^SARS-COV-2^99ROC|^1^:^0`,
      },
    ];
  // context.payload;
  for (const orderToPush of ordersToPush) {
    try {
      if (orderToPush?.raw_text) {
        const formattedJSON = context.hl7V2(orderToPush?.raw_text);
        console.log(JSON.stringify(formattedJSON));
        const mshBlock = formattedJSON["MSH"];
        const obrBlock = formattedJSON["OBR"];
        const obxBlock = formattedJSON["OBX"];
        const sampleId = Array.isArray(mshBlock) ? mshBlock[0]["Receiving Responsible Organization"] : mshBlock["Receiving Responsible Organization"];
        let instrumentCode = Array.isArray(mshBlock) ? mshBlock[0]["Sending Application"] : mshBlock["Sending Application"];
        const machineTestOrderCode = Array.isArray(obrBlock) ? obrBlock[0]["Universal Service Identifier"].split(" ")[0] : obrBlock["Universal Service Identifier"].split(" ")[0]

        const sql = `SELECT * FROM code_parameters WHERE test_order='${machineTestOrderCode}';`;
        db.all(sql, [], async (err, rows) => {
          if (err || rows.length === 0) {
            console.error(err ? err : "No data to sync");
          } else {
            await syncData(
              sampleId,
              instrumentCode,
              obrBlock,
              obxBlock,
              rows[0]
            );
          }
        });
      }
    } catch (e) {
      console.log(e);
    }
  }
};

return run();
