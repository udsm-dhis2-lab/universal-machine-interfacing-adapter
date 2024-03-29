// Copyright 2023 UDSM DHIS2 Lab All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

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
const userUuid =
  localStorage.getItem("userUuid") ?? "84ee6acb-1e75-11eb-8bc7-0242c0a85003";

const Authorization =
  `Basic ` + localStorage.getItem("token") ??
  new Buffer.from(`${username}:${password}`).toString("base64");

const syncData = async (
  sampleId,
  instrumentCode,
  obrBlock,
  obxBlock,
  mapping,
  order_id
) => {

  try {
    // 1. Get samples
    // 2. Save samples to the database
    const headersList = {
      Accept: "*/*",
      Authorization,
    };
    const BASE_URL = "http://192.168.2.95/openmrs/ws/rest/v1/";
    // Get sample by sample (filter API)
    // sampleId = "NPHL/23/0000369";

    // Get mappings by machine test order code
    const url = BASE_URL + `lab/samples?q=${sampleId}&excludeAllocations=false`;
    const { data } = await context.http.get(url, {
      headers: headersList,
    });

    if (data) {
      /**
       * TIPS
       * 1. Order is the test order
       * 2. Allocations map to test parameter as one to one
       */
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
      let results = [];

      if(obrBlock["Universal Service Identifier"].split(" ")[0] === "SARS-COV-2"){


      const targetOneValue = obxBlock[0]["Abnormal Flags"];
      const targetTwoValue = obxBlock[1]["Abnormal Flags"];

      const analysedDateString = obxBlock[0]["Date/Time of the Analysis"];
      const testedDate = analysedDateString.split(" ")[0];

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
            uuid: "d1217680-41ab-4e5e-bf50-10d780006cf4",
          },
          testedBy:userUuid,
          testedDate:testedDate
        };
      });

        const resultsUrl = BASE_URL + `lab/multipleresults`;
        const response = await context.http.post(resultsUrl, results, {
          headers: headersList,
        });
        if (response) {
          const status = {
            sample: {
              uuid: data?.results[0]?.uuid,
            },
            user: {
              uuid: userUuid,
            },
            remarks: "Has results",
            status: "HAS  RESULTS",
            category: "HAS_RESULTS",
          };
          const statusUrl = BASE_URL + `lab/samplestatus`;
          const response = await context.http.post(statusUrl, status, {
            headers: headersList,
          });

          const syncStatus = {
            sample: {
              uuid: data?.results[0]?.uuid,
            },
            user: {
              uuid: userUuid,
            },
            remarks: "Synched from analyser",
            status: "SYNCED_FROM_ANALYSER",
            category: "SYNCED_FROM_ANALYSER",
          };

          const responseForSyncStatus = await context.http.post(
            statusUrl,
            syncStatus,
            {
              headers: headersList,
            }
          );
          try {
            const query = `UPDATE orders SET reference_uuid="${
              data?.results[0]?.uuid
            }",reason=NULL, sync_status="1", lims_sync_date_time="${new Date().toISOString()}" WHERE id=${order_id}`;
            db.all(query, [], async (err, _rows) => {
              if (err) {
                console.log(
                  "🚫 ERROR WHILE UPDATING SYNC STATUS ",
                  err?.toUpperCase(),
                  " 🚫"
                );
              } else {
              }
            });
          } catch (e) {
            console.log(
              "🚫 ERROR WHILE UPDATING SYNC STATUS ",
              e.message.toUpperCase(),
              " 🚫"
            );
          }
        }
    } else if(obrBlock["Universal Service Identifier"].split(" ")[0] === "70241-5"){

      let valueNumericResult = false;
      // TODO: Find a way to softcode the allocation uuids
      viralLoadCodedConceptUuid = "04e0b707-af58-4271-a8bf-0c6051932743";
      viralLoadNumericConceptUuid = "dc5010d4-c02d-4c54-b593-118966c7e773";
      viraLoadLogConceptUuid = "7a20878d-78b0-47b3-adc8-bc2f2db63ee5";

      const analysedDateString = obxBlock[0]["Date/Time of the Analysis"];
      const testedDate = analysedDateString.split(" ")[0];

      const mappedItems = Object.keys(answers).map((key) => {
        return {
          id: key,
          ...answers[key],
        };
      });


      allocations?.map((allocation) => {

        if(allocation?.concept?.uuid === viralLoadCodedConceptUuid){
          codedAllocationUuid = allocation?.uuid;
        }

        if(allocation?.concept?.uuid === viralLoadNumericConceptUuid){
          numericAllocationUuid = allocation?.uuid;
        }

        if(allocation?.concept?.uuid === viraLoadLogConceptUuid){
          logAllocationUuid = allocation?.uuid;
        }

      })

      if(obxBlock[0]["Observation Value"] === "ValueNotSet"){

        results = [];

        var targetOneValue = obxBlock[2]["Observation Value"];
        const viralLoadCodedResult = {
          concept: {
            uuid: viralLoadCodedConceptUuid,
          },
          testAllocation: {
            uuid: codedAllocationUuid,
          },
          valueNumeric: valueNumericResult ? targetOneValue : null,
          valueText: null,
          valueCoded: {
            uuid: valueNumericResult ? null : (mappedItems?.filter((item) => item?.value === targetOneValue ) ||
              [])[0]?.id,
          },
          abnormal: false,
          instrument: {
            uuid: "d1217680-41ab-4e5e-bf50-10d780006cf4",
          },
          testedBy:userUuid,
          testedDate:testedDate
         }

         results.push(viralLoadCodedResult);

         //Sending results
         const resultsUrl = BASE_URL + `lab/multipleresults`;
         const response = await context.http.post(resultsUrl, results, {
           headers: headersList,
         });
         if (response) {
           const status = {
             sample: {
               uuid: data?.results[0]?.uuid,
             },
             user: {
               uuid: userUuid,
             },
             remarks: "Has results",
             status: "HAS  RESULTS",
             category: "HAS_RESULTS",
           };
           const statusUrl = BASE_URL + `lab/samplestatus`;
           const response = await context.http.post(statusUrl, status, {
             headers: headersList,
           });

           const syncStatus = {
             sample: {
               uuid: data?.results[0]?.uuid,
             },
             user: {
               uuid: userUuid,
             },
             remarks: "Synched from analyser",
             status: "SYNCED_FROM_ANALYSER",
             category: "SYNCED_FROM_ANALYSER",
           };

           const responseForSyncStatus = await context.http.post(
             statusUrl,
             syncStatus,
             {
               headers: headersList,
             }
           );
           try {
             const query = `UPDATE orders SET reference_uuid="${
               data?.results[0]?.uuid
             }",reason=NULL, sync_status="1", lims_sync_date_time="${new Date().toISOString()}" WHERE id=${order_id}`;
             db.all(query, [], async (err, _rows) => {
               if (err) {
                 console.log(
                   "🚫 ERROR WHILE UPDATING SYNC STATUS ",
                   err?.toUpperCase(),
                   " 🚫"
                 );
               } else {
               }
             });
           } catch (e) {
             console.log(
               "🚫 ERROR WHILE UPDATING SYNC STATUS ",
               e.message.toUpperCase(),
               " 🚫"
             );
           }
         }


      } else{

        results = [];
        valueNumericResult = true;
        var valueOne = +obxBlock[0]["Observation Value"];

        // Assume obxBlock[0] ["Units"] = 10*-1.{Copies}/mL
        var valueTwo = obxBlock[0] ["Units"].toString().split(".")[0];
        var baseNumber = +valueTwo.split("*")[0];
        var exponentNumber = +valueTwo.split("*")[1];
        var finalValue = baseNumber ** exponentNumber;
        var targetOneValue = valueOne * finalValue;
        const logBase10Value = Math.log10(targetOneValue);

        const viralLoadNumericResult = {
          concept: {
            uuid: viralLoadNumericConceptUuid,
          },
          testAllocation: {
            uuid: numericAllocationUuid,
          },
          valueNumeric: valueNumericResult ? targetOneValue : null,
          valueText: null,
          valueCoded: {
            uuid: valueNumericResult ? null : (mappedItems?.filter((item) => item?.value === targetOneValue ) ||
              [])[0]?.id,
          },
          abnormal: false,
          instrument: {
            uuid: "d1217680-41ab-4e5e-bf50-10d780006cf4",
          },
          testedBy:userUuid,
          testedDate:testedDate
         }

         const viralLoadLogResult = {
          concept: {
            uuid: viraLoadLogConceptUuid,
          },
          testAllocation: {
            uuid: logAllocationUuid,
          },
          valueNumeric: valueNumericResult ? logBase10Value : null,
          valueText: null,
          valueCoded: {
            uuid: valueNumericResult ? null : (mappedItems?.filter((item) => item?.value === targetOneValue ) ||
              [])[0]?.id,
          },
          abnormal: false,
          instrument: {
            uuid: "d1217680-41ab-4e5e-bf50-10d780006cf4",
          },
          testedBy:userUuid,
          testedDate:testedDate
         }

         results.push(viralLoadNumericResult,viralLoadLogResult);

         //sending results
         const resultsUrl = BASE_URL + `lab/multipleresults`;
         const response = await context.http.post(resultsUrl, results, {
           headers: headersList,
         });
         if (response) {
           const status = {
             sample: {
               uuid: data?.results[0]?.uuid,
             },
             user: {
               uuid: userUuid,
             },
             remarks: "Has results",
             status: "HAS  RESULTS",
             category: "HAS_RESULTS",
           };
           const statusUrl = BASE_URL + `lab/samplestatus`;
           const response = await context.http.post(statusUrl, status, {
             headers: headersList,
           });

           const syncStatus = {
             sample: {
               uuid: data?.results[0]?.uuid,
             },
             user: {
               uuid: userUuid,
             },
             remarks: "Synched from analyser",
             status: "SYNCED_FROM_ANALYSER",
             category: "SYNCED_FROM_ANALYSER",
           };

           const responseForSyncStatus = await context.http.post(
             statusUrl,
             syncStatus,
             {
               headers: headersList,
             }
           );
           try {
             const query = `UPDATE orders SET reference_uuid="${
               data?.results[0]?.uuid
             }",reason=NULL, sync_status="1", lims_sync_date_time="${new Date().toISOString()}" WHERE id=${order_id}`;
             db.all(query, [], async (err, _rows) => {
               if (err) {
                 console.log(
                   "🚫 ERROR WHILE UPDATING SYNC STATUS ",
                   err?.toUpperCase(),
                   " 🚫"
                 );
               } else {
               }
             });
           } catch (e) {
             console.log(
               "🚫 ERROR WHILE UPDATING SYNC STATUS ",
               e.message.toUpperCase(),
               " 🚫"
             );
           }
         }



      }


      //console.log("resultss:: ",results);


    }


    }
  } catch (e) {
    console.log(e);
  }
};

const pushData = async (payload) => {
  // context.payload;
  for (const orderToPush of payload) {
    try {
      if (orderToPush?.raw_text) {
        const formattedJSON = context.hl7V2(orderToPush?.raw_text);
        console.log("formattedJSON: ", JSON.stringify(formattedJSON));
        const mshBlock = formattedJSON["MSH"];
        const obrBlock = formattedJSON["OBR"];
        const obxBlock = formattedJSON["OBX"];
        const sampleId = Array.isArray(mshBlock)
          ? mshBlock[0]["Receiving Responsible Organization"]
          : mshBlock["Receiving Responsible Organization"];
        let instrumentCode = Array.isArray(mshBlock)
          ? mshBlock[0]["Sending Application"]
          : mshBlock["Sending Application"];
        const machineTestOrderCode = Array.isArray(obrBlock)
          ? obrBlock[0]["Universal Service Identifier"].split(" ")[0]
          : obrBlock["Universal Service Identifier"].split(" ")[0];

        const sql = `SELECT * FROM code_parameters WHERE test_order="${machineTestOrderCode}";`;
        db.all(sql, [], async (err, rows) => {
          if (err || rows.length === 0) {
            console.error(err ? err : "No data to sync");
          } else {
            await syncData(
              sampleId,
              instrumentCode,
              obrBlock,
              obxBlock,
              rows[0],
              orderToPush?.id
            );
          }
        });
      }
    } catch (e) {
      console.log(e);
    }
  }
};

const run = async () => {
  if (context.payload) {
    return await pushData(context.payload);
  }
  const sql = `SELECT * FROM orders WHERE test_type != "" AND order_id LIKE '%/%' AND reference_uuid IS NULL order by id asc limit 20;`;
  db.all(sql, [], async (err, rows) => {
    if (err || rows.length === 0) {
      console.error(err ? err : "No data to sync");
    } else {
      console.log(`🚀 DATA TO PUSH TO LIS:: ${rows?.length} 🚀`);
      await pushData(rows);
    }
  });
};

return run();
