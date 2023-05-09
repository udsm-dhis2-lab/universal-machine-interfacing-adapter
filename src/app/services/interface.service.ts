import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ElectronService } from "../core/services";
import { dictionary, separators } from "../shared/constants/shared.constants";
import { DatabaseService } from "./database.service";
import { ElectronStoreService } from "./electron-store.service";
import { formatRawDate } from "../shared/helpers/date.helper";

@Injectable({
  providedIn: "root",
})
export class InterfaceService {
  public socketClient = null;
  public server = null;
  public net = null;

  public connectionTries = 0;
  public hl7parser = require("hl7parser");

  protected ACK = Buffer.from("06", "hex");
  protected ENQ = Buffer.from("05", "hex");
  protected SOH = Buffer.from("01", "hex");
  protected STX = Buffer.from("02", "hex");
  protected ETX = Buffer.from("03", "hex");
  protected EOT = Buffer.from("04", "hex");
  protected CR = Buffer.from("13", "hex");
  protected FS = Buffer.from("25", "hex");
  protected LF = Buffer.from("10", "hex");
  protected NAK = Buffer.from("21", "hex");

  protected log = null;
  protected strData = "";
  protected connectopts: any = null;
  protected appSettings = null;
  protected timer = null;
  protected logtext = [];

  // protected serialConnection = null;

  protected statusSubject = new BehaviorSubject(false);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  currentStatus = this.statusSubject.asObservable();

  protected connectionAttemptStatusSubject = new BehaviorSubject(false);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  connectionAttemptStatus = this.connectionAttemptStatusSubject.asObservable();

  protected lastOrdersSubject = new BehaviorSubject([]);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  lastOrders = this.lastOrdersSubject.asObservable();

  protected liveLogSubject = new BehaviorSubject([]);
  protected processLogSubject = new BehaviorSubject([]);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  liveLog = this.liveLogSubject.asObservable();
  proccessLog = this.processLogSubject.asObservable();
  HL7MessageProcessor: any;

  constructor(
    public electronService: ElectronService,
    public dbService: DatabaseService,
    public store: ElectronStoreService
  ) {
    this.log = this.electronService.log;
    this.net = this.electronService.net;
  }

  // Method used to track machine connection status
  connectionStatus(interfaceConnected: boolean) {
    this.statusSubject.next(interfaceConnected);
  }

  // Method used to track machine connection status
  connectionAttempt(interfaceAttempt: boolean) {
    this.connectionAttemptStatusSubject.next(interfaceAttempt);
  }

  hl7ACK(messageID: string | number) {
    const that = this;

    if (!messageID || messageID === "") {
      messageID = Math.random();
    }

    const moment = require("moment");
    const date = moment(new Date()).format("YYYYMMDDHHmmss");

    let ack =
      String.fromCharCode(11) +
      "MSH|^~\\&|VLSM|VLSM|VLSM|VLSM|" +
      date +
      "||ACK^R22^ACK|" +
      self.crypto.randomUUID() +
      "|P|2.5.1||||||UNICODE UTF-8" +
      String.fromCharCode(13);

    ack +=
      "MSA|AA|" +
      messageID +
      String.fromCharCode(13) +
      String.fromCharCode(28) +
      String.fromCharCode(13);

    that.logger("info", "Sending HL7 ACK : " + ack);
    return ack;
  }

  // Method used to connect to the Testing Machine
  connect() {
    const that = this;
    that.appSettings = that.store.get("appSettings");

    that.connectionAttempt(true);

    if (that.appSettings.interfaceConnectionMode === "tcpserver") {
      that.logger(
        "info",
        "Listening for connection on port " +
          that.appSettings.analyzerMachinePort
      );
      that.server = that.net.createServer();
      that.server.listen(that.appSettings.analyzerMachinePort);

      const sockets = [];

      that.server.on("connection", function (socket) {
        // confirm socket connection from client
        that.logger(
          "info",
          new Date() +
            " : A remote client has connected to the Interfacing Server"
        );
        that.connectionStatus(true);
        sockets.push(socket);
        that.socketClient = socket;
        socket.on("data", function (data) {
          that.handleTCPResponse(data);
        });

        // Add a 'close' event handler to this instance of socket
        socket.on("close", function () {
          const index = sockets.findIndex(function (o) {
            return (
              o.analyzerMachineHost === socket.analyzerMachineHost &&
              o.analyzerMachinePort === socket.analyzerMachinePort
            );
          });
          if (index !== -1) {
            sockets.splice(index, 1);
          }
        });
      });

      this.server.on("error", function (e) {
        that.logger("error", "Error while connecting " + e.code);
        that.closeConnection();

        if (that.appSettings.interfaceAutoConnect === "yes") {
          that.logger(
            "error",
            "Interface AutoConnect is enabled: Will restart server in 30 seconds"
          );
          setTimeout(() => {
            that.reconnect();
          }, 30000);
        }
      });
    } else if (that.appSettings.interfaceConnectionMode === "tcpclient") {
      that.socketClient = new that.net.Socket();
      that.connectopts = {
        port: that.appSettings.analyzerMachinePort,
        host: that.appSettings.analyzerMachineHost,
      };

      that.logger("info", "Trying to connect as client");
      that.connectionTries++; // incrementing the connection tries

      that.socketClient.connect(that.connectopts, function () {
        that.connectionTries = 0; // resetting connection tries to 0
        that.connectionStatus(true);
        that.logger("success", "Connected as client successfully");
      });

      that.socketClient.on("data", function (data) {
        that.connectionStatus(true);
        that.handleTCPResponse(data);
      });

      that.socketClient.on("close", function () {});

      that.socketClient.on("error", (e) => {
        that.logger("error", e);
        that.closeConnection();

        if (that.appSettings.interfaceAutoConnect === "yes") {
          that.logger(
            "error",
            "Interface AutoConnect is enabled: Will re-attempt connection in 30 seconds"
          );
          setTimeout(() => {
            that.reconnect();
          }, 30000);
        }
      });
    } else {
    }
  }

  reconnect() {
    this.closeConnection();
    this.connect();
  }

  closeConnection() {
    const that = this;
    that.appSettings = that.store.get("appSettings");

    if (that.appSettings.interfaceConnectionMode === "tcpclient") {
      if (that.socketClient) {
        that.socketClient.destroy();
        that.connectionStatus(false);
        that.connectionAttempt(false);
        that.logger("info", "Client Disconnected");
      }
    } else {
      if (that.server) {
        that.server.close();
        that.connectionStatus(false);
        that.connectionAttempt(false);
        that.logger("info", "Server Stopped");
      }
    }
  }

  hex2ascii(hexx) {
    const hex = hexx.toString(); // force conversion
    let str = "";
    for (let i = 0; i < hex.length; i += 2) {
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }

    return str;
  }

  processHL7Data(rawText: string) {
    const that = this;
    if (rawText.includes("DH7x") && rawText.includes("Dymind")) {
      that.parseHL7DH76(rawText);
    } else {
      that.processHl7V1(rawText);
    }
  }

  handleTCPResponse(data: { toString: (arg0: string) => any }) {
    const that = this;
    if (that.appSettings.interfaceCommunicationProtocol === "hl7") {
      that.logger("info", "Receiving HL7 data");
      const hl7Text = that.hex2ascii(data.toString("hex"));
      that.strData += hl7Text;

      // If there is a File Separator or 1C or ASCII 28 character,
      // it means the stream has ended and we can proceed with saving this data
      if (that.strData.includes("\x1c")) {
        // Let us store this Raw Data before we process it
        that.logger(
          "info",
          "Received File Separator Character. Ready to process HL7 data"
        );
        const rData: any = {};
        rData.data = that.strData;
        rData.machine = that.appSettings?.analyzerMachineName;

        that.dbService.addRawData(
          rData,
          (res) => {
            that.logger("success", "HL7 Raw data successfully saved");
          },
          (err) => {
            that.logger(
              "error",
              "Not able to save raw data " + JSON.stringify(err)
            );
          }
        );

        that.strData = that.strData.replace(/[\x0b\x1c]/g, "");
        that.strData = that.strData.trim();
        that.strData = that.strData.replace(
          /[\r\n\x0B\x0C\u0085\u2028\u2029]+/gm,
          "\r"
        );

        that.processHL7Data(that.strData);
        that.strData = "";
      } else {
        // that.logger("error", "NOT a HL7 format or malformatted");
        const rData: any = {};
        rData.data = that.strData;
        rData.machine = that.appSettings?.analyzerMachineName;
        that.processHL7Data(that.strData);

        that.dbService.addRawData(
          rData,
          (res) => {
            that.logger("success", "Raw data saved for analysis");
          },
          (err) => {
            that.logger(
              "error",
              "Not able to save raw data " + JSON.stringify(err)
            );
          }
        );
      }
    } else if (
      that.appSettings.interfaceCommunicationProtocol === "astm-elecsys"
    ) {
      that.logger("info", "Processing ASTM Elecsys");

      const d = data.toString("hex");

      if (d === "04") {
        that.socketClient.write(that.ACK);
        that.logger("info", "Received EOT. Ready to Process");

        // Let us store this Raw Data before we process it
        const rData: any = {};
        rData.data = that.strData;
        rData.machine = that.appSettings?.analyzerMachineName;
        that.dbService.addRawData(
          rData,
          (res) => {
            that.logger("success", "Raw data successfully saved");
          },
          (err) => {
            that.logger(
              "error",
              "Not able to save raw data : " + JSON.stringify(err)
            );
          }
        );

        that.processASTMElecsysData(that.strData);
        that.strData = "";
      } else if (d === "21") {
        that.socketClient.write(that.ACK);
        that.logger("error", "NAK Received");
      } else {
        let text = that.hex2ascii(d);
        if (text.match(/^\d*H/)) {
          text = "##START##" + text;
        }
        that.strData += text;
        that.logger("info", "Receiving....");
        that.socketClient.write(that.ACK);
      }
    } else if (
      that.appSettings.interfaceCommunicationProtocol === "astm-concatenated"
    ) {
      that.logger("info", "Processing ASTM Concatenated");

      const d = data.toString("hex");

      if (d === "04") {
        that.socketClient.write(that.ACK);

        that.logger("info", "Received EOT. Ready to Process");
        const rData: any = {};
        rData.data = that.strData;
        rData.machine = that.appSettings?.analyzerMachineName;
        that.dbService.addRawData(
          rData,
          (res) => {
            that.logger("success", "Raw data successfully saved");
          },
          (err) => {
            that.logger(
              "error",
              "Not able to save raw data : " + JSON.stringify(err)
            );
          }
        );

        that.processASTMConcatenatedData(that.strData);
        that.strData = "";
      } else if (d === "21") {
        that.socketClient.write(that.ACK);
        that.logger("error", "NAK Received");
      } else {
        let text = that.hex2ascii(d);
        if (text.match(/^\d*H/)) {
          text = "##START##" + text;
        }
        that.strData += text;
        that.socketClient.write(that.ACK);
      }
    }
  }

  arrayKeyExists(key: string, search: any[]) {
    if (
      !search ||
      (search.constructor !== Array && search.constructor !== Object)
    ) {
      return false;
    }

    return key in search;
  }

  processASTMElecsysData(astmData: string) {
    //that.logger('info', astmData);

    const that = this;
    const fullDataArray = astmData.split("##START##");

    // that.logger('info', "AFTER SPLITTING USING ##START##");
    // that.logger('info', fullDataArray);

    fullDataArray.forEach(function (partData) {
      if (partData !== "" && partData !== undefined && partData !== null) {
        let data = partData.replace(/[\x05\x02\x03]/g, "");
        let astmArray = data.split(/\r?\n/);

        const dataArray = [];

        astmArray.forEach(function (element) {
          if (element !== "") {
            element = element.replace(/^\d*/, "");
            if (dataArray[element.substring(0, 1)] === undefined) {
              dataArray[element.substring(0, 1)] = element.split("|");
            } else {
              const arr = element.split("|");
              arr.shift();
              dataArray[element.substring(0, 1)] += arr;
            }
          }
        });

        if (
          dataArray === null ||
          dataArray === undefined ||
          dataArray["R"] === undefined
        ) {
          that.logger("info", "dataArray blank");
          return;
        }

        const order: any = {};

        try {
          if (
            that.arrayKeyExists("R", dataArray) &&
            typeof dataArray["R"] == "string"
          ) {
            dataArray["R"] = dataArray["R"].split(",");
          }

          if (
            that.arrayKeyExists("O", dataArray) &&
            typeof dataArray["O"] == "string"
          ) {
            dataArray["O"] = dataArray["O"].split(",");
          }

          if (
            that.arrayKeyExists("C", dataArray) &&
            typeof dataArray["C"] == "string"
          ) {
            dataArray["C"] = dataArray["C"].split(",");
          }

          console.warn(dataArray["O"]);
          console.warn(dataArray["R"]);

          if (dataArray["O"] !== undefined && dataArray["O"] !== null) {
            order.order_id = dataArray["O"][2];
            order.test_id = dataArray["O"][1];
            if (dataArray["R"] !== undefined && dataArray["R"] !== null) {
              order.test_type = dataArray["R"][2]
                ? dataArray["R"][2].replace("^^^", "")
                : dataArray["R"][2];
              order.test_unit = dataArray["R"][4];
              order.patient_id =
                dataArray["P"] && dataArray["P"].length > 3
                  ? dataArray["P"][4]
                  : null;
              order.results = dataArray["R"][3];
              order.tested_by = dataArray["R"][10];
              order.analysed_date_time = formatRawDate(dataArray["R"][12]);
              order.authorised_date_time = formatRawDate(dataArray["R"][12]);
              order.result_accepted_date_time = formatRawDate(
                dataArray["R"][12]
              );
            } else {
              order.test_type = "";
              order.test_unit = "";
              order.patient_id = "";
              order.results = "Failed";
              order.tested_by = "";
              order.analysed_date_time = "";
              order.authorised_date_time = "";
              order.result_accepted_date_time = "";
            }
            order.raw_text = "'" + partData + "'";
            order.result_status = 1;
            order.lims_sync_status = 0;
            order.test_location = that.appSettings?.labName;
            order.machine_used = that.appSettings?.analyzerMachineName;

            if (order.order_id) {
              that.logger(
                "info",
                "Trying to add order :" +
                  JSON.stringify({ ...order, raw_tex: "" })
              );
              that.dbService
                .addOrderTest(
                  order,
                  (res: any) => {},
                  (err) => {
                    that.logger(
                      "error",
                      "Failed to add : " + JSON.stringify(err)
                    );
                  }
                )
                .then((res) => {
                  that.logger(
                    "success",
                    "Result Successfully Added : " + order.order_id
                  );
                  console.log("✅ RESULTS ADDED ✅");
                })
                .catch((e) => {
                  console.log(
                    "🚫 RESULTS ADDING FAILED ",
                    `${(e?.message ?? e).toUpperCase()}`,
                    " 🚫"
                  );
                  that.logger(
                    "success",
                    "Result Successfully Added : " + order.order_id
                  );
                });
            } else {
              that.logger(
                "error",
                "Could NOT add order :" + order.order_id ?? ""
              );
            }
          }
        } catch (error) {
          that.logger("error", error);
          console.error(error);
          return;
        }

        //if (dataArray == undefined || dataArray['0'] == undefined ||
        //      dataArray['O'][3] == undefined || dataArray['O'][3] == null ||
        //        dataArray['O'][3] == '') return;
        //if (dataArray == undefined || dataArray['R'] == undefined
        //        || dataArray['R'][2] == undefined || dataArray['R'][2] == null
        //        || dataArray['R'][2] == '') return;
      } else {
        that.logger(
          "error",
          "Could NOT add order :" + JSON.stringify(astmData)
        );
      }
    });
  }

  processASTMConcatenatedData(astmData: string) {
    //this.logger('info', astmData);

    const that = this;
    astmData = astmData.replace(/[\x05]/g, "");
    astmData = astmData.replace(/\x02/g, "<STX>");
    astmData = astmData.replace(/\x03/g, "<ETX>");
    astmData = astmData.replace(/\x04/g, "<EOT>");
    astmData = astmData.replace(/\x17/g, "<ETB>");
    //astmData = astmData.replace(/\x5E/g, "::")

    astmData = astmData.replace(/\n/g, "<LF>");
    astmData = astmData.replace(/\r/g, "<CR>");

    //Let us remove the transmission blocks
    astmData = astmData
      .replace(/<ETB>\w{2}<CR><LF>/g, "")
      .replace(/<STX>/g, "");

    const fullDataArray = astmData.split("##START##");

    // that.logger('info', "AFTER SPLITTING USING ##START##");
    // that.logger('info', fullDataArray);

    fullDataArray.forEach(function (partData) {
      if (partData !== "" && partData !== undefined && partData !== null) {
        const astmArray = partData.split(/<CR>/);

        const dataArray = [];

        astmArray.forEach(function (element) {
          if (element !== "") {
            element = element.replace(/^\d*/, "");
            if (dataArray[element.substring(0, 1)] === undefined) {
              dataArray[element.substring(0, 1)] = element.split("|");
            } else {
              const arr = element.split("|");
              arr.shift();
              dataArray[element.substring(0, 1)] += arr;
            }
          }
        });

        if (
          dataArray === null ||
          dataArray === undefined ||
          dataArray["R"] === undefined
        ) {
          that.logger("info", "dataArray blank");
          return;
        }

        const order: any = {};

        try {
          if (
            that.arrayKeyExists("R", dataArray) &&
            typeof dataArray["R"] == "string"
          ) {
            dataArray["R"] = dataArray["R"].split(",");
          }

          if (
            that.arrayKeyExists("O", dataArray) &&
            typeof dataArray["O"] == "string"
          ) {
            dataArray["O"] = dataArray["O"].split(",");
          }

          if (
            that.arrayKeyExists("C", dataArray) &&
            typeof dataArray["C"] == "string"
          ) {
            dataArray["C"] = dataArray["C"].split(",");
          }

          if (dataArray["O"] !== undefined && dataArray["O"] !== null) {
            order.order_id = dataArray["O"][2];
            order.test_id = dataArray["O"][1];
            if (dataArray["R"] !== undefined && dataArray["R"] !== null) {
              order.test_type = dataArray["R"][2]
                ? dataArray["R"][2].replace("^^^", "")
                : dataArray["R"][2];
              order.test_unit = dataArray["R"][4];
              order.results = dataArray["R"][3];
              order.tested_by = dataArray["R"][10];
              order.patient_id =
                dataArray["P"] && dataArray["P"].length > 3
                  ? dataArray["P"][4]
                  : null;
              order.analysed_date_time = formatRawDate(dataArray["R"][12]);
              order.authorised_date_time = formatRawDate(dataArray["R"][12]);
              order.result_accepted_date_time = formatRawDate(
                dataArray["R"][12]
              );
            } else {
              order.test_type = "";
              order.test_unit = "";
              order.results = "Failed";
              order.tested_by = "";
              order.analysed_date_time = "";
              order.authorised_date_time = "";
              order.result_accepted_date_time = "";
            }
            order.raw_text = "'" + partData + "'";
            order.result_status = 1;
            order.lims_sync_status = 0;
            order.test_location = that.appSettings?.labName;
            order.machine_used = that.appSettings?.analyzerMachineName;

            if (order.order_id) {
              that.logger(
                "info",
                "Trying to add order :" +
                  JSON.stringify({ ...order, raw_text: "" })
              );
              that.dbService
                .addOrderTest(
                  order,
                  (res: any) => {},
                  (err) => {
                    that.logger(
                      "error",
                      "Failed to add : " + JSON.stringify(err)
                    );
                  }
                )
                .then((res) => {
                  that.logger(
                    "success",
                    "✅ Result Successfully Added : " + order.order_id + " ✅"
                  );
                })
                .catch((e) => {
                  console.log(
                    "🚫 RESULTS ADDING FAILED ",
                    `${(e?.message ?? e).toUpperCase()}`,
                    " 🚫"
                  );
                  that.logger(
                    "success",
                    "Result Successfully Added : " + order.order_id
                  );
                });
            } else {
              that.logger(
                "error",
                "Could NOT add order :" +
                  JSON.stringify({ ...order, raw_text: "" })
              );
            }
          }
        } catch (error) {
          that.logger("error", error);
          console.error(error);
          return;
        }

        //if (dataArray == undefined || dataArray['0'] == undefined ||
        //      dataArray['O'][3] == undefined || dataArray['O'][3] == null ||
        //        dataArray['O'][3] == '') return;
        //if (dataArray == undefined || dataArray['R'] == undefined
        //        || dataArray['R'][2] == undefined || dataArray['R'][2] == null
        //        || dataArray['R'][2] == '') return;
      }
    });
  }

  hasSetId(fields, segmentName) {
    let hasId = false;
    let setId = 0;
    fields.forEach((field: any, index: number) => {
      const key = dictionary[segmentName][index + 1];
      if (key === "Set ID" && (!hasId || !setId)) {
        hasId = !hasId ? true : hasId;
        setId = !setId ? Number(field) : setId;
      }
    });
    return { hasId, setId };
  }

  flattenData(data) {
    const finalData = {};
    Object.keys(data).forEach((key) => {
      if (Array.isArray(data[key])) {
        finalData[key] = data[key].map((d: any) => this.flattenData(d));
      } else {
        const innerData = Object.keys(data[key]);
        if (innerData.length === 1) {
          finalData[key] = data[key][innerData[0]];
        } else {
          finalData[key] = data[key];
        }
      }
    });

    return finalData;
  }

  parseHL7DH76 = (hl7: string) => {
    const data: any = {};
    let master = [];

    // This will turn the hl7 into an array seperated by our categories, however in order to keep the categories they stay in their own element
    const tokens = hl7.split(
      new RegExp("(" + separators.join("\\||") + "\\|)")
    );

    // Remove first element which is empty
    tokens.shift();

    // Here we combine the category name pairs with their values
    tokens.forEach((token, index) => {
      master.push(token + tokens[index + 1]);
      tokens.splice(index, 1);
    });
    // Remove empty values
    master = master.filter(Boolean);
    // Now that master is populated, we can iterate over it and form the table
    let inHTML = "";
    master.forEach((value, index) => {
      const fields = value.split("|");
      let subdetail = "";
      const segmentName = fields[0];
      fields.shift();
      const segmentValue = {};

      // Creating the sub rows
      for (let i = 0; i < fields.length; i++) {
        let subvalue = fields[i];
        try {
          // Hard-code pipe value
          if (segmentName == "MSH" && i == 0) {
            subvalue = "|";
          }
          // Subtract the index so that they're shifted correctly for MSH
          else if (segmentName == "MSH") {
            subvalue = fields[i - 1] || "";
          }

          subvalue = (subvalue || "")
            ?.split("^")
            ?.join(" ")
            ?.replace(/[\r|\n|\r\n]$/, "");
          const key = dictionary[segmentName][i + 1];
          subvalue =
            dictionary[segmentName][i + 1].includes("Date") &&
            subvalue &&
            subvalue !== ""
              ? formatRawDate(subvalue)
              : subvalue;
          segmentValue[key] = subvalue;
        } catch (e) {}
      }
      if (!data[segmentName]) {
        data[segmentName] = segmentValue;
      } else if (Array.isArray(data[segmentName])) {
        data[segmentName] = [...data[segmentName], segmentValue];
      } else {
        data[segmentName] = [data[segmentName], segmentValue];
      }
    });
    this.socketClient.write(this.hl7ACK(data.MSH["Message Control ID"]));
    const order: any = {
      order_id: data.OBR["Filler Order Number"],
      test_type: data.OBR["Principal Result Interpreter +"],
      test_unit: data.OBX.find((obx) => obx.Units !== "").Units,
      patient_id: data.PID["Patient ID"],
      results: data.OBX.find((obx) => obx["Observation Result Status"] !== "")[
        "Observation Result Status"
      ],
      tested_by: data.OBR["Principal Result Interpreter +"],
      analysed_date_time: data.OBR["Requested Date/Time"],
      authorised_date_time: data.OBR["Requested Date/Time"],
      result_accepted_date_time: data.OBR["Observation End Date/Time #"],
      raw_text: hl7,
    };

    this.dbService
      .addOrderTest(
        order,
        (res: any) => {},
        (err: any) => {
          this.logger("error", "Failed to add : " + JSON.stringify(err));
        }
      )
      .then((res) => {
        this.logger("success", "Result Successfully Added : " + order.order_id);
        console.log("✅ RESULTS ADDED ✅");
      })
      .catch((e) => {
        console.log(
          "🚫 RESULTS ADDING FAILED ",
          `${(e?.message ?? e).toUpperCase()}`,
          " 🚫"
        );
        this.logger("success", "Result Successfully Added : " + order.order_id);
      });
  };

  fetchLastOrders(summary: boolean) {
    const that = this;
    that.dbService.fetchLastOrders(
      (res: any[]) => {
        res = [res]; // converting it into an array
        that.lastOrdersSubject.next(res);
      },
      (err) => {
        that.logger("error", "Failed to fetch data " + JSON.stringify(err));
      },
      summary
    );
  }

  fetchRecentLogs() {
    const that = this;
    that.dbService.fetchRecentLogs(
      (res: { log: any }[]) => {
        if (res && Array.isArray(res)) {
          res.forEach((r: { log: any }) => {
            that.logtext.push(r.log);
            that.liveLogSubject.next(that.logtext);
          });
        }
      },
      (err) => {
        that.logger("error", "Failed to fetch data " + JSON.stringify(err));
      }
    );
  }

  fetchLastSyncTimes(callback): any {
    const that = this;
    that.dbService.fetchLastSyncTimes(
      (res) => {
        callback(res[0]);
      },
      (err) => {
        that.logger("error", "Failed to fetch data " + JSON.stringify(err));
      }
    );
  }

  clearLiveLog() {
    const that = this;
    that.logtext = [];
    that.liveLogSubject.next(that.logtext);
  }

  logger(logType: string, message: string) {
    const that = this;
    const moment = require("moment");
    const date = moment(new Date()).format("DD-MMM-YYYY HH:mm:ss");

    let logMessage = "";

    that.log.transports.file.fileName = `${moment().format("YYYY-MM-DD")}.log`;

    if (logType === "info") {
      that.log.info(message);
      logMessage =
        '<span class="text-info">[info]</span> [' +
        date +
        "] " +
        message +
        "<br>";
    } else if (logType === "error") {
      that.log.error(message);
      logMessage =
        '<span class="text-danger">[error]</span> [' +
        date +
        "] " +
        message +
        "<br>";
    } else if (logType === "success") {
      that.log.info(message);
      logMessage =
        '<span class="text-success">[success]</span> [' +
        date +
        "] " +
        message +
        "<br>";
    }

    //that.logtext[that.logtext.length] = logMessage;
    that.logtext.unshift(logMessage);
    that.liveLogSubject.next(that.logtext);

    const dbLog: any = {};
    dbLog.log = logMessage;

    that.dbService.addApplicationLog(
      dbLog,
      (res) => {},
      (err) => {}
    );
  }

  processHl7V1 = (rawText: string) => {
    const that = this;
    const message = that.hl7parser.create(rawText);
    const msgID = message.get("MSH.10").toString();
    that.socketClient.write(that.hl7ACK(msgID));
    // let result = null;
    const obx = message.get("OBX").toArray();
    console.log(obx);

    const spm = message.get("SPM");
    spm.forEach(function (singleSpm) {
      //sampleNumber = (singleSpm.get(1).toInteger());
      //const singleObx = obx[(sampleNumber * 2) - 1]; // there are twice as many OBX .. so we take the even number - 1 OBX for each SPM
      const singleObx = obx[0]; // there are twice as many OBX .. so we take the even number - 1 OBX for each SPM

      const resultOutcome = singleObx.get("OBX.5.1").toString();

      const order: any = {};
      order.raw_text = "'" + rawText + "'";
      order.order_id = singleSpm.get("SPM.3").toString().replace("&ROCHE", "");
      order.test_id = singleSpm.get("SPM.3").toString().replace("&ROCHE", "");

      if (order.order_id === "") {
        //Let us use the Sample Container ID as the Order ID
        order.order_id = message.get("SAC.3").toString();
        order.test_id = message.get("SAC.3").toString();
      }

      order.test_type = "HIVVL";

      if (resultOutcome === "Titer") {
        order.test_unit = singleObx.get("OBX.6.1").toString();
        order.results = singleObx.get("OBX.5.1").toString();
      } else if (resultOutcome === "> Titer max") {
        order.test_unit = "";
        order.results = ">10000000";
      } else if (resultOutcome === "Invalid") {
        order.test_unit = "";
        order.results = "Invalid";
      } else if (resultOutcome === "Failed") {
        order.test_unit = "";
        order.results = "Failed";
      } else {
        order.test_unit = singleObx.get("OBX.6.1").toString();
        if (!order.test_unit) {
          order.test_unit = singleObx.get("OBX.6.2").toString();
        }
        if (!order.test_unit) {
          order.test_unit = singleObx.get("OBX.6").toString();
        }
        order.results = resultOutcome;
      }

      order.tested_by = singleObx.get("OBX.16").toString();
      order.result_status = 1;
      order.lims_sync_status = 0;
      order.analysed_date_time = formatRawDate(
        singleObx.get("OBX.19").toString()
      );
      //order.specimen_date_time = this.formatRawDate(message.get('OBX').get(0).get('OBX.19').toString());
      order.authorised_date_time = formatRawDate(
        singleObx.get("OBX.19").toString()
      );
      order.result_accepted_date_time = formatRawDate(
        singleObx.get("OBX.19").toString()
      );
      order.test_location = that.appSettings?.labName;
      order.machine_used = that.appSettings?.analyzerMachineName;
      console.log(order);
      if (order.results) {
        that.dbService
          .addOrderTest(
            order,
            (res: any) => {},
            (err) => {
              that.logger("error", "Failed to add : " + JSON.stringify(err));
            }
          )
          .then((res) => {
            that.logger(
              "success",
              "Result Successfully Added : " + order.order_id
            );
            console.log("✅ RESULTS ADDED ✅");
          })
          .catch((e) => {
            console.log(
              "🚫 RESULTS ADDING FAILED ",
              `${(e?.message ?? e).toUpperCase()}`,
              " 🚫"
            );
            that.logger(
              "success",
              "Result Successfully Added : " + order.order_id
            );
          });
      } else {
        that.logger("error", "Unable to store data into the database");
      }
    });
  };
}
